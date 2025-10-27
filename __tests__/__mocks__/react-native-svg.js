const React = require('react');

const Svg = ({testID, children, ...props}) => (
  <div testID={testID} {...props}>
    {children}
  </div>
);

const Path = ({testID, ...props}) => (
  <div testID={testID} {...props} />
);

const Circle = ({testID, ...props}) => (
  <div testID={testID} {...props} />
);

const Rect = ({testID, ...props}) => (
  <div testID={testID} {...props} />
);

const G = ({testID, children, ...props}) => (
  <div testID={testID} {...props}>
    {children}
  </div>
);

module.exports = {
  default: Svg,
  Svg,
  Path,
  Circle,
  Rect,
  G,
};
