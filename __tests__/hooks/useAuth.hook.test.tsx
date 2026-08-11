jest.mock('@tanstack/react-query', () =>
  jest.requireActual('../../node_modules/@tanstack/react-query'),
);

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import authService from '../../src/services/auth-service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../src/constants';

jest.mock('../../src/services/auth-service');
jest.mock('../../src/utils/auth-session', () => ({
  persistLoginSession: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    clearStoredAuth: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockCachedStoreState = {
  setTokens: jest.fn().mockResolvedValue(undefined),
  setUserData: jest.fn(),
  setLinkedProfiles: jest.fn(),
  clearAll: jest.fn().mockResolvedValue(undefined),
  clearCache: jest.fn(),
};

const mockUserStoreState = {
  setLoading: jest.fn(),
  setAuthenticated: jest.fn(),
  setUser: jest.fn(),
  reset: jest.fn(),
};

jest.mock('../../src/stores', () => ({
  useUserStore: jest.fn((selector?: (state: typeof mockUserStoreState) => unknown) =>
    selector ? selector(mockUserStoreState) : mockUserStoreState,
  ),
  useUserCachedStore: Object.assign(
    jest.fn((selector?: (state: typeof mockCachedStoreState) => unknown) =>
      selector ? selector(mockCachedStoreState) : mockCachedStoreState,
    ),
    {
      getState: () => mockCachedStoreState,
    },
  ),
}));

jest.mock('../../src/hooks/api/use-auth-api', () => {
  const actual = jest.requireActual('../../src/hooks/api/use-auth-api');
  return {
    ...actual,
    useProfileQuery: jest.fn(() => ({
      data: { success: true, data: { id: '1', firstName: 'Profile' } },
      isLoading: false,
    })),
  };
});

const mockAuthService = authService as jest.Mocked<typeof authService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns login success when tokens and user are present', async () => {
    mockAuthService.verifyOTP.mockResolvedValue({
      success: true,
      data: {
        tokens: { accessToken: 'a', refreshToken: 'r' },
        user: { id: '1', role: 'student' } as any,
      },
      statusCode: 200,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let response: { success: boolean; message: string } | undefined;
    await act(async () => {
      response = await result.current.login({ mobile: '9876543210', otp: '123456' });
    });

    expect(response?.success).toBe(true);
    expect(response?.message).toBe(SUCCESS_MESSAGES.LOGIN_SUCCESS);
  });

  it('returns selection required response', async () => {
    mockAuthService.verifyOTP.mockResolvedValue({
      success: true,
      data: {
        selectionRequired: true,
        profiles: [{ studentId: 1 }],
      },
      statusCode: 200,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let response: any;
    await act(async () => {
      response = await result.current.verifyOTP({ mobile: '9876543210', otp: '123456' });
    });

    expect(response.success).toBe(true);
    expect(response.selectionRequired).toBe(true);
    expect(response.profiles).toHaveLength(1);
  });

  it('returns error message on failed verify', async () => {
    mockAuthService.verifyOTP.mockResolvedValue({
      success: false,
      error: 'Invalid OTP',
      statusCode: 400,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let response: any;
    await act(async () => {
      response = await result.current.verifyOTP({ mobile: '9876543210', otp: '000000' });
    });

    expect(response.success).toBe(false);
    expect(response.message).toBe('Invalid OTP');
  });

  it('handles register success and failure', async () => {
    mockAuthService.register.mockResolvedValueOnce({
      success: true,
      data: { id: '1' } as any,
      statusCode: 200,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let ok: any;
    await act(async () => {
      ok = await result.current.register({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        mobile: '9876543210',
        pincode: '500001',
        state: 'TS',
        district: 'HYD',
        city: 'HYD',
      });
    });
    expect(ok.success).toBe(true);

    mockAuthService.register.mockResolvedValueOnce({
      success: false,
      error: 'Exists',
      statusCode: 400,
    });

    let fail: any;
    await act(async () => {
      fail = await result.current.register({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        mobile: '9876543210',
        pincode: '500001',
        state: 'TS',
        district: 'HYD',
        city: 'HYD',
      });
    });
    expect(fail.message).toBe('Exists');
  });

  it('logs out successfully', async () => {
    mockAuthService.logout.mockResolvedValue({ success: true, statusCode: 200 });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let response: any;
    await act(async () => {
      response = await result.current.logout();
    });

    expect(response.success).toBe(true);
    expect(response.message).toBe(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  });

  it('updates profile and fetches profile via query client', async () => {
    mockAuthService.updateProfile.mockResolvedValue({
      success: true,
      data: { id: '1', firstName: 'Updated' } as any,
      statusCode: 200,
    });
    mockAuthService.getProfile.mockResolvedValue({
      success: true,
      data: { id: '1', firstName: 'Fetched' } as any,
      statusCode: 200,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let update: any;
    await act(async () => {
      update = await result.current.updateProfile({ firstName: 'Updated' });
    });
    expect(update.success).toBe(true);

    let profile: any;
    await act(async () => {
      profile = await result.current.getProfile();
    });
    expect(profile.success).toBe(true);

    expect(result.current.userProfile?.firstName).toBe('Profile');
  });

  it('returns unknown error when verify has no error string', async () => {
    mockAuthService.verifyOTP.mockResolvedValue({
      success: false,
      statusCode: 400,
    } as any);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    let response: any;
    await act(async () => {
      response = await result.current.verifyOTP({ mobile: '9876543210', otp: '1' });
    });

    expect(response.message).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
  });
});
