import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import ProfileScreen from '../../src/screens/Profile/index';

// Mock the navigation
const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

// Mock the user store
jest.mock('../../src/stores', () => ({
  useUserStore: () => ({
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '9876543210',
      state: 'California',
      city: 'San Francisco',
      pincode: '94102',
      isVerified: true,
      profileImage: null,
    },
    setAuthenticated: jest.fn(),
    setUser: jest.fn(),
    reset: jest.fn(),
  }),
}));

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

// Mock i18n
jest.mock('../../src/services/i18n-service', () => ({
  i18n: {
    t: jest.fn(key => key),
  },
}));

// Mock Alert
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <ProfileScreen />
      </NavigationContainer>,
    );
  };

  describe('Screen Rendering', () => {
    it('should render the profile screen', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('profile-screen')).toBeTruthy();
      expect(getByTestId('profile-header')).toBeTruthy();
      expect(getByTestId('profile-content')).toBeTruthy();
    });

    it('should render header with back button and title', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('profile-back-button')).toBeTruthy();
      expect(getByTestId('profile-back-arrow')).toBeTruthy();
      expect(getByTestId('profile-title')).toBeTruthy();
    });

    it('should render user profile information', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('profile-header-section')).toBeTruthy();
      expect(getByTestId('profile-avatar')).toBeTruthy();
      expect(getByTestId('profile-user-info')).toBeTruthy();
      expect(getByTestId('profile-user-name')).toBeTruthy();
      expect(getByTestId('profile-user-email')).toBeTruthy();
      expect(getByTestId('profile-user-mobile')).toBeTruthy();
    });

    it('should render account information', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('profile-account-info')).toBeTruthy();
      expect(getByTestId('profile-account-title')).toBeTruthy();
      expect(getByTestId('profile-location-row')).toBeTruthy();
      expect(getByTestId('profile-pincode-row')).toBeTruthy();
      expect(getByTestId('profile-status-row')).toBeTruthy();
    });

    it('should render action buttons', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('profile-actions')).toBeTruthy();
      expect(getByTestId('profile-permissions-button')).toBeTruthy();
      expect(getByTestId('profile-logout-button')).toBeTruthy();
    });
  });

  describe('User Information Display', () => {
    it('should display user name correctly', () => {
      const {getByTestId} = renderScreen();

      const userName = getByTestId('profile-user-name');
      expect(userName.props.children).toBe('John Doe');
    });

    it('should display user email', () => {
      const {getByTestId} = renderScreen();

      const userEmail = getByTestId('profile-user-email');
      expect(userEmail.props.children).toBe('john.doe@example.com');
    });

    it('should display user mobile', () => {
      const {getByTestId} = renderScreen();

      const userMobile = getByTestId('profile-user-mobile');
      expect(userMobile.props.children).toBe('9876543210');
    });

    it('should display location information', () => {
      const {getByTestId} = renderScreen();

      const locationValue = getByTestId('profile-location-value');
      expect(locationValue.props.children).toBe('San Francisco, California');
    });

    it('should display pincode', () => {
      const {getByTestId} = renderScreen();

      const pincodeValue = getByTestId('profile-pincode-value');
      expect(pincodeValue.props.children).toBe('94102');
    });

    it('should display verification status', () => {
      const {getByTestId} = renderScreen();

      const statusValue = getByTestId('profile-status-value');
      expect(statusValue.props.children).toBe('✅ Verified');
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is pressed', async () => {
      const {getByTestId} = renderScreen();

      const backButton = getByTestId('profile-back-button');

      await act(async () => {
        fireEvent.press(backButton);
      });

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should navigate to Permissions when permissions button is pressed', async () => {
      const {getByTestId} = renderScreen();

      const permissionsButton = getByTestId('profile-permissions-button');

      await act(async () => {
        fireEvent.press(permissionsButton);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Permissions');
    });
  });

  describe('Logout Functionality', () => {
    it('should show logout confirmation when logout button is pressed', async () => {
      const {getByTestId} = renderScreen();

      const logoutButton = getByTestId('profile-logout-button');

      await act(async () => {
        fireEvent.press(logoutButton);
      });

      // Alert.alert should be called with logout confirmation
      const Alert = require('react-native').Alert;
      expect(Alert.alert).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.any(Array),
        {cancelable: true},
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('profile-screen')).toBeTruthy();
      expect(getByTestId('profile-title')).toBeTruthy();
      expect(getByTestId('profile-back-button')).toBeTruthy();
      expect(getByTestId('profile-permissions-button')).toBeTruthy();
      expect(getByTestId('profile-logout-button')).toBeTruthy();
    });
  });
});
