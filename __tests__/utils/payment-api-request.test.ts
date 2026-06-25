const mockStorage = new Map<string, string>();
const mockGetApiBaseUrl = jest.fn(() => 'https://api.alphavlogs.com/');

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage.get(key) ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage.set(key, value);
    return Promise.resolve();
  }),
}));

jest.mock('@/constants', () => ({
  getApiBaseUrl: () => mockGetApiBaseUrl(),
  API: { TIMEOUT: 30000 },
  STORAGE_KEYS: {
    AUTH_TOKENS: 'auth_tokens',
  },
}));

jest.mock('@/utils/dev-log', () => ({
  devLog: jest.fn(),
}));

const mockSetTokens = jest.fn().mockResolvedValue(undefined);

jest.mock('@/stores/user-cached-store', () => ({
  useUserCachedStore: {
    getState: () => ({
      tokens: null,
      setTokens: mockSetTokens,
    }),
  },
}));

import * as Keychain from 'react-native-keychain';
import { STORAGE_KEYS } from '@/constants';
import {
  getStoredAuthTokensForPayment,
  paymentApiPost,
} from '../../src/utils/payment-api-request';
import { AUTH_KEYCHAIN_SERVER } from '../../src/utils/auth-storage';

const sampleTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
};

describe('payment-api-request utils', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();
    global.fetch = jest.fn();
    mockGetApiBaseUrl.mockReturnValue('https://api.alphavlogs.com/');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getStoredAuthTokensForPayment', () => {
    it('reads tokens from AsyncStorage', async () => {
      mockStorage.set(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(sampleTokens));
      await expect(getStoredAuthTokensForPayment()).resolves.toEqual(sampleTokens);
    });

    it('falls back to keychain and mirrors tokens into AsyncStorage', async () => {
      (Keychain.getInternetCredentials as jest.Mock).mockResolvedValueOnce({
        username: 'user',
        password: JSON.stringify(sampleTokens),
      });

      await expect(getStoredAuthTokensForPayment()).resolves.toEqual(sampleTokens);
      expect(mockStorage.get(STORAGE_KEYS.AUTH_TOKENS)).toBe(JSON.stringify(sampleTokens));
      expect(mockSetTokens).toHaveBeenCalledWith(sampleTokens);
      expect(Keychain.getInternetCredentials).toHaveBeenCalledWith(AUTH_KEYCHAIN_SERVER);
    });

    it('returns null when no credentials exist', async () => {
      (Keychain.getInternetCredentials as jest.Mock).mockResolvedValueOnce(false);
      await expect(getStoredAuthTokensForPayment()).resolves.toBeNull();
    });

    it('returns null when token parsing fails in dev', async () => {
      const originalDev = (global as { __DEV__?: boolean }).__DEV__;
      (global as { __DEV__?: boolean }).__DEV__ = true;
      mockStorage.set(STORAGE_KEYS.AUTH_TOKENS, 'not-json');

      await expect(getStoredAuthTokensForPayment()).resolves.toBeNull();
      (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    });
  });

  describe('paymentApiPost', () => {
    it('posts JSON and returns wrapped success payloads', async () => {
      mockStorage.set(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(sampleTokens));
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true, data: { orderId: 'ord_1' } }),
      });

      const result = await paymentApiPost<{ orderId: string }>('payments/create', {
        amount: 100,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.alphavlogs.com/payments/create',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer access-token',
            'X-Client-Platform': 'ios',
          }),
          body: JSON.stringify({ amount: 100 }),
        }),
      );
      expect(result).toMatchObject({
        success: true,
        data: { orderId: 'ord_1' },
        statusCode: 200,
        debug: expect.objectContaining({ hasAuth: true }),
      });
    });

    it('normalizes paths without a leading slash', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: () => 'text/plain' },
        text: async () => 'ok',
      });

      const result = await paymentApiPost('health');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.alphavlogs.com/health',
        expect.any(Object),
      );
      expect(result).toMatchObject({ success: true, data: 'ok' });
    });

    it('returns API error messages for failed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Invalid payment' }),
      });

      const result = await paymentApiPost('payments/create');
      expect(result).toMatchObject({
        success: false,
        error: 'Invalid payment',
        statusCode: 400,
      });
    });

    it('handles network failures and abort errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('offline'));
      const networkResult = await paymentApiPost('payments/create');
      expect(networkResult).toMatchObject({
        success: false,
        error: 'offline',
        statusCode: 0,
      });

      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);
      const abortResult = await paymentApiPost('payments/create');
      expect(abortResult.statusCode).toBe(408);
    });

    it('omits body for nullish payloads', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: { get: () => 'text/plain' },
        text: async () => '',
      });

      await paymentApiPost('payments/ping', null);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ body: undefined }),
      );
    });
  });
});
