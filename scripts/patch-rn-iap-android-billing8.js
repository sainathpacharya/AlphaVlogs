/**
 * react-native-iap 12.16.2 still compiles against Play Billing Library 7.
 * Play now rejects AABs that ship billing 7.x.
 *
 * This does not enable the in-app paywall. JS IAP stays iOS-only and
 * SUBSCRIPTION.PAYWALL_ENABLED stays false.
 *
 * Idempotent: safe from yarn postinstall and CI (which uses --ignore-scripts).
 */
const fs = require('fs');
const path = require('path');

const MARKER = 'AlphaVlogs: Play Billing 8';
const MODULE_PATH = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-iap',
  'android',
  'src',
  'play',
  'java',
  'com',
  'dooboolab',
  'rniap',
  'RNIapModule.kt',
);

function patchSource(source) {
  const patchedBuilder =
    'BillingClient.newBuilder(reactContext).enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()) /* ' +
    MARKER +
    ' */';
  if (source.includes(patchedBuilder) && !source.includes('queryPurchaseHistoryAsync')) {
    return source;
  }

  let next = source;
  if (!next.includes('import com.android.billingclient.api.PendingPurchasesParams')) {
    next = next.replace(
      'import com.android.billingclient.api.BillingClient\n',
      'import com.android.billingclient.api.BillingClient\nimport com.android.billingclient.api.PendingPurchasesParams\n',
    );
  }

  next = next.replace(
    'BillingClient.newBuilder(reactContext).enablePendingPurchases()',
    patchedBuilder,
  );

  next = next.replace(
    /BillingClient\.newBuilder\(reactContext\)\.enablePendingPurchases\(\s*PendingPurchasesParams\.newBuilder\(\)\.enableOneTimeProducts\(\)\.build\(\),\s*\) \/\/ AlphaVlogs: Play Billing 8/,
    patchedBuilder,
  );

  // queryPurchaseHistoryAsync was removed in Billing 8; current purchases are enough
  // while Android IAP is unused.
  next = next.replace(
    /billingClient\.queryPurchaseHistoryAsync\(\s*QueryPurchaseHistoryParams[\s\S]*?return@queryPurchaseHistoryAsync/,
    `billingClient.queryPurchasesAsync(
      QueryPurchasesParams
        .newBuilder()
        .setProductType(
          if (type == "subs") BillingClient.ProductType.SUBS else BillingClient.ProductType.INAPP,
        ).build(),
    ) { billingResult: BillingResult, purchaseHistoryRecordList: List<Purchase>? ->
      // ${MARKER}

      if (!isValidResult(billingResult, promise)) return@queryPurchasesAsync`,
  );

  if (!next.includes(MARKER)) {
    return null;
  }
  return next;
}

function main() {
  if (!fs.existsSync(MODULE_PATH)) {
    console.warn(
      '[patch-rn-iap-android-billing8] react-native-iap Android sources not found; skip.',
    );
    return;
  }

  const source = fs.readFileSync(MODULE_PATH, 'utf8').replace(/\r\n/g, '\n');
  const next = patchSource(source);
  if (!next) {
    console.warn(
      '[patch-rn-iap-android-billing8] expected Billing 7 snippets not found in RNIapModule.kt',
    );
    process.exitCode = 1;
    return;
  }
  if (next === source) {
    return;
  }
  fs.writeFileSync(MODULE_PATH, next);
  console.log(`[patch-rn-iap-android-billing8] patched ${MODULE_PATH}`);
}

main();
