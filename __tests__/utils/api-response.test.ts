import {
  normalizeAuthTokens,
  parseApiErrorMessage,
} from '../../src/utils/api-response';

describe('api-response utils', () => {
  describe('parseApiErrorMessage', () => {
    it('returns string payloads directly', () => {
      expect(parseApiErrorMessage('Server unavailable')).toBe('Server unavailable');
    });

    it('returns undefined for nullish and non-string primitives', () => {
      expect(parseApiErrorMessage(null)).toBeUndefined();
      expect(parseApiErrorMessage(undefined)).toBeUndefined();
      expect(parseApiErrorMessage(42)).toBeUndefined();
    });

    it('reads top-level message, error, and data fields', () => {
      expect(parseApiErrorMessage({ message: '  Bad request  ' })).toBe('Bad request');
      expect(parseApiErrorMessage({ error: 'Invalid OTP' })).toBe('Invalid OTP');
      expect(parseApiErrorMessage({ data: 'Expired session' })).toBe('Expired session');
    });

    it('ignores empty string fields', () => {
      expect(parseApiErrorMessage({ message: '   ' })).toBeUndefined();
      expect(parseApiErrorMessage({ error: '' })).toBeUndefined();
    });

    it('reads nested error objects', () => {
      expect(
        parseApiErrorMessage({
          error: { message: 'Nested failure' },
        }),
      ).toBe('Nested failure');
      expect(
        parseApiErrorMessage({
          error: { code: 'AUTH_FAILED' },
        }),
      ).toBe('AUTH_FAILED');
    });
  });

  describe('normalizeAuthTokens', () => {
    it('returns null for invalid input', () => {
      expect(normalizeAuthTokens(null)).toBeNull();
      expect(normalizeAuthTokens('token')).toBeNull();
      expect(normalizeAuthTokens({})).toBeNull();
    });

    it('normalizes camelCase token fields', () => {
      expect(
        normalizeAuthTokens({
          accessToken: 'access',
          refreshToken: 'refresh',
          expiresIn: 3600,
        }),
      ).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });
    });

    it('normalizes snake_case and nested tokens block', () => {
      expect(
        normalizeAuthTokens({
          tokens: {
            access_token: 'access',
            refresh_token: 'refresh',
            expires_in: 1200,
          },
        }),
      ).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 1200,
      });
    });

    it('falls back to token alias and default expiry', () => {
      expect(
        normalizeAuthTokens({
          token: 'only-access',
        }),
      ).toEqual({
        accessToken: 'only-access',
        refreshToken: 'only-access',
        expiresIn: 900,
      });
    });
  });
});
