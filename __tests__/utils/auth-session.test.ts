const mockStorage = new Map<string, string>();
const mockSetTokens = jest.fn(() => Promise.resolve());
const mockSetUserData = jest.fn();
const mockSetUser = jest.fn();
const mockSetAuthenticated = jest.fn();
const mockRecordAuthApiBaseUrl = jest.fn(() => Promise.resolve());

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
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((key) => mockStorage.delete(key));
    return Promise.resolve();
  }),
}));

jest.mock('@/stores/user-cached-store', () => ({
  useUserCachedStore: {
    getState: jest.fn(() => ({
      setTokens: mockSetTokens,
      setUserData: mockSetUserData,
    })),
  },
}));

jest.mock('@/stores/user-store', () => ({
  useUserStore: {
    getState: jest.fn(() => ({
      setUser: mockSetUser,
      setAuthenticated: mockSetAuthenticated,
    })),
  },
}));

jest.mock('@/utils/auth-api-session', () => ({
  recordAuthApiBaseUrl: (...args: unknown[]) => mockRecordAuthApiBaseUrl(...args),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import { AuthTokens, User } from '@/types';
import { persistLoginSession } from '../../src/utils/auth-session';

const sampleUser: User = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  mobile: '+919876543210',
  state: 'TS',
  district: 'Hyderabad',
  city: 'Hyderabad',
  pincode: '500001',
  roleId: 4,
  role: 'student',
  isVerified: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const sampleTokens: AuthTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
};

describe('auth-session utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.clear();
  });

  it('persists tokens, user data, and updates stores', async () => {
    await persistLoginSession(sampleUser, sampleTokens);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.AUTH_TOKENS,
      JSON.stringify(sampleTokens),
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(sampleUser),
    );
    expect(mockRecordAuthApiBaseUrl).toHaveBeenCalled();
    expect(mockSetTokens).toHaveBeenCalledWith(sampleTokens);
    expect(mockSetUserData).toHaveBeenCalledWith(sampleUser);
    expect(mockSetUser).toHaveBeenCalledWith(sampleUser);
    expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
  });
});
