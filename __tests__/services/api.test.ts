import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import apiService from '../../src/services/api';
import { apiLogger } from '../../src/utils/api-logger';
import { purgeAuthTokensFromDevice } from '../../src/utils/auth-storage';
import { useUserCachedStore } from '../../src/stores/user-cached-store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-keychain', () => ({
  getInternetCredentials: jest.fn(),
  setInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../src/utils/api-logger', () => ({
  apiLogger: {
    logRequestStart: jest.fn(),
    logRequestSuccess: jest.fn(),
    logRequestError: jest.fn(),
  },
}));

jest.mock('../../src/utils/auth-storage', () => ({
  purgeAuthTokensFromDevice: jest.fn(),
}));

jest.mock('../../src/stores/user-cached-store', () => ({
  useUserCachedStore: {
    setState: jest.fn(),
  },
}));

jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'http://192.168.29.26:8080',
  API_ENDPOINTS: {
    STUDENTS: {
      SEND_OTP: '/api/students/send-otp',
      VERIFY_OTP: '/api/students/verify-otp',
      SELECT_PROFILE: '/api/students/select-profile',
    },
    AUTH: {
      SEND_OTP: '/api/auth/send-otp',
      VERIFY_OTP: '/api/auth/verify-otp',
      REFRESH: '/api/auth/refresh',
      REGISTER: '/students/register',
      LOGOUT: '/auth/logout',
    },
  },
  API: { TIMEOUT: 30000 },
  STORAGE_KEYS: { AUTH_TOKENS: 'auth_tokens' },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockAsyncGet = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockKeychainGet = Keychain.getInternetCredentials as jest.MockedFunction<
  typeof Keychain.getInternetCredentials
