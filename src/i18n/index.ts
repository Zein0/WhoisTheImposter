import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import nl from './locales/nl.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';

const LANGUAGE_KEY = '@imposter/language';

const i18n = new I18n({
  en,
  nl,
  es,
  fr,
  pt,
});

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Set initial locale from device settings
i18n.locale = Localization.locale;

// Get stored language preference
export const getStoredLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.error('Error getting stored language:', error);
    return null;
  }
};

// Set language preference
export const setLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.locale = language;
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

// Initialize language from storage
export const initializeLanguage = async () => {
  const storedLanguage = await getStoredLanguage();
  if (storedLanguage) {
    i18n.locale = storedLanguage;
  } else {
    // Use device language if available, otherwise English
    const deviceLanguage = Localization.locale.split('-')[0];
    const supportedLanguages = ['en', 'nl', 'es', 'fr', 'pt'];
    i18n.locale = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
  }
};

export const t = (key: string, params?: any) => i18n.t(key, params);

export const getCurrentLanguage = () => i18n.locale;

export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export default i18n;
