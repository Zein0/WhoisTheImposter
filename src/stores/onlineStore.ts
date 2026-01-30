import { create } from 'zustand';
import { Player, GamePhase, GameSettings, OnlineLobby } from '../types';

interface OnlineStore {
  // State
  lobby: OnlineLobby | null;
  isHost: boolean;
  isConnected: boolean;
  connectionError: string | null;
  playerId: string | null;

  // Actions
  createLobby: (settings: GameSettings) => Promise<string>;
  joinLobby: (code: string, playerName: string) => Promise<boolean>;
  leaveLobby: () => void;
  updateLobbySettings: (settings: Partial<GameSettings>) => void;
  addPlayerToLobby: (player: Player) => void;
  removePlayerFromLobby: (playerId: string) => void;
  updateLobbyPhase: (phase: GamePhase) => void;
  setConnectionError: (error: string | null) => void;
  syncLobbyState: (lobby: OnlineLobby) => void;
}

const generateLobbyCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const generatePlayerId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const useOnlineStore = create<OnlineStore>((set, get) => ({
  // Initial State
  lobby: null,
  isHost: false,
  isConnected: false,
  connectionError: null,
  playerId: null,

  // Actions
  createLobby: async (settings) => {
    const code = generateLobbyCode();
    const hostId = generatePlayerId();

    const lobby: OnlineLobby = {
      code,
      hostId,
      players: [],
      settings,
      phase: 'setup',
      createdAt: new Date(),
    };

    set({
      lobby,
      isHost: true,
      isConnected: true,
      playerId: hostId,
      connectionError: null,
    });

    // In real implementation, connect to WebSocket server here
    return code;
  },

  joinLobby: async (code, playerName) => {
    try {
      // Mock join - in real implementation, connect via WebSocket
      const playerId = generatePlayerId();

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In real implementation, get lobby state from server
      // For now, we'll set up a mock connection
      set({
        isConnected: true,
        playerId,
        isHost: false,
        connectionError: null,
      });

      return true;
    } catch (error) {
      set({ connectionError: 'Failed to join lobby' });
      return false;
    }
  },

  leaveLobby: () => {
    // In real implementation, disconnect from WebSocket
    set({
      lobby: null,
      isHost: false,
      isConnected: false,
      playerId: null,
      connectionError: null,
    });
  },

  updateLobbySettings: (settings) => {
    set((state) => ({
      lobby: state.lobby
        ? { ...state.lobby, settings: { ...state.lobby.settings, ...settings } }
        : null,
    }));
  },

  addPlayerToLobby: (player) => {
    set((state) => ({
      lobby: state.lobby
        ? { ...state.lobby, players: [...state.lobby.players, player] }
        : null,
    }));
  },

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

  updateLobbyPhase: (phase) => {
    set((state) => ({
      lobby: state.lobby ? { ...state.lobby, phase } : null,
    }));
  },

  setConnectionError: (error) => {
    set({ connectionError: error });
  },

  syncLobbyState: (lobby) => {
    set({ lobby });
  },
}));
