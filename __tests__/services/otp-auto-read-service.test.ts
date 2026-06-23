import { Platform } from 'react-native';
import otpAutoReadService from '../../src/services/otp-auto-read-service';

jest.mock('react-native-sms-retriever');

const SmsRetriever = require('react-native-sms-retriever');

describe('OTPAutoReadService', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    SmsRetriever.isSupported.mockResolvedValue(true);
    SmsRetriever.getSmsHash.mockResolvedValue('<#ABC123>');
    otpAutoReadService.stopListening();
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    otpAutoReadService.stopListening();
  });

  describe('requestSMSPermission', () => {
    it('returns true on iOS without checking support', async () => {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

      await expect(otpAutoReadService.requestSMSPermission()).resolves.toBe(true);
      expect(SmsRetriever.isSupported).not.toHaveBeenCalled();
    });

    it('checks support on Android', async () => {
      await expect(otpAutoReadService.requestSMSPermission()).resolves.toBe(true);
      expect(SmsRetriever.isSupported).toHaveBeenCalled();
    });
  });

  describe('startListening', () => {
    it('returns error when auto-read disabled', async () => {
      const result = await otpAutoReadService.startListening({ enableAutoRead: false });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/disabled/i);
    });

    it('returns error when already listening', async () => {
      await otpAutoReadService.startListening({ enableAutoRead: true });

      const result = await otpAutoReadService.startListening({ enableAutoRead: true });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Already listening/);
    });

    it('starts listener on supported Android device', async () => {
      const result = await otpAutoReadService.startListening({ enableAutoRead: true, timeout: 1000 });

      expect(result.success).toBe(true);
      expect(SmsRetriever.addSmsListener).toHaveBeenCalled();
    });

    it('returns unsupported error when device lacks SMS retriever', async () => {
      SmsRetriever.isSupported.mockResolvedValue(false);

      const result = await otpAutoReadService.startListening({ enableAutoRead: true });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not supported/i);
    });

    it('stops listening after timeout', async () => {
      await otpAutoReadService.startListening({ enableAutoRead: true, timeout: 500 });
      jest.advanceTimersByTime(500);
      expect(SmsRetriever.removeSmsListener).toHaveBeenCalled();
    });

    it('extracts OTP from SMS listener callback', async () => {
      SmsRetriever.addSmsListener.mockImplementation((cb: (msg: string) => void) => {
        cb('Jack Marvels: Your OTP is 112233. Valid for 3 minutes.');
      });

      await otpAutoReadService.startListening({ enableAutoRead: true });

      expect(SmsRetriever.removeSmsListener).toHaveBeenCalled();
    });
  });

  describe('getSMSHash', () => {
    it('returns hash on Android', async () => {
      await expect(otpAutoReadService.getSMSHash()).resolves.toBe('<#ABC123>');
    });

    it('returns empty string on iOS', async () => {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

      await expect(otpAutoReadService.getSMSHash()).resolves.toBe('');
    });

    it('returns empty string on error', async () => {
      SmsRetriever.getSmsHash.mockRejectedValue(new Error('hash fail'));

      await expect(otpAutoReadService.getSMSHash()).resolves.toBe('');
    });
  });

  describe('generateSMSWithHash', () => {
    it('includes hash on Android', async () => {
      const message = await otpAutoReadService.generateSMSWithHash('123456');

      expect(message).toContain('123456');
      expect(message).toContain('<#ABC123>');
    });

    it('omits hash on iOS', async () => {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

      const message = await otpAutoReadService.generateSMSWithHash('123456');

      expect(message).toContain('123456');
      expect(message).not.toContain('<#');
    });
  });

  describe('extractOTPFromMessage', () => {
    it('extracts OTP from default pattern', () => {
      expect(
        otpAutoReadService.extractOTPFromMessage(
          'Jack Marvels: Your OTP is 482910. Valid for 3 minutes.',
        ),
      ).toBe('482910');
    });

    it('returns null when no match', () => {
      expect(otpAutoReadService.extractOTPFromMessage('no otp here')).toBeNull();
    });
  });

  describe('platform helpers', () => {
    it('returns platform-specific instructions', () => {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
      expect(otpAutoReadService.getPlatformInstructions()).toMatch(/automatically detected/);
      expect(otpAutoReadService.isAutoReadAvailable()).toBe(true);

      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
      expect(otpAutoReadService.getPlatformInstructions()).toMatch(/manually enter/);
      expect(otpAutoReadService.isAutoReadAvailable()).toBe(false);
    });
  });

  describe('isSupported', () => {
    it('returns false on iOS', async () => {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });

      await expect(otpAutoReadService.isSupported()).resolves.toBe(false);
    });

    it('returns false when retriever throws', async () => {
      SmsRetriever.isSupported.mockRejectedValue(new Error('boom'));

      await expect(otpAutoReadService.isSupported()).resolves.toBe(false);
    });
  });
});
