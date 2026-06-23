import { subscriptionService } from '../../src/services/subscription-service';
import { apiService } from '../../src/services/api';
import { MockWrapperService } from '../../src/services/mock-wrapper';
import { paymentService, PaymentApiError } from '../../src/services/payment-service';

jest.mock('../../src/services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('../../src/services/mock-wrapper', () => ({
  MockWrapperService: {
    isMockMode: jest.fn(),
    getMockService: jest.fn(),
  },
}));

jest.mock('../../src/services/payment-service', () => ({
  paymentService: {
    createOrder: jest.fn(),
    verifyPayment: jest.fn(),
  },
  PaymentApiError: class PaymentApiError extends Error {
    statusCode?: number;
    constructor(message: string, statusCode?: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

const mockApi = apiService as jest.Mocked<typeof apiService>;
const mockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockPayment = paymentService as jest.Mocked<typeof paymentService>;

const subscribedUser = {
  id: 'user_001',
  firstName: 'Test',
  lastName: 'User',
  email: 't@example.com',
  mobile: '9876543210',
  isSubscribed: true,
} as const;

const activeSubscription = {
  id: 'sub_1',
  userId: 'user_001',
  plan: 'premium',
  status: 'active',
  startDate: '2024-01-01',
  endDate: '2025-01-01',
  amount: 100,
  paymentMethod: 'razorpay',
};

describe('subscription-service integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
  });

  it('isStudentSubscribed returns true when user flag is set', async () => {
    await expect(subscriptionService.isStudentSubscribed(subscribedUser as any)).resolves.toBe(
      true,
    );
  });

  it('isStudentSubscribed checks API when user is not flagged', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: { subscribed: true },
      statusCode: 200,
    });

    await expect(
      subscriptionService.isStudentSubscribed({
        ...subscribedUser,
        isSubscribed: false,
      } as any),
    ).resolves.toBe(true);
  });

  it('getStudentSubscription parses API payload', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: activeSubscription,
      statusCode: 200,
    });

    const result = await subscriptionService.getStudentSubscription('user_001');

    expect(result?.status).toBe('active');
  });

  it('getStudentSubscription returns null on API failure', async () => {
    mockApi.get.mockResolvedValue({ success: false, statusCode: 400 });

    await expect(subscriptionService.getStudentSubscription('user_001')).resolves.toBeNull();
  });

  it('getCurrentSubscription uses mock service', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getSubscription: jest.fn().mockResolvedValue({
        success: true,
        data: { subscription: activeSubscription },
      }),
    } as never);

    const result = await subscriptionService.getCurrentSubscription('user_001');

    expect(result?.id).toBe('sub_1');
  });

  it('getPaymentMethods returns defaults in real mode', async () => {
    const methods = await subscriptionService.getPaymentMethods();

    expect(methods.length).toBeGreaterThan(0);
    expect(methods[0]).toHaveProperty('type');
  });

  it('getPaymentMethods reads mock payment methods', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getSubscription: jest.fn().mockResolvedValue({
        success: true,
        data: { paymentMethods: [{ id: 'razorpay' }] },
      }),
    } as never);

    const methods = await subscriptionService.getPaymentMethods();

    expect(methods).toEqual([{ id: 'razorpay' }]);
  });

  it('createSubscription posts to API', async () => {
    mockApi.post.mockResolvedValue({
      success: true,
      data: activeSubscription,
      statusCode: 200,
    });

    const result = await subscriptionService.createSubscription({
      userId: 'user_001',
      plan: 'premium',
      paymentMethod: 'razorpay',
      amount: 100,
    });

    expect(result.id).toBe('sub_1');
  });

  it('createSubscription throws when API fails', async () => {
    mockApi.post.mockResolvedValue({ success: false, error: 'Denied', statusCode: 400 });

    await expect(
      subscriptionService.createSubscription({
        userId: 'user_001',
        plan: 'premium',
        paymentMethod: 'razorpay',
        amount: 100,
      }),
    ).rejects.toThrow('Denied');
  });

  it('completeRazorpayCheckout runs mock payment flow', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockPayment.createOrder.mockResolvedValue({
      order_id: 'order_1',
      amount: 10000,
      currency: 'INR',
      key_id: 'rzp_test',
    });
    mockPayment.verifyPayment.mockResolvedValue({
      verified: true,
      orderId: 'order_1',
      paymentId: 'pay_1',
    });

    const result = await subscriptionService.completeRazorpayCheckout(
      subscribedUser as any,
      10000,
    );

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('order_1');
  });

  it('completeRazorpayCheckout rethrows PaymentApiError', async () => {
    mockPayment.createOrder.mockRejectedValue(new PaymentApiError('Payment down', 503));

    await expect(
      subscriptionService.completeRazorpayCheckout(subscribedUser as any, 10000),
    ).rejects.toBeInstanceOf(PaymentApiError);
  });

  it('initiateRazorpayPayment is deprecated', async () => {
    await expect(
      subscriptionService.initiateRazorpayPayment(100, 'sub_1'),
    ).rejects.toThrow('Use completeRazorpayCheckout instead');
  });

  it('processPayment posts to API in real mode', async () => {
    mockApi.post.mockResolvedValue({ success: true, data: { ok: true }, statusCode: 200 });

    const result = await subscriptionService.processPayment({
      subscriptionId: 'sub_1',
      amount: 100,
      paymentMethod: 'razorpay',
    });

    expect(result).toEqual({ ok: true });
  });

  it('cancelSubscription returns API success flag', async () => {
    mockApi.post.mockResolvedValue({ success: true, statusCode: 200 });

    await expect(subscriptionService.cancelSubscription('sub_1')).resolves.toBe(true);
  });

  it('updateSubscription updates via API', async () => {
    mockApi.post.mockResolvedValue({
      success: true,
      data: activeSubscription,
      statusCode: 200,
    });

    const result = await subscriptionService.updateSubscription({
      plan: 'premium',
      paymentMethod: 'razorpay',
      amount: 100,
    });

    expect(result.id).toBe('sub_1');
  });

  it('updateSubscription uses mock service', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      updateSubscription: jest.fn().mockResolvedValue({
        success: true,
        data: activeSubscription,
      }),
    } as never);

    const result = await subscriptionService.updateSubscription({
      plan: 'premium',
      paymentMethod: 'razorpay',
      amount: 100,
    });

    expect(result.id).toBe('sub_1');
  });
});
