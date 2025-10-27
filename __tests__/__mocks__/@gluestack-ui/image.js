const React = require('react');

const createImage = jest.fn(() => {
  return React.forwardRef(({testID, ...props}, ref) => {
    return React.createElement('img', { testID, ref, ...props });
  });
});

module.exports = {
  createImage,
};
