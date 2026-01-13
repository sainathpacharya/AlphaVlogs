import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '@/config/api-config';

export interface ApiLogData {
  method: string;
  url: string;
  baseURL?: string;
  fullUrl: string;
  headers?: Record<string, any>;
  params?: any;
  data?: any;
  status?: number;
  statusText?: string;
  responseData?: any;
  error?: any;
  duration?: number;
  timestamp: string;
}

class ApiLogger {
  private isEnabled: boolean;

  constructor() {
    // Enable logging in development or when explicitly configured
    this.isEnabled = __DEV__ || API_CONFIG.DEV.LOG_API_CALLS;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatDuration(startTime: any, endTime: Date): number {
    const start = startTime instanceof Date ? startTime.getTime() : startTime;
    const end = endTime.getTime();
    return end - start;
  }

  private sanitizeData(data: any): any {
    if (!data) {return data;}

    // Create a deep copy to avoid modifying original data
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'key', 'otp'];

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {return obj;}

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeObject(value);
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }

  private logRequest(config: AxiosRequestConfig, startTime: Date): void {
    if (!this.isEnabled) {return;}

    const logData: Partial<ApiLogData> = {
      method: config.method?.toUpperCase() || 'UNKNOWN',
      url: config.url || '',
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL || ''}${config.url || ''}`,
      headers: this.sanitizeData(config.headers),
      params: this.sanitizeData(config.params),
      data: this.sanitizeData(config.data),
      timestamp: this.formatTimestamp(),
    };

    console.group(`🚀 API Request: ${logData.method} ${logData.url}`);
    console.log('📅 Timestamp:', logData.timestamp);
    console.log('🌐 Full URL:', logData.fullUrl);
    console.log('📋 Headers:', logData.headers);
    if (logData.params) {console.log('🔍 Query Params:', logData.params);}
    if (logData.data) {console.log('📦 Request Body:', logData.data);}
    console.groupEnd();
  }

  private logResponse(response: AxiosResponse, startTime: Date): void {
    if (!this.isEnabled) {return;}

    const endTime = new Date();
    const duration = this.formatDuration(startTime, endTime);

    const logData: Partial<ApiLogData> = {
      method: response.config.method?.toUpperCase() || 'UNKNOWN',
      url: response.config.url || '',
      status: response.status,
      statusText: response.statusText,
      responseData: this.sanitizeData(response.data),
      duration,
      timestamp: this.formatTimestamp(),
    };

    const statusEmoji = logData.status && logData.status >= 200 && logData.status < 300 ? '✅' : '⚠️';

    console.group(`${statusEmoji} API Response: ${logData.method} ${logData.url}`);
    console.log('📅 Timestamp:', logData.timestamp);
    console.log('⏱️ Duration:', `${logData.duration}ms`);
    console.log('📊 Status:', `${logData.status} ${logData.statusText}`);
    console.log('📦 Response Data:', logData.responseData);
    console.groupEnd();
  }

  private logError(error: AxiosError, startTime: Date): void {
    if (!this.isEnabled) {return;}

    const endTime = new Date();
    const duration = this.formatDuration(startTime, endTime);

    const logData: Partial<ApiLogData> = {
      method: error.config?.method?.toUpperCase() || 'UNKNOWN',
      url: error.config?.url || '',
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: {
        message: error.message,
        code: error.code,
        response: this.sanitizeData(error.response?.data),
      },
      duration,
      timestamp: this.formatTimestamp(),
    };

    console.group(`❌ API Error: ${logData.method} ${logData.url}`);
    console.log('📅 Timestamp:', logData.timestamp);
    console.log('⏱️ Duration:', `${logData.duration}ms`);
    console.log('📊 Status:', `${logData.status} ${logData.statusText}`);
    console.log('🚨 Error Details:', logData.error);
    console.groupEnd();
  }

  // Public methods for logging
  logRequestStart(config: AxiosRequestConfig, startTime: Date): void {
    this.logRequest(config, startTime);
  }

  logRequestSuccess(response: AxiosResponse, startTime: Date): void {
    this.logResponse(response, startTime);
  }

  logRequestError(error: AxiosError, startTime: Date): void {
    this.logError(error, startTime);
  }

  // Method for logging service-level operations
  logServiceCall(serviceName: string, methodName: string, params?: any, result?: any, error?: any): void {
    if (!this.isEnabled) {return;}

    const timestamp = this.formatTimestamp();

    if (error) {
      console.group(`❌ Service Error: ${serviceName}.${methodName}`);
      console.log('📅 Timestamp:', timestamp);
      console.log('📋 Parameters:', this.sanitizeData(params));
      console.log('🚨 Error:', error);
      console.groupEnd();
    } else {
      console.group(`✅ Service Call: ${serviceName}.${methodName}`);
      console.log('📅 Timestamp:', timestamp);
      console.log('📋 Parameters:', this.sanitizeData(params));
      console.log('📦 Result:', this.sanitizeData(result));
      console.groupEnd();
    }
  }

  // Method for logging mock API calls
  logMockCall(serviceName: string, methodName: string, params?: any, result?: any): void {
    if (!this.isEnabled) {return;}

    const timestamp = this.formatTimestamp();

    console.group(`🎭 Mock API Call: ${serviceName}.${methodName}`);
    console.log('📅 Timestamp:', timestamp);
    console.log('📋 Parameters:', this.sanitizeData(params));
    console.log('📦 Mock Result:', this.sanitizeData(result));
    console.groupEnd();
  }

  // Redact sensitive data
  redactSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item));
    }

    const redacted = { ...data };
    const sensitiveFields = ['password', 'token', 'apiKey', 'authorization', 'secret', 'key'];

    for (const field of sensitiveFields) {
      if (redacted[field] !== undefined) {
        redacted[field] = '[REDACTED]';
      }
    }

    // Recursively redact nested objects
    for (const key in redacted) {
      if (redacted[key] && typeof redacted[key] === 'object') {
        redacted[key] = this.redactSensitiveData(redacted[key]);
      }
    }

    return redacted;
  }

  // Enable/disable logging
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }
}

export const apiLogger = new ApiLogger();
export default apiLogger;
