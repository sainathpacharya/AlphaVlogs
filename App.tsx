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
import {initializeSecureStorage} from '@/stores/user-cached-store';
import {useUserStore, useUserCachedStore} from '@/stores';
import {LogBox, useColorScheme} from 'react-native';
import {i18next} from '@/services/i18n-service';

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

const AppContent = React.memo(() => {
  const {setAuthenticated, setUser, setTheme, isAuthenticated, user} =
    useUserStore();
  const {tokens, userData} = useUserCachedStore();

  // Initialize network monitoring
  useNetwork();

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
          console.log(
            'User authenticated from persistent store:',
            user.firstName,
          );
        } else if (tokens?.accessToken && userData) {
          // User has valid tokens, restore session
          setUser(userData);
          setAuthenticated(true);
          console.log('User session restored from tokens');
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Set light theme as default
  useEffect(() => {
    setTheme('light');
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
