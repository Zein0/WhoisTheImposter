export type PlayerRole = 'crewmate' | 'imposter';

export interface Player {
  id: string;
  name: string;
  role?: PlayerRole;
  word?: string;
  hasRevealed: boolean;
  hasVoted: boolean;
  votes: string[]; // IDs of players this player voted for
  isEliminated: boolean;
  isOnline?: boolean;
}

export interface GameSettings {
  imposterCount: number;
  timerDuration: number; // in seconds
  selectedCategories: string[];
  isSpecialMode: boolean; // 0 imposters or all imposters
}

export type GamePhase =
  | 'setup'
  | 'revealing'
  | 'discussion'
  | 'paused'
  | 'voting'
  | 'results';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  currentPlayerIndex: number;
  selectedWord: string;
  firstSpeakerIndex: number;
  timeRemaining: number;
  isTimerRunning: boolean;
  gameResult?: GameResult;
}

export interface GameResult {
  winner: 'imposters' | 'crewmates';
  imposters: Player[];
  eliminatedPlayers: Player[];
  word: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isPremium: boolean;
  words: string[];
}

export interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionType?: 'weekly' | 'monthly' | 'yearly';
  expiresAt?: Date;
}

export interface OnlineLobby {
  code: string;
  hostId: string;
  players: Player[];
  settings: GameSettings;
  phase: GamePhase;
  createdAt: Date;
}

export interface VotingState {
  votes: Record<string, string[]>; // playerId -> array of voted player IDs
  votesPerPlayer: number;
  hasEveryoneVoted: boolean;
}

export type NavigationParamList = {
  Home: undefined;
  CreateLobby: { mode: 'local' | 'online' };
  LocalGame: undefined;
  OnlineGame: { lobbyCode: string };
  JoinLobby: undefined;
  Results: undefined;
  Categories: undefined;
  Settings: undefined;
  Subscription: undefined;
};
