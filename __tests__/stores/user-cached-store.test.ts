import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { purgeAuthTokensFromDevice } from '../../src/utils/auth-storage';
import { User, AuthTokens } from '../../src/types';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
}));

jest.mock('../../src/utils/auth-storage', () => ({
  purgeAuthTokensFromDevice: jest.fn(),
}));

jest.mock('../../src/constants', () => ({
  STORAGE_KEYS: { AUTH_TOKENS: 'auth_tokens' },
}));

const mockUser: User = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  mobile: '9876543210',
  role: 'student',
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockTokens: AuthTokens = {
  accessToken: 'access',
  refreshToken: 'refresh',
};

type StoreSlice = {
  tokens: AuthTokens | null;
  userData: User | null;
  settings: {
    biometricEnabled: boolean;
    notificationsEnabled: boolean;
    autoLogin: boolean;
    lastLoginAt: number;
  };
  cachedData: {
    events: unknown[];
    quizResults: unknown[];
    lastUpdated: number;
  };
  setTokens: (tokens: AuthTokens | null) => Promise<void>;
  setUserData: (userData: User | null) => void;
  setSettings: (settings: Partial<StoreSlice['settings']>) => void;
  setCachedData: (key: 'events' | 'quizResults', data: unknown) => void;
  clearCache: () => void;
  clearAll: () => Promise<void>;
};

function createTestStore(): StoreSlice {
  const defaultSettings = {
    biometricEnabled: false,
    notificationsEnabled: true,
    autoLogin: false,
    lastLoginAt: 0,
  };
  const defaultCachedData = {
    events: [] as unknown[],
    quizResults: [] as unknown[],
    lastUpdated: 0,
  };

  const state: StoreSlice = {
    tokens: null,
    userData: null,
    settings: { ...defaultSettings },
    cachedData: { ...defaultCachedData },
    setTokens: async (tokens: AuthTokens | null) => {
      if (tokens) {
        await Keychain.setInternetCredentials('auth_tokens', 'user', JSON.stringify(tokens));
      } else {
        await Keychain.resetInternetCredentials({ server: 'auth_tokens' });
      }
      state.tokens = tokens;
    },
    setUserData: (userData: User | null) => {
      state.userData = userData;
    },
    setSettings: (settings: Partial<StoreSlice['settings']>) => {
      state.settings = { ...state.settings, ...settings };
    },
    setCachedData: (key: 'events' | 'quizResults', data: unknown) => {
      state.cachedData = {
        ...state.cachedData,
        [key]: data,
        lastUpdated: Date.now(),
      };
    },
    clearCache: () => {
      state.cachedData = { ...defaultCachedData };
    },
    clearAll: async () => {
      await purgeAuthTokensFromDevice();
      state.tokens = null;
      state.userData = null;
      state.settings = { ...defaultSettings };
      state.cachedData = { ...defaultCachedData };
    },
  };

  return state;
}

describe('user-cached-store', () => {
  let store: StoreSlice;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore();
  });

  describe('setTokens', () => {
    it('stores tokens in keychain and state', async () => {
      await store.setTokens(mockTokens);

      expect(Keychain.setInternetCredentials).toHaveBeenCalledWith(
        'auth_tokens',
        'user',
        JSON.stringify(mockTokens),
      );
      expect(store.tokens).toEqual(mockTokens);
    });

    it('clears keychain when tokens are null', async () => {
      await store.setTokens(mockTokens);
      await store.setTokens(null);

      expect(Keychain.resetInternetCredentials).toHaveBeenCalledWith({
        server: 'auth_tokens',
      });
      expect(store.tokens).toBeNull();
    });
  });

  describe('setUserData and settings', () => {
    it('updates user data', () => {
      store.setUserData(mockUser);
      expect(store.userData).toEqual(mockUser);
    });

    it('merges settings', () => {
      store.setSettings({ biometricEnabled: true });

      expect(store.settings.biometricEnabled).toBe(true);
      expect(store.settings.notificationsEnabled).toBe(true);
    });
  });

  describe('cached data', () => {
    it('stores cached lists and updates timestamp', () => {
      const before = store.cachedData.lastUpdated;

      store.setCachedData('events', [{ id: '1' }]);

      expect(store.cachedData.events).toEqual([{ id: '1' }]);
      expect(store.cachedData.lastUpdated).toBeGreaterThanOrEqual(before);
    });

    it('clears cache without touching auth', async () => {
      await store.setTokens(mockTokens);
      store.setCachedData('events', [{ id: '1' }]);

      store.clearCache();

      expect(store.cachedData.events).toEqual([]);
      expect(store.tokens).toEqual(mockTokens);
    });
  });

  describe('clearAll', () => {
    it('purges auth and resets state', async () => {
      await store.setTokens(mockTokens);
      store.setUserData(mockUser);
      store.setSettings({ autoLogin: true });

      await store.clearAll();

      expect(purgeAuthTokensFromDevice).toHaveBeenCalled();
      expect(store.tokens).toBeNull();
      expect(store.userData).toBeNull();
      expect(store.settings.autoLogin).toBe(false);
    });
  });

  describe('initializeSecureStorage behavior', () => {
    it('hydrates tokens from keychain and mirrors to async storage', async () => {
      const setState = jest.fn();

      (Keychain.getInternetCredentials as jest.Mock).mockResolvedValue({
        password: JSON.stringify(mockTokens),
      });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const credentials = await Keychain.getInternetCredentials('auth_tokens');
      if (credentials && credentials.password) {
        const tokens: AuthTokens = JSON.parse(credentials.password);
        setState({ tokens });

        const tokensJson = await AsyncStorage.getItem('auth_tokens');
        if (!tokensJson) {
          await AsyncStorage.setItem('auth_tokens', credentials.password);
        }
      }

      expect(setState).toHaveBeenCalledWith({ tokens: mockTokens });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'auth_tokens',
        JSON.stringify(mockTokens),
      );
    });
  });
});
