import { apiService } from './api';
import { Subscription, User } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { MockWrapperService } from './mock-wrapper';
import {
  isSubscriptionActive,
  isSubscribedFromUser,
  parseSubscriptionPayload,
} from '@/utils/subscription';
import { buildPaymentReceipt } from '@/utils/payment';
import { paymentService, PaymentApiError } from './payment-service';
import { parseIapError } from '@/utils/iap-error';

export interface RazorpayCheckoutResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  isSubscribed?: boolean;
}

export interface AppleCheckoutResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  isSubscribed?: boolean;
}

export interface UpdateSubscriptionRequest {
  plan: 'premium';
  paymentMethod: 'razorpay' | 'cash' | 'cheque';
  amount: number;
}

class SubscriptionService {
  /** Whether the logged-in student has an active subscription (profile + API). */
  async isStudentSubscribed(user?: User | null): Promise<boolean> {
    if (isSubscribedFromUser(user ?? null)) {
      return true;
    }

    const userId = user?.id;
    const subscription = await this.getStudentSubscription(userId);
    return isSubscriptionActive(subscription);
  }

  /** Student subscription from GET /api/students/subscription (Bearer required). */
  async getStudentSubscription(userId?: string): Promise<Subscription | null> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getCurrentSubscription(userId);
      }

      const response = await apiService.get<unknown>(API_ENDPOINTS.STUDENTS.SUBSCRIPTION);
      if (response.success === false) {
        return null;
      }
      return parseSubscriptionPayload(response.data ?? response);
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting student subscription:', error);
      }
      return null;
    }
  }

  /** Mock helper — real API uses getStudentSubscription (never legacy /subscription/update). */
  async getCurrentSubscription(userId?: string): Promise<Subscription | null> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const uid = userId || 'user_001';
        const response = await mockService.getSubscription(uid, ['methods']);
        const data = response.success && 'data' in response ? response.data : null;
        return (data && typeof data === 'object' && 'subscription' in data)
          ? (data as { subscription: Subscription }).subscription
          : (data as Subscription | null);
      }

      return this.getStudentSubscription(userId);
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting subscription:', error);
      }
      return null;
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<any[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.getSubscription('user_001', ['methods']);
        return response.success && 'data' in response && response.data?.paymentMethods 
          ? response.data.paymentMethods 
          : [];
      }

      // In real implementation, this would call an API endpoint
      return [
        { id: 'razorpay', type: 'razorpay', name: 'Razorpay', isEnabled: true },
        { id: 'cash', type: 'cash', name: 'Cash', isEnabled: true },
        { id: 'cheque', type: 'cheque', name: 'Cheque', isEnabled: true },
      ];
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting payment methods:', error);
      }
      return [];
    }
  }

  // Create subscription
  async createSubscription(data: UpdateSubscriptionRequest & { userId: string }): Promise<Subscription> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.createSubscription(data);
        return response.success && 'data' in response ? response.data : null as any;
      }

      const response = await apiService.post<Subscription>(API_ENDPOINTS.SUBSCRIPTION.UPDATE, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create subscription');
      }
      return response.data!;
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating subscription:', error);
      }
      throw error;
    }
  }

  /** Full Razorpay checkout: create-order → native checkout → verify-payment. */
  async completeRazorpayCheckout(
    user: User,
    amountPaise: number,
  ): Promise<RazorpayCheckoutResult> {
    const receipt = buildPaymentReceipt(user.id);

    try {
      const order = await paymentService.createOrder({
        amount: amountPaise,
        currency: 'INR',
        receipt,
      });

      let checkoutResponse;

      if (MockWrapperService.isMockMode()) {
        checkoutResponse = {
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_order_id: order.order_id,
          razorpay_signature: 'mock_signature',
        };
      } else {
        const { razorpayService } = require('./razorpay-service');
        checkoutResponse = await razorpayService.openCheckout({
          key: order.key_id,
          order_id: order.order_id,
          amount: order.amount,
          currency: order.currency,
          name: 'Jack Marvels',
          description: 'Annual Premium Subscription',
          prefill: {
            email: user.email || undefined,
            contact: user.mobile?.replace(/\D/g, '').slice(-10) || undefined,
            name: `${user.firstName} ${user.lastName || ''}`.trim() || undefined,
          },
        });
      }

      const verified = await paymentService.verifyPayment(checkoutResponse);

      return {
        success: verified.verified,
        orderId: verified.orderId,
        paymentId: verified.paymentId,
        isSubscribed: verified.isSubscribed,
      };
    } catch (error) {
      if (error instanceof PaymentApiError) {
        throw error;
      }
      if (__DEV__) {
        console.error('Error completing Razorpay checkout:', error);
      }
      throw error;
    }
  }

  /** Full Apple IAP checkout: StoreKit purchase → server receipt validation. */
  async completeAppleCheckout(_user: User): Promise<AppleCheckoutResult> {
    try {
      const {iapService} = require('./iap-service');
      const purchase = await iapService.purchasePremium();
      const transactionId = String(purchase.transactionId ?? '').trim();
      // Prefer StoreKit 2 JWS; fall back to classic receipt.
      const transactionReceipt = String(
        purchase.verificationResultIOS ??
          purchase.transactionReceipt ??
          '',
      ).trim();

      if (!transactionId || !transactionReceipt) {
        throw new PaymentApiError(
          'Incomplete purchase data from App Store (need product_id, transaction_id, transaction_receipt)',
          400,
        );
      }

      const verified = await paymentService.verifyApplePurchase({
        productId: purchase.productId,
        transactionId,
        transactionReceipt,
      });

      const unlocked =
        verified.verified === true && verified.isSubscribed === true;

      if (unlocked) {
        await iapService.finishPurchase(purchase);
      }

      return {
        success: unlocked,
        orderId: verified.orderId,
        paymentId: verified.paymentId,
        isSubscribed: verified.isSubscribed,
      };
    } catch (error) {
      if (error instanceof PaymentApiError) {
        throw error;
      }
      if (__DEV__) {
        const parsed = parseIapError(error);
        if (
          parsed.code === 'E_ITEM_UNAVAILABLE' ||
          parsed.code === 'E_IAP_NOT_AVAILABLE'
        ) {
          console.warn('Apple checkout unavailable:', parsed.message);
        } else {
          console.error('Error completing Apple checkout:', error);
        }
      }
      throw error;
    }
  }

  /** Restore App Store subscription and validate with the same verify-apple-purchase endpoint. */
  async restoreApplePurchases(): Promise<AppleCheckoutResult> {
    try {
      const {iapService} = require('./iap-service');
      const purchases = await iapService.restorePurchases();

      if (purchases.length === 0) {
        return {
          success: false,
          orderId: '',
          paymentId: '',
          isSubscribed: false,
        };
      }

      const latestPurchase = purchases.sort(
        (a: {transactionDate?: number}, b: {transactionDate?: number}) =>
          (b.transactionDate ?? 0) - (a.transactionDate ?? 0),
      )[0];

      const transactionId = String(latestPurchase.transactionId ?? '').trim();
      const transactionReceipt = String(
        latestPurchase.verificationResultIOS ??
          latestPurchase.transactionReceipt ??
          '',
      ).trim();

      if (!transactionId || !transactionReceipt) {
        throw new PaymentApiError(
          'Incomplete purchase data from App Store (need product_id, transaction_id, transaction_receipt)',
          400,
        );
      }

      const verified = await paymentService.verifyApplePurchase({
        productId: latestPurchase.productId,
        transactionId,
        transactionReceipt,
      });

      const unlocked =
        verified.verified === true && verified.isSubscribed === true;

      if (unlocked) {
        await iapService.finishPurchase(latestPurchase);
      }

      return {
        success: unlocked,
        orderId: verified.orderId,
        paymentId: verified.paymentId,
        isSubscribed: verified.isSubscribed,
      };
    } catch (error) {
      if (error instanceof PaymentApiError) {
        throw error;
      }
      if (__DEV__) {
        console.error('Error restoring Apple purchases:', error);
      }
      throw error;
    }
  }

  // Legacy alias — prefer completeRazorpayCheckout
  async initiateRazorpayPayment(_amount: number, _subscriptionId: string): Promise<any> {
    throw new Error('Use completeRazorpayCheckout instead');
  }

  // Process payment (paymentData optional for Razorpay verification)
  async processPayment(data: {
    subscriptionId: string;
    amount: number;
    paymentMethod: string;
    paymentData?: unknown;
  }): Promise<any> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.processPayment(data);
        return response.success && 'data' in response ? response.data : null;
      }

      // In real implementation, this would call a payment processing API
      const response = await apiService.post(`${API_ENDPOINTS.SUBSCRIPTION.UPDATE}/process-payment`, data);
      return response.success ? response.data : null;
    } catch (error) {
      if (__DEV__) {
        console.error('Error processing payment:', error);
      }
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.cancelSubscription(subscriptionId);
        return response?.success === true;
      }

      const response = await apiService.post<{ success?: boolean }>(
        `${API_ENDPOINTS.SUBSCRIPTION.UPDATE}/cancel`,
        { subscriptionId },
      );
      return response?.success === true;
    } catch (error) {
      if (__DEV__) {
        console.error('Error cancelling subscription:', error);
      }
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(data: UpdateSubscriptionRequest): Promise<Subscription> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.updateSubscription(data);
        return response.data;
      }

      const response = await apiService.post<Subscription>(API_ENDPOINTS.SUBSCRIPTION.UPDATE, data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update subscription');
      }
      return response.data!;
    } catch (error) {
      if (__DEV__) {
        console.error('Error updating subscription:', error);
      }
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
