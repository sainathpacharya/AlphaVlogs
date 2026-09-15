import {Platform} from 'react-native';
import {
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
  setup,
  Subscription,
  SubscriptionPurchase,
} from 'react-native-iap';
import {SUBSCRIPTION} from '@/constants';
import {isPremiumStoreProduct} from '@/utils/iap-product';

const PREMIUM_SKU = SUBSCRIPTION.IAP.PREMIUM_ANNUAL_PRODUCT_ID;
const CATALOG_RETRY_DELAY_MS = 600;
const PURCHASE_TIMEOUT_MS = 90_000;

try {
  if (Platform.OS === 'ios') {
    setup({storekitMode: 'STOREKIT2_MODE'});
  }
} catch {
  // Native IAP module is unavailable in tests and some simulators.
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

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

  private async fetchPremiumSubscription(): Promise<Subscription | null> {
    const catalog = await getSubscriptions({skus: [PREMIUM_SKU]});
    return catalog.find(isPremiumStoreProduct) ?? null;
  }

  async getPremiumSubscription(): Promise<Subscription | null> {
    await this.init();
    const first = await this.fetchPremiumSubscription();
    if (first) {
      return first;
    }

    // StoreKit can return an empty catalog on the first fetch after launch.
    await delay(CATALOG_RETRY_DELAY_MS);
    return this.fetchPremiumSubscription();
  }

  async purchasePremium(): Promise<SubscriptionPurchase> {
    await this.init();
    const product = await this.getPremiumSubscription();
    if (!product) {
      // Native SK2 caches products even when JS mapping misses productId.
      await getSubscriptions({skus: [PREMIUM_SKU]}).catch(() => []);
    }

    return this.requestPremiumPurchase();
  }

  private requestPremiumPurchase(): Promise<SubscriptionPurchase> {
    return new Promise((resolve, reject) => {
      let settled = false;

      const finish = (callback: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeout);
        purchaseSub.remove();
        errorSub.remove();
        callback();
      };

      const timeout = setTimeout(() => {
        finish(() =>
          reject(new Error('The App Store purchase timed out. Please try again.')),
        );
      }, PURCHASE_TIMEOUT_MS);

      const purchaseSub = purchaseUpdatedListener(purchase => {
        if (purchase?.productId && !isPremiumStoreProduct(purchase)) {
          return;
        }
        finish(() => resolve(purchase as SubscriptionPurchase));
      });

      const errorSub = purchaseErrorListener(error => {
        finish(() => reject(error));
      });

      requestSubscription({
        sku: PREMIUM_SKU,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      })
        .then(result => {
          const purchase = Array.isArray(result) ? result[0] : result;
          if (purchase) {
            finish(() => resolve(purchase as SubscriptionPurchase));
            return;
          }
          if (Array.isArray(result)) {
            finish(() =>
              reject(new Error('No purchase returned from App Store')),
            );
          }
        })
        .catch(error => {
          finish(() => reject(error));
        });
    });
  }

  async restorePurchases(): Promise<SubscriptionPurchase[]> {
    await this.init();
    const purchases = await getAvailablePurchases();
    return purchases.filter(isPremiumStoreProduct) as SubscriptionPurchase[];
  }

  async finishPurchase(purchase: SubscriptionPurchase): Promise<void> {
    await finishTransaction({purchase, isConsumable: false});
  }
}

export const iapService = new IapService();
export default iapService;
