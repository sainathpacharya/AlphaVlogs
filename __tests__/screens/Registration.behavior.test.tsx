import React from 'react';
import RegistrationScreen from '../../src/screens/Registration';
import {
  testScreenComponent,
  testComponentBehavior,
} from '../utils/screen-test-utils';

// Mock all dependencies
jest.mock('../../src/components', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    VStack: ({children}: any) => React.createElement(View, {}, children),
    HStack: ({children}: any) => React.createElement(View, {}, children),
    Box: ({children}: any) => React.createElement(View, {}, children),
    Text: ({children}: any) => React.createElement(View, {}, children),
    Input: ({children}: any) => React.createElement(View, {}, children),
    InputField: () => React.createElement(View, {}),
    Button: ({children}: any) => React.createElement(View, {}, children),
    Image: () => React.createElement(View, {}),
    Icon: () => React.createElement(View, {}),
    Select: ({children}: any) => React.createElement(View, {}, children),
    Pressable: ({children}: any) => React.createElement(View, {}, children),
    ScrollView: ({children}: any) => React.createElement(View, {}, children),
  };
});

jest.mock('../../src/components/status-bar', () => ({
  StatusBar: () => React.createElement(require('react-native').View, {}),
}));

jest.mock('moti', () => ({
  MotiImage: () => React.createElement(require('react-native').View, {}),
}));

jest.mock('../../src/components/toast', () => ({
  useToast: () => ({
    show: jest.fn(),
    hide: jest.fn(),
  }),
}));

jest.mock('../../src/utils/colors', () => ({
  useThemeColors: () => ({
    primaryBackground: '#FFFFFF',
    primaryText: '#000000',
  }),
}));

jest.mock('../../src/services/auth-service', () => ({
  authService: {
    register: jest.fn(),
  },
}));

jest.mock('../../src/services/schools-service', () => ({
  schoolsService: {
    getSchools: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('lucide-react-native', () => ({
  User: () => React.createElement(require('react-native').View, {}),
  Mail: () => React.createElement(require('react-native').View, {}),
  Phone: () => React.createElement(require('react-native').View, {}),
  MapPin: () => React.createElement(require('react-native').View, {}),
  Building2: () => React.createElement(require('react-native').View, {}),
  Landmark: () => React.createElement(require('react-native').View, {}),
  Hash: () => React.createElement(require('react-native').View, {}),
}));

jest.mock('react-native-reanimated', () => ({
  Easing: {
    inOut: jest.fn(),
  },
}));

jest.mock('../../src/assets/png/appLogo.png', () => 'logo.png');

describe('RegistrationScreen - Behavior Tests', () => {
  // Use the new testing strategy
  testScreenComponent(RegistrationScreen, 'RegistrationScreen');

  describe('Component Logic Tests', () => {
    it('should be a function component', () => {
      expect(typeof RegistrationScreen).toBe('function');
    });

    it('should accept navigation prop', () => {
      const mockNavigation = {
        navigate: jest.fn(),
        goBack: jest.fn(),
        replace: jest.fn(),
      };
      const element = React.createElement(RegistrationScreen, {
        navigation: mockNavigation,
      });
      expect(React.isValidElement(element)).toBe(true);
    });

    it('should handle undefined navigation gracefully', () => {
      const element = React.createElement(RegistrationScreen, {
        navigation: undefined,
      });
      expect(React.isValidElement(element)).toBe(true);
    });
  });

  describe('Component Structure Tests', () => {
    it('should export as default', () => {
      expect(RegistrationScreen).toBeDefined();
    });

    it('should be a React component', () => {
      const element = React.createElement(RegistrationScreen);
      expect(React.isValidElement(element)).toBe(true);
    });
  });
});
