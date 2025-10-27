import { authService } from '../../src/services/auth-service';
import { MockWrapperService } from '../../src/services/mock-wrapper';

// Mock the dependencies
jest.mock('../../src/services/api');
jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/utils/api-logger');

describe('AuthService - Registration', () => {
  const validRegistrationData = {
    firstName: 'John',
    lastName: 'Doe',
    emailId: 'john.doe@example.com',
    mobileNumber: '9876543210',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400001',
    schoolId: '1',
    schoolName: '',
    promocode: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {

    it('should register user successfully in mock mode', async () => {
      // Mock MockWrapperService to return mock mode
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(true);
      
      const mockResponse = {
        success: true,
        data: {
          id: 'user_123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: '9876543210',
          state: 'Maharashtra',
          district: 'Mumbai',
          city: 'Mumbai',
          pincode: '400001',
          roleId: 4,
          role: 'student',
          isVerified: false,
        },
        message: 'Registration successful! Welcome to Jack Marvels!',
      };

      const mockService = {
        register: jest.fn().mockResolvedValue(mockResponse),
      };
      (MockWrapperService.getMockService as jest.Mock).mockReturnValue(mockService);
      (MockWrapperService.convertMockResponse as jest.Mock).mockReturnValue(mockResponse);

      const result = await authService.register(validRegistrationData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.firstName).toBe('John');
      expect(result.data.lastName).toBe('Doe');
      expect(result.data.email).toBe('john.doe@example.com');
    });

    it('should handle validation errors in mock mode', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(true);
      
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        emailId: 'invalid-email',
        mobileNumber: '123',
        state: '',
        district: '',
        city: '',
        pincode: '12345',
        schoolId: '',
        schoolName: '',
        promocode: '',
      };

      const mockErrorResponse = {
        success: false,
        error: 'First name is required, Please enter a valid email address, Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9, State is required, District is required, City is required, Please enter a valid 6-digit pincode, Please select a school or enter school name',
        statusCode: 400,
      };

      const mockService = {
        register: jest.fn().mockResolvedValue(mockErrorResponse),
      };
      (MockWrapperService.getMockService as jest.Mock).mockReturnValue(mockService);
      (MockWrapperService.convertMockResponse as jest.Mock).mockReturnValue(mockErrorResponse);

      const result = await authService.register(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('First name is required');
      expect(result.error).toContain('Please enter a valid email address');
    });

    it('should handle duplicate email error in mock mode', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(true);
      
      const duplicateEmailData = {
        ...validRegistrationData,
        emailId: 'rahul.sharma@example.com', // This email already exists in mock data
      };

      const mockErrorResponse = {
        success: false,
        error: 'An account with this email already exists. Please use a different email or try logging in.',
        statusCode: 400,
      };

      const mockService = {
        register: jest.fn().mockResolvedValue(mockErrorResponse),
      };
      (MockWrapperService.getMockService as jest.Mock).mockReturnValue(mockService);
      (MockWrapperService.convertMockResponse as jest.Mock).mockReturnValue(mockErrorResponse);

      const result = await authService.register(duplicateEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should handle duplicate mobile number error in mock mode', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(true);
      
      const duplicateMobileData = {
        ...validRegistrationData,
        mobileNumber: '9876543210', // This mobile already exists in mock data
      };

      const mockErrorResponse = {
        success: false,
        error: 'An account with this mobile number already exists. Please use a different number or try logging in.',
        statusCode: 400,
      };

      const mockService = {
        register: jest.fn().mockResolvedValue(mockErrorResponse),
      };
      (MockWrapperService.getMockService as jest.Mock).mockReturnValue(mockService);
      (MockWrapperService.convertMockResponse as jest.Mock).mockReturnValue(mockErrorResponse);

      const result = await authService.register(duplicateMobileData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('mobile number already exists');
    });

    it('should validate data before sending to API in non-mock mode', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidData = {
        firstName: 'John123', // Invalid characters
        lastName: 'Doe',
        emailId: 'invalid-email',
        mobileNumber: '1234567890', // Invalid starting digit
        state: 'Maharashtra123', // Invalid characters
        district: 'Mumbai',
        city: 'Mumbai',
        pincode: '012345', // Invalid starting digit
        schoolId: '',
        schoolName: '',
        promocode: '',
      };

      const result = await authService.register(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('First name can only contain letters, spaces, hyphens, and apostrophes');
      expect(result.error).toContain('Please enter a valid email address');
      expect(result.error).toContain('Please enter a valid 10-digit mobile number');
      expect(result.error).toContain('State name can only contain letters and spaces');
      expect(result.error).toContain('Please enter a valid 6-digit pincode');
    });

    it('should handle network errors gracefully', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      };

      // Mock apiService.post to throw network error
      const mockApiService = require('../../src/services/api').default;
      mockApiService.post = jest.fn().mockRejectedValue(networkError);

      const result = await authService.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please check your internet connection and try again.');
      expect(result.statusCode).toBe(0);
    });

    it('should handle timeout errors gracefully', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const timeoutError = {
        code: 'TIMEOUT',
        message: 'Request timeout',
      };

      const mockApiService = require('../../src/services/api').default;
      mockApiService.post = jest.fn().mockRejectedValue(timeoutError);

      const result = await authService.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request timed out. Please try again.');
      expect(result.statusCode).toBe(408);
    });

    it('should handle backend validation errors with friendly messages', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const backendError = {
        response: {
          data: {
            message: 'User with this email already exists',
          },
          status: 400,
        },
      };

      const mockApiService = require('../../src/services/api').default;
      mockApiService.post = jest.fn().mockRejectedValue(backendError);

      const result = await authService.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An account with this email already exists. Please use a different email or try logging in.');
      expect(result.statusCode).toBe(400);
    });

    it('should handle generic backend errors', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const backendError = {
        response: {
          data: {
            message: 'Internal server error',
          },
          status: 500,
        },
      };

      const mockApiService = require('../../src/services/api').default;
      mockApiService.post = jest.fn().mockRejectedValue(backendError);

      const result = await authService.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
      expect(result.statusCode).toBe(500);
    });

    it('should handle school validation errors', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const backendError = {
        response: {
          data: {
            message: 'Invalid school selection',
          },
          status: 400,
        },
      };

      const mockApiService = require('../../src/services/api').default;
      mockApiService.post = jest.fn().mockRejectedValue(backendError);

      const result = await authService.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please select a valid school or enter a school name.');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('validateRegistrationData (private method)', () => {
    // Since validateRegistrationData is private, we test it through the register method
    it('should validate all required fields', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const incompleteData = {
        firstName: '',
        lastName: '',
        emailId: '',
        mobileNumber: '',
        state: '',
        district: '',
        city: '',
        pincode: '',
        schoolId: '',
        schoolName: '',
        promocode: '',
      };

      const result = await authService.register(incompleteData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('First name is required');
      expect(result.error).toContain('Last name is required');
      expect(result.error).toContain('Email is required');
      expect(result.error).toContain('Mobile number is required');
      expect(result.error).toContain('State is required');
      expect(result.error).toContain('District is required');
      expect(result.error).toContain('City is required');
      expect(result.error).toContain('Pincode is required');
      expect(result.error).toContain('Please select a school or enter school name');
    });

    it('should validate email format', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidEmailData = {
        ...validRegistrationData,
        emailId: 'invalid-email-format',
      };

      const result = await authService.register(invalidEmailData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Please enter a valid email address');
    });

    it('should validate mobile number format', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidMobileData = {
        ...validRegistrationData,
        mobileNumber: '1234567890', // Invalid starting digit
      };

      const result = await authService.register(invalidMobileData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Please enter a valid 10-digit mobile number');
    });

    it('should validate pincode format', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidPincodeData = {
        ...validRegistrationData,
        pincode: '012345', // Invalid starting digit
      };

      const result = await authService.register(invalidPincodeData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Please enter a valid 6-digit pincode');
    });

    it('should validate name patterns', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidNameData = {
        ...validRegistrationData,
        firstName: 'John123',
        lastName: 'Doe@',
      };

      const result = await authService.register(invalidNameData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('First name can only contain letters, spaces, hyphens, and apostrophes');
      expect(result.error).toContain('Last name can only contain letters, spaces, hyphens, and apostrophes');
    });

    it('should validate location patterns', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidLocationData = {
        ...validRegistrationData,
        state: 'Maharashtra123',
        district: 'Mumbai@',
        city: 'Mumbai#',
      };

      const result = await authService.register(invalidLocationData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('State name can only contain letters and spaces');
      expect(result.error).toContain('District name can only contain letters and spaces');
      expect(result.error).toContain('City name can only contain letters and spaces');
    });

    it('should validate school name pattern when provided', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidSchoolData = {
        ...validRegistrationData,
        schoolId: '',
        schoolName: 'School@123#',
      };

      const result = await authService.register(invalidSchoolData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('School name can only contain letters, numbers, spaces, periods, hyphens, and apostrophes');
    });

    it('should validate promo code pattern when provided', async () => {
      (MockWrapperService.isMockMode as jest.Mock).mockReturnValue(false);
      
      const invalidPromoData = {
        ...validRegistrationData,
        promocode: 'PROMO@123#',
      };

      const result = await authService.register(invalidPromoData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Promo code can only contain letters and numbers');
    });
  });
});
