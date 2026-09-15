import {SUBSCRIPTION} from '@/constants';

/** Fields we read from react-native-iap StoreKit products. */
export type StoreSubscriptionFields = {
  title?: string;
  localizedPrice?: string;
  displayPrice?: string;
  price?: string | number;
  currency?: string;
  subscriptionPeriodNumberIOS?: string;
  subscriptionPeriodUnitIOS?: string;
};

export const PREMIUM_SUBSCRIPTION_DISPLAY = {
  title: 'Annual Premium',
  length: '1 year',
  fallbackPrice: `₹${SUBSCRIPTION.PRICING.PREMIUM_ANNUAL}`,
} as const;

const PERIOD_LABELS: Record<string, string> = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

function parseNumericPrice(product: StoreSubscriptionFields | null): number | null {
  if (!product) {
    return SUBSCRIPTION.PRICING.PREMIUM_ANNUAL;
  }

  if (typeof product.price === 'number' && Number.isFinite(product.price)) {
    return product.price;
  }

  if (typeof product.price === 'string' && product.price.trim()) {
    const parsed = Number.parseFloat(product.price.replace(/,/g, ''));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const localized = product.localizedPrice || product.displayPrice || '';
  const digits = localized.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(digits);
  return Number.isFinite(parsed) ? parsed : SUBSCRIPTION.PRICING.PREMIUM_ANNUAL;
}

function currencySymbol(product: StoreSubscriptionFields | null): string {
  const localized = product?.localizedPrice || product?.displayPrice || '';
  const symbol = localized.replace(/[\d.,\s]/g, '').trim();
  if (symbol) {
    return symbol;
  }
  if (product?.currency && product.currency !== 'INR') {
    return `${product.currency} `;
  }
  return '₹';
}

function formatAmount(amount: number, symbol: string): string {
  const rounded = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${symbol}${rounded}`;
}

export function getLocalizedSubscriptionPrice(
  product: StoreSubscriptionFields | null,
): string {
  const localized = product?.localizedPrice?.trim() || product?.displayPrice?.trim();
  if (localized) {
    return localized;
  }

  const amount = parseNumericPrice(product);
  return formatAmount(amount ?? SUBSCRIPTION.PRICING.PREMIUM_ANNUAL, currencySymbol(product));
}

export function getSubscriptionLengthLabel(
  product: StoreSubscriptionFields | null,
): string {
  const unit = String(product?.subscriptionPeriodUnitIOS ?? 'YEAR').toUpperCase();
  const count = Number.parseInt(product?.subscriptionPeriodNumberIOS ?? '1', 10);
  const safeCount = Number.isFinite(count) && count > 0 ? count : 1;
  const label = PERIOD_LABELS[unit] ?? 'year';
  return `${safeCount} ${safeCount === 1 ? label : `${label}s`}`;
}

/** Monthly equivalent for annual plans — Apple "price per unit". */
export function getSubscriptionPricePerUnit(
  product: StoreSubscriptionFields | null,
): string {
  const length = getSubscriptionLengthLabel(product);
  const symbol = currencySymbol(product);
  const amount = parseNumericPrice(product) ?? SUBSCRIPTION.PRICING.PREMIUM_ANNUAL;

  if (length.includes('year')) {
    const years = Number.parseInt(length, 10) || 1;
    const monthly = amount / (12 * years);
    return `${formatAmount(monthly, symbol)}/month`;
  }

  if (length.includes('month')) {
    const months = Number.parseInt(length, 10) || 1;
    return `${formatAmount(amount / months, symbol)}/month`;
  }

  return `${getLocalizedSubscriptionPrice(product)} per ${length}`;
}

export function getSubscriptionDisplayInfo(product: StoreSubscriptionFields | null) {
  const title =
    product?.title?.trim() && product.title.toLowerCase() !== 'null'
      ? product.title.trim()
      : PREMIUM_SUBSCRIPTION_DISPLAY.title;
  const localizedPrice = getLocalizedSubscriptionPrice(product);
  const lengthLabel = getSubscriptionLengthLabel(product);
  const pricePerUnit = getSubscriptionPricePerUnit(product);

  return {
    title,
    lengthLabel,
    localizedPrice,
    pricePerUnit,
    priceLine: `${localizedPrice} / ${lengthLabel}`,
    pricePerUnitLine: `${pricePerUnit} billed ${lengthLabel === '1 year' ? 'annually' : `every ${lengthLabel}`}`,
  };
}

export function readStoreProductId(
  product: {productId?: string; productID?: string; id?: string | number} | null | undefined,
): string {
  if (!product) {
    return '';
  }
  const raw = product.productId ?? product.productID ?? product.id;
  return raw == null ? '' : String(raw).trim();
}

export function isPremiumStoreProduct(
  product: {productId?: string; productID?: string; id?: string | number} | null | undefined,
): boolean {
  return readStoreProductId(product) === SUBSCRIPTION.IAP.PREMIUM_ANNUAL_PRODUCT_ID;
}

/** StoreKit 2 JWS first; classic receipt as fallback. */
export function extractIapReceipt(
  purchase: Record<string, unknown> | null | undefined,
): string {
  if (!purchase) {
    return '';
  }

  const candidates = [
    purchase.verificationResultIOS,
    purchase.verificationResult,
    purchase.transactionReceipt,
    purchase.purchaseToken,
    purchase.jsonRepresentation,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}
