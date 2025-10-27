const React = require('react');

const mockComponent = (name) => {
  const Component = (props) => {
    const { children, ...otherProps } = props;
    return React.createElement('View', { testID: name, ...otherProps }, children);
  };
  Component.displayName = name;
  return Component;
};

module.exports = {
  // Core Components
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  Image: mockComponent('Image'),
  ScrollView: mockComponent('ScrollView'),
  TextInput: mockComponent('TextInput'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TouchableHighlight: mockComponent('TouchableHighlight'),
  TouchableWithoutFeedback: mockComponent('TouchableWithoutFeedback'),
  Pressable: mockComponent('Pressable'),
  FlatList: mockComponent('FlatList'),
  SectionList: mockComponent('SectionList'),
  VirtualizedList: mockComponent('VirtualizedList'),
  KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
  SafeAreaView: mockComponent('SafeAreaView'),
  StatusBar: mockComponent('StatusBar'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
    absoluteFill: {},
    absoluteFillObject: {},
    hairlineWidth: 1,
  },
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => size),
  },
  // Navigation
  BackHandler: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  },
  // Gesture Handler
  PanGestureHandler: mockComponent('PanGestureHandler'),
  TapGestureHandler: mockComponent('TapGestureHandler'),
  LongPressGestureHandler: mockComponent('LongPressGestureHandler'),
  PinchGestureHandler: mockComponent('PinchGestureHandler'),
  RotationGestureHandler: mockComponent('RotationGestureHandler'),
  FlingGestureHandler: mockComponent('FlingGestureHandler'),
  // Reanimated
  Animated: {
    View: mockComponent('Animated.View'),
    Text: mockComponent('Animated.Text'),
    Image: mockComponent('Animated.Image'),
    ScrollView: mockComponent('Animated.ScrollView'),
    FlatList: mockComponent('Animated.FlatList'),
    SectionList: mockComponent('Animated.SectionList'),
    Value: jest.fn(),
    timing: jest.fn(),
    spring: jest.fn(),
    decay: jest.fn(),
    sequence: jest.fn(),
    parallel: jest.fn(),
    stagger: jest.fn(),
    loop: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    subtract: jest.fn(),
    multiply: jest.fn(),
    divide: jest.fn(),
    modulo: jest.fn(),
    diffClamp: jest.fn(),
    interpolate: jest.fn(),
    Extrapolate: {
      EXTEND: 'extend',
      CLAMP: 'clamp',
      IDENTITY: 'identity',
    },
    createAnimatedComponent: jest.fn((component) => component),
  },
  // Other utilities
  AppRegistry: {
    registerComponent: jest.fn(),
    runApplication: jest.fn(),
  },
  NativeModules: {},
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
  DeviceEventEmitter: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    getInitialURL: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  // AsyncStorage
  AsyncStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
  // Permissions
  PermissionsAndroid: {
    PERMISSIONS: {},
    RESULTS: {},
    request: jest.fn(),
    check: jest.fn(),
    requestMultiple: jest.fn(),
  },
  // NetInfo
  NetInfo: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    fetch: jest.fn(),
  },
  // Push Notifications
  PushNotification: {
    configure: jest.fn(),
    localNotification: jest.fn(),
    localNotificationSchedule: jest.fn(),
    cancelLocalNotifications: jest.fn(),
    cancelAllLocalNotifications: jest.fn(),
    removeAllDeliveredNotifications: jest.fn(),
    getDeliveredNotifications: jest.fn(),
    setApplicationIconBadgeNumber: jest.fn(),
    getApplicationIconBadgeNumber: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    requestPermissions: jest.fn(),
    checkPermissions: jest.fn(),
    getInitialNotification: jest.fn(),
    getScheduledLocalNotifications: jest.fn(),
    removeDeliveredNotifications: jest.fn(),
    invokeApp: jest.fn(),
    getChannels: jest.fn(),
    channelExists: jest.fn(),
    createChannel: jest.fn(),
    channelBlocked: jest.fn(),
    deleteChannel: jest.fn(),
  },
};
