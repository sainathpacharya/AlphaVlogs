module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: [
    'coverage/',
    'ios/Pods/',
    'android/',
    'build/',
    'dist/',
    '*.min.js',
    '*.bundle.js',
  ],
  rules: {
    // React 17+ doesn't require React in scope
    'react/react-in-jsx-scope': 'off',
    // Allow unused vars that start with underscore
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // Inline styles are common in React Native
    'react-native/no-inline-styles': 'warn',
    // Allow console in some cases
    'no-console': 'warn',
  },
  overrides: [
    {
      // Test files and mocks
      files: ['**/__tests__/**', '**/__mocks__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-dupe-keys': 'warn',
        'no-unused-vars': 'warn',
      },
    },
  ],
};
