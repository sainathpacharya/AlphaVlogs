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
    verifyApplePurchase: jest.fn(),
  },
  PaymentApiError: class PaymentApiError extends Error {
    statusCode?: number;
    constructor(message: string, statusCode?: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

jest.mock('../../src/services/razorpay-service', () => ({
  razorpayService: {
    openCheckout: jest.fn(),
  },
}));

jest.mock('../../src/services/iap-service', () => ({
  iapService: {
    purchasePremium: jest.fn(),
    restorePurchases: jest.fn(),
    finishPurchase: jest.fn(),
  },
}));

const mockApi = apiService as jest.Mocked<typeof apiService>;
const mockWrapper = MockWrapperService as jest.Mocked<typeof MockWrapperService>;
const mockPayment = paymentService as jest.Mocked<typeof paymentService>;
const { razorpayService } = jest.requireMock('../../src/services/razorpay-service') as {
  razorpayService: { openCheckout: jest.Mock };
};
const { iapService } = jest.requireMock('../../src/services/iap-service') as {
  iapService: {
    purchasePremium: jest.Mock;
    restorePurchases: jest.Mock;
    finishPurchase: jest.Mock;
  };
};

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

const user = {
  id: 'user_001',
  firstName: 'Test',
  lastName: 'User',
  email: 't@example.com',
  mobile: '9876543210',
  isSubscribed: false,
};

describe('subscription-service branch coverage', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWrapper.isMockMode.mockReturnValue(false);
    (global as { __DEV__?: boolean }).__DEV__ = true;
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  it('getStudentSubscription uses mock path', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getSubscription: jest.fn().mockResolvedValue({
        success: true,
        data: { subscription: activeSubscription },
      }),
    } as never);

    const result = await subscriptionService.getStudentSubscription('user_001');

    expect(result?.id).toBe('sub_1');
  });

  it('getStudentSubscription returns null when payload cannot be parsed', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: { unknown: true }, statusCode: 200 });

    const result = await subscriptionService.getStudentSubscription('user_001');

    expect(result).toBeNull();
  });

  it('getStudentSubscription returns null on thrown error', async () => {
    mockApi.get.mockRejectedValue(new Error('network'));

    await expect(subscriptionService.getStudentSubscription('user_001')).resolves.toBeNull();
  });

  it('getStudentSubscription skips dev logging when __DEV__ is false', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApi.get.mockRejectedValue(new Error('network'));

    await subscriptionService.getStudentSubscription('user_001');

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('getCurrentSubscription uses real API', async () => {
    mockApi.get.mockResolvedValue({
      success: true,
      data: activeSubscription,
      statusCode: 200,
    });

    const result = await subscriptionService.getCurrentSubscription('user_001');

    expect(result?.id).toBe('sub_1');
  });

  it('getCurrentSubscription returns null when API fails', async () => {
    mockApi.get.mockResolvedValue({ success: false, statusCode: 400 });

    await expect(subscriptionService.getCurrentSubscription('user_001')).resolves.toBeNull();
  });

  it('getCurrentSubscription mock returns subscription without wrapper', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getSubscription: jest.fn().mockResolvedValue({
        success: true,
        data: activeSubscription,
      }),
    } as never);

    const result = await subscriptionService.getCurrentSubscription();

    expect(result?.id).toBe('sub_1');
  });

  it('getCurrentSubscription handles errors', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getSubscription: jest.fn().mockRejectedValue(new Error('boom')),
    } as never);

    await expect(subscriptionService.getCurrentSubscription('user_001')).resolves.toBeNull();
  });

  it('getPaymentMethods returns empty on mock without methods', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getSubscription: jest.fn().mockResolvedValue({ success: true, data: {} }),
    } as never);

    await expect(subscriptionService.getPaymentMethods()).resolves.toEqual([]);
  });

  it('getPaymentMethods handles thrown errors', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      getSubscription: jest.fn().mockRejectedValue(new Error('fail')),
    } as never);

    await expect(subscriptionService.getPaymentMethods()).resolves.toEqual([]);
  });

  it('createSubscription uses mock service', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      createSubscription: jest.fn().mockResolvedValue({
        success: true,
        data: activeSubscription,
      }),
    } as never);

    const result = await subscriptionService.createSubscription({
      userId: 'user_001',
      plan: 'premium',
      paymentMethod: 'razorpay',
      amount: 100,
    });

    expect(result.id).toBe('sub_1');
  });

  it('createSubscription rethrows on error', async () => {
    mockApi.post.mockRejectedValue(new Error('create failed'));

    await expect(
      subscriptionService.createSubscription({
        userId: 'user_001',
        plan: 'premium',
        paymentMethod: 'razorpay',
        amount: 100,
      }),
    ).rejects.toThrow('create failed');
  });

  it('completeRazorpayCheckout uses real razorpay service', async () => {
    mockWrapper.isMockMode.mockReturnValue(false);
    mockPayment.createOrder.mockResolvedValue({
      order_id: 'order_1',
      amount: 10000,
      currency: 'INR',
      key_id: 'rzp_test',
    });
    razorpayService.openCheckout.mockResolvedValue({
      razorpay_payment_id: 'pay_real',
      razorpay_order_id: 'order_1',
      razorpay_signature: 'sig',
    });
    mockPayment.verifyPayment.mockResolvedValue({
      verified: true,
      orderId: 'order_1',
      paymentId: 'pay_real',
    });

    const result = await subscriptionService.completeRazorpayCheckout(user as never, 10000);

    expect(razorpayService.openCheckout).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('completeRazorpayCheckout rethrows non-PaymentApiError', async () => {
    mockPayment.createOrder.mockRejectedValue(new Error('checkout failed'));

    await expect(
      subscriptionService.completeRazorpayCheckout(user as never, 10000),
    ).rejects.toThrow('checkout failed');
  });

  it('processPayment uses mock service', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      processPayment: jest.fn().mockResolvedValue({
        success: true,
        data: { ok: true },
      }),
    } as never);

    const result = await subscriptionService.processPayment({
      subscriptionId: 'sub_1',
      amount: 100,
      paymentMethod: 'razorpay',
    });

    expect(result).toEqual({ ok: true });
  });

  it('processPayment returns null when API fails', async () => {
    mockApi.post.mockResolvedValue({ success: false, statusCode: 400 });

    const result = await subscriptionService.processPayment({
      subscriptionId: 'sub_1',
      amount: 100,
      paymentMethod: 'razorpay',
    });

    expect(result).toBeNull();
  });

  it('processPayment rethrows on error', async () => {
    mockApi.post.mockRejectedValue(new Error('process failed'));

    await expect(
      subscriptionService.processPayment({
        subscriptionId: 'sub_1',
        amount: 100,
        paymentMethod: 'razorpay',
      }),
    ).rejects.toThrow('process failed');
  });

  it('cancelSubscription uses mock service', async () => {
    mockWrapper.isMockMode.mockReturnValue(true);
    mockWrapper.getMockService.mockReturnValue({
      cancelSubscription: jest.fn().mockResolvedValue({ success: true }),
    } as never);

    await expect(subscriptionService.cancelSubscription('sub_1')).resolves.toBe(true);
  });

  it('cancelSubscription rethrows on error', async () => {
    mockApi.post.mockRejectedValue(new Error('cancel failed'));

    await expect(subscriptionService.cancelSubscription('sub_1')).rejects.toThrow('cancel failed');
  });

  it('updateSubscription throws when API returns failure', async () => {
    mockApi.post.mockResolvedValue({ success: false, error: 'Denied', statusCode: 400 });

    await expect(
      subscriptionService.updateSubscription({
        plan: 'premium',
        paymentMethod: 'razorpay',
        amount: 100,
      }),
    ).rejects.toThrow('Denied');
  });

  it('updateSubscription rethrows on network error', async () => {
    mockApi.post.mockRejectedValue(new Error('update failed'));

    await expect(
      subscriptionService.updateSubscription({
        plan: 'premium',
        paymentMethod: 'razorpay',
        amount: 100,
      }),
    ).rejects.toThrow('update failed');
  });

  describe('non-dev error logging', () => {
    beforeEach(() => {
      (global as { __DEV__?: boolean }).__DEV__ = false;
    });

    it('suppresses console errors in catch blocks', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApi.get.mockRejectedValue(new Error('network'));
      mockApi.post.mockRejectedValue(new Error('post failed'));

      await subscriptionService.getStudentSubscription('user_001');
      await subscriptionService.getCurrentSubscription('user_001');
      mockWrapper.isMockMode.mockReturnValue(true);
      mockWrapper.getMockService.mockReturnValue({
        getSubscription: jest.fn().mockRejectedValue(new Error('mock fail')),
      } as never);
      await subscriptionService.getPaymentMethods();
      await expect(
        subscriptionService.createSubscription({
          userId: 'user_001',
          plan: 'premium',
          paymentMethod: 'razorpay',
          amount: 100,
        }),
      ).rejects.toThrow();
      mockWrapper.isMockMode.mockReturnValue(false);
      mockPayment.createOrder.mockRejectedValue(new Error('checkout'));
      await expect(
        subscriptionService.completeRazorpayCheckout(user as never, 10000),
      ).rejects.toThrow();
      await expect(
        subscriptionService.processPayment({
          subscriptionId: 'sub_1',
          amount: 100,
          paymentMethod: 'razorpay',
        }),
      ).rejects.toThrow();
      await expect(subscriptionService.cancelSubscription('sub_1')).rejects.toThrow();
      await expect(
        subscriptionService.updateSubscription({
          plan: 'premium',
          paymentMethod: 'razorpay',
          amount: 100,
        }),
      ).rejects.toThrow();

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Apple IAP checkout and restore', () => {
    const applePurchase = {
      productId: 'com.nsnr.alphavlogsindia.annual.premium',
      transactionId: 'tx_1',
      verificationResultIOS: 'jws-token',
      transactionReceipt: 'legacy-receipt',
      transactionDate: 2000,
    };

    it('completeAppleCheckout unlocks only when verified and subscribed', async () => {
      iapService.purchasePremium.mockResolvedValue(applePurchase);
      mockPayment.verifyApplePurchase.mockResolvedValue({
        verified: true,
        orderId: 'tx_1',
        paymentId: 'tx_1',
        isSubscribed: true,
      });

      const result = await subscriptionService.completeAppleCheckout(user as never);

      expect(mockPayment.verifyApplePurchase).toHaveBeenCalledWith({
        productId: applePurchase.productId,
        transactionId: 'tx_1',
        transactionReceipt: 'jws-token',
      });
      expect(iapService.finishPurchase).toHaveBeenCalledWith(applePurchase);
      expect(result.success).toBe(true);
      expect(result.isSubscribed).toBe(true);
    });

    it('completeAppleCheckout does not unlock when isSubscribed is false', async () => {
      iapService.purchasePremium.mockResolvedValue(applePurchase);
      mockPayment.verifyApplePurchase.mockResolvedValue({
        verified: true,
        orderId: 'tx_1',
        paymentId: 'tx_1',
        isSubscribed: false,
      });

      const result = await subscriptionService.completeAppleCheckout(user as never);

      expect(result.success).toBe(false);
      expect(iapService.finishPurchase).not.toHaveBeenCalled();
    });

    it('completeAppleCheckout throws when receipt data is missing', async () => {
      iapService.purchasePremium.mockResolvedValue({
        productId: 'com.nsnr.alphavlogsindia.annual.premium',
        transactionId: '',
      });

      await expect(
        subscriptionService.completeAppleCheckout(user as never),
      ).rejects.toBeInstanceOf(PaymentApiError);
    });

    it('restoreApplePurchases returns failure when no purchases', async () => {
      iapService.restorePurchases.mockResolvedValue([]);

      const result = await subscriptionService.restoreApplePurchases();

      expect(result.success).toBe(false);
      expect(result.isSubscribed).toBe(false);
    });

    it('restoreApplePurchases verifies latest purchase and finishes when unlocked', async () => {
      iapService.restorePurchases.mockResolvedValue([
        { ...applePurchase, transactionId: 'old', transactionDate: 1000 },
        { ...applePurchase, transactionId: 'latest', transactionDate: 3000 },
      ]);
      mockPayment.verifyApplePurchase.mockResolvedValue({
        verified: true,
        orderId: 'latest',
        paymentId: 'latest',
        isSubscribed: true,
      });

      const result = await subscriptionService.restoreApplePurchases();

      expect(mockPayment.verifyApplePurchase).toHaveBeenCalledWith(
        expect.objectContaining({ transactionId: 'latest' }),
      );
      expect(iapService.finishPurchase).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('rethrows PaymentApiError from Apple verify', async () => {
      iapService.purchasePremium.mockResolvedValue(applePurchase);
      mockPayment.verifyApplePurchase.mockRejectedValue(
        new PaymentApiError('denied', 403),
      );

      await expect(
        subscriptionService.completeAppleCheckout(user as never),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
