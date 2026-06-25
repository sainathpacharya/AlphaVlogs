import { paymentService, PaymentApiError } from '../../src/services/payment-service';
import { apiService } from '../../src/services/api';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import { getStoredAuthApiBaseUrl } from '../../src/utils/auth-api-session';
import { paymentApiPost } from '../../src/utils/payment-api-request';

jest.mock('../../src/services/mock-wrapper');
jest.mock('../../src/services/api', () => ({
  apiService: {
    ensureFreshAccessToken: jest.fn(),
  },
}));
jest.mock('../../src/utils/payment-api-request', () => ({
  paymentApiPost: jest.fn(),
}));
jest.mock('../../src/utils/auth-api-session', () => ({
  getStoredAuthApiBaseUrl: jest.fn(),
}));
jest.mock('../../src/utils/dev-log', () => ({ devLog: jest.fn() }));
jest.mock('../../src/constants', () => ({
  getApiBaseUrl: () => 'http://192.168.29.26:8080',
  API_ENDPOINTS: {
    PAYMENT: {
      CREATE_ORDER: '/api/create-order',
      VERIFY_PAYMENT: '/api/verify-payment',
    },
  },
}));

const mockMockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockPaymentApiPost = paymentApiPost as jest.MockedFunction<typeof paymentApiPost>;
const mockGetStoredBaseUrl = getStoredAuthApiBaseUrl as jest.MockedFunction<
  typeof getStoredAuthApiBaseUrl
>;
const mockEnsureFreshAccessToken = apiService.ensureFreshAccessToken as jest.MockedFunction<
  typeof apiService.ensureFreshAccessToken
>;

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockGetStoredBaseUrl.mockResolvedValue('http://192.168.29.26:8080');
    mockEnsureFreshAccessToken.mockResolvedValue({
      accessToken: 'token',
      refreshToken: 'refresh',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createOrder', () => {
    it('returns mock order in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const promise = paymentService.createOrder({ amount: 100 });
      jest.advanceTimersByTime(500);
      const result = await promise;

      expect(result.order_id).toMatch(/^order_mock_/);
      expect(result.amount).toBe(100);
      expect(result.currency).toBe('INR');
      expect(result.key_id).toBe('rzp_test_mock_key');
    });

    it('creates order via API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: true,
        data: {
          order_id: 'order_live',
          amount: 100,
          currency: 'INR',
          key_id: 'rzp_live',
        },
        statusCode: 200,
      });

      const result = await paymentService.createOrder({
        amount: 100,
        receipt: 'student_1',
      });

      expect(mockPaymentApiPost).toHaveBeenCalledWith('/api/create-order', {
        amount: 100,
        currency: 'INR',
        receipt: 'student_1',
      });
      expect(result.order_id).toBe('order_live');
    });

    it('accepts camelCase order fields from API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: true,
        data: {
          orderId: 'order_camel',
          keyId: 'rzp_camel',
          amount: 200,
        } as any,
        statusCode: 200,
      });

      const result = await paymentService.createOrder({ amount: 200 });
      expect(result.order_id).toBe('order_camel');
      expect(result.key_id).toBe('rzp_camel');
    });

    it('throws when session base URL mismatches', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockGetStoredBaseUrl.mockResolvedValue('http://other-host:8080');

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toMatchObject({
        name: 'PaymentApiError',
        statusCode: 401,
      });
    });

    it('throws when no auth token', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockEnsureFreshAccessToken.mockResolvedValue(null);

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(
        /Session expired/,
      );
    });

    it('throws PaymentApiError on 404 with dev message', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: false,
        error: { error: { code: 'NOT_FOUND' }, message: 'not found' },
        statusCode: 404,
        debug: { url: 'http://192.168.29.26:8080/api/create-order', hasAuth: true },
      });

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(
        /local dev server/,
      );
    });

    it('throws production 404 message for non-LAN servers', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: false,
        error: 'not found: api/create-order',
        statusCode: 404,
        debug: { url: 'https://api.example.com/api/create-order', hasAuth: true },
      });

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(
        /not available on production/i,
      );
    });

    it('maps unauthorized payment errors when auth header was sent', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
        debug: { url: 'https://api.example.com/api/create-order', hasAuth: true },
      });

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(
        /session expired/i,
      );
    });

    it('maps unauthorized payment without auth header', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
        debug: { url: 'https://api.example.com/api/create-order', hasAuth: false },
      });

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(
        /No login token was sent/i,
      );
    });

    it('maps forbidden payment errors', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: false,
        error: { error: { code: 'FORBIDDEN' } },
        statusCode: 403,
      });

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(
        /not allowed to make payments/i,
      );
    });

    it('includes dev debug details in __DEV__', async () => {
      const originalDev = (global as { __DEV__?: boolean }).__DEV__;
      (global as { __DEV__?: boolean }).__DEV__ = true;
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: false,
        error: { error: { code: 'FORBIDDEN' }, message: 'denied' },
        statusCode: 403,
        debug: {
          url: 'https://api.example.com/api/create-order',
          hasAuth: true,
          jwtSummary: 'student',
        },
      });

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(/\[dev debug\]/);
      (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    });

    it('throws on invalid order response', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: true,
        data: { amount: 100 },
        statusCode: 200,
      });

      await expect(paymentService.createOrder({ amount: 100 })).rejects.toThrow(
        'Invalid order response from server',
      );
    });
  });

  describe('verifyPayment', () => {
    const validPayment = {
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'sig_1',
    };

    it('throws on incomplete payment data', async () => {
      await expect(
        paymentService.verifyPayment({ razorpay_payment_id: 'pay_1' }),
      ).rejects.toThrow('Incomplete payment data');
    });

    it('returns mock verification in mock mode', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(true);

      const promise = paymentService.verifyPayment(validPayment);
      jest.advanceTimersByTime(500);
      const result = await promise;

      expect(result.verified).toBe(true);
      expect(result.orderId).toBe('order_1');
    });

    it('verifies payment via API', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: true,
        data: { verified: true, orderId: 'order_1', paymentId: 'pay_1' },
        statusCode: 200,
      });

      const result = await paymentService.verifyPayment(validPayment);

      expect(result.verified).toBe(true);
      expect(mockPaymentApiPost).toHaveBeenCalledWith('/api/verify-payment', validPayment);
    });

    it('throws when verification fails', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: true,
        data: { verified: false },
        statusCode: 200,
      });

      await expect(paymentService.verifyPayment(validPayment)).rejects.toThrow(
        'Payment could not be verified',
      );
    });

    it('maps Razorpay auth failure to user message', async () => {
      mockMockWrapper.isMockMode.mockReturnValue(false);
      mockPaymentApiPost.mockResolvedValue({
        success: false,
        error: { error: { code: 'RAZORPAY_AUTH_FAILED' } },
        statusCode: 500,
      });

      await expect(paymentService.verifyPayment(validPayment)).rejects.toThrow(
        /not configured on the server/,
      );
    });
  });

  describe('PaymentApiError', () => {
    it('sets name and statusCode', () => {
      const err = new PaymentApiError('failed', 403);
      expect(err.name).toBe('PaymentApiError');
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('failed');
    });
  });
});
