module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': ['./src/components'],
          '@screens': ['./src/screens'],
          '@navigation': ['./src/navigation'],
          '@services': ['./src/services'],
          '@stores': ['./src/stores'],
          '@context': ['./src/context'],
          '@hooks': ['./src/hooks'],
          '@utils': ['./src/utils'],
          '@types': ['./src/types'],
          '@assets': ['./src/assets'],
          '@constants': ['./src/constants'],
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
