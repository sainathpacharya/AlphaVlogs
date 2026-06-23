jest.mock('@/constants/strings.json', () => ({
  common: {
    loading: 'Loading...',
    greeting: 'Hello {name}',
  },
  auth: {
    login: 'Login',
  },
}));

jest.mock('i18next', () => {
  const instance = {
    isInitialized: false,
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockImplementation(async () => {
      instance.isInitialized = true;
    }),
    changeLanguage: jest.fn(),
    t: jest.fn((key: string) => key),
  };
  return {
    __esModule: true,
    default: instance,
  };
});

jest.mock('react-i18next', () => ({
  initReactI18next: {},
}));

import { i18n, initializeI18n } from '../../src/services/i18n-service';
import i18next from 'i18next';

describe('I18nService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('t', () => {
    it('returns nested translation string', () => {
      expect(i18n.t('common.loading')).toBe('Loading...');
      expect(i18n.t('auth.login')).toBe('Login');
    });

    it('interpolates parameters', () => {
      expect(i18n.t('common.greeting', { name: 'Alex' })).toBe('Hello Alex');
    });

    it('returns key when translation is missing', () => {
      expect(i18n.t('missing.key')).toBe('missing.key');
    });

    it('returns key when value is not a string', () => {
      expect(i18n.t('auth')).toBe('auth');
    });
  });

  describe('hasKey', () => {
    it('returns true for existing string keys', () => {
      expect(i18n.hasKey('common.loading')).toBe(true);
    });

    it('returns false for missing keys', () => {
      expect(i18n.hasKey('does.not.exist')).toBe(false);
    });
  });

  describe('getNested', () => {
    it('returns nested object', () => {
      expect(i18n.getNested('common')).toEqual({
        loading: 'Loading...',
        greeting: 'Hello {name}',
      });
    });

    it('returns null for missing path', () => {
      expect(i18n.getNested('missing.path')).toBeNull();
    });
  });

  describe('language helpers', () => {
    it('returns current and available languages', () => {
      expect(i18n.getCurrentLanguage()).toBe('en');
      expect(i18n.getAvailableLanguages()).toContain('en');
    });

    it('changes language via i18next when initialized', () => {
      (i18next as { isInitialized: boolean }).isInitialized = true;
      i18n.setLanguage('en');
      expect(i18next.changeLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('i18next integration', () => {
    it('exposes i18next instance', () => {
      expect(i18n.getI18next()).toBe(i18next);
    });

    it('reports ready state', () => {
      (i18next as { isInitialized: boolean }).isInitialized = true;
      expect(i18n.isReady()).toBe(true);
    });

    it('waits for initialization', async () => {
      (i18next as { isInitialized: boolean }).isInitialized = false;
      await initializeI18n();
      expect(i18next.init).toHaveBeenCalled();
    });
  });
});
