import { create } from 'zustand';
import { Player, GamePhase, GameSettings, OnlineLobby } from '../types';
import { websocketService, WS_MESSAGE_TYPES } from '../services/websocket';

interface OnlineStore {
  // State
  lobby: OnlineLobby | null;
  isHost: boolean;
  isConnected: boolean;
  connectionError: string | null;
  playerId: string | null;
  playerName: string | null;
  myWord: string | null;
  isImposter: boolean;

  // Actions
  initialize: () => void;
  cleanup: () => void;
  createLobby: (hostId: string, playerName: string, settings: GameSettings) => Promise<string>;
  joinLobby: (code: string, playerName: string) => Promise<boolean>;
  leaveLobby: () => void;
  updateLobbySettings: (settings: Partial<GameSettings>) => void;
  addPlayerToLobby: (player: Player) => void;
  removePlayerFromLobby: (playerId: string) => void;
  updateLobbyPhase: (phase: GamePhase) => void;
  setConnectionError: (error: string | null) => void;
  syncLobbyState: (lobby: OnlineLobby) => void;
  startGame: () => void;
  playerRevealed: (playerId: string) => void;
  submitVotes: (votes: string[]) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  startVoting: () => void;
  setMyWord: (word: string, isImposter: boolean) => void;
  markPlayerRevealed: (playerId: string) => void;
  markPlayerVoted: (playerId: string) => void;
  setGameResults: (results: any) => void;
}

const generatePlayerId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Get WebSocket server URL from environment
const getServerUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_WS_SERVER_URL;
  if (!url) {
    console.warn('EXPO_PUBLIC_WS_SERVER_URL not set, using localhost');
    return 'ws://localhost:3000';
  }
  return url;
};

