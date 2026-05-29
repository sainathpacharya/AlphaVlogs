import { AuthTokens } from '@/types';

/** Read user-facing error text from AlphaVlogs-style API bodies. */
export function parseApiErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return typeof payload === 'string' ? payload : undefined;
  }
  const record = payload as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error.trim();
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
