import {
  CircleCheck,
  CloseLargeSquare,
  Lightbulb,
  TriangleExclamation,
} from '@/assets/icons/ui';
import { Box, HStack, Text, VStack } from '@/components';
import { useUserStore } from '@/stores/user-store';
import { ComponentProps, FC, ReactNode, useState } from 'react';
import { TouchableOpacity } from 'react-native';

interface ToastMessageProps extends ComponentProps<typeof HStack> {
  type?: 'info' | 'warning' | 'success';
  message: string | ReactNode;
  tryAgain?: boolean;
  closeBtn?: boolean;
  onClose?: () => void;
}

const ToastMessage: FC<ToastMessageProps> = ({
  type = 'info',
  message,
  tryAgain = false,
  mb = '$12',
  h = 'auto',
  closeBtn = true,
  px = '$3',
  onClose,
}) => {
  const [visible, setVisible] = useState<boolean>(true);
  const { executeLastMutate, setLastFailedMutate } = useUserStore();

  if (!visible) {return null;}

  const messageTypes = {
    info: {
      icon: <Lightbulb color="#3B4E85" />,
      color: '$chBlue120',
    },
    warning: {
      icon: <TriangleExclamation color="#C89211" />,
      color: '$chYellow120',
    },
    success: {
      icon: <CircleCheck color="#2D8560" />,
      color: '$chGreen100',
    },
  };

  return (
    <HStack px={px} w="$full" mb={mb} h={h}>
      <VStack
        p="$4"
        rounded="$sm"
        borderWidth="$1"
        borderRightColor="$trueGray300"
        borderTopColor="$trueGray200"
        borderBottomColor="$trueGray200"
        borderLeftWidth="$4"
        borderLeftColor={messageTypes[type].color}
        bgColor="$chWhite"
        w="$full"
        softShadow="4"
      >
        <HStack mb="$2" gap="$2" justifyContent="space-between">
          <Box flex={1}>{messageTypes[type].icon}</Box>
          <VStack flex={8}>
            <Text>{message} </Text>
            {tryAgain && (
              <TouchableOpacity onPress={executeLastMutate}>
                <Text fontWeight={500} color="$chTeal120">
                  Try again
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
          {closeBtn && (
            <HStack w="$64" h="$full" flex={1} justifyContent="flex-end">
              <TouchableOpacity
                testID="close-btn"
                onPress={() => {
                  setVisible(false);
                  onClose && onClose();
                  tryAgain && setLastFailedMutate(undefined);
                }}
              >
                <Box>
                  <CloseLargeSquare />
                </Box>
              </TouchableOpacity>
            </HStack>
          )}
        </HStack>
      </VStack>
    </HStack>
  );
};

export default ToastMessage;
