import {Platform} from 'react-native';
import {getApiBaseUrl, API} from '@/constants';
import {ApiResponse} from '@/types';
import {formatHttpStatusError} from '@/utils/api-response';
import {resolveAuthTokens} from '@/utils/auth-storage';
import {devLog} from '@/utils/dev-log';
import {formatJwtSummary} from '@/utils/jwt';

export type PaymentApiDebugMeta = {
  url: string;
  status: number;
  hasAuth: boolean;
  jwtSummary?: string;
};

export type PaymentApiResult<T> = ApiResponse<T> & {
  debug?: PaymentApiDebugMeta;
};

export async function getStoredAuthTokensForPayment() {
  return resolveAuthTokens();
}

/** Authenticated POST for payment — direct fetch, no token-refresh side effects. */
export async function paymentApiPost<T>(
  path: string,
  body?: unknown,
): Promise<PaymentApiResult<T>> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const tokens = await getStoredAuthTokensForPayment();
  const accessToken = tokens?.accessToken?.trim();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Platform': Platform.OS,
    'Cache-Control': 'no-cache',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const debug: PaymentApiDebugMeta = {
    url,
    status: 0,
    hasAuth: Boolean(accessToken),
    jwtSummary: formatJwtSummary(accessToken),
  };

  devLog('paymentApiPost →', {body, ...debug});

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
      credentials: 'omit',
      signal: controller.signal,
    });

    debug.status = response.status;

    const contentType = response.headers.get('content-type') ?? '';
    const parsed =
      contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    devLog('paymentApiPost ←', {parsed, ...debug});

    if (response.ok) {
      if (parsed && typeof parsed === 'object' && 'success' in (parsed as object)) {
        return {...(parsed as ApiResponse<T>), statusCode: response.status, debug};
      }
      return {success: true, data: parsed as T, statusCode: response.status, debug};
    }

    return {
      success: false,
      error: formatHttpStatusError(response.status, parsed),
      statusCode: response.status,
      debug,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    devLog('paymentApiPost ERROR', {message, ...debug});
    return {
      success: false,
      error: message,
      statusCode: error instanceof Error && error.name === 'AbortError' ? 408 : 0,
      debug,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
