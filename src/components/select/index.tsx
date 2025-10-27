import React, {useState} from 'react';
import {Pressable, Text, View, StyleSheet} from 'react-native';
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

    const selectedOption = options.find(option => option.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handlePress = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleOptionSelect = (optionValue: string) => {
      onValueChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <Box position="relative" style={{marginBottom: 0}}>
        <View style={{position: 'relative'}}>
          {/* Left Icon */}
          {IconComponent && (
            <Box
              position="absolute"
              left={12}
              top="50%"
              style={{transform: [{translateY: -12}]}}
              zIndex={1}>
              <Icon as={IconComponent} size="md" color={colors.accentAction} />
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
                borderBottomLeftRadius: isOpen ? 0 : 8,
                borderBottomRightRadius: isOpen ? 0 : 8,
                paddingLeft: IconComponent ? 48 : 12, // Add left padding when icon is present
              },
            ]}>
            <Text
              style={[
                styles.text,
                {
                  color: selectedOption ? colors.primaryText : colors.mutedText,
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

        {isOpen && (
          <>
            {/* Backdrop to prevent interaction with elements behind */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: -1000,
                right: -1000,
                bottom: -1000,
                zIndex: 9998,
              }}
              onTouchEnd={() => setIsOpen(false)}
            />
            <View
              style={[
                styles.menu,
                {
                  backgroundColor: colors.primaryBackground,
                  borderColor: colors.accentAction,
                },
              ]}>
              {options.map((option, index) => (
                <Pressable
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
                </Pressable>
              ))}
            </View>
          </>
        )}

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
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 9999,
    maxHeight: 200,
    elevation: 10, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    backgroundColor: 'white', // Ensure solid background
  },
  menuItem: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    backgroundColor: 'white', // Ensure solid background
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

export {Select};
