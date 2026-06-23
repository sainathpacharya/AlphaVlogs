import { AuthTokens } from '@/types';

function isHtmlLike(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
}

/** Read user-facing error text from AlphaVlogs-style API bodies. */
export function parseApiErrorMessage(payload: unknown): string | undefined {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (!trimmed || isHtmlLike(trimmed)) {
      return undefined;
    }
    return trimmed;
  }
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const record = payload as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error.trim();
  }
  if (typeof record.data === 'string' && record.data.trim()) {
    return record.data.trim();
  }
  if (record.error && typeof record.error === 'object') {
    const nested = record.error as Record<string, unknown>;
    if (typeof nested.message === 'string' && nested.message.trim()) {
      return nested.message.trim();
    }
    if (typeof nested.code === 'string' && nested.code.trim()) {
      return nested.code.trim();
    }
  }
  return undefined;
}

/** Map HTTP status (+ optional body) to a short user-facing message. */
export function formatHttpStatusError(status: number, payload?: unknown): string {
  const fromBody = parseApiErrorMessage(payload);
  if (fromBody) {
    return fromBody;
  }

  switch (status) {
    case 400:
      return 'Invalid request. Please check your information and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timed out. Please try again.';
    case 429:
      return 'Too many requests. Please wait and try again.';
    case 502:
      return 'Server is temporarily unavailable. Please try again later.';
    case 503:
      return 'Service is temporarily unavailable. Please try again later.';
    case 504:
      return 'Server took too long to respond. Please try again.';
    default:
      if (status >= 500) {
        return 'Server error. Please try again later.';
      }
      if (status >= 400) {
        return 'Request failed. Please check your information and try again.';
      }
      return 'Request failed';
  }
}

export function normalizeAuthTokens(raw: unknown): AuthTokens | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const block = (record.tokens ?? record) as Record<string, unknown>;
  const accessToken = String(
    block.accessToken ?? block.access_token ?? block.token ?? '',
  ).trim();
  const refreshToken = String(
    block.refreshToken ?? block.refresh_token ?? '',
  ).trim();
  if (!accessToken) {
    return null;
  }
  return {
    accessToken,
    refreshToken: refreshToken || accessToken,
    expiresIn: Number(block.expiresIn ?? block.expires_in ?? 900),
  };
}
