const React = require('react');

const createIcon = jest.fn(() => {
  return React.forwardRef(({testID, as: Component, ...props}, ref) => {
    if (Component) {
      return React.createElement(Component, { testID, ref, ...props });
    }
    return React.createElement('div', { testID, ref, ...props });
  });
});

module.exports = {
  createIcon,
};
