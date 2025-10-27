import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import strings from '@/constants/strings.json';

type StringKeys = keyof typeof strings;
type NestedStringKeys = {
  [K in StringKeys]: keyof typeof strings[K];
};

// Initialize i18next with react-i18next
const initializeI18n = async () => {
  if (!i18next.isInitialized) {
    await i18next
      .use(initReactI18next)
      .init({
        resources: {
          en: {
            translation: strings,
          },
        },
        lng: 'en', // default language
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false, // React already escapes values
        },
        react: {
          useSuspense: false, // Recommended for React Native
        },
        // Use compatibility JSON format to avoid Intl.PluralRules dependency
        compatibilityJSON: 'v3',
        // Disable pluralization features that require Intl.PluralRules
        pluralSeparator: '_',
        contextSeparator: '_',
      });
  }
  return i18next;
};

// Initialize immediately
initializeI18n().catch(console.error);

class I18nService {
  private currentLanguage: string = 'en';
  private translations: Record<string, any> = {
    en: strings,
  };

  constructor() {
    this.loadLanguage();
  }

  private loadLanguage() {
    // In the future, load language from device settings or user preference
    this.currentLanguage = 'en';
  }

  // Get a string by key path (e.g., 'common.loading')
  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage] || this.translations.en;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Replace parameters in the string
    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  // Interpolate parameters in a string
  private interpolate(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Set language (for future use)
  setLanguage(language: string) {
    this.currentLanguage = language;
    if (i18next.isInitialized) {
      i18next.changeLanguage(language);
    }
    // In the future, save to AsyncStorage and load translations
  }

  // Get available languages
  getAvailableLanguages(): string[] {
    return Object.keys(this.translations);
  }

  // Check if a key exists
  hasKey(key: string): boolean {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage] || this.translations.en;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return typeof value === 'string';
  }

  // Get nested object (for complex translations)
  getNested(key: string): any {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage] || this.translations.en;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }

    return value;
  }

  // Get the i18next instance for direct use
  getI18next() {
    return i18next;
  }

  // Check if i18next is ready
  isReady() {
    return i18next.isInitialized;
  }

  // Wait for i18next to be ready
  async waitForReady() {
    if (i18next.isInitialized) {
      return i18next;
    }
    return initializeI18n();
  }
}

export const i18n = new I18nService();
export default i18n;
export { i18next, initializeI18n };
