import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import {
  AUTH_KEYCHAIN_SERVER,
  purgeAuthTokensFromDevice,
} from '../../src/utils/auth-storage';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((key) => mockStorage.delete(key));
    return Promise.resolve();
  }),
}));

describe('auth-storage utils', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();
    (global as { __DEV__?: boolean }).__DEV__ = true;
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('exports the keychain server id', () => {
    expect(AUTH_KEYCHAIN_SERVER).toBe('auth_tokens');
  });

  it('removes auth keys from AsyncStorage and resets keychain entries', async () => {
    mockStorage.set(STORAGE_KEYS.AUTH_TOKENS, 'tokens');
    mockStorage.set(STORAGE_KEYS.USER_DATA, 'user');
    mockStorage.set(STORAGE_KEYS.AUTH_API_BASE_URL, 'url');

    await purgeAuthTokensFromDevice();

    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
      STORAGE_KEYS.AUTH_TOKENS,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.AUTH_API_BASE_URL,
    ]);
    expect(Keychain.resetInternetCredentials).toHaveBeenCalledWith({
      server: AUTH_KEYCHAIN_SERVER,
    });
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: AUTH_KEYCHAIN_SERVER,
    });
    expect(mockStorage.has(STORAGE_KEYS.AUTH_TOKENS)).toBe(false);
  });

  it('warns in dev when keychain reset fails', async () => {
    (Keychain.resetInternetCredentials as jest.Mock).mockRejectedValueOnce(
      new Error('keychain unavailable'),
    );
    (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('generic reset failed'),
    );

    await purgeAuthTokensFromDevice();

    expect(console.warn).toHaveBeenCalledWith(
      '[auth-storage] resetInternetCredentials failed:',
      expect.any(Error),
    );
    expect(console.warn).toHaveBeenCalledWith(
      '[auth-storage] resetGenericPassword failed:',
      expect.any(Error),
    );
  });

  it('swallows keychain errors silently outside dev', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    (Keychain.resetInternetCredentials as jest.Mock).mockRejectedValueOnce(
      new Error('keychain unavailable'),
    );
    (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('generic reset failed'),
    );

    await expect(purgeAuthTokensFromDevice()).resolves.toBeUndefined();
    expect(console.warn).not.toHaveBeenCalled();
  });
});
