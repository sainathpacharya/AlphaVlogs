import apiService from './api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse, User, AuthTokens, OTPResponse } from '@/types';
import { MockWrapperService } from './mock-wrapper';
import { apiLogger } from '@/utils/api-logger';
import { validateRegistrationData } from '@/utils/validation';

export interface SendOTPRequest {
  mobile: string;
  type: 'login' | 'registration';
}

export interface VerifyOTPRequest {
  mobile: string;
  otp: string;
}

// Alias for backward compatibility
export type OTPVerificationRequest = VerifyOTPRequest;
export type LoginRequest = VerifyOTPRequest;

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  emailId: string;
  mobileNumber: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  promocode?: string;
  schoolId?: string;
  schoolName?: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  async sendOTP(data: SendOTPRequest): Promise<ApiResponse<OTPResponse>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().sendOTP(data);
        const result = MockWrapperService.convertMockResponse(mockResponse);
        apiLogger.logMockCall('AuthService', 'sendOTP', data, result);
        return result;
      }

      const resp = await apiService.post<any>(API_ENDPOINTS.AUTH.SEND_OTP, data);
      const raw: any = resp as any;

      // Handle different response formats from backend
      if (raw && typeof raw.success === 'undefined') {
        // Backend returns data directly without success wrapper
        const result = { success: true, data: raw as OTPResponse, statusCode: 200 };
        apiLogger.logServiceCall('AuthService', 'sendOTP', data, result);
        return result;
      }

      // Backend returns standard ApiResponse format
      apiLogger.logServiceCall('AuthService', 'sendOTP', data, resp);
      return resp as ApiResponse<OTPResponse>;
    } catch (error: any) {
      // Handle specific error cases
      if (error?.response?.data?.message === 'Mobile number not registered with any student') {
        // Return a more user-friendly error message
        const friendlyError = {
          success: false,
          error: 'This mobile number is not registered. Please register first or contact support.',
          statusCode: 400,
        };
        apiLogger.logServiceCall('AuthService', 'sendOTP', data, null, friendlyError);
        return friendlyError;
      }

      apiLogger.logServiceCall('AuthService', 'sendOTP', data, null, error);
      throw error;
    }
  }

  // Alias for login - verifyOTP is used for login
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.verifyOTP(data);
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().verifyOTP(data);
        const result = MockWrapperService.convertMockResponse(mockResponse) as ApiResponse<LoginResponse>;
        apiLogger.logMockCall('AuthService', 'verifyOTP', data, result);
        return result;
      }

      const resp = await apiService.post<any>(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
      const raw: any = resp as any;

      // Check if the response indicates an error (apiService.post returns error responses, not throws)
      if (raw && raw.success === false) {
        let friendlyMessage = raw.error || 'Invalid or expired OTP. Please request a new OTP.';

        // Check if error message contains backend error details
        if (typeof friendlyMessage === 'string') {
          // Backend returned error as string (e.g., the null pointer exception)
          if (friendlyMessage.includes('createdOn') || friendlyMessage.includes('null') || friendlyMessage.includes('Timestamp')) {
            friendlyMessage = 'Account data error. Please contact support or try registering again.';
          } else if (friendlyMessage.includes('OTP') || friendlyMessage.includes('otp')) {
            friendlyMessage = 'Invalid or expired OTP. Please request a new OTP.';
          }
        }

        const friendlyError = {
          success: false,
          error: friendlyMessage,
          statusCode: raw.statusCode || 400,
        };
        apiLogger.logServiceCall('AuthService', 'verifyOTP', data, null, friendlyError);
        return friendlyError;
      }

      // Handle successful response
      if (raw && typeof raw.success === 'undefined') {
        // If backend returns user/tokens at top-level or under data, normalize
        const payload = (raw.data && (raw.data.user || raw.data.tokens)) ? raw.data : raw;
        const result = { success: true, data: payload as LoginResponse, statusCode: 200 };
        apiLogger.logServiceCall('AuthService', 'verifyOTP', data, result);
        return result;
      }

      apiLogger.logServiceCall('AuthService', 'verifyOTP', data, resp);
      return resp as ApiResponse<LoginResponse>;
    } catch (error: any) {
      // This catch block handles unexpected errors (should rarely happen since apiService.post handles errors)
      let friendlyMessage = 'Unable to verify OTP. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          if (errorData.includes('createdOn') || errorData.includes('null') || errorData.includes('Timestamp')) {
            friendlyMessage = 'Account data error. Please contact support or try registering again.';
          }
        } else if (errorData?.message) {
          friendlyMessage = errorData.message;
        }
      }

      const genericError = {
        success: false,
        error: friendlyMessage,
        statusCode: error?.response?.status || 500,
      };
      apiLogger.logServiceCall('AuthService', 'verifyOTP', data, null, genericError);
      return genericError;
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().register(data);
        const result = MockWrapperService.convertMockResponse(mockResponse);
        apiLogger.logMockCall('AuthService', 'register', data, result);
        return result;
      }

      // Validate required fields before sending to API
      const validation = validateRegistrationData(data);
      if (!validation.isValid) {
        const errorResponse = {
          success: false,
          error: validation.errors.join(', '),
          statusCode: 400,
        };
        apiLogger.logServiceCall('AuthService', 'register', data, null, errorResponse);
        return errorResponse;
      }

      // Use the data as-is since it already matches the backend format
      const result = await apiService.post<User>(API_ENDPOINTS.AUTH.REGISTER, data);
      apiLogger.logServiceCall('AuthService', 'register', data, result);
      return result;
    } catch (error: any) {
      // Handle specific error cases
      if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        let friendlyMessage = errorMessage;

        // Convert backend error messages to user-friendly messages
        if (errorMessage.includes('email') && errorMessage.includes('already exists')) {
          friendlyMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (errorMessage.includes('mobile') && errorMessage.includes('already exists')) {
          friendlyMessage = 'An account with this mobile number already exists. Please use a different number or try logging in.';
        } else if (errorMessage.includes('validation')) {
          friendlyMessage = 'Please check your information and try again.';
        } else if (errorMessage.includes('school')) {
          friendlyMessage = 'Please select a valid school or enter a school name.';
        }

        const friendlyError = {
          success: false,
          error: friendlyMessage,
          statusCode: error.response.status || 400,
        };
        apiLogger.logServiceCall('AuthService', 'register', data, null, friendlyError);
        return friendlyError;
      }

      // Handle network errors
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        const networkError = {
          success: false,
          error: 'Network error. Please check your internet connection and try again.',
          statusCode: 0,
        };
        apiLogger.logServiceCall('AuthService', 'register', data, null, networkError);
        return networkError;
      }

      // Handle timeout errors
      if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
        const timeoutError = {
          success: false,
          error: 'Request timed out. Please try again.',
          statusCode: 408,
        };
        apiLogger.logServiceCall('AuthService', 'register', data, null, timeoutError);
        return timeoutError;
      }

      apiLogger.logServiceCall('AuthService', 'register', data, null, error);
      throw error;
    }
  }


  async logout(): Promise<ApiResponse<void>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().logout();
        const result = MockWrapperService.convertMockResponse(mockResponse);
        apiLogger.logMockCall('AuthService', 'logout', null, result);
        return result;
      }

      const result = await apiService.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
      apiLogger.logServiceCall('AuthService', 'logout', null, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('AuthService', 'logout', null, null, error);
      throw error;
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().getProfile('user_001');
        const result = MockWrapperService.convertMockResponse(mockResponse);
        apiLogger.logMockCall('AuthService', 'getProfile', null, result);
        return result;
      }

      const result = await apiService.get<User>(API_ENDPOINTS.USER.PROFILE);
      apiLogger.logServiceCall('AuthService', 'getProfile', null, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('AuthService', 'getProfile', null, null, error);
      throw error;
    }
  }

  async updateProfile(data: Partial<User> & { studentId?: number }): Promise<ApiResponse<User>> {
    try {
      if (MockWrapperService.isMockMode()) {
        // Profile updates work for both Influencers and Students
        const mockResponse = await MockWrapperService.getMockService().updateProfile('user_001', data);
        const result = MockWrapperService.convertMockResponse(mockResponse);
        apiLogger.logMockCall('AuthService', 'updateProfile', data, result);
        return result;
      }

      const result = await apiService.put<User>(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
      apiLogger.logServiceCall('AuthService', 'updateProfile', data, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('AuthService', 'updateProfile', data, null, error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
