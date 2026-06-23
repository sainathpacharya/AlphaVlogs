import { Platform } from 'react-native';
import { getApiBaseUrl, API } from '@/constants';
import { ApiResponse } from '@/types';
import { formatHttpStatusError } from '@/utils/api-response';
import { devLog } from '@/utils/dev-log';

/** Bump when public pre-login networking changes — shown in dev error alerts. */
export const PUBLIC_API_CLIENT_VERSION = 'direct-fetch-v5';

/** Headers for public pre-login POSTs (register, OTP). No Authorization / Bearer. */
export function buildPublicApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Platform': Platform.OS,
    'Cache-Control': 'no-cache',
  };
}

export type PublicApiDebugMeta = {
  url: string;
  status: number;
  client: string;
};

export type PublicApiResult<T> = ApiResponse<T> & {
  debug?: PublicApiDebugMeta;
};

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text || null;
}

/** Pre-login POST — raw fetch, no Keychain, no Bearer, no cookies. */
export async function publicApiPost<T>(
  path: string,
  body?: unknown,
): Promise<PublicApiResult<T>> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const headers = buildPublicApiHeaders();

  devLog('publicApiPost →', { url, headers, body, client: PUBLIC_API_CLIENT_VERSION });

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

    const parsed = await parseBody(response);
    const debug: PublicApiDebugMeta = {
      url,
      status: response.status,
      client: PUBLIC_API_CLIENT_VERSION,
    };

    devLog('publicApiPost ←', { ...debug, parsed });

    if (response.ok) {
      if (parsed && typeof parsed === 'object' && 'success' in (parsed as object)) {
        return { ...(parsed as ApiResponse<T>), debug };
      }
      return { success: true, data: parsed as T, statusCode: response.status, debug };
    }

    return {
      success: false,
      error: formatHttpStatusError(response.status, parsed),
      statusCode: response.status,
      debug,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    devLog('publicApiPost ERROR', { url, message });
    return {
      success: false,
      error: message,
      statusCode: error instanceof Error && error.name === 'AbortError' ? 408 : 0,
      debug: { url, status: 0, client: PUBLIC_API_CLIENT_VERSION },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
