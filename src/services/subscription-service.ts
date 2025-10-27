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
