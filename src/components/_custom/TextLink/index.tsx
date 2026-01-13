import { HStack, Text } from '@/components/';
import { FC, ReactNode } from 'react';
import { TouchableOpacity } from 'react-native';

interface TextLinkProps {
  icon?: ReactNode;
  iconRight?: ReactNode;
  text: string;
  fontSize?: string;
  fontWeight?: number;
  onPress: () => void;
}

const TextLink: FC<TextLinkProps> = ({
  icon,
  iconRight,
  text,
  onPress,
  fontSize = '$md',
  fontWeight = 600,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="link"
      testID={`text-link-${text}`}
    >
      <HStack gap="$1" alignItems="center">
        {icon && icon}

        <Text
          color="$chTeal120"
          fontSize={fontSize}
          lineHeight={fontSize}
          fontWeight={fontWeight}
        >
          {text}
        </Text>

        {iconRight && iconRight}
      </HStack>
    </TouchableOpacity>
  );
};

export default TextLink;
