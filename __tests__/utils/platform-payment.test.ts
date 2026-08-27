import { Platform } from 'react-native';
import { shouldUseAppleIAP } from '../../src/utils/platform-payment';

describe('platform-payment', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    (Platform as { OS: string }).OS = originalOS;
  });

  it('returns true on iOS', () => {
    (Platform as { OS: string }).OS = 'ios';
    expect(shouldUseAppleIAP()).toBe(true);
  });

  it('returns false on Android', () => {
    (Platform as { OS: string }).OS = 'android';
    expect(shouldUseAppleIAP()).toBe(false);
  });
});
