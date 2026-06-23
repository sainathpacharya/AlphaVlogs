const mockGetApiBaseUrl = jest.fn(() => 'https://api.alphavlogs.com');

jest.mock('@/constants', () => ({
  getApiBaseUrl: () => mockGetApiBaseUrl(),
  API: { TIMEOUT: 30000 },
}));

jest.mock('@/utils/dev-log', () => ({
  devLog: jest.fn(),
}));

import {
  PUBLIC_API_CLIENT_VERSION,
  publicApiPost,
} from '../../src/utils/public-api-request';

describe('public-api-request utils', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    mockGetApiBaseUrl.mockReturnValue('https://api.alphavlogs.com');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('exposes the public API client version', () => {
    expect(PUBLIC_API_CLIENT_VERSION).toBe('direct-fetch-v5');
  });

  it('never sends Authorization on student registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, data: { id: 'user_1' } }),
    });

    await publicApiPost('/api/students/register', {
      firstName: 'NagaSainath',
      mobileNumber: '7013134330',
      deviceId: 'android-device-uuid-123',
      deviceType: 'android',
      token: 'fcm-push-token',
    });

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0];
    expect(requestInit.credentials).toBe('omit');
    expect(requestInit.headers).toMatchObject({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    expect(requestInit.headers.Authorization).toBeUndefined();
    expect(requestInit.headers.authorization).toBeUndefined();
    expect(requestInit.body).toContain('"token":"fcm-push-token"');
    expect(requestInit.body).not.toContain('Authorization');
  });

  it('posts JSON and returns ApiResponse-shaped success payloads', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, data: { sent: true } }),
    });

    const result = await publicApiPost<{ sent: boolean }>('/students/send-otp', {
      mobile: '+919999999999',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.alphavlogs.com/students/send-otp',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Client-Platform': 'ios',
        }),
        body: JSON.stringify({ mobile: '+919999999999' }),
        credentials: 'omit',
      }),
    );
    expect(result).toMatchObject({
      success: true,
      data: { sent: true },
      debug: {
        url: 'https://api.alphavlogs.com/students/send-otp',
        status: 200,
        client: PUBLIC_API_CLIENT_VERSION,
      },
    });
  });

  it('wraps non-ApiResponse JSON bodies as success data', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'application/json' },
      json: async () => ({ otpSent: true }),
    });

    const result = await publicApiPost('students/send-otp');
    expect(result).toMatchObject({
      success: true,
      data: { otpSent: true },
      statusCode: 200,
    });
  });

  it('parses text responses and maps API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: { get: () => 'text/plain' },
      text: async () => 'Validation failed',
    });

    const result = await publicApiPost('/students/verify-otp');
    expect(result).toMatchObject({
      success: false,
      error: 'Validation failed',
      statusCode: 422,
    });
  });

  it('maps HTML gateway errors to friendly messages', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      headers: { get: () => 'text/html' },
      text: async () => '<html><head><title>502 Bad Gateway</title></head></html>',
    });

    const result = await publicApiPost('/students/register');
    expect(result).toMatchObject({
      success: false,
      error: 'Server is temporarily unavailable. Please try again later.',
      statusCode: 502,
    });
  });

  it('returns null for empty text bodies', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: () => 'text/plain' },
      text: async () => '',
    });

    const result = await publicApiPost('/health');
    expect(result).toMatchObject({ success: true, data: null });
  });

  it('handles network failures and abort errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    const networkResult = await publicApiPost('/students/send-otp');
    expect(networkResult).toMatchObject({
      success: false,
      error: 'offline',
      statusCode: 0,
      debug: expect.objectContaining({ client: PUBLIC_API_CLIENT_VERSION }),
    });

    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);
    const abortResult = await publicApiPost('/students/send-otp');
    expect(abortResult.statusCode).toBe(408);
  });
});
