/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {useColorScheme} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GluestackUIProvider} from '@/components';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {I18nextProvider} from 'react-i18next';
import Navigation from '@/navigation';
import {useNetwork} from '@/hooks/useNetwork';
import {initializeSecureStorage} from '@/stores/user-cached-store';
import {useUserStore, useUserCachedStore} from '@/stores';
import {useShallow} from 'zustand/react/shallow';
import {LogBox} from 'react-native';
import {i18next} from '@/services/i18n-service';
import {subscribeSslPinningErrors} from '@/config/ssl-pinning';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Select only what we need; useShallow so store updates (e.g. networkStatus) don't re-render the whole app
const useAppContentStore = () =>
  useUserStore(
    useShallow((state) => ({
      setAuthenticated: state.setAuthenticated,
      setUser: state.setUser,
      setTheme: state.setTheme,
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
  const {setAuthenticated, setUser, setTheme, isAuthenticated, user} =
    useAppContentStore();
  const {tokens, userData} = useAppContentCachedStore();

  // Initialize network monitoring
  useNetwork();

  useEffect(() => subscribeSslPinningErrors(), []);

  // Initialize app state
  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    const initializeApp = async () => {
      try {
        // Initialize secure storage
        await initializeSecureStorage();

        // Check if user is authenticated from persistent store
        if (isAuthenticated && user) {
          // User is already authenticated from persistent store
        } else if (tokens?.accessToken && userData) {
          setUser(userData);
          setAuthenticated(true);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Failed to initialize app:', error);
        }
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Keep store theme in sync with device appearance
  const colorScheme = useColorScheme();
  useEffect(() => {
    setTheme(colorScheme === 'dark' ? 'dark' : 'light');
  }, [colorScheme, setTheme]);

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
