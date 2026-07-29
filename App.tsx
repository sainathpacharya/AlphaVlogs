/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {Appearance} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GluestackUIProvider} from '@/components';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {I18nextProvider} from 'react-i18next';
import Navigation from '@/navigation';
import {ErrorBoundary} from '@/components/ErrorBoundary';
import {useNetwork} from '@/hooks/useNetwork';
import {setFirebaseUser, setupGlobalErrorHandler} from '@/services/firebase-service';
import apiService from '@/services/api';
import {devLog} from '@/utils/dev-log';
import {initializeSecureStorage} from '@/stores/user-cached-store';
import {useUserStore, useUserCachedStore} from '@/stores';
import {useShallow} from 'zustand/react/shallow';
import {i18next} from '@/services/i18n-service';
import {subscribeSslPinningErrors} from '@/config/ssl-pinning';
import {getApiBaseUrl} from '@/constants';
import {getStoredAuthApiBaseUrl} from '@/utils/auth-api-session';
import {waitForStoreHydration} from '@/hooks/useStoreHydration';
import {resolveAuthTokens} from '@/utils/auth-storage';

// Lock the app to light theme regardless of system appearance
Appearance.setColorScheme('light');

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
  const {isAuthenticated, user} = useAppContentStore();
  // Keep subscription so cached user/token updates re-render when needed.
  useAppContentCachedStore();

  // Initialize network monitoring
  useNetwork();

  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  useEffect(() => subscribeSslPinningErrors(), []);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      void setFirebaseUser(user.id, {
        user_role: user.role,
        user_email: user.email,
      });
      return;
    }

    void setFirebaseUser(null);
  }, [isAuthenticated, user]);

  // Initialize only after Zustand rehydration so we never wipe tokens while
  // isAuthenticated is still the pre-hydrate default (false).
  useEffect(() => {
    let cancelled = false;

    const initializeApp = async () => {
      try {
        await waitForStoreHydration();
        if (cancelled) {
          return;
        }

        const {
          isAuthenticated: authed,
          user: persistedUser,
          setAuthenticated: setAuth,
          setUser: setPersistedUser,
        } = useUserStore.getState();

        if (!authed) {
          await apiService.clearStoredAuth();
          return;
        }

        await initializeSecureStorage();
        if (cancelled) {
          return;
        }

        const storedApiBaseUrl = await getStoredAuthApiBaseUrl();
        const currentApiBaseUrl = getApiBaseUrl();
        if (storedApiBaseUrl && storedApiBaseUrl !== currentApiBaseUrl) {
          devLog('API base URL changed — clearing stale auth session', {
            storedApiBaseUrl,
            currentApiBaseUrl,
          });
          await useUserCachedStore.getState().clearAll();
          setAuth(false);
          setPersistedUser(null);
          return;
        }

        const restoredTokens = await resolveAuthTokens();
        if (!restoredTokens?.accessToken) {
          // Flag said logged-in but no Bearer tokens — force re-login.
          devLog('Authenticated flag without tokens — clearing session');
          await useUserCachedStore.getState().clearAll();
          setAuth(false);
          setPersistedUser(null);
          return;
        }

        const cachedUser = useUserCachedStore.getState().userData;
        if (!persistedUser && cachedUser) {
          setPersistedUser(cachedUser);
          setAuth(true);
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
  }, []);

  return <Navigation />;
});

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18next}>
          <GluestackUIProvider>
            <SafeAreaProvider>
              <AppContent />
            </SafeAreaProvider>
          </GluestackUIProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
