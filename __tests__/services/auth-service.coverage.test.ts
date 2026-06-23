import { authService } from '../../src/services/auth-service';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import apiService from '../../src/services/api';
import * as publicApiRequest from '../../src/utils/public-api-request';

jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/utils/api-logger', () => ({
  apiLogger: { logMockCall: jest.fn(), logServiceCall: jest.fn() },
}));
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

describe('AuthService coverage paths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
    mockApi.clearStoredAuth.mockResolvedValue(undefined);
  });

  it('sendOTP handles thrown errors', async () => {
    mockPost.mockRejectedValue(new Error('network down'));

    const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('sendOTP maps API failure with debug info', async () => {
    mockPost.mockResolvedValue({
      success: false,
      error: 'Server error',
      statusCode: 500,
      debug: { url: '/otp', status: 500, client: 'test' },
    } as never);

    const result = await authService.sendOTP({ mobile: '9876543210', type: 'login' });

    expect(result.success).toBe(false);
  });

  it('verifyOTP rejects invalid mobile', async () => {
    const result = await authService.verifyOTP({ mobile: '123', otp: '123456' });

    expect(result.success).toBe(false);
  });

  it('verifyOTP returns mock failure unchanged', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      verifyOTP: jest.fn().mockResolvedValue({ success: false, error: 'bad otp' }),
    } as never);
    mockWrapper.convertMockResponse.mockImplementation(r => r as never);

    const result = await authService.verifyOTP({ mobile: '9876543210', otp: '000000' });

    expect(result.success).toBe(false);
  });

  it('verifyOTP handles API verify failure', async () => {
    mockPost.mockResolvedValue({
      success: false,
      error: 'Invalid OTP',
      statusCode: 400,
    });

    const result = await authService.verifyOTP({ mobile: '9876543210', otp: '000000' });

    expect(result.success).toBe(false);
  });

  it('verifyOTP handles selection required with empty profiles', async () => {
    mockPost.mockResolvedValue({
      success: true,
      data: {
        selectionRequired: true,
        profiles: [],
      },
      statusCode: 200,
    });

    const result = await authService.verifyOTP({ mobile: '9876543210', otp: '123456' });

    expect(result.success).toBe(false);
  });

  it('selectProfile handles thrown errors', async () => {
    mockPost.mockRejectedValue(new Error('boom'));

    const result = await authService.selectProfile({
      studentId: 1,
      mobile: '9876543210',
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(500);
  });

  it('listProfiles handles thrown errors', async () => {
    mockApi.get.mockRejectedValue(new Error('boom'));

    const result = await authService.listProfiles();

    expect(result.success).toBe(false);
  });

  it('switchProfile handles thrown errors', async () => {
    mockApi.post.mockRejectedValue(new Error('boom'));

    const result = await authService.switchProfile({ studentId: 1 });

    expect(result.success).toBe(false);
  });

  it('logout rethrows unexpected errors', async () => {
    mockApi.post.mockRejectedValue(new Error('logout failed'));

    await expect(authService.logout()).rejects.toThrow('logout failed');
  });

  it('deleteAccount rethrows unexpected errors', async () => {
    mockApi.delete.mockRejectedValue(new Error('delete failed'));

    await expect(authService.deleteAccount()).rejects.toThrow('delete failed');
  });

  it('getProfile rethrows unexpected errors', async () => {
    mockApi.get.mockRejectedValue(new Error('profile failed'));

    await expect(authService.getProfile()).rejects.toThrow('profile failed');
  });

  it('updateProfile uses mock service', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      updateProfile: jest.fn().mockResolvedValue({
        success: true,
        data: { id: '1', firstName: 'Updated' },
      }),
    } as never);
    mockWrapper.convertMockResponse.mockImplementation(r => r as never);

    const result = await authService.updateProfile({ firstName: 'Updated' });

    expect(result.success).toBe(true);
  });
});
