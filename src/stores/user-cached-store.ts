import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { AuthTokens, StudentProfile, User } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { purgeAuthTokensFromDevice } from '@/utils/auth-storage';

interface CachedData {
  events: any[];
  quizResults: any[];
  lastUpdated: number;
}

interface UserCachedStore {
  // Auth tokens (stored securely)
  tokens: AuthTokens | null;

  // User data (stored in AsyncStorage)
  userData: User | null;

  /**
   * Sibling student profiles linked to the same mobile.
   * Saved from verify-otp / select-profile so Switch Student still works
   * when GET /api/students/profiles is unavailable on the active API host.
   */
  linkedProfiles: StudentProfile[];

  // App settings
  settings: {
    biometricEnabled: boolean;
    notificationsEnabled: boolean;
    autoLogin: boolean;
    lastLoginAt: number;
  };

  // Cached data
  cachedData: CachedData;

  // Actions
  setTokens: (tokens: AuthTokens | null) => Promise<void>;
  setUserData: (userData: User | null) => void;
  setLinkedProfiles: (profiles: StudentProfile[]) => void;
  setSettings: (settings: Partial<UserCachedStore['settings']>) => void;
  setCachedData: (key: keyof CachedData, data: any) => void;
  clearCache: () => void;
  clearAll: () => Promise<void>;
}

const defaultSettings = {
  biometricEnabled: false,
  notificationsEnabled: true,
  autoLogin: false,
  lastLoginAt: 0,
};

const defaultCachedData: CachedData = {
  events: [],
  quizResults: [],
  lastUpdated: 0,
};

export const useUserCachedStore = create<UserCachedStore>()(
  persist(
    (set, _get) => ({
      tokens: null,
      userData: null,
      linkedProfiles: [],
      settings: defaultSettings,
      cachedData: defaultCachedData,

      setTokens: async (tokens: AuthTokens | null) => {
        if (tokens) {
          // Store tokens securely in Keychain
          await Keychain.setInternetCredentials(
            'auth_tokens',
            'user',
            JSON.stringify(tokens)
          );
        } else {
          // Remove tokens from Keychain
          await Keychain.resetInternetCredentials({ server: 'auth_tokens' });
        }
        set({ tokens });
      },

      setUserData: (userData: User | null) => {
        set({ userData });
      },

      setLinkedProfiles: (profiles: StudentProfile[]) => {
        set({ linkedProfiles: profiles });
      },

      setSettings: (settings: Partial<UserCachedStore['settings']>) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      setCachedData: (key: keyof CachedData, data: any) => {
        set(state => ({
          cachedData: {
            ...state.cachedData,
            [key]: data,
            lastUpdated: Date.now(),
          },
        }));
      },

      clearCache: () => {
        set({ cachedData: defaultCachedData });
      },

      clearAll: async () => {
        await purgeAuthTokensFromDevice();

        set({
          tokens: null,
          userData: null,
          linkedProfiles: [],
          settings: defaultSettings,
          cachedData: defaultCachedData,
        });
      },
    }),
    {
      name: 'user-cached-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userData: state.userData,
        linkedProfiles: state.linkedProfiles,
        settings: state.settings,
        cachedData: state.cachedData,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<UserCachedStore>),
        tokens: null,
        linkedProfiles:
          (persistedState as Partial<UserCachedStore>)?.linkedProfiles ?? [],
      }),
    }
  )
);

// Initialize tokens from secure storage
export const initializeSecureStorage = async () => {
  try {
    const credentials = await Keychain.getInternetCredentials('auth_tokens');
    if (credentials && credentials.password) {
      const tokens: AuthTokens = JSON.parse(credentials.password);
      useUserCachedStore.setState({ tokens });

      const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      if (!tokensJson) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.AUTH_TOKENS,
          credentials.password,
        );
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to load tokens from secure storage:', error);
    }
  }
};

// Selectors
export const useTokens = () => useUserCachedStore(state => state.tokens);
export const useUserData = () => useUserCachedStore(state => state.userData);
export const useLinkedProfiles = () =>
  useUserCachedStore(state => state.linkedProfiles);
export const useSettings = () => useUserCachedStore(state => state.settings);
export const useCachedData = () => useUserCachedStore(state => state.cachedData);
export const useBiometricEnabled = () => useUserCachedStore(state => state.settings.biometricEnabled);
export const useNotificationsEnabled = () => useUserCachedStore(state => state.settings.notificationsEnabled);
