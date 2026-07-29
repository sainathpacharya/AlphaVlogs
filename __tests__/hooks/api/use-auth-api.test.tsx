jest.mock('@tanstack/react-query', () =>
  jest.requireActual('../../../node_modules/@tanstack/react-query'),
);

import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authService from '@/services/auth-service';
import apiService from '@/services/api';
import { persistLoginSession } from '../../../src/utils/auth-session';
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSelectProfileMutation,
  useStudentProfilesQuery,
  useSwitchProfileMutation,
  useRegisterMutation,
  useLogoutMutation,
  useDeleteAccountMutation,
  useUpdateProfileMutation,
  useProfileQuery,
} from '../../../src/hooks/api/use-auth-api';

jest.mock('@/services/auth-service');
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { clearStoredAuth: jest.fn() },
}));
jest.mock('@/utils/auth-session', () => ({
  persistLoginSession: jest.fn(),
}));
jest.mock('@/stores', () => ({
  useUserStore: () => ({
    setAuthenticated: jest.fn(),
    setUser: jest.fn(),
    reset: jest.fn(),
  }),
  useUserCachedStore: Object.assign(
    jest.fn(() => ({
      clearAll: jest.fn().mockResolvedValue(undefined),
      setUserData: jest.fn(),
      setLinkedProfiles: jest.fn(),
      clearCache: jest.fn(),
      linkedProfiles: [],
    })),
    {
      getState: () => ({
        clearAll: jest.fn().mockResolvedValue(undefined),
        setUserData: jest.fn(),
        setLinkedProfiles: jest.fn(),
        clearCache: jest.fn(),
        linkedProfiles: [],
      }),
    },
  ),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockPersist = persistLoginSession as jest.MockedFunction<typeof persistLoginSession>;
const mockClearAuth = apiService.clearStoredAuth as jest.MockedFunction<
  typeof apiService.clearStoredAuth
>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('use-auth-api hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPersist.mockResolvedValue(undefined);
    mockClearAuth.mockResolvedValue(undefined);
  });

  it('useSendOtpMutation calls authService.sendOTP', async () => {
    mockAuthService.sendOTP.mockResolvedValue({ success: true, statusCode: 200 });

    const { result } = renderHook(() => useSendOtpMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ mobile: '9876543210', type: 'login' });
    });

    expect(mockAuthService.sendOTP).toHaveBeenCalledWith({
      mobile: '9876543210',
      type: 'login',
    });
  });

  it('useVerifyOtpMutation persists session on success', async () => {
    mockAuthService.verifyOTP.mockResolvedValue({
      success: true,
      data: {
        tokens: { accessToken: 'a', refreshToken: 'r' },
        user: { id: '1' } as any,
      },
      statusCode: 200,
    });

    const { result } = renderHook(() => useVerifyOtpMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ mobile: '9876543210', otp: '123456' });
    });

    expect(mockPersist).toHaveBeenCalled();
  });

  it('useSelectProfileMutation persists when profile selected', async () => {
    mockAuthService.selectProfile.mockResolvedValue({
      success: true,
      data: {
        user: { id: '1' } as any,
        tokens: { accessToken: 'a', refreshToken: 'r' },
      },
      statusCode: 200,
    });

    const { result } = renderHook(() => useSelectProfileMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ studentId: 1, mobile: '9876543210' });
    });

    expect(mockPersist).toHaveBeenCalled();
  });

  it('useStudentProfilesQuery loads profiles', async () => {
    mockAuthService.listProfiles.mockResolvedValue({
      success: true,
      data: { profiles: [{ studentId: 1 }] } as any,
      statusCode: 200,
    });

    const { result } = renderHook(() => useStudentProfilesQuery(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ studentId: 1 }]);
  });

  it('useStudentProfilesQuery throws on failure', async () => {
    mockAuthService.listProfiles.mockResolvedValue({
      success: false,
      error: 'No profiles',
      statusCode: 400,
    });

    const { result } = renderHook(() => useStudentProfilesQuery(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('useSwitchProfileMutation persists on success', async () => {
    mockAuthService.switchProfile.mockResolvedValue({
      success: true,
      data: {
        user: { id: '2' } as any,
        tokens: { accessToken: 'x', refreshToken: 'y' },
      },
      statusCode: 200,
    });

    const { result } = renderHook(() => useSwitchProfileMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync(2);
    });

    expect(mockAuthService.switchProfile).toHaveBeenCalledWith({ studentId: 2 });
    expect(mockPersist).toHaveBeenCalled();
  });

  it('useRegisterMutation calls authService.register', async () => {
    mockAuthService.register.mockResolvedValue({ success: true, statusCode: 200 });

    const { result } = renderHook(() => useRegisterMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({
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

    expect(mockAuthService.register).toHaveBeenCalled();
  });

  it('useLogoutMutation clears auth state', async () => {
    mockAuthService.logout.mockResolvedValue({ success: true, statusCode: 200 });

    const { result } = renderHook(() => useLogoutMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockClearAuth).toHaveBeenCalled();
  });

  it('useDeleteAccountMutation clears on success only', async () => {
    mockAuthService.deleteAccount.mockResolvedValue({ success: true, statusCode: 200 });

    const { result } = renderHook(() => useDeleteAccountMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockClearAuth).toHaveBeenCalled();
  });

  it('useUpdateProfileMutation updates stores on success', async () => {
    mockAuthService.updateProfile.mockResolvedValue({
      success: true,
      data: { id: '1', firstName: 'New' } as any,
      statusCode: 200,
    });

    const { result } = renderHook(() => useUpdateProfileMutation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ firstName: 'New' });
    });

    expect(mockAuthService.updateProfile).toHaveBeenCalledWith({ firstName: 'New' });
  });

  it('useProfileQuery is disabled by default', () => {
    const { result } = renderHook(() => useProfileQuery(), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockAuthService.getProfile).not.toHaveBeenCalled();
  });
});
