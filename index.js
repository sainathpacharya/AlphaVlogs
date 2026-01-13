/**
 * @format
 */

// Polyfill for Intl.PluralRules to fix i18next compatibility
if (!global.Intl) {
  global.Intl = {};
}

if (!global.Intl.PluralRules) {
  global.Intl.PluralRules = class PluralRules {
    constructor(locale, options) {
      this.locale = locale;
      this.options = options;
    }

    select(count) {
      // Simple pluralization rule: return 'one' for count === 1, 'other' for everything else
      return count === 1 ? 'one' : 'other';
    }
  };
}

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
