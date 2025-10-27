import React from 'react';
import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useAuth} from '../../src/hooks/useAuth';
import {useUserStore, useUserCachedStore} from '../../src/stores';
import authService from '../../src/services/auth-service';
import {SUCCESS_MESSAGES, ERROR_MESSAGES} from '../../src/constants';

// Mock dependencies
jest.mock('../../src/stores');
jest.mock('../../src/services/auth-service');
jest.mock('../../src/constants', () => ({
  APP_CONFIG: {
    apiUrl: 'http://localhost:3000/api',
    environment: 'test',
    version: '1.0.0',
    buildNumber: '1',
  },
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CACHE_TIME: 5 * 60 * 1000,
    STALE_TIME: 2 * 60 * 1000,
  },
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Login successful',
    REGISTRATION_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
  ERROR_MESSAGES: {
    UNKNOWN_ERROR: 'An unknown error occurred',
  },
}));

const mockUseUserStore = useUserStore as jest.MockedFunction<
  typeof useUserStore
>;
const mockUseUserCachedStore = useUserCachedStore as jest.MockedFunction<
  typeof useUserCachedStore
>;
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  verifyOTP: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),
  getProfile: jest.fn(),
} as jest.Mocked<typeof authService>;

// Mock store functions
const mockSetAuthenticated = jest.fn();
const mockSetUser = jest.fn();
const mockSetLoading = jest.fn();
const mockSetTokens = jest.fn();
const mockSetUserData = jest.fn();
const mockClearAll = jest.fn();

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  });
  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup store mocks
    mockUseUserStore.mockReturnValue({
      setAuthenticated: mockSetAuthenticated,
      setUser: mockSetUser,
      setLoading: mockSetLoading,
    } as any);

    mockUseUserCachedStore.mockReturnValue({
      setTokens: mockSetTokens,
      setUserData: mockSetUserData,
      clearAll: mockClearAll,
    } as any);
  });

  describe('login', () => {
    it('should handle successful login', async () => {
      const mockLoginData = {mobile: '9876543210', otp: '123456'};
      const mockResponse = {
        success: true,
        data: {
          user: {id: '1', firstName: 'John'},
          tokens: {accessToken: 'token123'},
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);
      mockSetTokens.mockResolvedValue(undefined);
      mockClearAll.mockResolvedValue(undefined);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const loginResult = await result.current.login(mockLoginData);

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockSetTokens).toHaveBeenCalledWith(mockResponse.data.tokens);
      expect(mockSetUserData).toHaveBeenCalledWith(mockResponse.data.user);
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user);
      expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      expect(loginResult).toEqual({
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      });
    });

    it('should handle failed login', async () => {
      const mockLoginData = {mobile: '9876543210', otp: '123456'};
      const mockResponse = {
        success: false,
        error: 'Invalid OTP',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const loginResult = await result.current.login(mockLoginData);

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(loginResult).toEqual({
        success: false,
        message: 'Invalid OTP',
      });
    });

    it('should handle login error', async () => {
      const mockLoginData = {mobile: '9876543210', otp: '123456'};
      const error = new Error('Network error');

      mockAuthService.login.mockRejectedValue(error);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const loginResult = await result.current.login(mockLoginData);

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(loginResult).toEqual({
        success: false,
        message: 'Network error',
      });
    });
  });

  describe('register', () => {
    it('should handle successful registration', async () => {
      const mockRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'john@example.com',
        mobileNumber: '9876543210',
        state: 'California',
        district: 'Los Angeles',
        city: 'Los Angeles',
        pincode: '123456',
      };
      const mockResponse = {
        success: true,
        data: {id: '1', firstName: 'John'},
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const registerResult = await result.current.register(mockRegisterData);

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(registerResult).toEqual({
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      });
    });

    it('should handle failed registration', async () => {
      const mockRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        emailId: 'john@example.com',
        mobileNumber: '9876543210',
        state: 'California',
        district: 'Los Angeles',
        city: 'Los Angeles',
        pincode: '123456',
      };
      const mockResponse = {
        success: false,
        error: 'Email already exists',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const registerResult = await result.current.register(mockRegisterData);

      expect(registerResult).toEqual({
        success: false,
        message: 'Email already exists',
      });
    });
  });

  describe('verifyOTP', () => {
    it('should handle successful OTP verification', async () => {
      const mockOTPData = {mobile: '9876543210', otp: '123456'};
      const mockResponse = {
        success: true,
        data: {
          user: {id: '1', firstName: 'John'},
          tokens: {accessToken: 'token123'},
        },
      };

      mockAuthService.verifyOTP.mockResolvedValue(mockResponse);
      mockSetTokens.mockResolvedValue(undefined);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const verifyResult = await result.current.verifyOTP(mockOTPData);

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockSetTokens).toHaveBeenCalledWith(mockResponse.data.tokens);
      expect(mockSetUserData).toHaveBeenCalledWith(mockResponse.data.user);
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user);
      expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      expect(verifyResult).toEqual({
        success: true,
        message: 'OTP verified successfully!',
      });
    });
  });

  describe('logout', () => {
    it('should handle successful logout', async () => {
      const mockResponse = {success: true};

      mockAuthService.logout.mockResolvedValue(mockResponse);
      mockClearAll.mockResolvedValue(undefined);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const logoutResult = await result.current.logout();

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockClearAll).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(null);
      expect(mockSetAuthenticated).toHaveBeenCalledWith(false);
      expect(logoutResult).toEqual({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    });

    it('should clear data even if logout API fails', async () => {
      const error = new Error('Network error');

      mockAuthService.logout.mockRejectedValue(error);
      mockClearAll.mockResolvedValue(undefined);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const logoutResult = await result.current.logout();

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockClearAll).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(null);
      expect(mockSetAuthenticated).toHaveBeenCalledWith(false);
      expect(logoutResult).toEqual({
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });
    });
  });

  describe('updateProfile', () => {
    it('should handle successful profile update', async () => {
      const mockProfileData = {firstName: 'Jane', lastName: 'Smith'};
      const mockResponse = {
        success: true,
        data: {id: '1', firstName: 'Jane', lastName: 'Smith'},
      };

      mockAuthService.updateProfile.mockResolvedValue(mockResponse);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const updateResult = await result.current.updateProfile(mockProfileData);

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockSetUserData).toHaveBeenCalledWith(mockResponse.data);
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data);
      expect(updateResult).toEqual({
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
      });
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', async () => {
      const mockProfile = {id: '1', firstName: 'John', lastName: 'Doe'};
      const mockResponse = {success: true, data: mockProfile};

      mockAuthService.getProfile.mockResolvedValue(mockResponse);

      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      const profileResult = await result.current.getProfile();

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(profileResult).toEqual(mockResponse);
    });
  });

  describe('loading states', () => {
    it('should return correct loading state', () => {
      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Initially should not be loading
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error states', () => {
    it('should return error states from mutations', () => {
      const {result} = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Initially should have no errors
      expect(result.current.loginError).toBeUndefined();
      expect(result.current.registerError).toBeUndefined();
      expect(result.current.verifyOTPError).toBeUndefined();
      expect(result.current.logoutError).toBeUndefined();
      expect(result.current.updateProfileError).toBeUndefined();
    });
  });
});
