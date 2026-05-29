import { authService } from '../../src/services/auth-service';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import { apiLogger } from '../../src/utils/api-logger';
import apiService from '../../src/services/api';

jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/utils/api-logger');
jest.mock('../../src/services/api');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'http://192.168.29.26:8080',
  APP_CONFIG: {
    apiUrl: 'http://192.168.29.26:8080',
    environment: 'development',
  },
  API_ENDPOINTS: {
    STUDENTS: {
      SEND_OTP: '/api/students/send-otp',
      VERIFY_OTP: '/api/students/verify-otp',
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
  API: {
    TIMEOUT: 30000,
  },
  STORAGE_KEYS: {
    AUTH_TOKENS: 'auth_tokens',
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockMockWrapperService = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockApiLogger = apiLogger as jest.Mocked<typeof apiLogger>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOTP', () => {
    const mockData = {
      mobile: '9876543210',
      type: 'login' as const,
    };

    it('should call mock service when in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(true);
      mockMockWrapperService.getMockService.mockReturnValue({
        sendOTP: jest.fn().mockResolvedValue({
          success: true,
          data: { message: 'OTP sent', expiresIn: 300 },
        }),
      } as any);
      mockMockWrapperService.convertMockResponse.mockReturnValue({
        success: true,
        data: { message: 'OTP sent', expiresIn: 300 },
      });

      const result = await authService.sendOTP(mockData);

      expect(mockMockWrapperService.isMockMode).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should POST 10-digit mobile to student send-otp', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      mockApiService.post.mockResolvedValue({
        success: true,
        data: {
          message: 'OTP sent successfully',
          mobile: '9876543210',
          expiresIn: 300,
        },
        statusCode: 200,
      });

      const result = await authService.sendOTP(mockData);

      expect(mockApiService.post).toHaveBeenCalledWith('/api/students/send-otp', {
        mobile: '9876543210',
      });
      expect(result.success).toBe(true);
      expect(result.data?.expiresIn).toBe(300);
    });

    it('should reject invalid Indian mobile format', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);

      const result = await authService.sendOTP({ mobile: '5876543210', type: 'login' });

      expect(mockApiService.post).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/6–9/);
    });

    it('should map unregistered mobile error', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      mockApiService.post.mockResolvedValue({
        success: false,
        error: 'Mobile number not registered with any student',
        statusCode: 400,
      });

      const result = await authService.sendOTP(mockData);

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not registered/i);
    });
  });

  describe('verifyOTP', () => {
    const mockData = {
      mobile: '9876543210',
      otp: '123456',
    };

    it('should call mock service when in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(true);
      const mockResponse = {
        success: true,
        data: { user: { id: '1' }, tokens: { accessToken: 'token' } },
      };
      mockMockWrapperService.getMockService.mockReturnValue({
        verifyOTP: jest.fn().mockResolvedValue(mockResponse),
      } as any);
      mockMockWrapperService.convertMockResponse.mockReturnValue(mockResponse);

      const result = await authService.verifyOTP(mockData);

      expect(result.success).toBe(true);
    });

    it('should POST mobile and otp to student verify-otp', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      mockApiService.post.mockResolvedValue({
        success: true,
        data: {
          accessToken: 'access',
          refreshToken: 'refresh',
          user: { id: 1, firstName: 'Test', role: 'STUDENT' },
        },
        statusCode: 200,
      });

      const result = await authService.verifyOTP(mockData);

      expect(mockApiService.post).toHaveBeenCalledWith('/api/students/verify-otp', {
        mobile: '9876543210',
        otp: '123456',
      });
      expect(result.success).toBe(true);
      expect(result.data?.tokens.accessToken).toBe('access');
    });

    it('should fetch profile when verify response has tokens only', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      mockApiService.post.mockResolvedValue({
        success: true,
        data: {
          tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 },
        },
        statusCode: 200,
      });
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { id: 1, username: 'student@test.com', role: 'STUDENT' },
        statusCode: 200,
      });

      const result = await authService.verifyOTP(mockData);

      expect(mockApiService.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result.success).toBe(true);
      expect(result.data?.user.role).toBe('student');
    });
  });
});
