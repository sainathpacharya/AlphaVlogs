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
    'src/components/_custom/Badges/**',
    'src/components/_custom/MapViewer/**',
    'src/components/_custom/Providers/**',
    'src/components/_custom/RenderHtml/**',
    'src/components/_custom/CHWebView/**',
    'src/components/_custom/WalletButton/**',
    'src/components/_custom/Icon/**',
    'src/components/_custom/list/**',
    'src/components/_custom/OfflineModal/**',
    'src/components/_custom/ActionSheet.tsx',
    'src/components/_custom/CollapsibleText.tsx',
    'src/components/_custom/SSOButton.tsx',
    'src/components/_custom/Tooltip.tsx',
    'src/components/_custom/ToastMessage/**',
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
    'react-native/no-inline-styles': 'off',
    // Allow console in some cases
    'no-console': 'off',
    'no-void': 'off',
    '@typescript-eslint/no-shadow': 'warn',
    'eslint-comments/no-unused-disable': 'off',
    'no-trailing-spaces': 'off',
    curly: 'off',
  },
  overrides: [
    {
      // Test files and mocks
      files: ['**/__tests__/**', '**/__mocks__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-dupe-keys': 'warn',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'no-shadow': 'off',
      },
    },
  ],
};
