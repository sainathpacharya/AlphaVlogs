import Check from '@/assets/icons/Check';
import { Box, HStack, Text, VStack } from '@/components';
import { FC, ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

interface CheckItemProps {
  label: string;
  description?: string;
  checked: boolean;
  id: string | number;
  action: (id: string | number) => void;
  icon?: ReactNode;
  border?: boolean;
}

const CheckItem: FC<CheckItemProps> = ({
  label,
  description,
  checked,
  id,
  action,
  icon,
  border = true,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        action(id);
      }}
      accessibilityRole="checkbox"
      aria-checked={checked}
      testID={`check-item-${id}`}
    >
      <HStack
        py="$5"
        gap="$6"
        w="$full"
        alignItems="center"
        borderBottomColor="#E9E9E9"
        borderBottomWidth={icon || !border ? '$0' : '$1'}
      >
        {!icon ? (
          <Box
            w="$5"
            h="$5"
            rounded="$xs"
            borderColor="#999"
            borderWidth={checked ? '$0' : '$1'}
            backgroundColor={checked ? '$chTeal120' : '$white'}
            justifyContent="center"
            alignItems="center"
          >
            <Check color="#FFF" />
          </Box>
        ) : (
          icon
        )}

        <VStack gap="$2" flex={1}>
          <Text>{label}</Text>
          {description && <Text color="#757575">{description}</Text>}
        </VStack>

        {icon && (
          <Box
            w="$5"
            h="$5"
            rounded="$xs"
            borderColor="#999"
            borderWidth={checked ? '$0' : '$1'}
            backgroundColor={checked ? '$chTeal120' : '$white'}
            justifyContent="center"
            alignItems="center"
          >
            <Check color="#FFF" />
          </Box>
        )}
      </HStack>
    </TouchableOpacity>
  );
};

export default CheckItem;
