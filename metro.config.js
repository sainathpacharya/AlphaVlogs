const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const config = {
  resolver: {
    extraNodeModules: {
      'react-dom': path.resolve(__dirname, 'empty-module'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
