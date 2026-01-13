import React, {useState, useRef} from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {ChevronDown, Check} from 'lucide-react-native';
import {Box} from '../box';
import {Icon} from '../icon';
import {useThemeColors} from '../../utils/colors';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  icon?: React.ComponentType<any>;
}

const Select = React.forwardRef<any, SelectProps>(
  (
    {
      options,
      value,
      placeholder = 'Select an option',
      onValueChange,
      error,
      disabled,
      icon: IconComponent,
    },
    ref,
  ) => {
    const colors = useThemeColors();
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<View>(null);
    const [selectLayout, setSelectLayout] = useState({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });

    const selectedOption = options.find(option => option.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handlePress = () => {
      if (!disabled) {
        // Measure the select component position
        selectRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setSelectLayout({x: pageX, y: pageY, width, height});
          setIsOpen(true);
        });
      }
    };

    const handleOptionSelect = (optionValue: string) => {
      onValueChange?.(optionValue);
      setIsOpen(false);
    };

    const handleClose = () => {
      setIsOpen(false);
    };

    return (
      <>
        <Box position="relative" style={{marginBottom: 0}}>
          <View style={{position: 'relative'}} ref={selectRef}>
            {/* Left Icon */}
            {IconComponent && (
              <Box
                position="absolute"
                left={12}
                top="50%"
                style={{transform: [{translateY: -12}]}}
                zIndex={1}>
                <Icon
                  as={IconComponent}
                  size="md"
                  color={colors.accentAction}
                />
              </Box>
            )}
            <Pressable
              ref={ref}
              onPress={handlePress}
              style={[
                styles.root,
                {
                  borderColor: error ? colors.danger : colors.accentAction,
                  backgroundColor: colors.primaryBackground,
                  paddingLeft: IconComponent ? 48 : 12, // Add left padding when icon is present
                },
              ]}>
              <Text
                style={[
                  styles.text,
                  {
                    color: selectedOption
                      ? colors.primaryText
                      : colors.mutedText,
                  },
                ]}>
                {displayText}
              </Text>
              <Icon
                as={ChevronDown}
                size="sm"
                color={colors.accentAction}
                style={{
                  transform: [{rotate: isOpen ? '180deg' : '0deg'}],
                }}
              />
            </Pressable>
          </View>

          {error && (
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.danger,
                },
              ]}>
              {error}
            </Text>
          )}
        </Box>

        {/* Modal for dropdown menu */}
        <Modal
          visible={isOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={handleClose}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleClose}>
            <View
              style={[
                styles.modalMenu,
                {
                  backgroundColor: colors.primaryBackground,
                  borderColor: colors.accentAction,
                  top: selectLayout.y + selectLayout.height,
                  left: selectLayout.x,
                  width: selectLayout.width,
                },
              ]}
              onStartShouldSetResponder={() => true}>
              <ScrollView
                style={styles.menuScrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleOptionSelect(option.value)}
                    style={[
                      styles.menuItem,
                      {
                        borderBottomColor:
                          index === options.length - 1
                            ? 'transparent'
                            : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.menuItemText,
                        {
                          color: colors.primaryText,
                        },
                      ]}>
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Icon as={Check} size="sm" color={colors.accentAction} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  },
);

Select.displayName = 'Select';

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalMenu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 300,
    elevation: 10, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  menuScrollView: {
    maxHeight: 300,
  },
  menuItem: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    minHeight: 44, // Consistent touch target
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
  },
});

// Wrapper to support gluestack-ui Select API with children
const SelectWrapper = React.forwardRef<any, any>((props, ref) => {
  const {children, selectedValue, onValueChange, isDisabled, ...restProps} =
    props;

  // Extract options from children (SelectItem components)
  const options: SelectOption[] = [];
  const processChildren = (children: any) => {
    Children.forEach(children, (child: any) => {
      if (child && typeof child === 'object') {
        const componentName = child.type?.displayName || child.type?.name || '';
        if (
          componentName === 'SelectItem' ||
          child.type?.displayName === 'SelectItem'
        ) {
          const itemProps = child.props || {};
          if (itemProps.value) {
            const label =
              itemProps.label || itemProps.children || itemProps.value;
            options.push({value: itemProps.value, label: String(label)});
          }
        } else if (child.props && child.props.children) {
          processChildren(child.props.children);
        }
      }
    });
  };

  processChildren(children);

  return (
    <Select
      ref={ref}
      options={options}
      value={selectedValue}
      onValueChange={onValueChange}
      disabled={isDisabled}
      {...restProps}
    />
  );
});

SelectWrapper.displayName = 'Select';

export {Select};

// Stub exports for gluestack-ui Select API compatibility
export const SelectTrigger: any = ({children, ...props}: any) => children;
export const SelectInput: any = () => null;
export const SelectIcon: any = ({children}: any) => children;
export const SelectPortal: any = ({children}: any) => children;
export const SelectBackdrop: any = () => null;
export const SelectContent: any = ({children}: any) => children;
export const SelectDragIndicatorWrapper: any = ({children}: any) => children;
export const SelectDragIndicator: any = () => null;
// SelectItem component for gluestack-ui API compatibility
export const SelectItem: any = ({label, value, children, ...props}: any) => {
  // This component is used by SelectWrapper to extract options
  // It doesn't render anything itself
  return null;
};
SelectItem.displayName = 'SelectItem';
export const SelectItemText: any = ({children}: any) => children;

// Default export supports both APIs
const SelectComponent: any = React.forwardRef<any, any>(
  (props: any, ref: any) => {
    // If children are provided, use wrapper; otherwise use regular Select
    if (props.children) {
      return <SelectWrapper ref={ref} {...props} />;
    }
    return <Select ref={ref} {...props} />;
  },
);

SelectComponent.displayName = 'Select';

export default SelectComponent;
