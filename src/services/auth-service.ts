import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';
import { API_ENDPOINTS, STORAGE_KEYS, getApiBaseUrl } from '@/constants';
import { ApiResponse, User, OTPResponse, StudentProfile, VerifyOTPResponse, LoginResponse, StudentProfilesResponse } from '@/types';
import { MockWrapperService } from './mock-wrapper';
import { apiLogger } from '@/utils/api-logger';
import { getRegisterDeviceContext } from '@/utils/device-registration';
import { buildRegisterApiPayload } from '@/utils/register-payload';
import { validateRegistrationData } from '@/utils/validation';
import { normalizeAuthTokens } from '@/utils/api-response';
import { isTruthySubscriptionFlag } from '@/utils/subscription';
import {
  publicApiPost,
  PUBLIC_API_CLIENT_VERSION,
  PublicApiResult,
} from '@/utils/public-api-request';
import { devLog } from '@/utils/dev-log';
import { useUserCachedStore } from '@/stores/user-cached-store';

/** Alternate mount path used by some backend deployments. */
const STUDENT_PROFILES_V1 = '/api/v1/students/profiles';
const STUDENT_SWITCH_PROFILE_V1 = '/api/v1/students/switch-profile';

/**
 * True only for a missing HTTP route (Spring: "Not found: api/..."),
 * not business errors like "Student not found".
 */
function isMissingApiRoute(statusCode?: number, error?: string): boolean {
  if (statusCode !== 404) {
    return false;
  }
  const message = String(error ?? '');
  return (
    /^Not found:\s*/i.test(message) ||
    /requested resource was not found/i.test(message) ||
    message.length === 0
  );
}

/** Last 10 digits of an Indian mobile (API expects plain 10-digit string). */
function toIndianMobile(mobile: string): string {
  return mobile.replace(/\D/g, '').slice(-10);
}

/** Indian mobile: 10 digits, first digit 6–9. */
function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/** Display / storage format (e.g. +91xxxxxxxxxx). */
function toE164(mobile: string): string {
  const digits = toIndianMobile(mobile);
  return digits.length === 10 ? `+91${digits}` : mobile;
}

function formatDevOtpError(
  message: string,
  debug?: PublicApiResult<unknown>['debug'],
): string {
  if (!__DEV__ || !debug) {
    return message;
  }
  return `${message}\n\n[dev debug]\nURL: ${debug.url}\nHTTP: ${debug.status}\nClient: ${debug.client}`;
}

function mapSendOtpError(
  message: string | undefined,
  debug?: PublicApiResult<unknown>['debug'],
): string {
  const msg = message?.trim() || 'Failed to send OTP';
  if (msg.includes('not registered')) {
    return 'This mobile number is not registered. Please register first or contact support.';
  }
  return formatDevOtpError(msg, debug);
}

function mapRegisterError(
  message: string | undefined,
  statusCode: number,
  debug?: PublicApiResult<unknown>['debug'],
): string {
  const msg = message?.trim() || 'Registration failed';
  const isUnauthorized =
    statusCode === 401 ||
    msg.toLowerCase().includes('unauthorized') ||
    msg.toUpperCase() === 'UNAUTHORIZED';

  if (isUnauthorized) {
    const apiBase = getApiBaseUrl();
    const onProduction = apiBase.includes('api.alphavlogs.com');
    if (__DEV__) {
      const hint = onProduction
        ? 'Production blocks anonymous registration. Copy api-config.local.example.ts to api-config.local.ts, set USE_PRODUCTION_API: false, and point to your local backend (or ask backend to permit POST /api/students/register).'
        : 'Ensure POST /api/students/register is permitAll on your backend SecurityConfig.';
      return formatDevOtpError(`Registration unauthorized (401). ${hint}`, debug);
    }
    return onProduction
      ? 'Registration is temporarily unavailable. Please try again later or contact support.'
      : 'Registration could not be completed. Please check your connection and try again.';
  }

  return formatDevOtpError(msg, debug);
}

