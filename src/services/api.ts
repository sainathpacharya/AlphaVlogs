import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import NetInfo from '@react-native-community/netinfo';
import { getApiBaseUrl, API_ENDPOINTS, API, STORAGE_KEYS } from '@/constants';
import { ApiResponse, AuthTokens } from '@/types';
import { apiLogger, ApiLogRequest, ApiLogResponse, ApiLogError } from '@/utils/api-logger';
import { normalizeAuthTokens, parseApiErrorMessage } from '@/utils/api-response';
import { purgeAuthTokensFromDevice } from '@/utils/auth-storage';

export type ApiRequestConfig = {
  skipAuth?: boolean;
  _retry?: boolean;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
};

type InternalRequestConfig = ApiRequestConfig & {
  method: string;
  url: string;
  body?: unknown;
};

class ApiService {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: string) => void;
    reject: (error?: unknown) => void;
  }> = [];

  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      if (tokensJson) {
        const parsed = normalizeAuthTokens(JSON.parse(tokensJson));
        if (parsed) {
          return parsed;
        }
      }

      const credentials = await Keychain.getInternetCredentials('auth_tokens');
      if (credentials !== false && credentials.password) {
        const parsed = normalizeAuthTokens(JSON.parse(credentials.password));
        if (parsed) {
          return parsed;
        }
      }

      return null;
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting stored tokens:', error);
      }
      return null;
    }
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
    } catch (error) {
      if (__DEV__) {
        console.error('Error storing tokens:', error);
      }
    }
  }

  private async clearAuth(): Promise<void> {
    try {
      await purgeAuthTokensFromDevice();
    } catch (error) {
      if (__DEV__) {
        console.error('Error clearing auth:', error);
      }
    }
  }

  private isRefreshRequest(url: string): boolean {
    return url === API_ENDPOINTS.AUTH.REFRESH || url.endsWith(API_ENDPOINTS.AUTH.REFRESH);
  }

  /** Login/register endpoints must never send stored Bearer tokens (stale iOS Keychain). */
  private isPublicAuthPath(path: string): boolean {
    const publicPaths = [
      API_ENDPOINTS.STUDENTS.SEND_OTP,
      API_ENDPOINTS.STUDENTS.VERIFY_OTP,
      API_ENDPOINTS.STUDENTS.SELECT_PROFILE,
      API_ENDPOINTS.AUTH.SEND_OTP,
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      API_ENDPOINTS.AUTH.REGISTER,
    ];
    return publicPaths.some(p => path === p || path.endsWith(p));
  }

  private shouldSkipAuth(path: string, config: ApiRequestConfig): boolean {
    return config.skipAuth === true || this.isPublicAuthPath(path);
  }

  /** Clear tokens from AsyncStorage, Keychain, and in-memory store (call before login OTP). */
  async clearStoredAuth(): Promise<void> {
    await this.clearAuth();
    try {
      const { useUserCachedStore } = await import('@/stores/user-cached-store');
      useUserCachedStore.setState({ tokens: null, userData: null });
    } catch (error) {
      if (__DEV__) {
        console.error('Error clearing cached auth store:', error);
      }
    }
  }

  private async buildRequestHeaders(
    path: string,
    config: ApiRequestConfig,
  ): Promise<Record<string, string>> {
    const skipAuth = this.shouldSkipAuth(path, config);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Platform': Platform.OS,
    };

    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        if (skipAuth && key.toLowerCase() === 'authorization') {
          continue;
        }
        headers[key] = value;
      }
    }

    if (!skipAuth && !this.isRefreshRequest(path)) {
      const tokens = await this.getStoredTokens();
      if (tokens?.accessToken) {
        headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    }

    return headers;
  }

  private buildUrl(path: string, params?: ApiRequestConfig['params']): string {
    const baseUrl = getApiBaseUrl().replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${baseUrl}${normalizedPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async parseResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    const text = await response.text();
    return text || null;
  }

  private async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.executeFetch(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      url: API_ENDPOINTS.AUTH.REFRESH,
      body: { refreshToken },
      skipAuth: true,
    });

    const body = response.data;
    const newTokens =
      normalizeAuthTokens(body) ??
      normalizeAuthTokens(
        body && typeof body === 'object' ? (body as Record<string, unknown>).data : null,
      );

    if (!newTokens) {
      throw new Error('Invalid refresh response from server');
    }

    await this.storeTokens(newTokens);
    return newTokens;
  }

  private async executeFetch<T>(
    path: string,
    config: InternalRequestConfig,
  ): Promise<{ ok: boolean; status: number; statusText: string; data: ApiResponse<T> | unknown }> {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
      throw new Error('No internet connection');
    }

    const url = this.buildUrl(path, config.params);
    const startTime = new Date();
    const skipAuth = this.shouldSkipAuth(path, config);
    const headers = await this.buildRequestHeaders(path, config);

    if (skipAuth) {
      delete headers.Authorization;
      delete headers.authorization;
    }

    if (__DEV__) {
      console.log(`[API] ${config.method} ${path}`, {
        baseUrl: getApiBaseUrl(),
        skipAuth,
        hasAuthHeader: Boolean(headers.Authorization ?? headers.authorization),
      });
    }

    const logRequest: ApiLogRequest = {
      method: config.method,
      url: path,
      baseURL: getApiBaseUrl(),
      fullUrl: url,
      headers,
      data: config.body,
    };
    apiLogger.logRequestStart(logRequest, startTime);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT);

    try {
      const response = await fetch(url, {
        method: config.method,
        headers,
        body:
          config.body !== undefined && config.body !== null
            ? JSON.stringify(config.body)
            : undefined,
        credentials: 'omit',
        signal: controller.signal,
      });

      const data = await this.parseResponseBody(response);

      if (response.ok) {
        apiLogger.logRequestSuccess(
          {
            method: config.method,
            url: path,
            status: response.status,
            statusText: response.statusText,
            data,
          } satisfies ApiLogResponse,
          startTime,
        );
      } else {
        apiLogger.logRequestError(
          {
            method: config.method,
            url: path,
            status: response.status,
            statusText: response.statusText,
            message: parseApiErrorMessage(data) || response.statusText,
            data,
          } satisfies ApiLogError,
          startTime,
        );
      }

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
      };
    } catch (error) {
      apiLogger.logRequestError(
        {
          method: config.method,
          url: path,
          message: error instanceof Error ? error.message : 'Network request failed',
        } satisfies ApiLogError,
        startTime,
      );
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async request<T>(path: string, config: InternalRequestConfig): Promise<ApiResponse<T>> {
    try {
      const skipAuth = this.shouldSkipAuth(path, config);
      let result = await this.executeFetch<T>(path, config);

      if (
        result.status === 401 &&
        !config._retry &&
        !skipAuth &&
        !this.isRefreshRequest(path)
      ) {
        if (this.isRefreshing) {
          const token = await new Promise<string>((resolve, reject) => {
            this.failedQueue.push({
              resolve: (value?: string) => {
                if (value) {
                  resolve(value);
                }
              },
              reject,
            });
          });
          const retryResult = await this.executeFetch<T>(path, {
            ...config,
            _retry: true,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            },
          });
          result = retryResult;
        } else {
          this.isRefreshing = true;
          try {
            const tokens = await this.getStoredTokens();
            if (tokens?.refreshToken) {
              const newTokens = await this.refreshAccessToken(tokens.refreshToken);
              this.failedQueue.forEach(({ resolve }) => resolve(newTokens.accessToken));
              this.failedQueue = [];

              const retryResult = await this.executeFetch<T>(path, {
                ...config,
                _retry: true,
                headers: {
                  ...config.headers,
                  Authorization: `Bearer ${newTokens.accessToken}`,
                },
              });
              result = retryResult;
            }
          } catch (refreshError) {
            await this.clearAuth();
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            return this.handleFetchFailure(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
      }

      if (result.ok) {
        return result.data as ApiResponse<T>;
      }

      return this.handleHttpError(result.status, result.statusText, result.data);
    } catch (error) {
      return this.handleFetchFailure(error);
    }
  }

  private handleHttpError(status: number, statusText: string, data: unknown): ApiResponse {
    const errorMessage =
      (typeof data === 'string' ? data : parseApiErrorMessage(data)) ||
      statusText ||
      'An error occurred';

    return {
      success: false,
      error: errorMessage,
      statusCode: status,
    };
  }

  private handleFetchFailure(error: unknown): ApiResponse {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please try again.',
          statusCode: 408,
        };
      }
      if (error.message === 'No internet connection') {
        return {
          success: false,
          error: 'Network error. Please check your connection.',
          statusCode: 0,
        };
      }
      return {
        success: false,
        error: error.message || 'An unknown error occurred.',
        statusCode: 0,
      };
    }

    return {
      success: false,
      error: 'An unknown error occurred.',
      statusCode: 0,
    };
  }

  async get<T = unknown>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET', url });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', url, body: data });
  }

  /**
   * Pre-login POST — never reads Keychain/AsyncStorage tokens or retries with Bearer auth.
   * Use for OTP, register, and other public auth endpoints.
   */
  async postPublic<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    }

    const url = this.buildUrl(path);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Platform': Platform.OS,
    };
    const startTime = new Date();

    if (__DEV__) {
      console.log('[API:public] POST', url, { body: data });
    }

    apiLogger.logRequestStart(
      {
        method: 'POST',
        url: path,
        baseURL: getApiBaseUrl(),
        fullUrl: url,
        headers,
        data,
      },
      startTime,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data !== undefined && data !== null ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      const parsed = await this.parseResponseBody(response);

      if (__DEV__) {
        console.log('[API:public] response', response.status, parsed);
      }

      if (response.ok) {
        apiLogger.logRequestSuccess(
          {
            method: 'POST',
            url: path,
            status: response.status,
            statusText: response.statusText,
            data: parsed,
          },
          startTime,
        );

        if (parsed && typeof parsed === 'object' && 'success' in (parsed as object)) {
          return parsed as ApiResponse<T>;
        }
        return { success: true, data: parsed as T, statusCode: response.status };
      }

      apiLogger.logRequestError(
        {
          method: 'POST',
          url: path,
          status: response.status,
          statusText: response.statusText,
          message: parseApiErrorMessage(parsed) || response.statusText,
          data: parsed,
        },
        startTime,
      );

      return this.handleHttpError(response.status, response.statusText, parsed);
    } catch (error) {
      apiLogger.logRequestError(
        {
          method: 'POST',
          url: path,
          message: error instanceof Error ? error.message : 'Network request failed',
        },
        startTime,
      );
      return this.handleFetchFailure(error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', url, body: data });
  }

  async delete<T = unknown>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE', url });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', url, body: data });
  }

  async uploadFile<T = unknown>(
    url: string,
    file: unknown,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    void onProgress;

    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    }

    const fullUrl = this.buildUrl(url);
    const startTime = new Date();
    const formData = new FormData();
    formData.append('file', file as unknown as Blob);

    const headers: Record<string, string> = {
      'X-Client-Platform': Platform.OS,
    };

    const tokens = await this.getStoredTokens();
    if (tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    apiLogger.logRequestStart(
      {
        method: 'POST',
        url,
        baseURL: getApiBaseUrl(),
        fullUrl,
        headers,
        data: '[FormData]',
      },
      startTime,
    );

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await this.parseResponseBody(response);

      if (response.ok) {
        apiLogger.logRequestSuccess(
          {
            method: 'POST',
            url,
            status: response.status,
            statusText: response.statusText,
            data,
          },
          startTime,
        );
        return data as ApiResponse<T>;
      }

      return this.handleHttpError(response.status, response.statusText, data);
    } catch (error) {
      return this.handleFetchFailure(error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
