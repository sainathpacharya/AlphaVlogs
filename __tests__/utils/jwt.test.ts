import {decodeJwtPayload, formatJwtSummary} from '../../src/utils/jwt';

const payload = {role: 'student', studentId: 42, exp: 1_700_000_000};
const encodedPayload = Buffer.from(JSON.stringify(payload))
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
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
});
