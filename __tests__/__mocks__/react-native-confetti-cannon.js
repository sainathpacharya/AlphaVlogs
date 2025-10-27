const React = require('react');

const ConfettiCannon = ({testID, ...props}) => (
  <div testID={testID} {...props} />
);

module.exports = ConfettiCannon;
