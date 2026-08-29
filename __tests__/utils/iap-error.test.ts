import { parseIapError } from '../../src/utils/iap-error';

describe('parseIapError', () => {
  it('maps E_USER_CANCELLED', () => {
    const result = parseIapError({ code: 'E_USER_CANCELLED', message: 'cancelled' });
    expect(result.cancelled).toBe(true);
    expect(result.code).toBe('E_USER_CANCELLED');
    expect(result.userMessage).toMatch(/cancelled the purchase/i);
  });

  it('maps canceled spelling and SKError cancel', () => {
    expect(parseIapError('Purchase was canceled').cancelled).toBe(true);
    expect(parseIapError({ message: 'SKErrorPaymentCancelled' }).cancelled).toBe(true);
    expect(parseIapError({ message: 'Error Domain=SKErrorDomain error 2' }).cancelled).toBe(true);
  });

  it('reads code from userInfo', () => {
    const result = parseIapError({
      userInfo: { code: 'E_USER_CANCELLED' },
      message: 'x',
    });
    expect(result.cancelled).toBe(true);
  });

  it('maps E_IAP_NOT_AVAILABLE and storekit messages', () => {
    expect(parseIapError({ code: 'E_IAP_NOT_AVAILABLE' }).userMessage).toMatch(/not available/i);
    expect(parseIapError({ message: 'StoreKit is unavailable' }).code).toBe('E_IAP_NOT_AVAILABLE');
    expect(parseIapError('IAP not available on this device').userMessage).toMatch(/real iPhone/i);
  });

  it('maps E_ITEM_UNAVAILABLE and missing product messages', () => {
    expect(parseIapError({ code: 'E_ITEM_UNAVAILABLE' }).userMessage).toMatch(/not available|does not recognize/i);
    expect(parseIapError({ message: 'SKU could not be found' }).code).toBe('E_ITEM_UNAVAILABLE');
    expect(parseIapError({ message: 'product not available for purchase' }).userMessage).toMatch(
      /Paid Apps Agreement|real iPhone|Simulator/i,
    );
    expect(parseIapError(new Error('Invalid product ID.')).code).toBe('E_ITEM_UNAVAILABLE');
    expect(parseIapError(new Error('Invalid product ID.')).userMessage).toMatch(/Simulator/i);
  });

  it('maps E_UNKNOWN / unknown error wording', () => {
    const unknown = parseIapError({
      code: 'E_UNKNOWN',
      message: 'An unknown error occurred',
    });
    expect(unknown.code).toBe('E_UNKNOWN');
    expect(unknown.userMessage).toMatch(/Sandbox tester/i);

    expect(parseIapError(new Error('An unknown error occurred')).code).toBe('E_UNKNOWN');
    expect(parseIapError({ message: 'unknown error from store' }).cancelled).toBe(false);
  });

  it('falls back for generic Error and non-objects', () => {
    expect(parseIapError(new Error('Boom')).userMessage).toBe('Boom');
    expect(parseIapError(null).message).toBe('Purchase failed');
    expect(parseIapError(42).code).toBe('E_IAP');
    expect(parseIapError({ message: '   ' }).message).toBe('Purchase failed');
    expect(parseIapError({ code: 123, message: 'weird' }).code).toBe('E_IAP');
  });
});
