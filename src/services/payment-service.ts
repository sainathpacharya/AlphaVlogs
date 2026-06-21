import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';
import { API_ENDPOINTS, STORAGE_KEYS, getApiBaseUrl } from '@/constants';
import { MockWrapperService } from './mock-wrapper';
import { RazorpayResponse } from './razorpay-service';
import { parseApiErrorMessage } from '@/utils/api-response';
import { devLog } from '@/utils/dev-log';

export interface CreateOrderResult {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  orderId: string;
  paymentId: string;
}

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
}

function formatPaymentError(path: string, error: unknown, statusCode?: number): string {
  const base =
    (typeof error === 'string' ? error : parseApiErrorMessage(error)) ||
    'Payment request failed';

  if (!__DEV__) {
    return base;
  }

  return `${base}\n\n[dev debug]\nURL: ${getApiBaseUrl()}${path}\nHTTP: ${statusCode ?? '?'}`;
}

async function assertPaymentAuth(): Promise<void> {
  const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
  if (!tokensJson) {
    throw new PaymentApiError(
      'Session expired. Please log out and sign in again before paying.',
      401,
    );
  }
}

class PaymentService {
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
    if (MockWrapperService.isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        order_id: `order_mock_${Date.now()}`,
        amount: request.amount,
        currency: request.currency ?? 'INR',
        key_id: 'rzp_test_mock_key',
      };
    }

    await assertPaymentAuth();

    const path = API_ENDPOINTS.PAYMENT.CREATE_ORDER;
    devLog('PaymentService.createOrder →', {
      path,
      baseUrl: getApiBaseUrl(),
      amount: request.amount,
      receipt: request.receipt,
    });

    const response = await apiService.post<CreateOrderResult>(
      path,
      {
        amount: request.amount,
        currency: request.currency ?? 'INR',
        ...(request.receipt ? { receipt: request.receipt } : {}),
      },
    );

    devLog('PaymentService.createOrder ←', {
      success: response.success,
      statusCode: response.statusCode,
      error: response.error,
    });

    if (!response.success || !response.data) {
      throw new PaymentApiError(
        formatPaymentError(path, response.error, response.statusCode),
        response.statusCode,
      );
    }

    const data = response.data as CreateOrderResult & Record<string, unknown>;
    const orderId = String(data.order_id ?? data.orderId ?? '');
    const keyId = String(data.key_id ?? data.keyId ?? '');

    if (!orderId || !keyId) {
      throw new PaymentApiError('Invalid order response from server');
    }

    return {
      order_id: orderId,
      amount: Number(data.amount ?? request.amount),
      currency: String(data.currency ?? 'INR'),
      key_id: keyId,
    };
  }

  async verifyPayment(payment: RazorpayResponse): Promise<VerifyPaymentResult> {
    if (!payment.razorpay_order_id || !payment.razorpay_payment_id || !payment.razorpay_signature) {
      throw new PaymentApiError('Incomplete payment data from Razorpay');
    }

    if (MockWrapperService.isMockMode()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        verified: true,
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
      };
    }

    await assertPaymentAuth();

    const path = API_ENDPOINTS.PAYMENT.VERIFY_PAYMENT;
    devLog('PaymentService.verifyPayment →', { path, baseUrl: getApiBaseUrl() });

    const response = await apiService.post<VerifyPaymentResult>(
      path,
      {
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      },
    );

    if (!response.success || !response.data) {
      throw new PaymentApiError(
        formatPaymentError(path, response.error, response.statusCode),
        response.statusCode,
      );
    }

    const data = response.data as VerifyPaymentResult & Record<string, unknown>;
    const verified = data.verified === true;

    if (!verified) {
      throw new PaymentApiError('Payment could not be verified');
    }

    return {
      verified: true,
      orderId: String(data.orderId ?? payment.razorpay_order_id),
      paymentId: String(data.paymentId ?? payment.razorpay_payment_id),
    };
  }
}

export class PaymentApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'PaymentApiError';
    this.statusCode = statusCode;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
