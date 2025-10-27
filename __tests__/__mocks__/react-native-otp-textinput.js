const React = require('react');

const OTPTextInput = React.forwardRef(({testID, ...props}, ref) => (
  <div testID={testID} ref={ref} {...props} />
));

module.exports = OTPTextInput;
