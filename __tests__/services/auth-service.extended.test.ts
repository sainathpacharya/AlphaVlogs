import { authService } from '../../src/services/auth-service';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import { apiLogger } from '../../src/utils/api-logger';
import apiService from '../../src/services/api';
import * as publicApiRequest from '../../src/utils/public-api-request';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/utils/api-logger');
jest.mock('../../src/services/api');
jest.mock('../../src/utils/dev-log', () => ({ devLog: jest.fn() }));
jest.mock('../../src/utils/public-api-request', () => ({
  publicApiPost: jest.fn(),
  PUBLIC_API_CLIENT_VERSION: 'test',
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'http://192.168.29.26:8080',
  API_ENDPOINTS: {
    STUDENTS: {
      SEND_OTP: '/api/students/send-otp',
      VERIFY_OTP: '/api/students/verify-otp',
      SELECT_PROFILE: '/api/students/select-profile',
      PROFILES: '/api/students/profiles',
      SWITCH_PROFILE: '/api/students/switch-profile',
      DELETE_ACCOUNT: '/api/students/account',
    },
    AUTH: {
      REGISTER: '/students/register',
      LOGOUT: '/auth/logout',
    },
    USER: {
      PROFILE: '/api/auth/me',
      UPDATE_PROFILE: '/students/profile',
    },
  },
  API: { TIMEOUT: 30000 },
  STORAGE_KEYS: {
    AUTH_TOKENS: 'auth_tokens',
    USER_DATA: 'user_data',
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockPublicApiPost = publicApiRequest.publicApiPost as jest.MockedFunction<
  typeof publicApiRequest.publicApiPost
>;
const mockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;

const loginPayload = {
  user: {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    role: 'STUDENT',
    mobile: '9876543210',
  },
  tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 },
};

describe('AuthService extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
  });

  describe('selectProfile', () => {
    it('rejects invalid mobile', async () => {
      const result = await authService.selectProfile({ studentId: 1, mobile: '123' });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/valid 10-digit/);
    });

    it('selects profile via API', async () => {
      mockPublicApiPost.mockResolvedValue({
        success: true,
        data: loginPayload,
        statusCode: 200,
      });

      const result = await authService.selectProfile({
        studentId: 101,
        mobile: '9876543210',
      });

      expect(mockPublicApiPost).toHaveBeenCalledWith('/api/students/select-profile', {
        studentId: 101,
        mobile: '9876543210',
      });
      expect(result.success).toBe(true);
      expect(result.data?.tokens?.accessToken).toBe('access');
    });

    it('uses mock service in mock mode', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        selectProfile: jest.fn().mockResolvedValue({ success: true, data: loginPayload }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.selectProfile({
        studentId: 1,
        mobile: '9876543210',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('listProfiles', () => {
    it('lists profiles from API', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: {
          profiles: [
            {
              studentId: 1,
              firstName: 'A',
              lastName: 'B',
              className: '5',
              schoolName: 'School',
              verified: true,
              isSubscribed: false,
            },
          ],
        },
        statusCode: 200,
      });

      const result = await authService.listProfiles();

      expect(result.success).toBe(true);
      expect(result.data?.profiles).toHaveLength(1);
    });

    it('returns error when API fails', async () => {
      mockApiService.get.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
      });

      const result = await authService.listProfiles();

      expect(result.success).toBe(false);
    });
  });

  describe('switchProfile', () => {
    it('switches profile via API', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: loginPayload,
        statusCode: 200,
      });

      const result = await authService.switchProfile({ studentId: 2 });

      expect(result.success).toBe(true);
    });

    it('maps 403 to profile not available', async () => {
      mockApiService.post.mockResolvedValue({
        success: false,
        error: 'Forbidden',
        statusCode: 403,
      });

      const result = await authService.switchProfile({ studentId: 99 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile not available.');
    });
  });

  describe('logout', () => {
    it('posts logout to API', async () => {
      mockApiService.post.mockResolvedValue({ success: true, statusCode: 200 });

      const result = await authService.logout();

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/logout');
      expect(result.success).toBe(true);
    });

    it('uses mock logout in mock mode', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        logout: jest.fn().mockResolvedValue({ success: true }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      await expect(authService.logout()).resolves.toEqual({ success: true });
    });
  });

  describe('deleteAccount', () => {
    it('deletes account and clears storage', async () => {
      mockApiService.delete.mockResolvedValue({ success: true, statusCode: 200 });

      const result = await authService.deleteAccount();

      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('maps /api/auth/me response to user', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'student@test.com', role: 'STUDENT' },
        statusCode: 200,
      });

      const result = await authService.getProfile();

      expect(result.success).toBe(true);
      expect(result.data?.role).toBe('student');
    });

    it('returns API error response', async () => {
      mockApiService.get.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
      });

      const result = await authService.getProfile();

      expect(result.success).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('updates profile via API', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: { id: '1', firstName: 'Updated' } as never,
        statusCode: 200,
      });

      const result = await authService.updateProfile({ firstName: 'Updated' });

      expect(mockApiService.put).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('login alias', () => {
    it('delegates to verifyOTP', async () => {
      mockPublicApiPost.mockResolvedValue({
        success: true,
        data: {
          selectionRequired: false,
          user: loginPayload.user,
          tokens: loginPayload.tokens,
        },
        statusCode: 200,
      });

      const result = await authService.login({
        mobile: '9876543210',
        otp: '123456',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('register error handling', () => {
    const registerData = {
      firstName: 'Arun',
      lastName: 'Kumar',
      emailId: 'arun@example.com',
      mobileNumber: '9876543210',
      pincode: '500001',
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      schoolId: '1',
    };

    it('returns validation errors before API call', async () => {
      const result = await authService.register({
        ...registerData,
        firstName: '',
      });

      expect(result.success).toBe(false);
      expect(mockPublicApiPost).not.toHaveBeenCalled();
    });

    it('maps duplicate email errors', async () => {
      mockPublicApiPost.mockRejectedValue({
        response: { data: { message: 'email already exists' }, status: 400 },
      });

      const result = await authService.register(registerData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/email already exists/i);
    });

    it('maps network errors', async () => {
      mockPublicApiPost.mockRejectedValue({
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      });

      const result = await authService.register(registerData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Network error/i);
    });

    it('maps timeout errors', async () => {
      mockPublicApiPost.mockRejectedValue({
        code: 'TIMEOUT',
        message: 'timeout of 30000ms exceeded',
      });

      const result = await authService.register(registerData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/timed out/i);
    });
  });
});
