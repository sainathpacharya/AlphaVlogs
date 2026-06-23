import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApiBaseUrl, STORAGE_KEYS} from '@/constants';

/** API origin used when the user last signed in (dev LAN vs production). */
export async function recordAuthApiBaseUrl(): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.AUTH_API_BASE_URL,
    getApiBaseUrl(),
  );
}

export async function getStoredAuthApiBaseUrl(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.AUTH_API_BASE_URL);
}

export async function isAuthApiBaseUrlCurrent(): Promise<boolean> {
  const stored = await getStoredAuthApiBaseUrl();
  if (!stored) {
    return true;
  }
  return stored === getApiBaseUrl();
}

export async function clearAuthApiBaseUrl(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_API_BASE_URL);
}
