/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GluestackUIProvider} from '@/components';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {I18nextProvider} from 'react-i18next';
import Navigation from '@/navigation';
import {useNetwork} from '@/hooks/useNetwork';
import apiService from '@/services/api';
import {devLog} from '@/utils/dev-log';
import {initializeSecureStorage} from '@/stores/user-cached-store';
import {useUserStore, useUserCachedStore} from '@/stores';
import {useShallow} from 'zustand/react/shallow';
import {i18next} from '@/services/i18n-service';
import {subscribeSslPinningErrors} from '@/config/ssl-pinning';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const useAppContentStore = () =>
  useUserStore(
    useShallow(state => ({
      setAuthenticated: state.setAuthenticated,
      setUser: state.setUser,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
    })),
  );
const useAppContentCachedStore = () =>
  useUserCachedStore(
    useShallow((state) => ({
      tokens: state.tokens,
      userData: state.userData,
    })),
  );

const AppContent = React.memo(() => {
  const {setAuthenticated, setUser, isAuthenticated, user} =
    useAppContentStore();
  const {tokens, userData} = useAppContentCachedStore();

  // Initialize network monitoring
  useNetwork();

  useEffect(() => subscribeSslPinningErrors(), []);

  // Initialize app state
  useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      try {
        if (!isAuthenticated) {
          await apiService.clearStoredAuth();
        } else {
          await initializeSecureStorage();
        }

        if (cancelled) {
          return;
        }

        if (isAuthenticated && user) {
          // User is already authenticated from persistent store
        } else if (tokens?.accessToken && userData) {
          setUser(userData);
          setAuthenticated(true);
        }
      } catch (error) {
        if (__DEV__) {
          devLog('Failed to initialize app', error);
        }
      }
    };

    initializeApp();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return <Navigation />;
});

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18next}>
        <GluestackUIProvider>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </GluestackUIProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
