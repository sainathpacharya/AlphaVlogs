import { API_ENDPOINTS, getApiBaseUrl } from '@/constants';
import { MockWrapperService } from './mock-wrapper';
import { RazorpayResponse } from './razorpay-service';
import { apiService } from './api';
import { parseApiErrorMessage } from '@/utils/api-response';
import { devLog } from '@/utils/dev-log';
import { getStoredAuthApiBaseUrl } from '@/utils/auth-api-session';
import {
  paymentApiPost,
  PaymentApiDebugMeta,
} from '@/utils/payment-api-request';
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
  isSubscribed?: boolean;
}

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
}

function parsePaymentErrorPayload(payload: unknown): {
  message: string;
  code?: string;
} {
  const message =
    (typeof payload === 'string' ? payload : parseApiErrorMessage(payload)) ||
    'Payment request failed';

  if (!payload || typeof payload !== 'object') {
    return { message };
  }

  const record = payload as Record<string, unknown>;
  const nested = record.error;
  if (nested && typeof nested === 'object') {
    const code = (nested as Record<string, unknown>).code;
    if (typeof code === 'string' && code.trim()) {
      return { message, code: code.trim() };
    }
  }

  return { message };
}

function userFacingPaymentError(
  payload: unknown,
  statusCode?: number,
  debug?: PaymentApiDebugMeta,
): string {
  const { message, code } = parsePaymentErrorPayload(payload);
  const isDevServer = (debug?.url ?? getApiBaseUrl()).includes('192.168.');

  if (
    code === 'RAZORPAY_AUTH_FAILED' ||
    message.toLowerCase().includes('razorpay authentication failed')
  ) {
    return 'Payment gateway is not configured on the server yet. Please try again later or contact support.';
  }

  if (
    statusCode === 404 ||
    code === 'NOT_FOUND' ||
    message.toLowerCase().includes('not found: api/create-order')
  ) {
    if (isDevServer) {
      return (
        'Payment was rejected by your local dev server (404). ' +
        'Log out, sign in again, and ensure your student exists in the local database. ' +
        'The backend team can confirm POST /api/create-order is running on your Mac.'
      );
    }
    return 'Payment service is not available on production yet. The backend must deploy POST /api/create-order.';
  }

  if (statusCode === 401 || message.toLowerCase().includes('unauthorized')) {
    if (debug?.hasAuth === false) {
      return 'No login token was sent with the payment request. Log out, sign in again, and retry.';
    }
    return 'Your session expired or is invalid. Please log out, sign in again, and retry payment.';
  }

  if (statusCode === 403 || code === 'FORBIDDEN') {
    return 'Your account is not allowed to make payments. Please use a student account or contact support.';
  }

  return message;
}

function formatPaymentError(
  path: string,
  error: unknown,
  statusCode?: number,
  debug?: PaymentApiDebugMeta,
): string {
  const base = userFacingPaymentError(error, statusCode, debug);

  if (!__DEV__) {
    return base;
  }

  const { code } = parsePaymentErrorPayload(error);
  const codeLine = code ? `\nCode: ${code}` : '';
  const urlLine = debug?.url ?? `${getApiBaseUrl()}${path}`;
  const jwtLine = debug?.jwtSummary ? `\nJWT: ${debug.jwtSummary}` : '';
  const authLine =
    debug?.hasAuth === false ? '\nAuth header: missing' : '\nAuth header: present';

  return `${base}\n\n[dev debug]\nURL: ${urlLine}\nHTTP: ${statusCode ?? '?'}${codeLine}${authLine}${jwtLine}`;
}

async function assertPaymentAuth(): Promise<void> {
  const currentBaseUrl = getApiBaseUrl();
  const storedBaseUrl = await getStoredAuthApiBaseUrl();

  if (storedBaseUrl && storedBaseUrl !== currentBaseUrl) {
    throw new PaymentApiError(
      `Your login session is for ${storedBaseUrl}, but the app is using ${currentBaseUrl}. Log out and sign in again.`,
      401,
    );
  }

  const tokens = await apiService.ensureFreshAccessToken();
  if (!tokens?.accessToken) {
    throw new PaymentApiError(
      'Session expired. Please log out and sign in again before paying.',
      401,
    );
  }
}

class PaymentService {
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
    if (MockWrapperService.isMockMode()) {
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 500);
      });
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

    const response = await paymentApiPost<CreateOrderResult>(path, {
      amount: request.amount,
      currency: request.currency ?? 'INR',
      ...(request.receipt ? { receipt: request.receipt } : {}),
    });

    devLog('PaymentService.createOrder ←', {
      success: response.success,
      statusCode: response.statusCode,
      error: response.error,
      debug: response.debug,
    });

    if (!response.success || !response.data) {
      throw new PaymentApiError(
        formatPaymentError(path, response.error, response.statusCode, response.debug),
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
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 500);
      });
      return {
        verified: true,
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
        isSubscribed: true,
      };
    }

    await assertPaymentAuth();

    const path = API_ENDPOINTS.PAYMENT.VERIFY_PAYMENT;
    devLog('PaymentService.verifyPayment →', { path, baseUrl: getApiBaseUrl() });

    const response = await paymentApiPost<VerifyPaymentResult>(path, {
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_signature: payment.razorpay_signature,
    });

    if (!response.success || !response.data) {
      throw new PaymentApiError(
        formatPaymentError(path, response.error, response.statusCode, response.debug),
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
      isSubscribed: data.isSubscribed === true || data.subscribed === true,
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
