import { OnlineLobby, Player, GamePhase, GameSettings } from '../types';

type MessageHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private serverUrl: string = '';

  // Connect to WebSocket server
  connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serverUrl = serverUrl;

      try {
        this.socket = new WebSocket(serverUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleDisconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageHandlers.clear();
  }

  // Send a message to the server
  send(type: string, payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { type, payload };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Subscribe to a message type
  on(type: string, handler: MessageHandler): () => void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.push(handler);
    this.messageHandlers.set(type, handlers);

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.messageHandlers.get(type) || [];
      this.messageHandlers.set(
        type,
        currentHandlers.filter((h) => h !== handler)
      );
    };
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach((handler) => handler(message.payload));

    // Also call 'all' handlers for debugging
    const allHandlers = this.messageHandlers.get('*') || [];
    allHandlers.forEach((handler) => handler(message));
  }

  // Handle disconnection and attempt reconnect
  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => {
        this.connect(this.serverUrl).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  // Lobby actions
  createLobby(settings: GameSettings): void {
    this.send('CREATE_LOBBY', { settings });
  }

  joinLobby(code: string, playerName: string): void {
    this.send('JOIN_LOBBY', { code, playerName });
  }

  leaveLobby(): void {
    this.send('LEAVE_LOBBY', {});
  }

  updateSettings(settings: Partial<GameSettings>): void {
    this.send('UPDATE_SETTINGS', { settings });
  }

  startGame(): void {
    this.send('START_GAME', {});
  }

  playerRevealed(playerId: string): void {
    this.send('PLAYER_REVEALED', { playerId });
  }

  submitVotes(playerId: string, votes: string[]): void {
    this.send('SUBMIT_VOTES', { playerId, votes });
  }

  pauseGame(): void {
    this.send('PAUSE_GAME', {});
  }

  resumeGame(): void {
    this.send('RESUME_GAME', {});
  }

  startVoting(): void {
    this.send('START_VOTING', {});
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Message types for type safety
export const WS_MESSAGE_TYPES = {
  // Incoming from server
  LOBBY_CREATED: 'LOBBY_CREATED',
  LOBBY_JOINED: 'LOBBY_JOINED',
  PLAYER_JOINED: 'PLAYER_JOINED',
  PLAYER_LEFT: 'PLAYER_LEFT',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  GAME_STARTED: 'GAME_STARTED',
  PLAYER_REVEALED: 'PLAYER_REVEALED',
  VOTES_SUBMITTED: 'VOTES_SUBMITTED',
  VOTING_STARTED: 'VOTING_STARTED',
  GAME_PAUSED: 'GAME_PAUSED',
  GAME_RESUMED: 'GAME_RESUMED',
  GAME_ENDED: 'GAME_ENDED',
  ERROR: 'ERROR',
  SYNC_STATE: 'SYNC_STATE',
} as const;

export type WSMessageType = (typeof WS_MESSAGE_TYPES)[keyof typeof WS_MESSAGE_TYPES];