export const useOnlineStore = create<OnlineStore>((set, get) => ({
  // Initial State
  lobby: null,
  isHost: false,
  isConnected: false,
  connectionError: null,
  playerId: null,
  playerName: null,
  myWord: null,
  isImposter: false,

  // Initialize WebSocket listeners
  initialize: () => {
    // Lobby created
    websocketService.on(WS_MESSAGE_TYPES.LOBBY_CREATED, (data) => {
      console.log('Lobby created:', data);
      set({
        lobby: data.lobby,
        isHost: true,
        isConnected: true,
        connectionError: null,
      });
    });

    // Lobby joined
    websocketService.on(WS_MESSAGE_TYPES.LOBBY_JOINED, (data) => {
      console.log('Lobby joined:', data);
      set({
        lobby: data.lobby,
        isConnected: true,
        connectionError: null,
      });
    });

    // Player joined
    websocketService.on(WS_MESSAGE_TYPES.PLAYER_JOINED, (data) => {
      console.log('Player joined:', data);
      get().addPlayerToLobby(data.player);
    });

    // Player left
    websocketService.on(WS_MESSAGE_TYPES.PLAYER_LEFT, (data) => {
      console.log('Player left:', data);
      get().removePlayerFromLobby(data.playerId);
    });

    // Settings updated
    websocketService.on(WS_MESSAGE_TYPES.SETTINGS_UPDATED, (data) => {
      console.log('Settings updated:', data);
      set((state) => ({
        lobby: state.lobby
          ? { ...state.lobby, settings: data.settings }
          : null,
      }));
    });

    // Game started
    websocketService.on(WS_MESSAGE_TYPES.GAME_STARTED, (data) => {
      console.log('Game started:', data);
      set({
        myWord: data.word,
        isImposter: data.isImposter,
      });
      get().updateLobbyPhase('revealing');
    });

    // Player revealed
    websocketService.on(WS_MESSAGE_TYPES.PLAYER_REVEALED, (data) => {
      console.log('Player revealed:', data);
      get().markPlayerRevealed(data.playerId);
    });

    // Phase changed
    websocketService.on(WS_MESSAGE_TYPES.PHASE_CHANGED, (data) => {
      console.log('Phase changed:', data);
      get().updateLobbyPhase(data.phase);
    });

    // Voting started
    websocketService.on(WS_MESSAGE_TYPES.VOTING_STARTED, (data) => {
      console.log('Voting started:', data);
      get().updateLobbyPhase('voting');
    });

    // Votes submitted
    websocketService.on(WS_MESSAGE_TYPES.VOTES_SUBMITTED, (data) => {
      console.log('Votes submitted:', data);
      get().markPlayerVoted(data.playerId);
    });

    // Game paused
    websocketService.on(WS_MESSAGE_TYPES.GAME_PAUSED, () => {
      console.log('Game paused');
      // Handle pause UI state if needed
    });

    // Game resumed
    websocketService.on(WS_MESSAGE_TYPES.GAME_RESUMED, () => {
      console.log('Game resumed');
      // Handle resume UI state if needed
    });

    // Game ended
    websocketService.on(WS_MESSAGE_TYPES.GAME_ENDED, (data) => {
      console.log('Game ended:', data);
      get().setGameResults(data.results);
      get().updateLobbyPhase('results');
    });

    // Host changed
    websocketService.on(WS_MESSAGE_TYPES.HOST_CHANGED, (data) => {
      console.log('Host changed:', data);
      const state = get();
      set({
        isHost: data.newHostId === state.playerId,
        lobby: state.lobby
          ? { ...state.lobby, hostId: data.newHostId }
          : null,
      });
    });

    // Error
    websocketService.on(WS_MESSAGE_TYPES.ERROR, (data) => {
      console.error('WebSocket error:', data);
      set({ connectionError: data.message });
    });

    // State sync
    websocketService.on(WS_MESSAGE_TYPES.SYNC_STATE, (data) => {
      console.log('State sync:', data);
      get().syncLobbyState(data.lobby);
    });
  },

  // Cleanup WebSocket listeners
  cleanup: () => {
    websocketService.disconnect();
    set({
      lobby: null,
      isHost: false,
      isConnected: false,
      playerId: null,
      playerName: null,
      myWord: null,
      isImposter: false,
      connectionError: null,
    });
  },

  // Create lobby
  createLobby: async (hostId, playerName, settings) => {
    try {
      // Connect to WebSocket server
      const serverUrl = getServerUrl();
      await websocketService.connect(serverUrl);

      // Generate player ID if not provided
      const playerId = hostId || generatePlayerId();

      set({
        playerId,
        playerName,
        isHost: true,
      });

      // Send create lobby message
      websocketService.createLobby({ hostId: playerId, settings });

      // Wait for lobby created response
      return new Promise((resolve) => {
        const unsubscribe = websocketService.on(WS_MESSAGE_TYPES.LOBBY_CREATED, (data) => {
          unsubscribe();
          resolve(data.code);
        });
      });
    } catch (error) {
      console.error('Failed to create lobby:', error);
      set({ connectionError: 'Failed to connect to server' });
      throw error;
    }
  },

  // Join lobby
  joinLobby: async (code, playerName) => {
    try {
      // Connect to WebSocket server
      const serverUrl = getServerUrl();
      await websocketService.connect(serverUrl);

      const playerId = generatePlayerId();
      const player: Player = {
        id: playerId,
        name: playerName,
        role: 'crewmate',
        hasRevealed: false,
        hasVoted: false,
      };

      set({
        playerId,
        playerName,
        isHost: false,
      });

      // Send join lobby message
      websocketService.joinLobby(code, player);

      // Wait for lobby joined response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Join lobby timeout'));
        }, 5000);

        const unsubscribe = websocketService.on(WS_MESSAGE_TYPES.LOBBY_JOINED, () => {
          clearTimeout(timeout);
          unsubscribe();
          resolve(true);
        });

        const unsubscribeError = websocketService.on(WS_MESSAGE_TYPES.ERROR, (data) => {
          clearTimeout(timeout);
          unsubscribeError();
          set({ connectionError: data.message });
          reject(new Error(data.message));
        });
      });
    } catch (error) {
      console.error('Failed to join lobby:', error);
      set({ connectionError: 'Failed to join lobby' });
      return false;
    }
  },

  // Leave lobby
  leaveLobby: () => {
    websocketService.leaveLobby();
    get().cleanup();
  },

  // Update lobby settings (host only)
  updateLobbySettings: (settings) => {
    if (!get().isHost) return;
    websocketService.updateSettings(settings);
  },

  // Start game (host only)
  startGame: () => {
    if (!get().isHost) return;
    websocketService.startGame();
  },

  // Player revealed their role
  playerRevealed: (playerId) => {
    websocketService.playerRevealed(playerId);
  },

  // Submit votes
  submitVotes: (votes) => {
    const playerId = get().playerId;
    if (!playerId) return;
    websocketService.submitVotes(playerId, votes);
  },

  // Pause game (host only)
  pauseGame: () => {
    if (!get().isHost) return;
    websocketService.pauseGame();
  },

  // Resume game (host only)
  resumeGame: () => {
    if (!get().isHost) return;
    websocketService.resumeGame();
  },

  // Start voting (host only)
  startVoting: () => {
    if (!get().isHost) return;
    websocketService.startVoting();
  },

  // Add player to lobby
  addPlayerToLobby: (player) => {
    set((state) => ({
      lobby: state.lobby
        ? { ...state.lobby, players: [...state.lobby.players, player] }
        : null,
    }));
  },

  // Remove player from lobby
  removePlayerFromLobby: (playerId) => {
    set((state) => ({
      lobby: state.lobby
        ? {
            ...state.lobby,
            players: state.lobby.players.filter((p) => p.id !== playerId),
          }
        : null,
    }));
  },

  // Update lobby phase
  updateLobbyPhase: (phase) => {
    set((state) => ({
      lobby: state.lobby ? { ...state.lobby, phase } : null,
    }));
  },

  // Set connection error
  setConnectionError: (error) => {
    set({ connectionError: error });
  },

  // Sync lobby state
  syncLobbyState: (lobby) => {
    set({ lobby });
  },

  // Set my word and role
  setMyWord: (word, isImposter) => {
    set({ myWord: word, isImposter });
  },

  // Mark player as revealed
  markPlayerRevealed: (playerId) => {
    set((state) => ({
      lobby: state.lobby
        ? {
            ...state.lobby,
            players: state.lobby.players.map((p) =>
              p.id === playerId ? { ...p, hasRevealed: true } : p
            ),
          }
        : null,
    }));
  },

  // Mark player as voted
  markPlayerVoted: (playerId) => {
    set((state) => ({
      lobby: state.lobby
        ? {
            ...state.lobby,
            players: state.lobby.players.map((p) =>
              p.id === playerId ? { ...p, hasVoted: true } : p
            ),
          }
        : null,
    }));
  },

  // Set game results
  setGameResults: (results) => {
    set((state) => ({
      lobby: state.lobby
        ? { ...state.lobby, results }
        : null,
    }));
  },
}));
