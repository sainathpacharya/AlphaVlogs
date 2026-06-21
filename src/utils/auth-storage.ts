import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '@/constants';

/** Keychain server id used by setInternetCredentials / resetInternetCredentials. */
export const AUTH_KEYCHAIN_SERVER = 'auth_tokens';

/** Remove tokens from AsyncStorage and Keychain (all storage backends). */
export async function purgeAuthTokensFromDevice(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKENS, STORAGE_KEYS.USER_DATA]);

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
