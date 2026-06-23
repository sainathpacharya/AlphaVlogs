import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApiBaseUrl, API, STORAGE_KEYS} from '@/constants';
import {ApiResponse, AuthTokens} from '@/types';
import {formatHttpStatusError, normalizeAuthTokens} from '@/utils/api-response';
import {AUTH_KEYCHAIN_SERVER} from '@/utils/auth-storage';
import {devLog} from '@/utils/dev-log';
import {formatJwtSummary} from '@/utils/jwt';
import * as Keychain from 'react-native-keychain';

export type PaymentApiDebugMeta = {
  url: string;
  status: number;
  hasAuth: boolean;
  jwtSummary?: string;
};

export type PaymentApiResult<T> = ApiResponse<T> & {
  debug?: PaymentApiDebugMeta;
};

export async function getStoredAuthTokensForPayment(): Promise<AuthTokens | null> {
  try {
    const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    if (tokensJson) {
      return normalizeAuthTokens(JSON.parse(tokensJson));
    }

    const credentials = await Keychain.getInternetCredentials(AUTH_KEYCHAIN_SERVER);
    if (credentials !== false && credentials.password) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, credentials.password);
      return normalizeAuthTokens(JSON.parse(credentials.password));
    }
  } catch (error) {
    if (__DEV__) {
      devLog('getStoredAuthTokensForPayment failed', error);
    }
  }

  return null;
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
