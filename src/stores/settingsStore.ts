import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsStore {
  // State
  isDarkMode: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Actions
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  loadSettings: () => Promise<void>;
}

const STORAGE_KEY = '@imposter/settings';

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial State
  isDarkMode: true, // Default to dark mode for gaming
  soundEnabled: true,
  vibrationEnabled: true,

  // Actions
  toggleDarkMode: () => {
    const newValue = !get().isDarkMode;
    set({ isDarkMode: newValue });
    saveSettings(get());
  },

  toggleSound: () => {
    const newValue = !get().soundEnabled;
    set({ soundEnabled: newValue });
    saveSettings(get());
  },

  toggleVibration: () => {
    const newValue = !get().vibrationEnabled;
    set({ vibrationEnabled: newValue });
    saveSettings(get());
  },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({
          isDarkMode: settings.isDarkMode ?? true,
          soundEnabled: settings.soundEnabled ?? true,
          vibrationEnabled: settings.vibrationEnabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },
}));

const saveSettings = async (settings: {
  isDarkMode: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
