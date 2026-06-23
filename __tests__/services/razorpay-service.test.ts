import RazorpayCheckout from 'react-native-razorpay';
import { razorpayService } from '../../src/services/razorpay-service';

jest.mock('react-native-razorpay', () => ({
  open: jest.fn(),
}));

const mockOpen = RazorpayCheckout.open as jest.MockedFunction<typeof RazorpayCheckout.open>;

describe('RazorpayService', () => {
  const checkoutParams = {
    key: 'rzp_test_key',
    order_id: 'order_123',
    amount: 10000,
    currency: 'INR',
    name: 'Alpha Vlogs',
    description: 'Subscription',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openCheckout', () => {
    it('opens checkout with default theme', async () => {
      const response = {
        razorpay_payment_id: 'pay_1',
        razorpay_order_id: 'order_123',
        razorpay_signature: 'sig',
      };
      mockOpen.mockResolvedValue(response);

      const result = await razorpayService.openCheckout(checkoutParams);

      expect(mockOpen).toHaveBeenCalledWith({
        ...checkoutParams,
        theme: { color: '#0A84FF' },
      });
      expect(result).toEqual(response);
    });

    it('preserves custom theme', async () => {
      mockOpen.mockResolvedValue({
        razorpay_payment_id: 'pay_1',
      });

      await razorpayService.openCheckout({
        ...checkoutParams,
        theme: { color: '#FF0000' },
      });

      expect(mockOpen).toHaveBeenCalledWith(
        expect.objectContaining({ theme: { color: '#FF0000' } }),
      );
    });

    it('throws when payment is cancelled', async () => {
      mockOpen.mockRejectedValue({ code: 'payment_cancelled' });

      await expect(razorpayService.openCheckout(checkoutParams)).rejects.toThrow(
        'Payment was cancelled by user',
      );
    });

    it('throws when payment fails', async () => {
      mockOpen.mockRejectedValue({
        code: 'payment_failed',
        description: 'Card declined',
      });

      await expect(razorpayService.openCheckout(checkoutParams)).rejects.toThrow(
        'Payment failed: Card declined',
      );
    });

    it('throws generic error for unknown failures', async () => {
      mockOpen.mockRejectedValue({ code: 'unknown' });

      await expect(razorpayService.openCheckout(checkoutParams)).rejects.toThrow(
        'Payment processing failed. Please try again.',
      );
    });
  });

  describe('validatePaymentData', () => {
    it('returns true when all fields present', () => {
      expect(
        razorpayService.validatePaymentData({
          razorpay_payment_id: 'pay_1',
          razorpay_order_id: 'order_1',
          razorpay_signature: 'sig',
        }),
      ).toBe(true);
    });

    it('returns false when fields are missing', () => {
      expect(
        razorpayService.validatePaymentData({
          razorpay_payment_id: 'pay_1',
        }),
      ).toBe(false);
    });
  });
});