function mapStudentProfile(raw: Record<string, unknown>): StudentProfile {
  return {
    studentId: Number(raw.studentId),
    firstName: String(raw.firstName ?? raw.first_name ?? ''),
    lastName: String(raw.lastName ?? raw.last_name ?? ''),
    className: String(raw.className ?? raw.class ?? ''),
    schoolName: String(raw.schoolName ?? raw.school ?? ''),
    verified: raw.verified === true || raw.isVerified === true,
    isSubscribed:
      raw.isSubscribed === true ||
      raw.subscribed === true ||
      isTruthySubscriptionFlag(raw.subscriptionStatus) ||
      isTruthySubscriptionFlag(raw.plan),
  };
}

function mapStudentProfiles(raw: unknown): StudentProfile[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(mapStudentProfile)
    .filter(profile => Number.isFinite(profile.studentId));
}

function mapVerifyUserToAppUser(raw: Record<string, unknown>, mobile: string): User {
  const role = String(raw.role ?? raw.userType ?? 'STUDENT').toUpperCase();
  const isStudent = role === 'STUDENT';
  return {
    id: String(raw.id ?? raw.studentId ?? raw.userId ?? ''),
    firstName: String(raw.firstName ?? raw.first_name ?? raw.username ?? 'User'),
    lastName: String(raw.lastName ?? raw.last_name ?? ''),
    email: String(raw.email ?? raw.emailId ?? raw.username ?? ''),
    mobile: toE164(String(raw.mobile ?? raw.mobileNumber ?? mobile)),
    state: String(raw.state ?? ''),
    district: String(raw.district ?? ''),
    city: String(raw.city ?? ''),
    pincode: String(raw.pincode ?? ''),
    roleId: isStudent ? 4 : 3,
    role: isStudent ? 'student' : 'influencer',
    isVerified: true,
    isSubscribed:
      raw.isSubscribed === true ||
      raw.subscribed === true ||
      isTruthySubscriptionFlag(raw.subscriptionStatus) ||
      isTruthySubscriptionFlag(raw.plan),
    subscriptionStatus: raw.subscriptionStatus
      ? String(raw.subscriptionStatus)
      : raw.isSubscribed === true || raw.subscribed === true
        ? 'active'
        : undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  };
}

