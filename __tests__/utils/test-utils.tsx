import React from 'react';
import {render, RenderOptions, fireEvent} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';

// Mock navigation container for testing
const MockNavigationContainer = ({children}: {children: React.ReactNode}) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return render(ui, {
    wrapper: MockNavigationContainer,
    ...options,
  });
};

// Mock form data for testing
export const mockFormData = {
  firstName: 'John',
  lastName: 'Doe',
  emailId: 'john.doe@example.com',
  mobileNumber: '1234567890',
  state: 'California',
  district: 'Los Angeles',
  city: 'Los Angeles',
  pincode: '123456',
  promocode: 'PROMO123',
  schoolId: '1',
  schoolName: 'Delhi Public School',
};

// Mock navigation object
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock theme colors
export const mockThemeColors = {
  primaryBackground: '#FFFFFF',
  primaryText: '#000000',
  accentAction: '#007AFF',
  success: '#34C759',
  danger: '#FF3B30',
  white: '#FFFFFF',
  mutedText: '#8E8E93',
  inputText: '#000000',
};

// Mock toast object
export const mockToast = {
  show: jest.fn(),
  hide: jest.fn(),
  close: jest.fn(),
  closeAll: jest.fn(),
  isActive: jest.fn(),
};

// Helper function to fill registration form
export const fillRegistrationForm = (getByPlaceholderText: any) => {
  fireEvent.changeText(
    getByPlaceholderText('First Name'),
    mockFormData.firstName,
  );
  fireEvent.changeText(
    getByPlaceholderText('Last Name'),
    mockFormData.lastName,
  );
  fireEvent.changeText(getByPlaceholderText('Email ID'), mockFormData.emailId);
  fireEvent.changeText(
    getByPlaceholderText('Mobile Number'),
    mockFormData.mobileNumber,
  );
  fireEvent.changeText(getByPlaceholderText('State'), mockFormData.state);
  fireEvent.changeText(getByPlaceholderText('District'), mockFormData.district);
  fireEvent.changeText(getByPlaceholderText('City'), mockFormData.city);
  fireEvent.changeText(getByPlaceholderText('Pincode'), mockFormData.pincode);
  fireEvent.changeText(
    getByPlaceholderText('Promo Code (Optional)'),
    mockFormData.promocode,
  );
};

// Helper function to create mock auth service responses
export const createMockAuthResponse = (
  success: boolean,
  data?: any,
  error?: string,
) => ({
  success,
  data: data || null,
  error: error || null,
});

// Re-export everything from testing library
export * from '@testing-library/react-native';
export {customRender as render};
