import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated - using the mock file via moduleNameMapper in jest.config.js
// Additional mock for specs path
jest.mock('react-native-reanimated/src/specs/NativeReanimatedModule', () => {
  const mockModule = {
    installCoreFunctions: jest.fn(),
    makeShareableClone: jest.fn(),
    scheduleOnUI: jest.fn(),
    createWorkletRuntime: jest.fn(),
    scheduleOnJS: jest.fn(),
    registerEventHandler: jest.fn(),
    unregisterEventHandler: jest.fn(),
    getViewProp: jest.fn(),
    enableScreens: jest.fn(),
    disableScreens: jest.fn(),
    makeScreens: jest.fn(),
    makeShareable: jest.fn(),
    makeMutable: jest.fn(),
    makeRemote: jest.fn(),
    startMapper: jest.fn(),
    stopMapper: jest.fn(),
    registerSensor: jest.fn(),
    unregisterSensor: jest.fn(),
    subscribeForKeyboardEvents: jest.fn(),
    unsubscribeFromKeyboardEvents: jest.fn(),
  };
  return {
    default: {
      get: jest.fn(() => mockModule),
    },
  };
});


// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

// Mock StatusBar
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  setBackgroundColor: jest.fn(),
  setBarStyle: jest.fn(),
}));

// Mock KeyboardAvoidingView
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => {
  const { View } = require('react-native');
  return View;
});

// Mock ScrollView
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const { View } = require('react-native');
  return View;
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock navigation
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

// Mock route
export const mockRoute = {
  key: 'test-route',
  name: 'Registration',
  params: {},
};

// Global test timeout
jest.setTimeout(10000);
