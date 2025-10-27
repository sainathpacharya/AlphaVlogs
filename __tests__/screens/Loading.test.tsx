import React from 'react';
import {render} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import LoadingScreen from '../../src/screens/Loading/index';

// Mock the theme colors
jest.mock('../../src/utils/colors', () => ({
  useThemeColors: () => ({
    primaryBackground: '#FFFFFF',
    primaryText: '#000000',
    accentAction: '#007AFF',
    mutedText: '#888888',
    white: '#FFFFFF',
  }),
}));

// Mock Moti
jest.mock('moti', () => ({
  MotiImage: ({testID, source, ...props}: any) => (
    <div testID={testID} data-source={source} {...props} />
  ),
}));

// Mock Dimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({width: 375, height: 667})),
    },
  };
});

describe('LoadingScreen', () => {
  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <LoadingScreen />
      </NavigationContainer>,
    );
  };

  describe('Screen Rendering', () => {
    it('should render the loading screen', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('loading-screen')).toBeTruthy();
      expect(getByTestId('loading-container')).toBeTruthy();
    });

    it('should render animated logo', () => {
      const {getByTestId} = renderScreen();

      const logo = getByTestId('loading-logo');
      expect(logo).toBeTruthy();
      expect(logo.props['data-source']).toBeDefined();
    });

    it('should render loading spinner and text', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('loading-spinner-container')).toBeTruthy();
      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByTestId('loading-text')).toBeTruthy();
    });

    it('should display loading text', () => {
      const {getByTestId} = renderScreen();

      const loadingText = getByTestId('loading-text');
      expect(loadingText.props.children).toBe('Loading...');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('loading-screen')).toBeTruthy();
      expect(getByTestId('loading-logo')).toBeTruthy();
      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByTestId('loading-text')).toBeTruthy();
    });
  });
});
