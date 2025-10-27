const React = require('react');

const createInput = jest.fn(() => {
  return React.forwardRef(({testID, children, ...props}, ref) => {
    return React.createElement('div', { testID, ref, ...props }, children);
  });
});

module.exports = {
  createInput,
};
