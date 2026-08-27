jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(() => Promise.resolve(true)),
  endConnection: jest.fn(() => Promise.resolve(true)),
  getSubscriptions: jest.fn(),
  requestSubscription: jest.fn(),
  getAvailablePurchases: jest.fn(),
  finishTransaction: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@/constants', () => ({
  SUBSCRIPTION: {
    IAP: {
      PREMIUM_ANNUAL_PRODUCT_ID: 'com.nsnr.alphavlogsindia.annual.premium',
    },
  },
}));

import {Platform} from 'react-native';
import {
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
  requestSubscription,
} from 'react-native-iap';
import {iapService} from '../../src/services/iap-service';

const PREMIUM = 'com.nsnr.alphavlogsindia.annual.premium';

describe('iap-service', () => {
  beforeEach(async () => {
    (Platform as {OS: string}).OS = 'ios';
    await iapService.teardown();
    jest.clearAllMocks();
  });

  it('skips init and teardown on Android', async () => {
    (Platform as {OS: string}).OS = 'android';

    await iapService.init();
    await iapService.teardown();

    expect(initConnection).not.toHaveBeenCalled();
    expect(endConnection).not.toHaveBeenCalled();
  });

  it('initializes once and fetches premium product', async () => {
    (getSubscriptions as jest.Mock).mockResolvedValue([
      {productId: 'other'},
      {productId: PREMIUM, localizedPrice: '₹100'},
    ]);

    await iapService.init();
    await iapService.init();

    expect(initConnection).toHaveBeenCalledTimes(1);

    const product = await iapService.getPremiumSubscription();
    expect(product?.localizedPrice).toBe('₹100');
  });

  it('returns null when premium product is missing', async () => {
    (getSubscriptions as jest.Mock).mockResolvedValue([{productId: 'other'}]);

    await expect(iapService.getPremiumSubscription()).resolves.toBeNull();
  });

  it('purchases premium subscription', async () => {
    (requestSubscription as jest.Mock).mockResolvedValue({
      productId: PREMIUM,
      transactionId: 'tx_1',
      transactionReceipt: 'receipt',
    });

    const purchase = await iapService.purchasePremium();

    expect(purchase.transactionId).toBe('tx_1');
    expect(requestSubscription).toHaveBeenCalledWith({
      sku: PREMIUM,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
  });

  it('unwraps array purchase results and rejects empty', async () => {
    (requestSubscription as jest.Mock).mockResolvedValue([
      {productId: PREMIUM, transactionId: 'tx_arr'},
    ]);
    await expect(iapService.purchasePremium()).resolves.toMatchObject({
      transactionId: 'tx_arr',
    });

    (requestSubscription as jest.Mock).mockResolvedValue([]);
    await expect(iapService.purchasePremium()).rejects.toThrow(/No purchase returned/);
  });

  it('restores premium purchases and finishes them', async () => {
    (getAvailablePurchases as jest.Mock).mockResolvedValue([
      {productId: 'other', transactionId: '1'},
      {productId: PREMIUM, transactionId: '2'},
    ]);

    const purchases = await iapService.restorePurchases();
    expect(purchases).toHaveLength(1);

    await iapService.finishPurchase(purchases[0]);
    expect(finishTransaction).toHaveBeenCalledWith({
      purchase: purchases[0],
      isConsumable: false,
    });
  });

  it('ends connection on teardown after init', async () => {
    await iapService.init();
    await iapService.teardown();
    await iapService.teardown();

    expect(endConnection).toHaveBeenCalledTimes(1);
  });
});
