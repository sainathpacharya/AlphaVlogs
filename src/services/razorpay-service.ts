// @ts-ignore
import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';

export interface RazorpayOptions {
  description: string;
  image?: string;
  currency: string;
  key: string;
  amount: number;
  name: string;
  order_id?: string;
  prefill: {
    email: string;
    contact: string;
    name: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

class RazorpayService {
  private readonly keyId = __DEV__
    ? 'rzp_test_your_test_key' // Test key for development
    : 'rzp_live_your_live_key'; // Live key for production

  async initiatePayment(options: Omit<RazorpayOptions, 'key'>): Promise<RazorpayResponse> {
    try {
      const razorpayOptions: RazorpayOptions = {
        ...options,
        key: this.keyId,
        amount: options.amount * 100, // Convert to paise (Razorpay expects amount in paise)
        theme: {
          color: '#0A84FF', // Use app accent color
        },
      };

      const response = await RazorpayCheckout.open(razorpayOptions);
      return response;
    } catch (error: any) {
      console.error('Razorpay payment error:', error);

      if (error.code === 'payment_cancelled') {
        throw new Error('Payment was cancelled by user');
      } else if (error.code === 'payment_failed') {
        throw new Error(`Payment failed: ${error.description || 'Unknown error'}`);
      } else {
        throw new Error('Payment processing failed. Please try again.');
      }
    }
  }

  async createOrder(amount: number, currency: string = 'INR'): Promise<string> {
    try {
      // This would typically call your backend to create a Razorpay order
      // For now, we'll generate a mock order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return orderId;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  validatePaymentData(paymentData: RazorpayResponse): boolean {
    return !!(
      paymentData.razorpay_payment_id &&
      paymentData.razorpay_payment_id.length > 0
    );
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
