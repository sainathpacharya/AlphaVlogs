const {firebaseInstance, getApp, namespaced} = require('./firebase-shared');

module.exports = namespaced;
module.exports.default = namespaced;
module.exports.getApp = getApp;
