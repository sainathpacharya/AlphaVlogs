import { apiService } from './api';
import { Subscription, User } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { MockWrapperService } from './mock-wrapper';
import {
  isSubscriptionActive,
  isSubscribedFromUser,
  parseSubscriptionPayload,
} from '@/utils/subscription';

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

  /** Student subscription from backend (Bearer required). */
  async getStudentSubscription(userId?: string): Promise<Subscription | null> {
    try {
      if (MockWrapperService.isMockMode()) {
        return this.getCurrentSubscription(userId);
      }

      const response = await apiService.get<unknown>(API_ENDPOINTS.STUDENTS.SUBSCRIPTION);
      if (response.success === false) {
        return null;
      }
      return (
        parseSubscriptionPayload(response.data ?? response) ??
        (await this.getCurrentSubscription(userId))
      );
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting student subscription:', error);
      }
      return null;
    }
  }

  // Get current subscription (userId optional in mock mode – defaults to static user)
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

      const uid = userId || '';
      const response = await apiService.get<Subscription>(`${API_ENDPOINTS.SUBSCRIPTION.UPDATE}?userId=${uid}`);
      return response.success ? (response.data || null) : null;
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

  // Initiate Razorpay payment
  async initiateRazorpayPayment(amount: number, subscriptionId: string): Promise<any> {
    try {
      const { razorpayService } = require('./razorpay-service');
      return await razorpayService.initiatePayment({
        description: 'Subscription Payment',
        amount,
        currency: 'INR',
        name: 'Alpha Vlogs Subscription',
        prefill: {
          email: '',
          contact: '',
          name: '',
        },
        theme: {
          color: '#0A84FF',
        },
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error initiating Razorpay payment:', error);
      }
      throw error;
    }
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
