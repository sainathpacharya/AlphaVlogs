const React = require('react');

const createSelect = jest.fn(() => {
  return React.forwardRef(({testID, children, ...props}, ref) => {
    return React.createElement('select', { testID, ref, ...props }, children);
  });
});

module.exports = {
  createSelect,
};
