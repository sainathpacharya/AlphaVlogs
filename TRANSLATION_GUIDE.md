# Translation Guide - React-i18next Integration

This guide explains how to use the new `react-i18next` integration in the JackMarvelsApp.

## Overview

The app now uses `react-i18next` for internationalization, which provides a more React-friendly way to handle translations. The integration maintains backward compatibility with the existing `I18nService` while adding new React hooks for easier usage in components.

## Quick Start

### 1. Using the `useTranslation` Hook (Recommended)

```tsx
import React from 'react';
import {View, Text} from 'react-native';
import {useTranslation} from '@/hooks/useTranslation';

const MyComponent: React.FC = () => {
  const {t, tn, hasKey, getCurrentLanguage, changeLanguage} = useTranslation();

  return (
    <View>
      {/* Basic translation */}
      <Text>{t('common.loading')}</Text>

      {/* Translation with parameters */}
      <Text>
        {t('events.eventReminderMessage', {eventTitle: 'School Event'})}
      </Text>

      {/* Using the tn helper for nested keys */}
      <Text>{tn('events.eventCategories.singing')}</Text>

      {/* Check if a key exists */}
      {hasKey('common.loading') && <Text>Key exists!</Text>}

      {/* Current language */}
      <Text>Current Language: {getCurrentLanguage()}</Text>
    </View>
  );
};
```

### 2. Using the Legacy I18nService (Still Available)

```tsx
import {i18n} from '@/services/i18n-service';

// In any function or component
const message = i18n.t('common.loading');
const messageWithParams = i18n.t('events.eventReminderMessage', {
  eventTitle: 'Event',
});
```

## Available Methods

### useTranslation Hook Methods

- `t(key, params?)` - Translate a key with optional parameters
- `tn(key, params?)` - Alias for `t()` (nested translation helper)
- `hasKey(key)` - Check if a translation key exists
- `getCurrentLanguage()` - Get current language code
- `changeLanguage(lang)` - Change the current language
- `i18n` - Access to the underlying i18next instance

### I18nService Methods (Legacy)

- `i18n.t(key, params?)` - Translate a key
- `i18n.hasKey(key)` - Check if key exists
- `i18n.getCurrentLanguage()` - Get current language
- `i18n.setLanguage(lang)` - Set language
- `i18n.getAvailableLanguages()` - Get available languages
- `i18n.getNested(key)` - Get nested object

## Translation Keys

All translation keys are defined in `src/constants/strings.json`. The structure follows a nested object pattern:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error"
  },
  "auth": {
    "login": "Login",
    "register": "Register"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome"
  }
}
```

## Parameter Interpolation

You can use parameters in your translations:

```json
{
  "events": {
    "eventReminderMessage": "Don't forget! \"{eventTitle}\" is tomorrow."
  }
}
```

```tsx
const message = t('events.eventReminderMessage', {
  eventTitle: 'Singing Competition',
});
// Result: "Don't forget! "Singing Competition" is tomorrow."
```

## Adding New Languages

To add support for new languages:

1. Create a new language file in `src/constants/` (e.g., `strings-hi.json` for Hindi)
2. Update the i18n service to load the new language
3. Use `changeLanguage('hi')` to switch to Hindi

## Best Practices

1. **Use the `useTranslation` hook** in React components for better performance and React integration
2. **Keep translation keys organized** in the strings.json file
3. **Use parameters** for dynamic content instead of string concatenation
4. **Check for key existence** before using translations in critical paths
5. **Use the legacy service** only for non-React contexts (services, utilities)

## Example: Updated Dashboard Component

The Dashboard component has been updated to use the new translation system:

```tsx
import {useTranslation} from '@/hooks/useTranslation';

const DashboardScreen: React.FC = () => {
  const {t} = useTranslation();

  return (
    <View>
      <Text>{t('dashboard.unlockPremium')}</Text>
      <Text>{t('dashboard.accessAllQuizzes')}</Text>
      <Button title={t('dashboard.subscribe')} />
    </View>
  );
};
```

## Testing

The translation system includes comprehensive tests. Run them with:

```bash
yarn test __tests__/services/i18n-service.test.ts
yarn test __tests__/hooks/useTranslation.test.tsx
```

## Migration from Old System

If you have existing components using the old `i18n` service:

1. Import `useTranslation` from `@/hooks/useTranslation`
2. Replace `i18n.t()` calls with `t()` from the hook
3. Add the hook to your component: `const { t } = useTranslation();`

The old system remains functional for backward compatibility.
