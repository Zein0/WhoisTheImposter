import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionState } from '../types';

interface SubscriptionStore extends SubscriptionState {
  // State
  givenFreeCategories: string[];
  hasRated: boolean;
  gamesPlayed: number;

  // Actions
  setSubscribed: (isSubscribed: boolean, type?: 'weekly' | 'monthly' | 'yearly') => void;
  checkSubscription: () => Promise<void>;
  setGivenFreeCategories: (categories: string[]) => void;
  addGivenFreeCategory: (categoryId: string) => void;
  revokeGivenFreeCategories: () => void;
  setHasRated: (rated: boolean) => void;
  incrementGamesPlayed: () => void;
  loadStoredData: () => Promise<void>;
  canAccessCategory: (categoryId: string) => boolean;
  canUseSpecialMode: () => boolean;
  canCreateOnlineLobby: () => boolean;
}

const STORAGE_KEYS = {
  SUBSCRIPTION: '@imposter/subscription',
  FREE_CATEGORIES: '@imposter/free_categories',
  HAS_RATED: '@imposter/has_rated',
  GAMES_PLAYED: '@imposter/games_played',
};

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  // Initial State
  isSubscribed: false,
  subscriptionType: undefined,
  expiresAt: undefined,
  givenFreeCategories: [],
  hasRated: false,
  gamesPlayed: 0,

  // Actions
  setSubscribed: (isSubscribed, type) => {
    set({ isSubscribed, subscriptionType: type });
    AsyncStorage.setItem(
      STORAGE_KEYS.SUBSCRIPTION,
      JSON.stringify({ isSubscribed, subscriptionType: type })
    );
  },

  checkSubscription: async () => {
    // Mock subscription check - in real app, use RevenueCat SDK
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (stored) {
        const { isSubscribed, subscriptionType } = JSON.parse(stored);
        set({ isSubscribed, subscriptionType });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  },

  setGivenFreeCategories: (categories) => {
    set({ givenFreeCategories: categories });
    AsyncStorage.setItem(STORAGE_KEYS.FREE_CATEGORIES, JSON.stringify(categories));
  },

  addGivenFreeCategory: (categoryId) => {
    const current = get().givenFreeCategories;
    if (current.length >= 2) return; // Max 2 free categories from rating
    if (current.includes(categoryId)) return;

    const updated = [...current, categoryId];
    set({ givenFreeCategories: updated });
    AsyncStorage.setItem(STORAGE_KEYS.FREE_CATEGORIES, JSON.stringify(updated));
  },

  revokeGivenFreeCategories: () => {
    set({ givenFreeCategories: [], hasRated: false });
    AsyncStorage.removeItem(STORAGE_KEYS.FREE_CATEGORIES);
    AsyncStorage.setItem(STORAGE_KEYS.HAS_RATED, 'false');
  },

  setHasRated: (rated) => {
    set({ hasRated: rated });
    AsyncStorage.setItem(STORAGE_KEYS.HAS_RATED, rated ? 'true' : 'false');
  },

  incrementGamesPlayed: () => {
    const newCount = get().gamesPlayed + 1;
    set({ gamesPlayed: newCount });
    AsyncStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, newCount.toString());
  },

  loadStoredData: async () => {
    try {
      const [subscription, freeCategories, hasRated, gamesPlayed] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION),
          AsyncStorage.getItem(STORAGE_KEYS.FREE_CATEGORIES),
          AsyncStorage.getItem(STORAGE_KEYS.HAS_RATED),
          AsyncStorage.getItem(STORAGE_KEYS.GAMES_PLAYED),
        ]);

      if (subscription) {
        const { isSubscribed, subscriptionType } = JSON.parse(subscription);
        set({ isSubscribed, subscriptionType });
      }

      if (freeCategories) {
        set({ givenFreeCategories: JSON.parse(freeCategories) });
      }

      if (hasRated) {
        set({ hasRated: hasRated === 'true' });
      }

      if (gamesPlayed) {
        set({ gamesPlayed: parseInt(gamesPlayed, 10) });
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  },

  canAccessCategory: (categoryId) => {
    const state = get();
    const freeCategories = ['general', 'food'];

    // Free categories always accessible
    if (freeCategories.includes(categoryId)) return true;

    // Subscriber can access all
    if (state.isSubscribed) return true;

    // Check given free categories from rating
    if (state.givenFreeCategories.includes(categoryId)) return true;

    return false;
  },

  canUseSpecialMode: () => {
    return get().isSubscribed;
  },

  canCreateOnlineLobby: () => {
    return get().isSubscribed;
  },
}));
