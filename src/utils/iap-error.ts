/** Normalize react-native-iap / StoreKit errors for UI + logging. */

export type ParsedIapError = {
  code: string;
  message: string;
  cancelled: boolean;
  userMessage: string;
};

function readCode(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return '';
  }
  const record = error as Record<string, unknown>;
  const code = record.code ?? (record.userInfo as Record<string, unknown> | undefined)?.code;
  return typeof code === 'string' ? code : '';
}

function readMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message;
    }
  }
  return 'Purchase failed';
}

export function parseIapError(error: unknown): ParsedIapError {
  const code = readCode(error);
  const message = readMessage(error);
  const lower = `${code} ${message}`.toLowerCase();

  const cancelled =
    code === 'E_USER_CANCELLED' ||
    lower.includes('cancelled') ||
    lower.includes('canceled') ||
    lower.includes('skerrorpaymentcancelled') ||
    lower.includes('error 2');

  if (cancelled) {
    return {
      code: code || 'E_USER_CANCELLED',
      message,
      cancelled: true,
      userMessage: 'You cancelled the purchase. You can try again anytime.',
    };
  }

  if (
    code === 'E_ITEM_UNAVAILABLE' ||
    lower.includes('invalid product id') ||
    lower.includes('invalid productid') ||
    lower.includes('product not available') ||
    lower.includes('could not be found')
  ) {
    return {
      code: code || 'E_ITEM_UNAVAILABLE',
      message,
      cancelled: false,
      userMessage:
        'Apple does not recognize this subscription. The iOS Simulator cannot load live App Store products (that is why the price shows “… / year”). Test on a real iPhone with a Sandbox Apple ID, and confirm the product ID exists in App Store Connect.',
    };
  }

  if (
    code === 'E_IAP_NOT_AVAILABLE' ||
    lower.includes('storekit') ||
    lower.includes('iap not available')
  ) {
    return {
      code: code || 'E_IAP_NOT_AVAILABLE',
      message,
      cancelled: false,
      userMessage:
        'App Store purchases are not available here. Use a real iPhone with a Sandbox Apple ID (Settings → App Store → Sandbox Account), not only the Simulator.',
    };
  }

  if (
    code === 'E_UNKNOWN' ||
    lower.includes('unknown error') ||
    lower.includes('an unknown error occurred')
  ) {
    return {
      code: code || 'E_UNKNOWN',
      message,
      cancelled: false,
      userMessage:
        'Apple could not complete the purchase. Sign in with the Sandbox tester (Settings → App Store → Sandbox Account) on a real device, then try again. Canceling the Apple ID sheet also causes this.',
    };
  }

  return {
    code: code || 'E_IAP',
    message,
    cancelled: false,
    userMessage: message || 'Payment processing failed. Please try again.',
  };
}
