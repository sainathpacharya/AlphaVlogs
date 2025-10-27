import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  return {
    t,
    i18n,
    // Helper method for nested keys
    tn: (key: string, params?: Record<string, string | number>) => {
      return t(key, params);
    },
    // Helper method for checking if key exists
    hasKey: (key: string) => {
      return i18n.exists(key);
    },
    // Helper method for getting current language
    getCurrentLanguage: () => i18n.language,
    // Helper method for changing language
    changeLanguage: (language: string) => i18n.changeLanguage(language),
  };
};

export default useTranslation;
