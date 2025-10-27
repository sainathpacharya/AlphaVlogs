import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, NetworkStatus, LocationData } from '@/types';

interface UserStore extends AppState {
  // Actions
  setLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: User | null) => void;
  setNetworkStatus: (status: NetworkStatus) => void;
  setLocation: (location: LocationData | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  reset: () => void;
}

const initialState: AppState = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
  networkStatus: {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  },
  location: null,
  theme: 'dark',
  language: 'en',
};

export const useUserStore = create<UserStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),

      setAuthenticated: (authenticated: boolean) =>
        set({ isAuthenticated: authenticated }),

      setUser: (user: User | null) =>
        set({ user }),

      setNetworkStatus: (status: NetworkStatus) =>
        set({ networkStatus: status }),

      setLocation: (location: LocationData | null) =>
        set({ location }),

      setTheme: (theme: 'light' | 'dark') =>
        set({ theme }),

      setLanguage: (language: string) =>
        set({ language }),

      reset: () => set(initialState),
    })),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

// Selectors for better performance
export const useIsAuthenticated = () => useUserStore(state => state.isAuthenticated);
export const useUser = () => useUserStore(state => state.user);
export const useIsLoading = () => useUserStore(state => state.isLoading);
export const useNetworkStatus = () => useUserStore(state => state.networkStatus);
export const useLocation = () => useUserStore(state => state.location);
export const useTheme = () => useUserStore(state => state.theme);
export const useLanguage = () => useUserStore(state => state.language);


