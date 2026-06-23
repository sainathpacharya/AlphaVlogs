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
  PUBLIC_API_CLIENT_VERSION: 'test-client',
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'http://test.local',
  API_ENDPOINTS: {
    STUDENTS: {
      SEND_OTP: '/api/students/send-otp',
      VERIFY_OTP: '/api/students/verify-otp',
      SELECT_PROFILE: '/api/students/select-profile',
      PROFILES: '/api/students/profiles',
      SWITCH_PROFILE: '/api/students/switch-profile',
      DELETE_ACCOUNT: '/api/students/account',
    },
    AUTH: { REGISTER: '/students/register', LOGOUT: '/auth/logout' },
    USER: { PROFILE: '/api/auth/me', UPDATE_PROFILE: '/students/profile' },
  },
  API: { TIMEOUT: 30000 },
  STORAGE_KEYS: { AUTH_TOKENS: 'auth_tokens', USER_DATA: 'user_data' },
}));

const mockApi = apiService as jest.Mocked<typeof apiService>;
const mockPost = publicApiRequest.publicApiPost as jest.MockedFunction<
  typeof publicApiRequest.publicApiPost
>;
const mockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;

const tokens = { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 };

describe('AuthService branch coverage', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
    mockApi.clearStoredAuth.mockResolvedValue(undefined);
    (global as { __DEV__?: boolean }).__DEV__ = true;
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  describe('sendOTP', () => {
    it('uses mock service in mock mode', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        sendOTP: jest.fn().mockResolvedValue({
          success: true,
          data: { message: 'sent', mobile: '9876543210', expiresIn: 300 },
        }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

      expect(result.success).toBe(true);
      expect(apiLogger.logMockCall).toHaveBeenCalled();
    });

    it('rejects invalid mobile numbers', async () => {
      const result = await authService.sendOTP({ mobile: '123', type: 'login' });

      expect(result.success).toBe(false);
      expect(mockPost).not.toHaveBeenCalled();
    });

    it('maps not-registered backend errors', async () => {
      mockPost.mockResolvedValue({
        success: false,
        error: 'Mobile not registered',
        statusCode: 404,
      });

      const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

      expect(result.error).toMatch(/not registered/i);
    });

    it('appends dev debug details when available', async () => {
      mockPost.mockResolvedValue({
        success: false,
        error: 'Server error',
        statusCode: 500,
        debug: { url: '/otp', status: 500, client: 'test-client' },
      });

      const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

      expect(result.error).toContain('[dev debug]');
    });

    it('skips dev debug when __DEV__ is false', async () => {
      (global as { __DEV__?: boolean }).__DEV__ = false;
      mockPost.mockResolvedValue({
        success: false,
        error: 'Server error',
        statusCode: 500,
        debug: { url: '/otp', status: 500, client: 'test-client' },
      });

      const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

      expect(result.error).not.toContain('[dev debug]');
    });

    it('returns success payload from API', async () => {
      mockPost.mockResolvedValue({
        success: true,
        data: { message: 'OTP sent', mobile: '9876543210', expiresIn: 120 },
        statusCode: 200,
      });

      const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

      expect(result.success).toBe(true);
      expect(result.data?.expiresIn).toBe(120);
      expect(mockApi.clearStoredAuth).toHaveBeenCalled();
    });

    it('accepts OTP payload on the response root', async () => {
      mockPost.mockResolvedValue({
        success: true,
        message: 'OTP sent',
        mobile: '9876543210',
        expiresIn: 240,
        statusCode: 200,
      } as never);

      const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

      expect(result.data?.expiresIn).toBe(240);
    });
  });

  describe('verifyOTP', () => {
    it('returns profile selection when required', async () => {
      mockPost.mockResolvedValue({
        success: true,
        data: {
          selectionRequired: true,
          profiles: [
            {
              studentId: 1,
              first_name: 'A',
              last_name: 'B',
              class: '5',
              school: 'School',
              isVerified: true,
              subscribed: true,
            },
          ],
        },
        statusCode: 200,
      });

      const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

      expect(result.success).toBe(true);
      expect(result.data?.selectionRequired).toBe(true);
      expect(result.data?.profiles?.[0].isSubscribed).toBe(true);
    });

    it('loads profile via /me when user is omitted', async () => {
      mockPost.mockResolvedValue({
        success: true,
        data: {
          selectionRequired: false,
          accessToken: 'access',
          refreshToken: 'refresh',
          expiresIn: 3600,
        },
        statusCode: 200,
      });
      mockApi.get.mockResolvedValue({
        success: true,
        data: { id: 9, username: 'student@test.com', role: 'STUDENT' },
        statusCode: 200,
      });

      const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(result.data?.user?.role).toBe('student');
    });

    it('fails when profile cannot be loaded after token issue', async () => {
      mockPost.mockResolvedValue({
        success: true,
        data: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 3600 },
        statusCode: 200,
      });
      mockApi.get.mockResolvedValue({ success: false, error: 'Unauthorized', statusCode: 401 });

      const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized|could not load profile/i);
    });

    it('uses mock verify flow with influencer user mapping', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        verifyOTP: jest.fn().mockResolvedValue({
          success: true,
          data: {
            user: {
              id: 2,
              firstName: 'Creator',
              role: 'INFLUENCER',
              mobile: '9876543210',
              subscriptionStatus: 'active',
            },
            tokens,
          },
        }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

      expect(result.success).toBe(true);
      expect(result.data?.user?.role).toBe('influencer');
      expect(result.data?.user?.isSubscribed).toBe(true);
    });

    it('maps student field from verify OTP response', async () => {
      mockPost.mockResolvedValue({
        success: true,
        data: {
          selectionRequired: false,
          student: {
            studentId: 5,
            first_name: 'Sam',
            last_name: 'Lee',
            role: 'STUDENT',
            mobileNumber: '9876543210',
          },
          accessToken: 'access',
          refreshToken: 'refresh',
          expiresIn: 3600,
        },
        statusCode: 200,
      });

      const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

      expect(result.success).toBe(true);
      expect(result.data?.user?.firstName).toBe('Sam');
      expect(result.data?.user?.role).toBe('student');
      expect(result.data?.user?.isVerified).toBe(true);
    });

    it('handles verifyOTP thrown non-Error values', async () => {
      mockPost.mockRejectedValue('otp failed');

      const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
    });

    it('fails verifyOTP when login payload has invalid tokens', async () => {
      mockPost.mockResolvedValue({
        success: true,
        data: { selectionRequired: false, user: { id: 1, role: 'STUDENT' } },
        statusCode: 200,
      });

      const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/invalid response/i);
    });

    it('handles sendOTP thrown non-Error values', async () => {
      mockPost.mockRejectedValue('network');

      const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

      expect(result.success).toBe(false);
    });
  });

  describe('selectProfile', () => {
    it('returns mock failure unchanged', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        selectProfile: jest.fn().mockResolvedValue({ success: false, error: 'bad profile' }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.selectProfile({ studentId: 1, mobile: '9876543210' });

      expect(result.success).toBe(false);
    });

    it('maps API failure', async () => {
      mockPost.mockResolvedValue({ success: false, error: 'Denied', statusCode: 403 });

      const result = await authService.selectProfile({ studentId: 1, mobile: '9876543210' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Denied');
    });

    it('selects profile when API returns student object', async () => {
      mockPost.mockResolvedValue({
        success: true,
        data: {
          student: {
            id: 9,
            firstName: 'Profile',
            role: 'STUDENT',
            mobile: '9876543210',
          },
          accessToken: 'access',
          refreshToken: 'refresh',
          expiresIn: 3600,
        },
        statusCode: 200,
      });

      const result = await authService.selectProfile({ studentId: 9, mobile: '9876543210' });

      expect(result.success).toBe(true);
      expect(result.data?.user?.firstName).toBe('Profile');
    });
  });

  describe('listProfiles', () => {
    it('maps mock profiles with alternate field names', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        listProfiles: jest.fn().mockResolvedValue({
          success: true,
          data: {
            profiles: [
              {
                studentId: '2',
                first_name: 'Sam',
                last_name: 'Lee',
                className: '6',
                schoolName: 'High',
                verified: true,
              },
            ],
          },
        }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.listProfiles();

      expect(result.success).toBe(true);
      expect(result.data?.profiles[0].firstName).toBe('Sam');
    });

    it('returns mock failure unchanged', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        listProfiles: jest.fn().mockResolvedValue({ success: false, error: 'nope' }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.listProfiles();

      expect(result.success).toBe(false);
    });

    it('filters invalid profile rows from API payload', async () => {
      mockApi.get.mockResolvedValue({
        success: true,
        data: {
          profiles: [{ studentId: 'bad' }, { studentId: 3, firstName: 'Valid' }],
        },
        statusCode: 200,
      });

      const result = await authService.listProfiles();

      expect(result.data?.profiles).toHaveLength(1);
      expect(result.data?.profiles[0].studentId).toBe(3);
    });

    it('returns empty profiles when mock payload is not an array', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        listProfiles: jest.fn().mockResolvedValue({
          success: true,
          data: { profiles: 'invalid' },
        }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.listProfiles();

      expect(result.data?.profiles).toEqual([]);
    });
  });

  describe('switchProfile', () => {
    it('uses mock switch profile flow', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        switchProfile: jest.fn().mockResolvedValue({
          success: true,
          data: {
            user: { id: 1, firstName: 'Test', role: 'STUDENT', mobileNumber: '9876543210' },
            ...tokens,
          },
        }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.switchProfile({ studentId: 1 });

      expect(result.success).toBe(true);
    });

    it('returns mock failure unchanged', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        switchProfile: jest.fn().mockResolvedValue({ success: false, error: 'blocked' }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.switchProfile({ studentId: 1 });

      expect(result.success).toBe(false);
    });

    it('maps non-403 API errors', async () => {
      mockApi.post.mockResolvedValue({ success: false, error: 'Server error', statusCode: 500 });

      const result = await authService.switchProfile({ studentId: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('switches profile when API omits user mobile', async () => {
      mockApi.post.mockResolvedValue({
        success: true,
        data: {
          accessToken: 'access',
          refreshToken: 'refresh',
          expiresIn: 3600,
          user: { id: 1, firstName: 'Test', role: 'STUDENT' },
        },
        statusCode: 200,
      });

      const result = await authService.switchProfile({ studentId: 1 });

      expect(result.success).toBe(true);
      expect(result.data?.user?.id).toBeTruthy();
    });
  });

  describe('register', () => {
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

    it('uses mock register in mock mode', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        register: jest.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.register(registerData);

      expect(result.success).toBe(true);
    });

    it('maps duplicate mobile errors', async () => {
      mockPost.mockRejectedValue({
        response: { data: { message: 'mobile already exists' }, status: 400 },
      });

      const result = await authService.register(registerData);

      expect(result.error).toMatch(/mobile number already exists/i);
    });

    it('maps validation and school backend errors', async () => {
      mockPost.mockRejectedValue({
        response: { data: { message: 'validation failed on field' }, status: 400 },
      });
      const validationResult = await authService.register(registerData);
      expect(validationResult.error).toMatch(/check your information/i);

      mockPost.mockRejectedValue({
        response: { data: { message: 'invalid school id' }, status: 400 },
      });
      const schoolResult = await authService.register(registerData);
      expect(schoolResult.error).toMatch(/valid school/i);
    });

    it('rethrows unknown register errors', async () => {
      mockPost.mockRejectedValue(new Error('unexpected'));

      await expect(authService.register(registerData)).rejects.toThrow('unexpected');
    });

    it('maps generic backend error messages', async () => {
      mockPost.mockRejectedValue({
        response: { data: { message: 'Something went wrong' }, status: 500 },
      });

      const result = await authService.register(registerData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
    });
  });

  describe('account lifecycle', () => {
    it('deleteAccount uses mock service', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        deleteAccount: jest.fn().mockResolvedValue({ success: true }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.deleteAccount();

      expect(result.success).toBe(true);
    });

    it('getProfile uses mock service', async () => {
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        getProfile: jest.fn().mockResolvedValue({
          success: true,
          data: { id: '1', firstName: 'Mock' },
        }),
      } as never);
      mockWrapper.convertMockResponse.mockImplementation(r => r as never);

      const result = await authService.getProfile();

      expect(result.success).toBe(true);
    });

    it('updateProfile rethrows API errors', async () => {
      mockApi.put.mockRejectedValue(new Error('update failed'));

      await expect(authService.updateProfile({ firstName: 'X' })).rejects.toThrow('update failed');
    });
  });
});
