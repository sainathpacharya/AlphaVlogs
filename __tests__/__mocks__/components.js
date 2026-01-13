const React = require('react');
const { View, Text, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, StatusBar, ActivityIndicator, Alert } = require('react-native');

// Mock all the custom components
const MockComponent = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(View, otherProps, children);
};

const MockPressable = (props) => {
  const { children, onPress, ...otherProps } = props;
  return React.createElement(TouchableOpacity, { ...otherProps, onPress }, children);
};

const MockTextInput = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(TextInput, otherProps, children);
};

const MockText = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(Text, otherProps, children);
};

const MockImage = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(Image, otherProps, children);
};

const MockScrollView = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(ScrollView, otherProps, children);
};

const MockKeyboardAvoidingView = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(KeyboardAvoidingView, otherProps, children);
};

const MockStatusBar = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(StatusBar, otherProps, children);
};

const MockFlatList = (props) => {
  const { data, renderItem, keyExtractor, ...otherProps } = props;
  return React.createElement(ScrollView, otherProps,
    data?.map((item, index) =>
      React.createElement(View, { key: keyExtractor ? keyExtractor(item, index) : index },
        renderItem ? renderItem({ item, index }) : null
      )
    )
  );
};

// Mock Select component with proper structure
const MockSelect = (props) => {
  const { children, options, value, onValueChange, ...otherProps } = props;
  return React.createElement(View, otherProps, children);
};

// Mock Input component with proper structure
const MockInput = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(View, otherProps, children);
};

// Mock InputField component
const MockInputField = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(TextInput, otherProps, children);
};

// Mock Button component
const MockButton = (props) => {
  const { children, onPress, ...otherProps } = props;
  return React.createElement(TouchableOpacity, { ...otherProps, onPress }, children);
};

// Mock ButtonText component
const MockButtonText = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(Text, otherProps, children);
};

// Mock Icon component
const MockIcon = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(View, otherProps, children);
};

// Mock LoadingSpinner component
const MockLoadingSpinner = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement(ActivityIndicator, otherProps, children);
};

module.exports = {
  // Layout components
  VStack: MockComponent,
  HStack: MockComponent,
  Box: MockComponent,
  View: MockComponent,
  
  // Text components
  Text: MockText,
  
  // Input components
  Input: MockInput,
  InputField: MockInputField,
  InputIcon: MockComponent,
  InputSlot: MockComponent,
  InputInput: MockInputField, // deprecated
  
  // Button components
  Button: MockButton,
  ButtonText: MockButtonText,
  ButtonGroup: MockComponent,
  ButtonSpinner: MockComponent,
  ButtonIcon: MockComponent,
  
  // Other components
  Image: MockImage,
  Icon: MockIcon,
  Select: MockSelect,
  ScrollView: MockScrollView,
  KeyboardAvoidingView: MockKeyboardAvoidingView,
  StatusBar: MockStatusBar,
  FlatList: MockFlatList,
  LoadingSpinner: MockLoadingSpinner,
  Divider: MockComponent,
  Badge: MockComponent,
  Pressable: MockPressable,
  
  // Translation components
  TranslationExample: MockComponent,
  TranslationTest: MockComponent,
};
