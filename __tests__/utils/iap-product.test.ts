import {
  extractIapReceipt,
  getLocalizedSubscriptionPrice,
  getSubscriptionDisplayInfo,
  getSubscriptionLengthLabel,
  getSubscriptionPricePerUnit,
  isPremiumStoreProduct,
  PREMIUM_SUBSCRIPTION_DISPLAY,
  readStoreProductId,
} from '../../src/utils/iap-product';

describe('iap-product display helpers', () => {
  it('falls back to Annual Premium at ₹100 / 1 year', () => {
    const info = getSubscriptionDisplayInfo(null);

    expect(info.title).toBe(PREMIUM_SUBSCRIPTION_DISPLAY.title);
    expect(info.localizedPrice).toBe('₹100');
    expect(info.lengthLabel).toBe('1 year');
    expect(info.priceLine).toBe('₹100 / 1 year');
    expect(info.pricePerUnit).toBe('₹8.33/month');
  });

  it('prefers StoreKit localizedPrice and yearly unit', () => {
    const product = {
      title: 'Annual Premium',
      localizedPrice: '₹199',
      price: '199',
      currency: 'INR',
      subscriptionPeriodNumberIOS: '1',
      subscriptionPeriodUnitIOS: 'YEAR',
    };

    expect(getLocalizedSubscriptionPrice(product)).toBe('₹199');
    expect(getSubscriptionLengthLabel(product)).toBe('1 year');
    expect(getSubscriptionPricePerUnit(product)).toBe('₹16.58/month');
    expect(getSubscriptionDisplayInfo(product).priceLine).toBe('₹199 / 1 year');
  });

  it('uses displayPrice when localizedPrice is missing', () => {
    expect(
      getLocalizedSubscriptionPrice({
        displayPrice: '$1.99',
        price: 1.99,
        currency: 'USD',
      }),
    ).toBe('$1.99');
  });

  it('formats month-based length and price per unit', () => {
    expect(
      getSubscriptionLengthLabel({
        subscriptionPeriodNumberIOS: '3',
        subscriptionPeriodUnitIOS: 'MONTH',
      }),
    ).toBe('3 months');

    expect(
      getSubscriptionPricePerUnit({
        localizedPrice: '₹300',
        price: '300',
        subscriptionPeriodNumberIOS: '3',
        subscriptionPeriodUnitIOS: 'MONTH',
      }),
    ).toBe('₹100/month');
  });

  it('uses a numeric price when localized strings are missing', () => {
    expect(
      getLocalizedSubscriptionPrice({
        price: 149,
        currency: 'INR',
      }),
    ).toBe('₹149');
  });

  it('parses localized digits when price is not numeric', () => {
    expect(
      getSubscriptionPricePerUnit({
        price: 'n/a',
        localizedPrice: '₹12.50',
        subscriptionPeriodNumberIOS: '1',
        subscriptionPeriodUnitIOS: 'YEAR',
      }),
    ).toBe('₹1.04/month');
  });

  it('falls back to annual rupees when localized digits are invalid', () => {
    expect(
      getSubscriptionPricePerUnit({
        price: 'n/a',
        localizedPrice: '',
        displayPrice: '',
        subscriptionPeriodNumberIOS: '1',
        subscriptionPeriodUnitIOS: 'YEAR',
      }),
    ).toBe('₹8.33/month');
  });

  it('uses ISO currency when localized price has no symbol', () => {
    expect(
      getSubscriptionPricePerUnit({
        price: 24,
        currency: 'USD',
        subscriptionPeriodNumberIOS: '1',
        subscriptionPeriodUnitIOS: 'YEAR',
      }),
    ).toBe('USD 2/month');
  });

  it('formats weekly length as price per period', () => {
    expect(
      getSubscriptionPricePerUnit({
        localizedPrice: '₹20',
        price: 20,
        subscriptionPeriodNumberIOS: '1',
        subscriptionPeriodUnitIOS: 'WEEK',
      }),
    ).toBe('₹20 per 1 week');
  });
});

describe('iap-product store identity and receipts', () => {
  it('matches premium products by productId, productID, or id', () => {
    expect(
      isPremiumStoreProduct({
        productId: 'com.nsnr.alphavlogsindia.annual.premium',
      }),
    ).toBe(true);
    expect(
      isPremiumStoreProduct({
        productID: 'com.nsnr.alphavlogsindia.annual.premium',
      }),
    ).toBe(true);
    expect(
      isPremiumStoreProduct({
        id: 'com.nsnr.alphavlogsindia.annual.premium',
      }),
    ).toBe(true);
    expect(isPremiumStoreProduct({productId: 'other'})).toBe(false);
    expect(readStoreProductId(null)).toBe('');
  });

  it('prefers StoreKit 2 JWS over an empty classic receipt', () => {
    expect(
      extractIapReceipt({
        transactionReceipt: '',
        verificationResultIOS: 'jws-token',
      }),
    ).toBe('jws-token');
    expect(
      extractIapReceipt({
        verificationResult: 'native-jws',
        jsonRepresentation: '{"id":1}',
      }),
    ).toBe('native-jws');
    expect(extractIapReceipt({transactionReceipt: 'classic'})).toBe('classic');
    expect(extractIapReceipt({})).toBe('');
  });
});
