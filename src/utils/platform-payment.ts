import {Platform} from 'react-native';

/** App Store builds must use Apple IAP for digital subscriptions on iOS. */
export function shouldUseAppleIAP(): boolean {
  return Platform.OS === 'ios';
}
