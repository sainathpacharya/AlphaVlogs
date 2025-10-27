const React = require('react');

const mockStyled = (Component, styles) => {
  if (!Component) {
    return React.createElement('View', {});
  }
  
  const StyledComponent = (props) => {
    const { children, ...otherProps } = props;
    return React.createElement(Component, { ...otherProps, style: styles }, children);
  };
  
  const componentName = Component.displayName || Component.name || 'Component';
  StyledComponent.displayName = `Styled(${componentName})`;
  return StyledComponent;
};

module.exports = {
  styled: mockStyled,
  createConfig: jest.fn(),
  createComponents: jest.fn(),
  createTheme: jest.fn(),
};