/** Map AlphaVlogs /api/auth/me to app User. */
function mapMeToUser(me: { id: number; username: string; role: string; branchId: number | null }, mobile: string): User {
  const role = (me.role || '').toUpperCase();
  return {
    id: String(me.id),
    firstName: me.username || 'User',
    lastName: '',
    email: me.username || '',
    mobile: toE164(mobile),
    state: '',
    district: '',
    city: '',
    pincode: '',
    roleId: role === 'STUDENT' ? 4 : 3,
    role: role === 'STUDENT' ? 'student' : 'influencer',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

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
  studentClass?: string;
  section?: string;
}

async function resolveLoginFromApiBody(
  inner: Record<string, unknown>,
  mobile: string,
): Promise<ApiResponse<LoginResponse>> {
  const tokens = normalizeAuthTokens(inner);
  if (!tokens) {
    return { success: false, error: 'Invalid response from server.', statusCode: 500 };
  }

  let user: User | undefined;
  const rawUser = (inner.user ?? inner.student) as Record<string, unknown> | undefined;
  if (rawUser && typeof rawUser === 'object') {
    user = mapVerifyUserToAppUser(rawUser, mobile);
    user.isVerified =
      rawUser.verified === true ||
      rawUser.isVerified === true ||
      user.isVerified;
  } else {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
    const meResp = await apiService.get<Record<string, unknown>>(API_ENDPOINTS.USER.PROFILE);
    if (meResp.success === false) {
      return {
        success: false,
        error: meResp.error || 'Logged in but could not load profile.',
        statusCode: meResp.statusCode || 500,
      };
    }
    const me = (meResp.data ?? meResp) as Record<string, unknown>;
    user = mapMeToUser(
      {
        id: Number(me.id),
        username: String(me.username ?? ''),
        role: String(me.role ?? ''),
        branchId: (me.branchId as number | null) ?? null,
      },
      mobile,
    );
  }

  if (!user) {
    return { success: false, error: 'Could not load user profile.', statusCode: 500 };
  }

  return { success: true, data: { user, tokens }, statusCode: 200 };
}

function buildSelectionResponse(
  inner: Record<string, unknown>,
): ApiResponse<VerifyOTPResponse> | null {
  if (inner.selectionRequired !== true) {
    return null;
  }
  const profiles = mapStudentProfiles(inner.profiles);
  if (profiles.length === 0) {
    return { success: false, error: 'No student profiles available.', statusCode: 400 };
  }
  return {
    success: true,
    data: {
      otpVerified: inner.otpVerified === true || true,
      selectionRequired: true,
      profiles,
      user: undefined,
      tokens: undefined,
    },
    statusCode: 200,
  };
}

async function buildVerifyOtpResponse(
  inner: Record<string, unknown>,
  mobile: string,
): Promise<ApiResponse<VerifyOTPResponse>> {
  const selection = buildSelectionResponse(inner);
  if (selection) {
    return selection;
  }

  const loginResult = await resolveLoginFromApiBody(inner, mobile);
  if (!loginResult.success || !loginResult.data) {
    return {
      success: false,
      error: loginResult.error || 'Invalid response from server.',
      statusCode: loginResult.statusCode || 500,
    };
  }

  return {
    success: true,
    data: {
      otpVerified: inner.otpVerified === true || true,
      selectionRequired: false,
      profiles: null,
      user: loginResult.data.user,
      tokens: loginResult.data.tokens,
    },
    statusCode: 200,
  };
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

      // Drop stale tokens so login OTP is never sent with an expired Bearer header.
      await apiService.clearStoredAuth();

      const mobile = toIndianMobile(data.mobile);
      if (!isValidIndianMobile(mobile)) {
        const err = {
          success: false,
          error: 'Enter a valid 10-digit Indian mobile number (starting with 6–9).',
          statusCode: 400,
        };
        apiLogger.logServiceCall('AuthService', 'sendOTP', data, null, err);
        return err;
      }

      devLog('AuthService.sendOTP start', { mobile, client: PUBLIC_API_CLIENT_VERSION });

      const resp = await publicApiPost<OTPResponse>(API_ENDPOINTS.STUDENTS.SEND_OTP, {
        mobile,
      });

      if (resp.success === false) {
        const err = {
          success: false,
          error: mapSendOtpError(resp.error, resp.debug),
          statusCode: resp.statusCode || 400,
        };
        apiLogger.logServiceCall('AuthService', 'sendOTP', data, null, err);
        return err;
      }

      const inner = resp.data ?? (resp as unknown as OTPResponse);
      const result: ApiResponse<OTPResponse> = {
        success: true,
        data: {
          message: inner?.message ?? 'OTP sent successfully',
          mobile: inner?.mobile ?? mobile,
          expiresIn: inner?.expiresIn ?? 300,
          otpMessage: inner?.message ?? 'OTP sent successfully',
        },
        statusCode: resp.statusCode ?? 200,
      };
      apiLogger.logServiceCall('AuthService', 'sendOTP', data, result);
      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to send OTP';
      const friendlyError = {
        success: false,
        error: mapSendOtpError(msg),
        statusCode: 400,
      };
      apiLogger.logServiceCall('AuthService', 'sendOTP', data, null, friendlyError);
      return friendlyError;
    }
  }

  // Alias for login - verifyOTP is used for login
  async login(data: LoginRequest): Promise<ApiResponse<VerifyOTPResponse>> {
    return this.verifyOTP(data);
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse>> {
    try {
      const mobile = toIndianMobile(data.mobile);
      if (!isValidIndianMobile(mobile)) {
        const err = {
          success: false,
          error: 'Enter a valid 10-digit Indian mobile number (starting with 6–9).',
          statusCode: 400,
        };
        apiLogger.logServiceCall('AuthService', 'verifyOTP', data, null, err);
        return err;
      }

      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().verifyOTP(data);
        const converted = MockWrapperService.convertMockResponse(mockResponse);
        if (!converted.success) {
          apiLogger.logMockCall('AuthService', 'verifyOTP', data, converted);
          return converted;
        }
        const result = await buildVerifyOtpResponse(
          (converted.data ?? {}) as Record<string, unknown>,
          mobile,
        );
        apiLogger.logMockCall('AuthService', 'verifyOTP', data, result);
        return result;
      }

      const resp = await publicApiPost<VerifyOTPResponse>(
        API_ENDPOINTS.STUDENTS.VERIFY_OTP,
        {
          mobile,
          otp: data.otp.trim(),
        },
      );

      if (resp.success === false) {
        const err = {
          success: false,
          error: resp.error || 'Invalid or expired OTP.',
          statusCode: resp.statusCode || 401,
        };
        apiLogger.logServiceCall('AuthService', 'verifyOTP', data, null, err);
        return err;
      }

      const inner = (resp.data ?? resp) as unknown as Record<string, unknown>;
      const result = await buildVerifyOtpResponse(inner, mobile);
      apiLogger.logServiceCall('AuthService', 'verifyOTP', data, result);
      return result;
    } catch (error: unknown) {
      const friendlyMessage =
        error instanceof Error ? error.message : 'Unable to verify OTP. Please try again.';
      const err = { success: false, error: friendlyMessage, statusCode: 500 };
      apiLogger.logServiceCall('AuthService', 'verifyOTP', data, null, err);
      return err;
    }
  }

  async selectProfile(data: {
    studentId: number;
    mobile: string;
    otp?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    try {
      const mobile = toIndianMobile(data.mobile);
      if (!isValidIndianMobile(mobile)) {
        return {
          success: false,
          error: 'Enter a valid 10-digit Indian mobile number (starting with 6–9).',
          statusCode: 400,
        };
      }

      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().selectProfile(data);
        const converted = MockWrapperService.convertMockResponse(mockResponse);
        if (!converted.success) {
          apiLogger.logMockCall('AuthService', 'selectProfile', data, converted);
          return converted;
        }
        const result = await resolveLoginFromApiBody(
          (converted.data ?? {}) as Record<string, unknown>,
          mobile,
        );
        apiLogger.logMockCall('AuthService', 'selectProfile', data, result);
        return result;
      }

      const body: {studentId: number; mobile: string; otp?: string} = {
        studentId: data.studentId,
        mobile,
      };
      const otp = data.otp?.trim();
      if (otp) {
        body.otp = otp;
      }

      const resp = await publicApiPost<LoginResponse>(
        API_ENDPOINTS.STUDENTS.SELECT_PROFILE,
        body,
      );

      if (resp.success === false) {
        return {
          success: false,
          error: resp.error || 'Invalid student profile selection.',
          statusCode: resp.statusCode || 400,
        };
      }

      const inner = (resp.data ?? resp) as unknown as Record<string, unknown>;
      const result = await resolveLoginFromApiBody(inner, mobile);
      apiLogger.logServiceCall('AuthService', 'selectProfile', data, result);
      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unable to select profile. Please try again.';
      const err = { success: false, error: message, statusCode: 500 };
      apiLogger.logServiceCall('AuthService', 'selectProfile', data, null, err);
      return err;
    }
  }

  async listProfiles(): Promise<ApiResponse<StudentProfilesResponse>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().listProfiles();
        const converted = MockWrapperService.convertMockResponse(mockResponse);
        if (!converted.success) {
          apiLogger.logMockCall('AuthService', 'listProfiles', null, converted);
          return converted;
        }
        const profiles = mapStudentProfiles(
          (converted.data as Record<string, unknown> | undefined)?.profiles,
        );
        const result: ApiResponse<StudentProfilesResponse> = {
          success: true,
          data: { profiles },
          statusCode: 200,
        };
        apiLogger.logMockCall('AuthService', 'listProfiles', null, result);
        return result;
      }

      // Prefer live API; fall back to /api/v1 if the primary path 404s on older hosts.
      let resp = await apiService.get<StudentProfilesResponse>(API_ENDPOINTS.STUDENTS.PROFILES);
      if (resp.success === false && isMissingApiRoute(resp.statusCode, resp.error)) {
        resp = await apiService.get<StudentProfilesResponse>(STUDENT_PROFILES_V1);
      }

      if (resp.success === false) {
        // OTP already returned sibling profiles — reuse them when GET /profiles is missing.
        const cached = useUserCachedStore.getState().linkedProfiles;
        if (cached.length > 0) {
          const result: ApiResponse<StudentProfilesResponse> = {
            success: true,
            data: { profiles: cached },
            statusCode: 200,
          };
          apiLogger.logServiceCall('AuthService', 'listProfiles', {source: 'cache'}, result);
          return result;
        }

        const statusCode = resp.statusCode || 400;
        const error =
          statusCode === 401 || /unauthorized/i.test(String(resp.error ?? ''))
            ? 'Your session expired. Please log out and sign in again.'
            : isMissingApiRoute(statusCode, resp.error)
              ? 'Unable to load linked students from the server. Log out and sign in again to refresh profiles.'
              : resp.error || 'Unable to load profiles.';
        return { success: false, error, statusCode };
      }

      const inner = (resp.data ?? resp) as unknown as Record<string, unknown>;
      const profiles = mapStudentProfiles(inner.profiles);
      if (profiles.length > 0) {
        useUserCachedStore.getState().setLinkedProfiles(profiles);
      }
      const result: ApiResponse<StudentProfilesResponse> = {
        success: true,
        data: { profiles },
        statusCode: resp.statusCode ?? 200,
      };
      apiLogger.logServiceCall('AuthService', 'listProfiles', null, result);
      return result;
    } catch (error: unknown) {
      const cached = useUserCachedStore.getState().linkedProfiles;
      if (cached.length > 0) {
        return {
          success: true,
          data: { profiles: cached },
          statusCode: 200,
        };
      }
      const message =
        error instanceof Error ? error.message : 'Unable to load profiles. Please try again.';
      const err = { success: false, error: message, statusCode: 500 };
      apiLogger.logServiceCall('AuthService', 'listProfiles', null, null, err);
      return err;
    }
  }

  async switchProfile(data: { studentId: number }): Promise<ApiResponse<LoginResponse>> {
    try {
      const studentId = Number(data.studentId);
      if (!Number.isFinite(studentId) || studentId <= 0) {
        return {
          success: false,
          error: 'Invalid student profile.',
          statusCode: 400,
        };
      }

      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().switchProfile({
          studentId,
        });
        const converted = MockWrapperService.convertMockResponse(mockResponse);
        if (!converted.success) {
          apiLogger.logMockCall('AuthService', 'switchProfile', data, converted);
          return converted;
        }
        const inner = (converted.data ?? {}) as Record<string, unknown>;
        const rawUser = (inner.user ?? inner.student) as Record<string, unknown> | undefined;
        const mobile = rawUser
          ? toIndianMobile(String(rawUser.mobile ?? rawUser.mobileNumber ?? ''))
          : '9876543210';
        const result = await resolveLoginFromApiBody(inner, mobile);
        apiLogger.logMockCall('AuthService', 'switchProfile', data, result);
        return result;
      }

      // Fail fast if we would call switch without a Bearer token.
      const tokens = await apiService.ensureFreshAccessToken();
      if (!tokens?.accessToken) {
        return {
          success: false,
          error: 'Your session expired. Please log out and sign in again.',
          statusCode: 401,
        };
      }

      devLog('AuthService.switchProfile →', {
        studentId,
        baseUrl: getApiBaseUrl(),
        path: API_ENDPOINTS.STUDENTS.SWITCH_PROFILE,
      });

      let resp = await apiService.post<LoginResponse>(API_ENDPOINTS.STUDENTS.SWITCH_PROFILE, {
        studentId,
      });
      if (resp.success === false && isMissingApiRoute(resp.statusCode, resp.error)) {
        resp = await apiService.post<LoginResponse>(STUDENT_SWITCH_PROFILE_V1, {
          studentId,
        });
      }

      if (resp.success === false) {
        const statusCode = resp.statusCode || 400;
        const rawError = String(resp.error ?? '').trim();
        const error =
          statusCode === 401 || /unauthorized/i.test(rawError)
            ? 'Your session expired. Please log out and sign in again.'
            : statusCode === 403 ||
                /profile not available|does not belong|access required/i.test(rawError)
              ? 'Profile not available for this account.'
              : // Never mask the real server/network error — it hides the root cause.
                rawError || `Unable to switch profile (${statusCode}).`;
        devLog('AuthService.switchProfile ← failed', {
          statusCode,
          rawError,
          error,
          baseUrl: getApiBaseUrl(),
        });
        return { success: false, error, statusCode };
      }

      // Support both wrapped { data: { user, tokens } } and flat bodies.
      const inner = (resp.data ?? resp) as unknown as Record<string, unknown>;
      const payload =
        inner.user || inner.tokens || inner.student
          ? inner
          : ((inner.data as Record<string, unknown> | undefined) ?? inner);
      const rawUser = (payload.user ?? payload.student) as Record<string, unknown> | undefined;
      const mobile = rawUser
        ? toIndianMobile(String(rawUser.mobile ?? rawUser.mobileNumber ?? ''))
        : '';
      const result = await resolveLoginFromApiBody(payload, mobile);
      apiLogger.logServiceCall('AuthService', 'switchProfile', {studentId}, result);
      return result;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unable to switch profile. Please try again.';
      const err = { success: false, error: message, statusCode: 500 };
      apiLogger.logServiceCall('AuthService', 'switchProfile', data, null, err);
      return err;
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

      // Drop stale tokens — registration must be anonymous (same as sendOTP).
      await apiService.clearStoredAuth();

      // Build backend payload (schoolId vs schoolName, device fields, digit-only mobile)
      const device = await getRegisterDeviceContext();
      const payload = buildRegisterApiPayload(data, device);

      devLog('AuthService.register start', {
        client: PUBLIC_API_CLIENT_VERSION,
        baseUrl: getApiBaseUrl(),
        path: API_ENDPOINTS.STUDENTS.REGISTER,
        payload,
      });

      const result = await publicApiPost<User>(API_ENDPOINTS.STUDENTS.REGISTER, payload);

      devLog('AuthService.register request', {
        via: 'publicApiPost',
        authHeader: false,
        path: API_ENDPOINTS.STUDENTS.REGISTER,
      });

      if (result.success === false) {
        const err = {
          success: false as const,
          error: mapRegisterError(result.error, result.statusCode ?? 0, result.debug),
          statusCode: result.statusCode ?? 400,
        };
        apiLogger.logServiceCall('AuthService', 'register', data, null, err);
        return err;
      }

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

  async deleteAccount(): Promise<ApiResponse<void>> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockResponse = await MockWrapperService.getMockService().deleteAccount();
        const result = MockWrapperService.convertMockResponse(mockResponse);
        apiLogger.logMockCall('AuthService', 'deleteAccount', null, result);
        return result;
      }

      const result = await apiService.delete<void>(API_ENDPOINTS.STUDENTS.DELETE_ACCOUNT);
      if (result.success) {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
      apiLogger.logServiceCall('AuthService', 'deleteAccount', null, result);
      return result;
    } catch (error) {
      apiLogger.logServiceCall('AuthService', 'deleteAccount', null, null, error);
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

      const raw = await apiService.get<any>(API_ENDPOINTS.USER.PROFILE);
      if (raw && (raw as any).success === false) {
        apiLogger.logServiceCall('AuthService', 'getProfile', null, null, raw);
        return raw as ApiResponse<User>;
      }
      const me = (raw?.data ?? raw) as { id: number; username: string; role: string; branchId?: number | null };
      const user = mapMeToUser(
        { id: me?.id, username: me?.username ?? '', role: me?.role ?? '', branchId: me?.branchId ?? null },
        ''
      );
      const result: ApiResponse<User> = { success: true, data: user, statusCode: 200 };
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
export type { LoginResponse, VerifyOTPResponse, StudentProfile } from '@/types';
