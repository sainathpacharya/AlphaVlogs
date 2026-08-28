const {firebaseInstance, namespaced} = require('./firebase-shared');

module.exports = namespaced;
module.exports.default = namespaced;
module.exports.getCrashlytics = jest.fn(() => firebaseInstance);
module.exports.log = jest.fn((crashlytics, message) => crashlytics.log(message));
module.exports.recordError = jest.fn((crashlytics, error) =>
  crashlytics.recordError(error),
);
module.exports.setAttribute = jest.fn((crashlytics, name, value) =>
  crashlytics.setAttribute(name, value),
);
module.exports.setUserId = jest.fn((crashlytics, userId) =>
  crashlytics.setUserId(userId),
);
module.exports.setCrashlyticsCollectionEnabled = jest.fn((crashlytics, enabled) =>
  crashlytics.setCrashlyticsCollectionEnabled(enabled),
);
