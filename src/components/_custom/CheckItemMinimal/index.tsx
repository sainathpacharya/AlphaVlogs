import { CheckTiny } from '@/assets/icons/misc';
import { HStack, Text, VStack } from '@/components';
import { FC } from 'react';
import { TouchableOpacity } from 'react-native';

interface CheckItemMinimalProps {
  label: string;
  description?: string;
  checked: boolean;
  id: string | number;
  action: (id: string | number) => void;
  border?: boolean;
}

const CheckItemMinimal: FC<CheckItemMinimalProps> = ({
  label,
  description,
  checked,
  id,
  action,
  border = true,
}) => {
  return (
    <TouchableOpacity
      onPress={() => action(id)}
      accessibilityRole="checkbox"
      aria-checked={checked}
      testID={`check-item-${label}`}
    >
      <HStack
        py="$6"
        gap="$6"
        w="$full"
        alignItems="center"
        borderBottomColor="#E9E9E9"
        borderBottomWidth={!border ? '$0' : '$1'}
      >
        <VStack gap="$2" flex={1}>
          <Text>{label}</Text>
          {description && <Text color="#757575">{description}</Text>}
        </VStack>

        {checked && <CheckTiny size={36} />}
      </HStack>
    </TouchableOpacity>
  );
};

export default CheckItemMinimal;
