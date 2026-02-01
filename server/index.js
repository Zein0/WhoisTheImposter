const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active lobbies and connections
const lobbies = new Map();
const connections = new Map(); // playerId -> ws connection

// Helper function to generate unique lobby code
function generateLobbyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  // Check if code already exists
  if (lobbies.has(code)) {
    return generateLobbyCode();
  }
  return code;
}

// Helper function to broadcast to all players in a lobby
function broadcastToLobby(lobbyCode, message, excludePlayerId = null) {
  const lobby = lobbies.get(lobbyCode);
  if (!lobby) return;

  lobby.players.forEach(player => {
    if (player.id !== excludePlayerId) {
      const ws = connections.get(player.id);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  });
}

// Helper function to send to specific player
function sendToPlayer(playerId, message) {
  const ws = connections.get(playerId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    lobbies: lobbies.size,
    connections: connections.size,
    timestamp: new Date().toISOString()
  });
});

// Get lobby info (for debugging)
app.get('/lobby/:code', (req, res) => {
  const lobby = lobbies.get(req.params.code);
  if (lobby) {
    res.json({
      code: lobby.code,
      playerCount: lobby.players.length,
      phase: lobby.phase,
      hostId: lobby.hostId
    });
  } else {
    res.status(404).json({ error: 'Lobby not found' });
  }
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  let currentPlayerId = null;
  let currentLobbyCode = null;

  console.log('New WebSocket connection');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const { type, payload } = message;

      console.log(`Received: ${type}`, payload);

      switch (type) {
        case 'CREATE_LOBBY': {
          const code = generateLobbyCode();
          const lobby = {
            code,
            hostId: payload.hostId,
            players: [],
            settings: payload.settings,
            phase: 'setup',
            createdAt: new Date(),
            gameState: null,
            votes: new Map(),
            revealedPlayers: new Set()
          };

          lobbies.set(code, lobby);
          currentLobbyCode = code;
          currentPlayerId = payload.hostId;
          connections.set(payload.hostId, ws);

          sendToPlayer(payload.hostId, {
            type: 'LOBBY_CREATED',
            payload: { code, lobby }
          });

          console.log(`Lobby ${code} created by ${payload.hostId}`);
          break;
        }

        case 'JOIN_LOBBY': {
          const { code, player } = payload;
          const lobby = lobbies.get(code);

          if (!lobby) {
            sendToPlayer(player.id, {
              type: 'ERROR',
              payload: { message: 'Lobby not found' }
            });
            break;
          }

          if (lobby.phase !== 'setup') {
            sendToPlayer(player.id, {
              type: 'ERROR',
              payload: { message: 'Game already in progress' }
            });
            break;
          }

          // Check max players
          const maxPlayers = lobby.settings.maxPlayers || 15;
          if (lobby.players.length >= maxPlayers) {
            sendToPlayer(player.id, {
              type: 'ERROR',
              payload: { message: 'Lobby is full' }
            });
            break;
          }

          // Add player to lobby
          lobby.players.push(player);
          currentPlayerId = player.id;
          currentLobbyCode = code;
          connections.set(player.id, ws);

          // Send success to joining player
          sendToPlayer(player.id, {
            type: 'LOBBY_JOINED',
            payload: { lobby }
          });

          // Notify all players
          broadcastToLobby(code, {
            type: 'PLAYER_JOINED',
            payload: { player }
          });

          console.log(`Player ${player.name} joined lobby ${code}`);
          break;
        }

        case 'LEAVE_LOBBY': {
          if (!currentLobbyCode || !currentPlayerId) break;

          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby) break;

          // Remove player
          lobby.players = lobby.players.filter(p => p.id !== currentPlayerId);
          connections.delete(currentPlayerId);

          // If host left, assign new host or delete lobby
          if (lobby.hostId === currentPlayerId) {
            if (lobby.players.length > 0) {
              lobby.hostId = lobby.players[0].id;
              broadcastToLobby(currentLobbyCode, {
                type: 'HOST_CHANGED',
                payload: { newHostId: lobby.hostId }
              });
            } else {
              // No players left, delete lobby
              lobbies.delete(currentLobbyCode);
              console.log(`Lobby ${currentLobbyCode} deleted (empty)`);
              break;
            }
          }

          // Notify remaining players
          broadcastToLobby(currentLobbyCode, {
            type: 'PLAYER_LEFT',
            payload: { playerId: currentPlayerId }
          });

          console.log(`Player ${currentPlayerId} left lobby ${currentLobbyCode}`);
          currentPlayerId = null;
          currentLobbyCode = null;
          break;
        }

        case 'UPDATE_SETTINGS': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby || lobby.hostId !== currentPlayerId) break;

          lobby.settings = { ...lobby.settings, ...payload.settings };

          broadcastToLobby(currentLobbyCode, {
            type: 'SETTINGS_UPDATED',
            payload: { settings: lobby.settings }
          });

          console.log(`Settings updated in lobby ${currentLobbyCode}`);
          break;
        }

        case 'START_GAME': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby || lobby.hostId !== currentPlayerId) break;

          // Initialize game state
          const imposterCount = lobby.settings.imposterCount || 1;
          const players = [...lobby.players];

          // Shuffle and assign roles
          const shuffled = players.sort(() => Math.random() - 0.5);
          const imposters = shuffled.slice(0, imposterCount).map(p => p.id);

          // Select word (would come from selected categories)
          const normalWord = 'EXAMPLE'; // This should come from categories
          const imposterWord = imposterCount === players.length ? normalWord : 'IMPOSTER';

          lobby.gameState = {
            imposters,
            normalWord,
            imposterWord,
            startedAt: new Date()
          };
          lobby.phase = 'revealing';
          lobby.revealedPlayers.clear();

          // Send role to each player individually
          lobby.players.forEach(player => {
            const isImposter = imposters.includes(player.id);
            sendToPlayer(player.id, {
              type: 'GAME_STARTED',
              payload: {
                word: isImposter ? imposterWord : normalWord,
                isImposter,
                phase: 'revealing'
              }
            });
          });

          console.log(`Game started in lobby ${currentLobbyCode}`);
          break;
        }

        case 'PLAYER_REVEALED': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby) break;

          lobby.revealedPlayers.add(payload.playerId);

          broadcastToLobby(currentLobbyCode, {
            type: 'PLAYER_REVEALED',
            payload: { playerId: payload.playerId }
          });

          // If all revealed, move to discussion
          if (lobby.revealedPlayers.size === lobby.players.length) {
            lobby.phase = 'discussion';
            broadcastToLobby(currentLobbyCode, {
              type: 'PHASE_CHANGED',
              payload: { phase: 'discussion' }
            });
          }

          console.log(`Player ${payload.playerId} revealed in lobby ${currentLobbyCode}`);
          break;
        }

        case 'START_VOTING': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby || lobby.hostId !== currentPlayerId) break;

          lobby.phase = 'voting';
          lobby.votes.clear();

          broadcastToLobby(currentLobbyCode, {
            type: 'VOTING_STARTED',
            payload: { phase: 'voting' }
          });

          console.log(`Voting started in lobby ${currentLobbyCode}`);
          break;
        }

        case 'SUBMIT_VOTES': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby) break;

          lobby.votes.set(payload.playerId, payload.votes);

          broadcastToLobby(currentLobbyCode, {
            type: 'VOTES_SUBMITTED',
            payload: { playerId: payload.playerId }
          });

          // Check if all voted
          if (lobby.votes.size === lobby.players.length) {
            // Calculate results
            const voteCounts = new Map();
            lobby.votes.forEach((votes) => {
              votes.forEach(votedId => {
                voteCounts.set(votedId, (voteCounts.get(votedId) || 0) + 1);
              });
            });

            const results = {
              imposters: lobby.gameState.imposters,
              votes: Object.fromEntries(lobby.votes),
              voteCounts: Object.fromEntries(voteCounts),
              winner: null // Calculate based on game logic
            };

            lobby.phase = 'results';

            broadcastToLobby(currentLobbyCode, {
              type: 'GAME_ENDED',
              payload: { results }
            });

            console.log(`Game ended in lobby ${currentLobbyCode}`);
          }

          break;
        }

        case 'PAUSE_GAME': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby || lobby.hostId !== currentPlayerId) break;

          broadcastToLobby(currentLobbyCode, {
            type: 'GAME_PAUSED',
            payload: {}
          });

          console.log(`Game paused in lobby ${currentLobbyCode}`);
          break;
        }

        case 'RESUME_GAME': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby || lobby.hostId !== currentPlayerId) break;

          broadcastToLobby(currentLobbyCode, {
            type: 'GAME_RESUMED',
            payload: {}
          });

          console.log(`Game resumed in lobby ${currentLobbyCode}`);
          break;
        }

        case 'SEND_CHAT': {
          if (!currentLobbyCode) break;
          const lobby = lobbies.get(currentLobbyCode);
          if (!lobby) break;

          const chatMessage = {
            playerId: currentPlayerId,
            playerName: payload.playerName,
            message: payload.message,
            timestamp: new Date().toISOString()
          };

          // Broadcast to all players in lobby
          broadcastToLobby(currentLobbyCode, {
            type: 'CHAT_MESSAGE',
            payload: chatMessage
          });

          console.log(`Chat message in ${currentLobbyCode} from ${payload.playerName}: ${payload.message}`);
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG', payload: {} }));
          break;
        }

        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Internal server error' }
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');

    // Clean up on disconnect
    if (currentLobbyCode && currentPlayerId) {
      const lobby = lobbies.get(currentLobbyCode);
      if (lobby) {
        lobby.players = lobby.players.filter(p => p.id !== currentPlayerId);
        connections.delete(currentPlayerId);

        if (lobby.hostId === currentPlayerId) {
          if (lobby.players.length > 0) {
            lobby.hostId = lobby.players[0].id;
            broadcastToLobby(currentLobbyCode, {
              type: 'HOST_CHANGED',
              payload: { newHostId: lobby.hostId }
            });
          } else {
            lobbies.delete(currentLobbyCode);
            console.log(`Lobby ${currentLobbyCode} deleted (empty)`);
          }
        } else {
          broadcastToLobby(currentLobbyCode, {
            type: 'PLAYER_LEFT',
            payload: { playerId: currentPlayerId }
          });
        }
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Cleanup old lobbies every 30 minutes
setInterval(() => {
  const now = new Date();
  const maxAge = 2 * 60 * 60 * 1000; // 2 hours

  lobbies.forEach((lobby, code) => {
    const age = now - lobby.createdAt;
    if (age > maxAge) {
      lobbies.delete(code);
      console.log(`Lobby ${code} deleted (expired)`);
    }
  });
}, 30 * 60 * 1000);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
