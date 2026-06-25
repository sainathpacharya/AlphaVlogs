import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '@/constants';
import { AuthTokens } from '@/types';
import { normalizeAuthTokens } from '@/utils/api-response';

/** Keychain server id used by setInternetCredentials / resetInternetCredentials. */
export const AUTH_KEYCHAIN_SERVER = 'auth_tokens';

function getMemoryAuthTokens(): AuthTokens | null {
  try {
    // Lazy require avoids auth-storage ↔ user-cached-store circular dependency.
    const { useUserCachedStore } =
      require('@/stores/user-cached-store') as typeof import('@/stores/user-cached-store');
    return useUserCachedStore.getState().tokens;
  } catch {
    return null;
  }
}

async function syncMemoryAuthTokens(tokens: AuthTokens): Promise<void> {
  const { useUserCachedStore } =
    require('@/stores/user-cached-store') as typeof import('@/stores/user-cached-store');
  await useUserCachedStore.getState().setTokens(tokens);
}

/** Read auth tokens from AsyncStorage, Keychain, or the in-memory session store. */
export async function resolveAuthTokens(): Promise<AuthTokens | null> {
  try {
    const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    if (tokensJson) {
      const parsed = normalizeAuthTokens(JSON.parse(tokensJson));
      if (parsed) {
        return parsed;
      }
    }

    const credentials = await Keychain.getInternetCredentials(AUTH_KEYCHAIN_SERVER);
    if (credentials !== false && credentials.password) {
      const parsed = normalizeAuthTokens(JSON.parse(credentials.password));
      if (parsed) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, credentials.password);
        await syncMemoryAuthTokens(parsed);
        return parsed;
      }
    }

    const memoryTokens = getMemoryAuthTokens();
    if (memoryTokens?.accessToken) {
      await persistAuthTokens(memoryTokens);
      return memoryTokens;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[auth-storage] resolveAuthTokens failed:', error);
    }
  }

  return null;
}

/** Persist tokens to AsyncStorage, Keychain, and the in-memory session store. */
export async function persistAuthTokens(tokens: AuthTokens): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
  await syncMemoryAuthTokens(tokens);
}

/** Remove tokens from AsyncStorage and Keychain (all storage backends). */
export async function purgeAuthTokensFromDevice(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.AUTH_TOKENS,
    STORAGE_KEYS.USER_DATA,
    STORAGE_KEYS.AUTH_API_BASE_URL,
  ]);

  try {
    await Keychain.resetInternetCredentials({ server: AUTH_KEYCHAIN_SERVER });
  } catch (error) {
    if (__DEV__) {
      console.warn('[auth-storage] resetInternetCredentials failed:', error);
    }
  }

  try {
    await Keychain.resetGenericPassword({ service: AUTH_KEYCHAIN_SERVER });
  } catch (error) {
    if (__DEV__) {
      console.warn('[auth-storage] resetGenericPassword failed:', error);
    }
  }
}
