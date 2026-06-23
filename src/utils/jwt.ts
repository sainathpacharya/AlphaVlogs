/** Decode JWT payload (no signature verification — dev diagnostics only). */
export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }

    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = (() => {
      const atobFn = (globalThis as {atob?: (input: string) => string}).atob;
      if (typeof atobFn === 'function') {
        return atobFn(padded);
      }
      return null;
    })();

    if (!json) {
      return null;
    }

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function formatJwtSummary(token: string | undefined | null): string {
  if (!token) {
    return 'no token';
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return 'invalid token';
  }

  const role = String(payload.role ?? '?');
  const studentId =
    payload.studentId !== undefined && payload.studentId !== null
      ? String(payload.studentId)
      : 'missing';
  const exp =
    typeof payload.exp === 'number'
      ? new Date(payload.exp * 1000).toISOString()
      : '?';

  return `role=${role}, studentId=${studentId}, exp=${exp}`;
}
