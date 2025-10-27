import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import WelcomeScreen from '../../src/screens/Welcome/index';

// Mock the navigation
const mockNavigation = {
  replace: jest.fn(),
};

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
    StatusBar: {
      currentHeight: 50,
    },
  };
});

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <WelcomeScreen />
      </NavigationContainer>,
    );
  };

  describe('Screen Rendering', () => {
    it('should render the welcome screen', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('welcome-screen')).toBeTruthy();
      expect(getByTestId('welcome-container')).toBeTruthy();
      expect(getByTestId('welcome-logo')).toBeTruthy();
    });

    it('should render status bar', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('welcome-status-bar')).toBeTruthy();
      expect(getByTestId('welcome-status-bar-overlay')).toBeTruthy();
    });

    it('should render animated logo', () => {
      const {getByTestId} = renderScreen();

      const logo = getByTestId('welcome-logo');
      expect(logo).toBeTruthy();
      expect(logo.props['data-source']).toBeDefined();
    });
  });

  describe('Navigation', () => {
    it('should navigate to Login after 2.5 seconds', async () => {
      renderScreen();

      // Fast-forward time by 2.5 seconds
      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
      });
    });

    it('should not navigate before 2.5 seconds', () => {
      renderScreen();

      // Fast-forward time by 2 seconds
      jest.advanceTimersByTime(2000);

      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('welcome-screen')).toBeTruthy();
      expect(getByTestId('welcome-logo')).toBeTruthy();
    });
  });
});