>;
const mockNetInfo = NetInfo.fetch as jest.MockedFunction<typeof NetInfo.fetch>;
const mockPurge = purgeAuthTokensFromDevice as jest.MockedFunction<typeof purgeAuthTokensFromDevice>;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { get: jest.fn(() => 'application/json') },
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNetInfo.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    } as any);
    mockAsyncGet.mockResolvedValue(null);
    mockKeychainGet.mockResolvedValue(false);
    mockPurge.mockResolvedValue(undefined);
  });

  describe('get', () => {
    it('returns successful JSON response with auth header', async () => {
      mockAsyncGet.mockResolvedValue(
        JSON.stringify({ accessToken: 'access_1', refreshToken: 'refresh_1' }),
      );
      mockFetch.mockResolvedValue(
        jsonResponse({ success: true, data: { id: 1 }, statusCode: 200 }),
      );

      const result = await apiService.get('/api/auth/me');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://192.168.29.26:8080/api/auth/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer access_1',
          }),
        }),
      );
      expect(apiLogger.logRequestSuccess).toHaveBeenCalled();
    });

    it('skips auth for public OTP paths', async () => {
      mockAsyncGet.mockResolvedValue(
        JSON.stringify({ accessToken: 'stale', refreshToken: 'r' }),
      );
      mockFetch.mockResolvedValue(
        jsonResponse({ success: true, data: { sent: true }, statusCode: 200 }),
      );

      await apiService.post('/api/students/send-otp', { mobile: '9876543210' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBeUndefined();
    });

    it('appends query params to URL', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ success: true, data: [], statusCode: 200 }));

      await apiService.get('/events', { params: { page: 1, active: true, skip: null } });

      expect(mockFetch.mock.calls[0][0]).toBe(
        'http://192.168.29.26:8080/events?page=1&active=true',
      );
    });

    it('returns network error when offline', async () => {
      mockNetInfo.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      } as any);

      const result = await apiService.get('/api/auth/me');

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/connection/i);
      expect(result.statusCode).toBe(0);
    });

    it('maps HTTP errors to ApiResponse', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({ message: 'Not found' }, 404),
      );

      const result = await apiService.get('/missing');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBeTruthy();
    });

    it('handles non-JSON response body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: { get: jest.fn(() => 'text/plain') },
        json: async () => {
          throw new Error('not json');
        },
        text: async () => 'plain text',
      });

      const result = await apiService.get('/plain');

      expect(result).toBe('plain text');
    });
  });

  describe('postPublic', () => {
    it('posts without auth and wraps raw data', async () => {
      mockFetch.mockResolvedValue(jsonResponse({ id: 'new-user' }, 201));

      const result = await apiService.postPublic('/students/register', { name: 'A' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 'new-user' });
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBeUndefined();
    });

    it('returns already formatted ApiResponse when present', async () => {
      mockFetch.mockResolvedValue(
        jsonResponse({ success: false, error: 'Validation failed', statusCode: 400 }, 400),
      );

      const result = await apiService.postPublic('/students/register', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('returns network error when offline', async () => {
      mockNetInfo.mockResolvedValue({ isConnected: false } as any);

      const result = await apiService.postPublic('/students/register', {});

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(0);
    });
  });

  describe('token refresh', () => {
    it('refreshes token and retries on 401', async () => {
      mockAsyncGet.mockResolvedValue(
        JSON.stringify({ accessToken: 'old', refreshToken: 'refresh_ok' }),
      );

      mockFetch
        .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
        .mockResolvedValueOnce(
          jsonResponse({
            accessToken: 'new_access',
            refreshToken: 'new_refresh',
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({ success: true, data: { id: 99 }, statusCode: 200 }),
        );

      const result = await apiService.get('/protected');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 99 });
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('clears auth when refresh fails', async () => {
      mockAsyncGet.mockResolvedValue(
        JSON.stringify({ accessToken: 'old', refreshToken: 'bad_refresh' }),
      );

      mockFetch
        .mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401))
        .mockResolvedValueOnce(jsonResponse({ message: 'Invalid refresh' }, 401));

      const result = await apiService.get('/protected');

      expect(result.success).toBe(false);
      expect(mockPurge).toHaveBeenCalled();
    });

    it('returns 401 when no refresh token is stored', async () => {
      mockAsyncGet.mockResolvedValue(null);
      mockKeychainGet.mockResolvedValue(false);

      mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401));

      const result = await apiService.get('/protected');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(401);
    });
  });

  describe('uploadFile', () => {
    it('uploads with bearer token', async () => {
      mockAsyncGet.mockResolvedValue(
        JSON.stringify({ accessToken: 'upload_token', refreshToken: 'r' }),
      );
      mockFetch.mockResolvedValue(
        jsonResponse({ success: true, data: { url: 'https://cdn/x.mp4' }, statusCode: 200 }),
      );

      const file = { uri: 'file://x.mp4', name: 'x.mp4' };
      const result = await apiService.uploadFile('/video/upload', file);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://192.168.29.26:8080/video/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer upload_token',
          }),
        }),
      );
    });

    it('returns network error when offline', async () => {
      mockNetInfo.mockResolvedValue({ isConnected: false } as any);

      const result = await apiService.uploadFile('/video/upload', {});

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(0);
    });
  });

  describe('clearStoredAuth', () => {
    it('purges tokens and clears cached store', async () => {
      await apiService.clearStoredAuth();

      expect(mockPurge).toHaveBeenCalled();
      expect(useUserCachedStore.setState).toHaveBeenCalledWith({
        tokens: null,
        userData: null,
      });
    });
  });

  describe('HTTP verbs', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(jsonResponse({ success: true, data: {}, statusCode: 200 }));
    });

    it('supports put, patch, delete', async () => {
      await apiService.put('/resource', { a: 1 });
      await apiService.patch('/resource', { b: 2 });
      await apiService.delete('/resource');

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
      expect(mockFetch.mock.calls[1][1].method).toBe('PATCH');
      expect(mockFetch.mock.calls[2][1].method).toBe('DELETE');
    });
  });

  describe('timeout handling', () => {
    it('returns timeout error on abort', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      const result = await apiService.postPublic('/slow', {});

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/timed out/i);
      expect(result.statusCode).toBe(408);
    });
  });

  describe('token sources', () => {
    it('reads tokens from keychain when async storage is empty', async () => {
      mockAsyncGet.mockResolvedValue(null);
      mockKeychainGet.mockResolvedValue({
        username: 'user',
        password: JSON.stringify({ accessToken: 'from_keychain', refreshToken: 'r' }),
        service: 'auth_tokens',
        storage: 'keychain',
      } as any);
      mockFetch.mockResolvedValue(jsonResponse({ success: true, data: {}, statusCode: 200 }));

      await apiService.get('/secure');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBe('Bearer from_keychain');
    });

    it('returns null auth when stored tokens are invalid JSON', async () => {
      mockAsyncGet.mockResolvedValue('not-json');
      mockFetch.mockResolvedValue(jsonResponse({ success: true, data: {}, statusCode: 200 }));

      await apiService.get('/open');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.Authorization).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('maps unknown thrown values to generic errors', async () => {
      mockFetch.mockRejectedValue('boom');

      const result = await apiService.get('/broken');

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unknown error/i);
    });

    it('survives cached store clear failures', async () => {
      (useUserCachedStore.setState as jest.Mock).mockImplementation(() => {
        throw new Error('store unavailable');
      });

      await expect(apiService.clearStoredAuth()).resolves.toBeUndefined();
      expect(mockPurge).toHaveBeenCalled();
    });
  });
});
