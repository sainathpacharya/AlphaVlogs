const React = require('react');
const { Image, View, Text } = require('react-native');

module.exports = {
  MotiImage: ({ children, ...props }) => React.createElement(Image, props, children),
  MotiView: ({ children, ...props }) => React.createElement(View, props, children),
  MotiText: ({ children, ...props }) => React.createElement(Text, props, children),
};
