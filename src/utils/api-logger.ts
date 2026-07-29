import { API_CONFIG } from '@/config/api-config';

export interface ApiLogData {
  method: string;
  url: string;
  baseURL?: string;
  fullUrl: string;
  headers?: Record<string, unknown>;
  params?: unknown;
  data?: unknown;
  status?: number;
  statusText?: string;
  responseData?: unknown;
  error?: unknown;
  duration?: number;
  timestamp: string;
}

export type ApiLogRequest = Pick<
  ApiLogData,
  'method' | 'url' | 'baseURL' | 'fullUrl' | 'headers' | 'params' | 'data'
>;

export type ApiLogResponse = Pick<
  ApiLogData,
  'method' | 'url' | 'status' | 'statusText' | 'responseData'
> & {
  data?: unknown;
};

export type ApiLogError = Pick<
  ApiLogData,
  'method' | 'url' | 'status' | 'statusText'
> & {
  message?: string;
  data?: unknown;
};

class ApiLogger {
  /** Runtime override; null means follow API_CONFIG.DEV.LOG_API_CALLS. */
  private enabledOverride: boolean | null = null;

  private get isEnabled(): boolean {
    if (this.enabledOverride !== null) {
      return this.enabledOverride;
    }
    return Boolean(__DEV__ && API_CONFIG.DEV.LOG_API_CALLS);
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatDuration(startTime: Date, endTime: Date): number {
    return endTime.getTime() - startTime.getTime();
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) {
      return data;
    }

    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'key', 'otp'];

    const sanitizeObject = (obj: unknown): unknown => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
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

  private logRequest(config: ApiLogRequest, startTime: Date): void {
    if (!this.isEnabled) {
      return;
    }

    console.group(`🚀 API Request: ${config.method} ${config.url}`);
    console.log('📅 Timestamp:', this.formatTimestamp());
    console.log('🌐 Full URL:', config.fullUrl);
    console.log('📋 Headers:', this.sanitizeData(config.headers));
    if (config.params) {
      console.log('🔍 Query Params:', this.sanitizeData(config.params));
    }
    if (config.data) {
      console.log('📦 Request Body:', this.sanitizeData(config.data));
    }
    console.groupEnd();
    void startTime;
  }

  private logResponse(response: ApiLogResponse, startTime: Date): void {
    if (!this.isEnabled) {
      return;
    }

    const endTime = new Date();
    const duration = this.formatDuration(startTime, endTime);
    const statusEmoji =
      response.status && response.status >= 200 && response.status < 300 ? '✅' : '⚠️';

    console.group(`${statusEmoji} API Response: ${response.method} ${response.url}`);
    console.log('📅 Timestamp:', this.formatTimestamp());
    console.log('⏱️ Duration:', `${duration}ms`);
    console.log('📊 Status:', `${response.status} ${response.statusText ?? ''}`);
    console.log('📦 Response Data:', this.sanitizeData(response.data ?? response.responseData));
    console.groupEnd();
  }

  private logError(error: ApiLogError, startTime: Date): void {
    if (!this.isEnabled) {
      return;
    }

    const endTime = new Date();
    const duration = this.formatDuration(startTime, endTime);

    console.group(`❌ API Error: ${error.method} ${error.url}`);
    console.log('📅 Timestamp:', this.formatTimestamp());
    console.log('⏱️ Duration:', `${duration}ms`);
    console.log('📊 Status:', `${error.status ?? ''} ${error.statusText ?? ''}`);
    console.log('🚨 Error Details:', this.sanitizeData(error));
    console.groupEnd();
    void duration;
  }

  logRequestStart(config: ApiLogRequest, startTime: Date): void {
    this.logRequest(config, startTime);
  }

  logRequestSuccess(response: ApiLogResponse, startTime: Date): void {
    this.logResponse(response, startTime);
  }

  logRequestError(error: ApiLogError, startTime: Date): void {
    this.logError(error, startTime);
  }

  logServiceCall(
    serviceName: string,
    methodName: string,
    params?: unknown,
    result?: unknown,
    error?: unknown,
  ): void {
    if (!this.isEnabled) {
      return;
    }

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

  logMockCall(serviceName: string, methodName: string, params?: unknown, result?: unknown): void {
    if (!this.isEnabled) {
      return;
    }

    const timestamp = this.formatTimestamp();

    console.group(`🎭 Mock API Call: ${serviceName}.${methodName}`);
    console.log('📅 Timestamp:', timestamp);
    console.log('📋 Parameters:', this.sanitizeData(params));
    console.log('📦 Mock Result:', this.sanitizeData(result));
    console.groupEnd();
  }

  redactSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item));
    }

    const redacted = { ...(data as Record<string, unknown>) };
    const sensitiveFields = ['password', 'token', 'apiKey', 'authorization', 'secret', 'key'];

    for (const field of sensitiveFields) {
      if (redacted[field] !== undefined) {
        redacted[field] = '[REDACTED]';
      }
    }

    for (const key in redacted) {
      if (redacted[key] && typeof redacted[key] === 'object') {
        redacted[key] = this.redactSensitiveData(redacted[key]);
      }
    }

    return redacted;
  }

  setEnabled(enabled: boolean): void {
    this.enabledOverride = enabled;
  }

  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }
}

export const apiLogger = new ApiLogger();
export default apiLogger;
