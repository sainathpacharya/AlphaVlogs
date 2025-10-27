const React = require('react');

const LottieView = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement('View', { testID: 'LottieView', ...otherProps }, children);
};

LottieView.displayName = 'LottieView';

module.exports = LottieView;
module.exports.default = LottieView;
