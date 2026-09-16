/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependencies: {
    // iOS uses Apple IAP only; Razorpay stays available on Android.
    'react-native-razorpay': {
      platforms: {
        ios: null,
      },
    },
    // Play Billing 8 cannot compile against react-native-iap 12.16.2, and
    // Android IAP is unused while PAYWALL_ENABLED is false. Keep the JS/iOS
    // module; do not ship Play Billing in this AAB.
    'react-native-iap': {
      platforms: {
        android: null,
      },
    },
  },
};
