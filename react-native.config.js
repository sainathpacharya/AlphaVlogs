/** @type {import('@react-native-community/cli-types').Config} */
module.exports = {
  dependencies: {
    // iOS uses Apple IAP only; Razorpay stays available on Android.
    'react-native-razorpay': {
      platforms: {
        ios: null,
      },
    },
  },
};
