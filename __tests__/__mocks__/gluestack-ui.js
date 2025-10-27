const React = require('react');

const MockComponent = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement('View', otherProps, children);
};

const MockPressable = (props) => {
  const { children, onPress, ...otherProps } = props;
  return React.createElement('TouchableOpacity', { ...otherProps, onPress }, children);
};

const MockTextInput = (props) => {
  const { children, ...otherProps } = props;
  return React.createElement('TextInput', otherProps, children);
};

const MockFlatList = (props) => {
  const { data, renderItem, keyExtractor, ...otherProps } = props;
  return React.createElement('ScrollView', otherProps, 
    data?.map((item, index) => 
      React.createElement('View', { key: keyExtractor ? keyExtractor(item, index) : index }, 
        renderItem ? renderItem({ item, index }) : null
      )
    )
  );
};

// Mock createButton function
const createButton = jest.fn(() => MockComponent);

module.exports = {
  VStack: MockComponent,
  HStack: MockComponent,
  Box: MockComponent,
  Text: MockComponent,
  Input: MockComponent,
  InputField: MockTextInput,
  Button: MockPressable,
  Pressable: MockPressable,
  Image: MockComponent,
  Icon: MockComponent,
  Select: MockComponent,
  ScrollView: MockComponent,
  KeyboardAvoidingView: MockComponent,
  StatusBar: MockComponent,
  FlatList: MockFlatList,
  LoadingSpinner: MockComponent,
  createButton,
};
