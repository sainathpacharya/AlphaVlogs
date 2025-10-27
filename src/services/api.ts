import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { APP_CONFIG, API_ENDPOINTS, API, STORAGE_KEYS } from '@/constants';
import { ApiResponse, AuthTokens } from '@/types';
import { apiLogger } from '@/utils/api-logger';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: APP_CONFIG.apiUrl,
      timeout: API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Check network connectivity (only block when explicitly offline)
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
          throw new Error('No internet connection');
        }

        // Add auth token to requests
        const tokens = await this.getStoredTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        // Add request timestamp for caching and logging
        const startTime = new Date();
        (config as any).metadata = { startTime };

        // Log the request
        apiLogger.logRequestStart(config, startTime);

        return config;
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful response
        const startTime = (response.config as any).metadata?.startTime;
        if (startTime) {
          apiLogger.logRequestSuccess(response, startTime);
        }

        return response;
      },
      async (error: AxiosError) => {
        // Log the error
        const startTime = (error.config as any)?.metadata?.startTime;
        if (startTime) {
          apiLogger.logRequestError(error, startTime);
        }

        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for the token refresh to complete
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers!.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const tokens = await this.getStoredTokens();
            if (tokens?.refreshToken) {
              const response = await this.refreshToken(tokens.refreshToken);
              const newTokens = response.data;

              await this.storeTokens(newTokens);

              // Retry failed requests
              this.failedQueue.forEach(({ resolve }) => {
                resolve(newTokens.accessToken);
              });
              this.failedQueue = [];

              originalRequest.headers!.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Token refresh failed, clear auth and redirect to login
            await this.clearAuth();
            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            this.failedQueue = [];
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  private async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  private async refreshToken(refreshToken: string): Promise<AxiosResponse<AuthTokens>> {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || error.response.statusText,
        statusCode: error.response.status,
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    } else {
      // Other error
      return {
        success: false,
        error: error.message || 'An unknown error occurred.',
        statusCode: 0,
      };
    }
  }

  // Upload file
  async uploadFile<T = any>(url: string, file: any, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.api.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;
