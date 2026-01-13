import { apiService } from './api';
import { Subscription } from '@/types';
import { API_ENDPOINTS } from '@/constants';
import { MockWrapperService } from './mock-wrapper';

export interface UpdateSubscriptionRequest {
  plan: 'premium';
  paymentMethod: 'razorpay' | 'cash' | 'cheque';
  amount: number;
}

class SubscriptionService {
  // Get current subscription
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.getSubscription(userId, {include: ['methods']});
        return response.success && 'data' in response ? response.data : null;
      }

      const response = await apiService.get<Subscription>(`${API_ENDPOINTS.SUBSCRIPTION.UPDATE}?userId=${userId}`);
      return response.success ? (response.data || null) : null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<any[]> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        const response = await mockService.getSubscription('user_001', {include: ['methods']});
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
      console.error('Error getting payment methods:', error);
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
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Initiate Razorpay payment
  async initiateRazorpayPayment(amount: number, subscriptionId: string): Promise<any> {
    try {
      // This would typically integrate with Razorpay service
      const { razorpayService } = await import('./razorpay-service');
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
      });
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      throw error;
    }
  }

  // Process payment
  async processPayment(data: { subscriptionId: string; amount: number; paymentMethod: string }): Promise<any> {
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
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      if (MockWrapperService.isMockMode()) {
        const mockService = MockWrapperService.getMockService();
        await mockService.cancelSubscription(subscriptionId);
        return;
      }

      await apiService.post(`${API_ENDPOINTS.SUBSCRIPTION.UPDATE}/cancel`, { subscriptionId });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
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
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
