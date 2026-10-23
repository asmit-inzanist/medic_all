import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import bnTranslations from './locales/bn.json';
import taTranslations from './locales/ta.json';
import teTranslations from './locales/te.json';
import guTranslations from './locales/gu.json';
import mrTranslations from './locales/mr.json';
import paTranslations from './locales/pa.json';

const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  },
  bn: {
    translation: bnTranslations
  },
  ta: {
    translation: taTranslations
  },
  te: {
    translation: teTranslations
  },
  gu: {
    translation: guTranslations
  },
  mr: {
    translation: mrTranslations
  },
  pa: {
    translation: paTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'selectedLanguage',
      caches: ['localStorage'],
    },
  });

export default i18n;
