const {firebaseInstance, namespaced} = require('./firebase-shared');

module.exports = namespaced;
module.exports.default = namespaced;
module.exports.getAnalytics = jest.fn(() => firebaseInstance);
module.exports.logEvent = jest.fn((analytics, name, params) =>
  analytics.logEvent(name, params),
);
module.exports.setAnalyticsCollectionEnabled = jest.fn((analytics, enabled) =>
  analytics.setAnalyticsCollectionEnabled(enabled),
);
module.exports.setUserId = jest.fn((analytics, userId) =>
  analytics.setUserId(userId),
);
