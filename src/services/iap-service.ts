import {Platform} from 'react-native';
import {
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
  requestSubscription,
  Subscription,
  SubscriptionPurchase,
} from 'react-native-iap';
import {SUBSCRIPTION} from '@/constants';

const PREMIUM_SKU = SUBSCRIPTION.IAP.PREMIUM_ANNUAL_PRODUCT_ID;

class IapService {
  private connected = false;

  async init(): Promise<void> {
    if (Platform.OS !== 'ios' || this.connected) {
      return;
    }
    await initConnection();
    this.connected = true;
  }

  async teardown(): Promise<void> {
    if (Platform.OS !== 'ios' || !this.connected) {
      return;
    }
    await endConnection();
    this.connected = false;
  }

  async getPremiumSubscription(): Promise<Subscription | null> {
    await this.init();
    const subscriptions = await getSubscriptions({skus: [PREMIUM_SKU]});
    return subscriptions.find(item => item.productId === PREMIUM_SKU) ?? null;
  }

  async purchasePremium(): Promise<SubscriptionPurchase> {
    await this.init();
    const product = await this.getPremiumSubscription();
    if (!product) {
      const error = new Error(
        `Invalid product ID: ${PREMIUM_SKU} is not available from App Store`,
      );
      (error as Error & {code?: string}).code = 'E_ITEM_UNAVAILABLE';
      throw error;
    }

    const result = await requestSubscription({
      sku: PREMIUM_SKU,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });

    const purchase = Array.isArray(result) ? result[0] : result;
    if (!purchase) {
      throw new Error('No purchase returned from App Store');
    }
    return purchase;
  }

  async restorePurchases(): Promise<SubscriptionPurchase[]> {
    await this.init();
    const purchases = await getAvailablePurchases();
    return purchases.filter(
      purchase => purchase.productId === PREMIUM_SKU,
    ) as SubscriptionPurchase[];
  }

  async finishPurchase(purchase: SubscriptionPurchase): Promise<void> {
    await finishTransaction({purchase, isConsumable: false});
  }
}

export const iapService = new IapService();
export default iapService;
