const React = require('react');

// Mock useToast hook
const useToast = jest.fn(() => ({
  show: jest.fn(),
  hide: jest.fn(),
  isVisible: false,
}));

// Mock Toast component
const Toast = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement('View', otherProps, children);
};

Toast.Title = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement('Text', otherProps, children);
};

Toast.Description = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement('Text', otherProps, children);
};

module.exports = {
  useToast,
  Toast,
  ToastTitle: Toast.Title,
  ToastDescription: Toast.Description,
};
