import { apiLogger } from '../../src/utils/api-logger';

jest.mock('@/config/api-config', () => ({
  API_CONFIG: {
    DEV: {
      LOG_API_CALLS: true,
    },
  },
}));

describe('api-logger utils', () => {
  const startTime = new Date('2024-01-01T00:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    console.group = jest.fn();
    console.groupEnd = jest.fn();
    apiLogger.setEnabled(true);
  });

  it('reports whether logging is enabled', () => {
    apiLogger.setEnabled(false);
    expect(apiLogger.isLoggingEnabled()).toBe(false);
    apiLogger.setEnabled(true);
    expect(apiLogger.isLoggingEnabled()).toBe(true);
  });

  it('logs request start details when enabled', () => {
    apiLogger.logRequestStart(
      {
        method: 'POST',
        url: '/students/login',
        fullUrl: 'https://api.alphavlogs.com/students/login',
        headers: { Authorization: 'Bearer secret' },
        params: { debug: true },
        data: { password: 'hidden' },
      },
      startTime,
    );

    expect(console.group).toHaveBeenCalledWith('🚀 API Request: POST /students/login');
    expect(console.log).toHaveBeenCalledWith(
      '📋 Headers:',
      expect.objectContaining({ Authorization: '[REDACTED]' }),
    );
    expect(console.log).toHaveBeenCalledWith(
      '📦 Request Body:',
      expect.objectContaining({ password: '[REDACTED]' }),
    );
    expect(console.groupEnd).toHaveBeenCalled();
  });

  it('skips request logging when disabled', () => {
    apiLogger.setEnabled(false);
    apiLogger.logRequestStart(
      {
        method: 'GET',
        url: '/health',
        fullUrl: 'https://api.alphavlogs.com/health',
      },
      startTime,
    );
    expect(console.group).not.toHaveBeenCalled();
  });

  it('skips success and error logging when disabled', () => {
    apiLogger.setEnabled(false);
    apiLogger.logRequestSuccess(
      { method: 'GET', url: '/x', status: 200, statusText: 'OK', data: {} },
      startTime,
    );
    apiLogger.logRequestError(
      { method: 'GET', url: '/x', message: 'fail' },
      startTime,
    );
    apiLogger.logServiceCall('X', 'y', {}, {});
    apiLogger.logMockCall('X', 'y', {}, {});
    expect(console.group).not.toHaveBeenCalled();
  });

  it('logs successful and error responses', () => {
    apiLogger.logRequestSuccess(
      {
        method: 'GET',
        url: '/dashboard',
        status: 200,
        statusText: 'OK',
        data: { token: 'abc' },
      },
      startTime,
    );
    expect(console.group).toHaveBeenCalledWith('✅ API Response: GET /dashboard');

    apiLogger.logRequestError(
      {
        method: 'GET',
        url: '/dashboard',
        status: 500,
        statusText: 'Server Error',
        message: 'failed',
        data: { otp: '123456' },
      },
      startTime,
    );
    expect(console.group).toHaveBeenCalledWith('❌ API Error: GET /dashboard');
  });

  it('logs service and mock calls', () => {
    apiLogger.logServiceCall('AuthService', 'login', { otp: '1111' }, { ok: true });
    expect(console.group).toHaveBeenCalledWith('✅ Service Call: AuthService.login');

    apiLogger.logServiceCall('AuthService', 'login', { otp: '1111' }, undefined, new Error('boom'));
    expect(console.group).toHaveBeenCalledWith('❌ Service Error: AuthService.login');

    apiLogger.logMockCall('EventsService', 'list', { page: 1 }, [{ id: 1 }]);
    expect(console.group).toHaveBeenCalledWith('🎭 Mock API Call: EventsService.list');
  });

  it('redacts sensitive fields recursively', () => {
    const redacted = apiLogger.redactSensitiveData({
      password: 'secret',
      profile: {
        apiKey: 'key-123',
        name: 'Test',
      },
      items: [{ token: 'nested' }],
    });

    expect(redacted).toEqual({
      password: '[REDACTED]',
      profile: {
        apiKey: '[REDACTED]',
        name: 'Test',
      },
      items: [{ token: '[REDACTED]' }],
    });
  });

  it('returns primitive redact input unchanged', () => {
    expect(apiLogger.redactSensitiveData(null)).toBeNull();
    expect(apiLogger.redactSensitiveData('plain')).toBe('plain');
  });
});
