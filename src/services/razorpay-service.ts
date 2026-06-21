// @ts-ignore — no bundled types for react-native-razorpay
import RazorpayCheckout from 'react-native-razorpay';

export interface RazorpayCheckoutParams {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

class RazorpayService {
  async openCheckout(params: RazorpayCheckoutParams): Promise<RazorpayResponse> {
    try {
      const response = await RazorpayCheckout.open({
        ...params,
        theme: params.theme ?? { color: '#0A84FF' },
      });
      return response;
    } catch (error: unknown) {
      const err = error as { code?: string; description?: string };
      if (__DEV__) {
        console.error('Razorpay payment error:', error);
      }

      if (err.code === 'payment_cancelled') {
        throw new Error('Payment was cancelled by user');
      }
      if (err.code === 'payment_failed') {
        throw new Error(`Payment failed: ${err.description || 'Unknown error'}`);
      }
      throw new Error('Payment processing failed. Please try again.');
    }
  }

  validatePaymentData(paymentData: RazorpayResponse): boolean {
    return !!(
      paymentData.razorpay_payment_id &&
      paymentData.razorpay_order_id &&
      paymentData.razorpay_signature
    );
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService;
