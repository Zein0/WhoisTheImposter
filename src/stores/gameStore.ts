import { create } from 'zustand';
import { Player, GamePhase, GameSettings, GameResult } from '../types';
import { getRandomWordFromCategories } from '../data/categories';

interface GameStore {
  // State
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  currentPlayerIndex: number;
  selectedWord: string;
  firstSpeakerIndex: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  gameResult: GameResult | null;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  setSettings: (settings: Partial<GameSettings>) => void;
  setCurrentPlayerIndex: (index: number) => void;
  nextPlayer: () => void;
  setTimeRemaining: (time: number) => void;
  decrementTimer: () => void;
  setTimerRunning: (running: boolean) => void;
  startGame: () => void;
  startVoting: () => void;
  submitVotes: (playerId: string, votedPlayerIds: string[]) => void;
  calculateResults: () => void;
  resetGame: () => void;
  revealPlayer: (playerId: string) => void;
}

const generatePlayerId = () => Math.random().toString(36).substring(2, 9);

const initialSettings: GameSettings = {
  imposterCount: 1,
  timerDuration: 180, // 3 minutes
  selectedCategories: ['general'],
  isSpecialMode: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial State
  phase: 'setup',
  players: [],
  settings: initialSettings,
  currentPlayerIndex: 0,
  selectedWord: '',
  firstSpeakerIndex: 0,
  timeRemaining: 180,
  isTimerRunning: false,
  gameResult: null,

  // Actions
  setPhase: (phase) => set({ phase }),

  setPlayers: (players) => set({ players }),

  addPlayer: (name) =>
    set((state) => ({
      players: [
        ...state.players,
        {
          id: generatePlayerId(),
          name,
          hasRevealed: false,
          hasVoted: false,
          votes: [],
          isEliminated: false,
        },
      ],
    })),

  removePlayer: (id) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    })),

  updatePlayer: (id, updates) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  setCurrentPlayerIndex: (index) => set({ currentPlayerIndex: index }),

  nextPlayer: () =>
    set((state) => {
      const nextIndex = state.currentPlayerIndex + 1;
      if (nextIndex >= state.players.length) {
        // All players have revealed
        return {
          currentPlayerIndex: 0,
          phase: 'discussion',
          isTimerRunning: true,
        };
      }
      return { currentPlayerIndex: nextIndex };
    }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  decrementTimer: () =>
    set((state) => {
      const newTime = Math.max(0, state.timeRemaining - 1);
      return { timeRemaining: newTime };
    }),

  setTimerRunning: (running) => set({ isTimerRunning: running }),

  startGame: () => {
    const state = get();
    const { players, settings } = state;

    if (players.length < 2) return;

    // Select random word
    const word = getRandomWordFromCategories(settings.selectedCategories);

    // Assign roles
    let imposterCount = settings.imposterCount;
    const isAllImposters = imposterCount >= players.length;
    const isNoImposters = imposterCount === 0;

    // Special modes
    if (isAllImposters || isNoImposters) {
      set((state) => ({
        settings: { ...state.settings, isSpecialMode: true },
      }));
    }

    // Create a shuffled copy for role assignment
    const shuffledIndices = players
      .map((_, i) => i)
      .sort(() => Math.random() - 0.5);

    const imposterIndices = new Set(
      shuffledIndices.slice(0, isAllImposters ? players.length : imposterCount)
    );

    const updatedPlayers = players.map((player, index) => ({
      ...player,
      role: imposterIndices.has(index)
        ? ('imposter' as const)
        : ('crewmate' as const),
      word: imposterIndices.has(index) ? undefined : word,
      hasRevealed: false,
      hasVoted: false,
      votes: [],
      isEliminated: false,
    }));

    // Random first speaker
    const firstSpeakerIndex = Math.floor(Math.random() * players.length);

    set({
      phase: 'revealing',
      players: updatedPlayers,
      selectedWord: word,
      currentPlayerIndex: 0,
      firstSpeakerIndex,
      timeRemaining: settings.timerDuration,
      isTimerRunning: false,
      gameResult: null,
    });
  },

  revealPlayer: (playerId) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, hasRevealed: true } : p
      ),
    })),

  startVoting: () => {
    set({
      phase: 'voting',
      isTimerRunning: false,
    });
  },

  submitVotes: (playerId, votedPlayerIds) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId
          ? { ...p, hasVoted: true, votes: votedPlayerIds }
          : p
      ),
    })),

  calculateResults: () => {
    const state = get();
    const { players, settings, selectedWord } = state;

    // Count votes for each player
    const voteCounts: Record<string, number> = {};
    players.forEach((p) => {
      p.votes.forEach((votedId) => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
      });
    });

    // Find max votes
    const maxVotes = Math.max(...Object.values(voteCounts), 0);

    // Find all players with max votes (for tie)
    const eliminatedIds = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes && maxVotes > 0)
      .map(([id]) => id);

    // Mark eliminated players
    const updatedPlayers = players.map((p) => ({
      ...p,
      isEliminated: eliminatedIds.includes(p.id),
    }));

    // Get imposters
    const imposters = players.filter((p) => p.role === 'imposter');
    const eliminatedPlayers = updatedPlayers.filter((p) => p.isEliminated);

    // Determine winner
    // Crewmates win if at least one imposter is eliminated
    // Imposters win if no imposters are eliminated (or all eliminated are crewmates)
    const imposterEliminated = eliminatedPlayers.some(
      (p) => p.role === 'imposter'
    );

    // Special mode handling
    const winner: 'imposters' | 'crewmates' =
      settings.isSpecialMode && settings.imposterCount === 0
        ? 'crewmates' // No imposters mode - crewmates always win
        : settings.isSpecialMode && settings.imposterCount >= players.length
        ? 'imposters' // All imposters mode - imposters always win
        : imposterEliminated
        ? 'crewmates'
        : 'imposters';

    set({
      players: updatedPlayers,
      phase: 'results',
      gameResult: {
        winner,
        imposters,
        eliminatedPlayers,
        word: selectedWord,
      },
    });
  },

  resetGame: () =>
    set({
      phase: 'setup',
      players: [],
      settings: initialSettings,
      currentPlayerIndex: 0,
      selectedWord: '',
      firstSpeakerIndex: 0,
      timeRemaining: 180,
      isTimerRunning: false,
      gameResult: null,
    }),
}));
