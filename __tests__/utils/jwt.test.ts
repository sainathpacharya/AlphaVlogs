import {decodeJwtPayload, formatJwtSummary, isJwtExpired} from '../../src/utils/jwt';

const payload = {role: 'student', studentId: 42, exp: 1_700_000_000};
const encodedPayload = Buffer.from(JSON.stringify(payload))
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(new RegExp('=+$'), '');
const token = `header.${encodedPayload}.signature`;

describe('jwt utils', () => {
  it('decodes a valid JWT payload', () => {
    expect(decodeJwtPayload(token)).toEqual(payload);
  });

  it('returns null for malformed tokens', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
  });

  it('formats a readable JWT summary', () => {
    expect(formatJwtSummary(token)).toBe(
      'role=student, studentId=42, exp=2023-11-14T22:13:20.000Z',
    );
  });

  it('handles missing or invalid tokens in summary', () => {
    expect(formatJwtSummary(undefined)).toBe('no token');
    expect(formatJwtSummary('bad.token')).toBe('invalid token');
  });

  it('returns null when atob is unavailable', () => {
    const originalAtob = globalThis.atob;
    // @ts-expect-error test override
    globalThis.atob = undefined;

    expect(decodeJwtPayload(token)).toBeNull();

    globalThis.atob = originalAtob;
  });

  it('returns null when payload JSON is invalid', () => {
    const badSegment = Buffer.from('not-json').toString('base64');
    expect(decodeJwtPayload(`header.${badSegment}.signature`)).toBeNull();
  });

  it('formats summary when studentId and exp are missing', () => {
    const minimalPayload = {role: 'admin'};
    const segment = Buffer.from(JSON.stringify(minimalPayload))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(new RegExp('=+$'), '');
    const minimalToken = `h.${segment}.s`;

    expect(formatJwtSummary(minimalToken)).toBe('role=admin, studentId=missing, exp=?');
  });

  it('detects expired JWTs using exp claim', () => {
    const expiredPayload = {role: 'student', exp: 1};
    const expiredSegment = Buffer.from(JSON.stringify(expiredPayload))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(new RegExp('=+$'), '');
    const expiredToken = `h.${expiredSegment}.s`;

    expect(isJwtExpired(expiredToken)).toBe(true);
    expect(isJwtExpired(undefined)).toBe(true);
  });

  it('treats valid future JWTs as not expired', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const validPayload = {role: 'student', exp: futureExp};
    const validSegment = Buffer.from(JSON.stringify(validPayload))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(new RegExp('=+$'), '');
    const validToken = `h.${validSegment}.s`;

    expect(isJwtExpired(validToken)).toBe(false);
  });
});
