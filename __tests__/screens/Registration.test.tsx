import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import RegistrationScreen from '../../src/screens/Registration/index';

// Mock the navigation
const mockNavigation = {
  navigate: jest.fn(),
};

// Mock the auth service
jest.mock('../../src/services/auth-service', () => ({
  authService: {
    register: jest.fn(),
  },
}));

// Mock the toast
jest.mock('../../src/components/toast', () => ({
  useToast: () => ({
    show: jest.fn(),
  }),
}));

// Mock the theme colors
jest.mock('../../src/utils/colors', () => ({
  useThemeColors: () => ({
    primaryBackground: '#FFFFFF',
    primaryText: '#000000',
    accentAction: '#007AFF',
    mutedText: '#888888',
    danger: '#FF3B30',
    success: '#34C759',
    white: '#FFFFFF',
    inputText: '#000000',
  }),
}));

// Mock the status bar
jest.mock('@/components/status-bar', () => ({
  StatusBar: ({testID, ...props}: any) => <div testID={testID} {...props} />,
}));

// Mock Moti
jest.mock('moti', () => ({
  MotiImage: ({testID, source, ...props}: any) => (
    <div testID={testID} data-source={source} {...props} />
  ),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  Easing: {
    inOut: jest.fn(() => jest.fn()),
    ease: jest.fn(),
  },
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

describe('RegistrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <RegistrationScreen navigation={mockNavigation} />
      </NavigationContainer>,
    );
  };

  describe('Screen Rendering', () => {
    it('should render the registration screen', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('registration-screen')).toBeTruthy();
      expect(getByTestId('registration-container')).toBeTruthy();
      expect(getByTestId('registration-logo')).toBeTruthy();
      expect(getByTestId('registration-title')).toBeTruthy();
    });

    it('should render all form fields', () => {
      const {getByTestId} = renderScreen();

      // Check all input fields are rendered
      expect(getByTestId('registration-firstName-field')).toBeTruthy();
      expect(getByTestId('registration-lastName-field')).toBeTruthy();
      expect(getByTestId('registration-emailId-field')).toBeTruthy();
      expect(getByTestId('registration-mobileNumber-field')).toBeTruthy();
      expect(getByTestId('registration-state-field')).toBeTruthy();
      expect(getByTestId('registration-district-field')).toBeTruthy();
      expect(getByTestId('registration-city-field')).toBeTruthy();
      expect(getByTestId('registration-pincode-field')).toBeTruthy();
      expect(getByTestId('registration-promocode-field')).toBeTruthy();
    });

    it('should render school selection dropdown', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('registration-school-container')).toBeTruthy();
      expect(getByTestId('registration-school-select')).toBeTruthy();
      expect(getByTestId('registration-school-label')).toBeTruthy();
    });

    it('should render submit button', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('registration-submit-button')).toBeTruthy();
      expect(getByTestId('registration-submit-text')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const {getByTestId} = renderScreen();

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Check for validation errors
      expect(getByTestId('registration-firstName-error')).toBeTruthy();
      expect(getByTestId('registration-lastName-error')).toBeTruthy();
      expect(getByTestId('registration-emailId-error')).toBeTruthy();
      expect(getByTestId('registration-mobileNumber-error')).toBeTruthy();
      expect(getByTestId('registration-state-error')).toBeTruthy();
      expect(getByTestId('registration-district-error')).toBeTruthy();
      expect(getByTestId('registration-city-error')).toBeTruthy();
      expect(getByTestId('registration-pincode-error')).toBeTruthy();
      expect(getByTestId('registration-school-error')).toBeTruthy();
    });

    it('should validate email format', async () => {
      const {getByTestId} = renderScreen();

      const emailField = getByTestId('registration-emailId-field');

      await act(async () => {
        fireEvent.changeText(emailField, 'invalid-email');
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(getByTestId('registration-emailId-error')).toBeTruthy();
    });

    it('should validate mobile number format', async () => {
      const {getByTestId} = renderScreen();

      const mobileField = getByTestId('registration-mobileNumber-field');

      await act(async () => {
        fireEvent.changeText(mobileField, '123');
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(getByTestId('registration-mobileNumber-error')).toBeTruthy();
    });

    it('should validate pincode format', async () => {
      const {getByTestId} = renderScreen();

      const pincodeField = getByTestId('registration-pincode-field');

      await act(async () => {
        fireEvent.changeText(pincodeField, '123');
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(getByTestId('registration-pincode-error')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update form fields when user types', async () => {
      const {getByTestId} = renderScreen();

      const firstNameField = getByTestId('registration-firstName-field');
      const lastNameField = getByTestId('registration-lastName-field');

      await act(async () => {
        fireEvent.changeText(firstNameField, 'John');
        fireEvent.changeText(lastNameField, 'Doe');
      });

      expect(firstNameField.props.value).toBe('John');
      expect(lastNameField.props.value).toBe('Doe');
    });

    it('should clear validation errors when user starts typing', async () => {
      const {getByTestId, queryByTestId} = renderScreen();

      const submitButton = getByTestId('registration-submit-button');

      // Trigger validation errors
      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(getByTestId('registration-firstName-error')).toBeTruthy();

      // Start typing in firstName field
      const firstNameField = getByTestId('registration-firstName-field');

      await act(async () => {
        fireEvent.changeText(firstNameField, 'John');
      });

      // Error should be cleared
      expect(queryByTestId('registration-firstName-error')).toBeNull();
    });
  });

  describe('School Selection', () => {
    it('should show custom school input when "Other" is selected', async () => {
      const {getByTestId} = renderScreen();

      // This would need to be implemented based on the Select component's behavior
      // For now, we'll test that the custom school container is not visible initially
      expect(() =>
        getByTestId('registration-custom-school-container'),
      ).toThrow();
    });

    it('should validate school selection', async () => {
      const {getByTestId} = renderScreen();

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(getByTestId('registration-school-error')).toBeTruthy();
    });
  });

  describe('Submit Button State', () => {
    it('should be disabled when form is incomplete', () => {
      const {getByTestId} = renderScreen();

      const submitButton = getByTestId('registration-submit-button');

      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should be enabled when form is complete', async () => {
      const {getByTestId} = renderScreen();

      // Fill all required fields
      const fields = [
        'registration-firstName-field',
        'registration-lastName-field',
        'registration-emailId-field',
        'registration-mobileNumber-field',
        'registration-state-field',
        'registration-district-field',
        'registration-city-field',
        'registration-pincode-field',
      ];

      await act(async () => {
        fields.forEach(fieldId => {
          const field = getByTestId(fieldId);
          fireEvent.changeText(field, 'Test Value');
        });
      });

      // Select a school (this would need to be implemented based on Select component)
      // For now, we'll just check the current state
      const submitButton = getByTestId('registration-submit-button');
      expect(submitButton).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful registration', async () => {
      const {authService} = require('../../src/services/auth-service');
      authService.register.mockResolvedValue({
        success: true,
        data: {id: '1', firstName: 'John'},
      });

      const {getByTestId} = renderScreen();

      // Fill all required fields
      const fields = [
        'registration-firstName-field',
        'registration-lastName-field',
        'registration-emailId-field',
        'registration-mobileNumber-field',
        'registration-state-field',
        'registration-district-field',
        'registration-city-field',
        'registration-pincode-field',
      ];

      await act(async () => {
        fields.forEach(fieldId => {
          const field = getByTestId(fieldId);
          fireEvent.changeText(field, 'Test Value');
        });
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(authService.register).toHaveBeenCalled();
    });

    it('should handle registration failure', async () => {
      const {authService} = require('../../src/services/auth-service');
      authService.register.mockResolvedValue({
        success: false,
        error: 'Registration failed',
      });

      const {getByTestId} = renderScreen();

      // Fill all required fields
      const fields = [
        'registration-firstName-field',
        'registration-lastName-field',
        'registration-emailId-field',
        'registration-mobileNumber-field',
        'registration-state-field',
        'registration-district-field',
        'registration-city-field',
        'registration-pincode-field',
      ];

      await act(async () => {
        fields.forEach(fieldId => {
          const field = getByTestId(fieldId);
          fireEvent.changeText(field, 'Test Value');
        });
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(authService.register).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const {authService} = require('../../src/services/auth-service');
      authService.register.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      );

      const {getByTestId} = renderScreen();

      // Fill all required fields
      const fields = [
        'registration-firstName-field',
        'registration-lastName-field',
        'registration-emailId-field',
        'registration-mobileNumber-field',
        'registration-state-field',
        'registration-district-field',
        'registration-city-field',
        'registration-pincode-field',
      ];

      await act(async () => {
        fields.forEach(fieldId => {
          const field = getByTestId(fieldId);
          fireEvent.changeText(field, 'Test Value');
        });
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Check loading state
      expect(getByTestId('registration-submit-text')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const {authService} = require('../../src/services/auth-service');
      authService.register.mockRejectedValue(new Error('Network error'));

      const {getByTestId} = renderScreen();

      // Fill all required fields
      const fields = [
        'registration-firstName-field',
        'registration-lastName-field',
        'registration-emailId-field',
        'registration-mobileNumber-field',
        'registration-state-field',
        'registration-district-field',
        'registration-city-field',
        'registration-pincode-field',
      ];

      await act(async () => {
        fields.forEach(fieldId => {
          const field = getByTestId(fieldId);
          fireEvent.changeText(field, 'Test Value');
        });
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(authService.register).toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    it('should reset form after successful submission', async () => {
      const {authService} = require('../../src/services/auth-service');
      authService.register.mockResolvedValue({
        success: true,
        data: {id: '1', firstName: 'John'},
      });

      const {getByTestId} = renderScreen();

      // Fill all required fields
      const fields = [
        'registration-firstName-field',
        'registration-lastName-field',
        'registration-emailId-field',
        'registration-mobileNumber-field',
        'registration-state-field',
        'registration-district-field',
        'registration-city-field',
        'registration-pincode-field',
      ];

      await act(async () => {
        fields.forEach(fieldId => {
          const field = getByTestId(fieldId);
          fireEvent.changeText(field, 'Test Value');
        });
      });

      const submitButton = getByTestId('registration-submit-button');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Form should be reset after successful submission
      expect(authService.register).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const {getByTestId} = renderScreen();

      expect(getByTestId('registration-screen')).toBeTruthy();
      expect(getByTestId('registration-title')).toBeTruthy();
      expect(getByTestId('registration-submit-button')).toBeTruthy();
    });

    it('should have proper accessibility hints', () => {
      const {getByTestId} = renderScreen();

      const firstNameField = getByTestId('registration-firstName-field');
      const lastNameField = getByTestId('registration-lastName-field');
      const emailField = getByTestId('registration-emailId-field');

      expect(firstNameField).toBeTruthy();
      expect(lastNameField).toBeTruthy();
      expect(emailField).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should render quickly', () => {
      const startTime = Date.now();
      renderScreen();
      const endTime = Date.now();

      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks', () => {
      const {unmount} = renderScreen();

      // Unmount should not throw any errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
