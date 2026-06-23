import { maskEmail, maskMobile } from '../../src/utils/privacy';

describe('privacy utils', () => {
  describe('maskEmail', () => {
    it('returns em dash for empty values', () => {
      expect(maskEmail(null)).toBe('—');
      expect(maskEmail(undefined)).toBe('—');
      expect(maskEmail('   ')).toBe('—');
    });

    it('returns *** for malformed emails', () => {
      expect(maskEmail('@example.com')).toBe('***');
      expect(maskEmail('user@')).toBe('***');
      expect(maskEmail('no-at-sign')).toBe('***');
    });

    it('masks standard emails', () => {
      expect(maskEmail('user@example.com')).toBe('u***@e***.com');
      expect(maskEmail('  user@example.com  ')).toBe('u***@e***.com');
    });

    it('masks single-character local and domain parts', () => {
      expect(maskEmail('a@b.co')).toBe('*@*.co');
    });

    it('masks domains without a TLD dot', () => {
      expect(maskEmail('user@localhost')).toBe('u***@l***');
    });

    it('caps asterisk runs at three characters', () => {
      expect(maskEmail('longlocal@longdomain.org')).toBe('l***@l***.org');
    });
  });

  describe('maskMobile', () => {
    it('returns em dash for empty values', () => {
      expect(maskMobile(null)).toBe('—');
      expect(maskMobile(undefined)).toBe('—');
      expect(maskMobile('')).toBe('—');
    });

    it('returns **** for very short numbers', () => {
      expect(maskMobile('123')).toBe('****');
    });

    it('masks Indian +91 numbers', () => {
      expect(maskMobile('+917013134330')).toBe('+91 70******30');
      expect(maskMobile('919876543210')).toBe('+91 98******10');
    });

    it('masks other international numbers with country code', () => {
      expect(maskMobile('+441234567890')).toBe('+44 12******90');
    });

    it('masks long numbers without explicit country prefix', () => {
      expect(maskMobile('9876543210')).toBe('98******10');
    });

    it('masks shorter numbers with trailing digits only', () => {
      expect(maskMobile('1234567')).toBe('******67');
    });
  });
});
