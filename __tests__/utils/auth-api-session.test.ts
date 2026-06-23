import {
  clearAuthApiBaseUrl,
  getStoredAuthApiBaseUrl,
  isAuthApiBaseUrlCurrent,
  recordAuthApiBaseUrl,
} from '../../src/utils/auth-api-session';

const mockStorage = new Map<string, string>();
const mockGetApiBaseUrl = jest.fn(() => 'https://api.alphavlogs.com');

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key: string, value: string) => {
    mockStorage.set(key, value);
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage.get(key) ?? null)),
  removeItem: jest.fn((key: string) => {
    mockStorage.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorage.clear();
    return Promise.resolve();
  }),
}));

jest.mock('@/constants', () => ({
  getApiBaseUrl: () => mockGetApiBaseUrl(),
  STORAGE_KEYS: {
    AUTH_API_BASE_URL: 'auth_api_base_url',
  },
}));

describe('auth-api-session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();
    mockGetApiBaseUrl.mockReturnValue('https://api.alphavlogs.com');
  });

  it('records the current API base URL', async () => {
    await recordAuthApiBaseUrl();
    await expect(getStoredAuthApiBaseUrl()).resolves.toBe(
      'https://api.alphavlogs.com',
    );
  });

  it('treats missing stored URL as current', async () => {
    await expect(isAuthApiBaseUrlCurrent()).resolves.toBe(true);
  });

  it('detects when the API base URL changed', async () => {
    await recordAuthApiBaseUrl();
    mockGetApiBaseUrl.mockReturnValue('http://192.168.1.9:8080');
    await expect(isAuthApiBaseUrlCurrent()).resolves.toBe(false);
  });

  it('clears the stored API base URL', async () => {
    await recordAuthApiBaseUrl();
    await clearAuthApiBaseUrl();
    await expect(getStoredAuthApiBaseUrl()).resolves.toBeNull();
  });
});
