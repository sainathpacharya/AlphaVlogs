import { authService } from '../../src/services/auth-service';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import { apiLogger } from '../../src/utils/api-logger';
import apiService from '../../src/services/api';
import { API_ENDPOINTS } from '../../src/constants';

// Mock dependencies
jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/utils/api-logger');
jest.mock('../../src/services/api');
jest.mock('../../src/constants', () => ({
  APP_CONFIG: {
    apiUrl: 'https://api.jackmarvels.com',
    environment: 'development',
  },
  API_ENDPOINTS: {
    AUTH: {
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
    },
    USER: {
      UPDATE_PROFILE: '/user/profile',
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
        sendOTP: jest.fn().mockResolvedValue({ success: true, data: { otp: '123456' } }),
      } as any);
      mockMockWrapperService.convertMockResponse.mockReturnValue({
        success: true,
        data: { otp: '123456' },
      });

      const result = await authService.sendOTP(mockData);

      expect(mockMockWrapperService.isMockMode).toHaveBeenCalled();
      expect(mockMockWrapperService.getMockService).toHaveBeenCalled();
      expect(mockApiLogger.logMockCall).toHaveBeenCalledWith(
        'AuthService',
        'sendOTP',
        mockData,
        { success: true, data: { otp: '123456' } }
      );
      expect(result).toEqual({ success: true, data: { otp: '123456' } });
    });

    it('should call real API when not in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = { success: true, data: { otp: '123456' } };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.sendOTP(mockData);

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/send-otp', mockData);
      expect(mockApiLogger.logServiceCall).toHaveBeenCalledWith(
        'AuthService',
        'sendOTP',
        mockData,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle backend response without success wrapper', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = { otp: '123456' };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.sendOTP(mockData);

      expect(result).toEqual({
        success: true,
        data: { otp: '123456' },
        statusCode: 200,
      });
    });

    it('should handle mobile number not registered error', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const error = {
        response: {
          data: {
            message: 'Mobile number not registered with any student',
          },
        },
      };
      mockApiService.post.mockRejectedValue(error);

      const result = await authService.sendOTP(mockData);

      expect(result).toEqual({
        success: false,
        error: 'This mobile number is not registered. Please register first or contact support.',
        statusCode: 400,
      });
    });

    it('should throw error for other API errors', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const error = new Error('Network error');
      mockApiService.post.mockRejectedValue(error);

      await expect(authService.sendOTP(mockData)).rejects.toThrow('Network error');
      expect(mockApiLogger.logServiceCall).toHaveBeenCalledWith(
        'AuthService',
        'sendOTP',
        mockData,
        null,
        error
      );
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

      expect(mockMockWrapperService.isMockMode).toHaveBeenCalled();
      expect(mockApiLogger.logMockCall).toHaveBeenCalledWith(
        'AuthService',
        'verifyOTP',
        mockData,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call real API when not in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = {
        success: true,
        data: { user: { id: '1' }, tokens: { accessToken: 'token' } },
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.verifyOTP(mockData);

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/verify-otp', mockData);
      expect(mockApiLogger.logServiceCall).toHaveBeenCalledWith(
        'AuthService',
        'verifyOTP',
        mockData,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle backend response without success wrapper', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = {
        data: { user: { id: '1' }, tokens: { accessToken: 'token' } },
      };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.verifyOTP(mockData);

      expect(result).toEqual({
        success: true,
        data: { user: { id: '1' }, tokens: { accessToken: 'token' } },
        statusCode: 200,
      });
    });

    it('should handle direct user/tokens response', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = { user: { id: '1' }, tokens: { accessToken: 'token' } };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.verifyOTP(mockData);

      expect(result).toEqual({
        success: true,
        data: { user: { id: '1' }, tokens: { accessToken: 'token' } },
        statusCode: 200,
      });
    });
  });

  describe('register', () => {
    const mockData = {
      firstName: 'John',
      lastName: 'Doe',
      emailId: 'john@example.com',
      mobileNumber: '9876543210',
      state: 'California',
      district: 'Los Angeles',
      city: 'Los Angeles',
      pincode: '123456',
      promocode: 'PROMO123',
      schoolId: '1',
      schoolName: 'Test School',
    };

    it('should call mock service when in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(true);
      const mockResponse = { success: true, data: { id: '1', firstName: 'John' } };
      mockMockWrapperService.getMockService.mockReturnValue({
        register: jest.fn().mockResolvedValue(mockResponse),
      } as any);
      mockMockWrapperService.convertMockResponse.mockReturnValue(mockResponse);

      const result = await authService.register(mockData);

      expect(mockMockWrapperService.isMockMode).toHaveBeenCalled();
      expect(mockApiLogger.logMockCall).toHaveBeenCalledWith(
        'AuthService',
        'register',
        mockData,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call real API when not in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = { success: true, data: { id: '1', firstName: 'John' } };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.register(mockData);

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/register', mockData);
      expect(mockApiLogger.logServiceCall).toHaveBeenCalledWith(
        'AuthService',
        'register',
        mockData,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call mock service when in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(true);
      const mockResponse = { success: true };
      mockMockWrapperService.getMockService.mockReturnValue({
        logout: jest.fn().mockResolvedValue(mockResponse),
      } as any);
      mockMockWrapperService.convertMockResponse.mockReturnValue(mockResponse);

      const result = await authService.logout();

      expect(mockMockWrapperService.isMockMode).toHaveBeenCalled();
      expect(mockApiLogger.logMockCall).toHaveBeenCalledWith(
        'AuthService',
        'logout',
        null,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call real API when not in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = { success: true };
      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockApiLogger.logServiceCall).toHaveBeenCalledWith(
        'AuthService',
        'logout',
        null,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProfile', () => {
    const mockData = {
      firstName: 'Jane',
      lastName: 'Smith',
      studentId: 123,
    };

    it('should call mock service when in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(true);
      const mockResponse = { success: true, data: { id: '1', firstName: 'Jane' } };
      mockMockWrapperService.getMockService.mockReturnValue({
        updateProfile: jest.fn().mockResolvedValue(mockResponse),
      } as any);
      mockMockWrapperService.convertMockResponse.mockReturnValue(mockResponse);

      const result = await authService.updateProfile(mockData);

      expect(mockMockWrapperService.isMockMode).toHaveBeenCalled();
      expect(mockApiLogger.logMockCall).toHaveBeenCalledWith(
        'AuthService',
        'updateProfile',
        mockData,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call real API when not in mock mode', async () => {
      mockMockWrapperService.isMockMode.mockReturnValue(false);
      const mockResponse = { success: true, data: { id: '1', firstName: 'Jane' } };
      mockApiService.put.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(mockData);

      expect(mockApiService.put).toHaveBeenCalledWith('/user/profile', mockData);
      expect(mockApiLogger.logServiceCall).toHaveBeenCalledWith(
        'AuthService',
        'updateProfile',
        mockData,
        mockResponse
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
