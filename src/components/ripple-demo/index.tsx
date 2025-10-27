import React from 'react';
import {VStack, Text, Button, Pressable, Fab, Box} from '../index';
import {useThemeColors} from '../../utils/colors';

export const RippleDemo: React.FC = () => {
  const colors = useThemeColors();

  return (
    <VStack space="lg" p="$4" bg={colors.primaryBackground}>
      <Text fontSize="$xl" fontWeight="$bold" color={colors.primaryText}>
        Ripple Effects Demo
      </Text>

      <VStack space="md">
        <Text fontSize="$lg" color={colors.primaryText}>
          Button with Ripple Effect
        </Text>
        <Button
          onPress={() => console.log('Button pressed!')}
          bg={colors.accentAction}
          rippleColor="rgba(255, 255, 255, 0.4)"
          rippleDuration={400}>
          <Text color={colors.white}>Press Me!</Text>
        </Button>
      </VStack>

      <VStack space="md">
        <Text fontSize="$lg" color={colors.primaryText}>
          Pressable with Ripple Effect
        </Text>
        <Pressable
          onPress={() => console.log('Pressable pressed!')}
          bg={colors.warning}
          p="$3"
          borderRadius="$md"
          rippleColor="rgba(0, 0, 0, 0.2)"
          rippleDuration={300}>
          <Text color={colors.white} textAlign="center">
            Pressable Button
          </Text>
        </Pressable>
      </VStack>

      <VStack space="md">
        <Text fontSize="$lg" color={colors.primaryText}>
          Custom Ripple Colors
        </Text>
        <Button
          onPress={() => console.log('Custom ripple pressed!')}
          bg={colors.success}
          rippleColor="rgba(255, 0, 0, 0.3)"
          rippleOpacity={0.5}
          rippleDuration={500}>
          <Text color={colors.white}>Custom Ripple</Text>
        </Button>
      </VStack>

      <VStack space="md">
        <Text fontSize="$lg" color={colors.primaryText}>
          Disabled Button (No Ripple)
        </Text>
        <Button
          onPress={() => console.log('This should not work')}
          bg={colors.gray}
          isDisabled={true}>
          <Text color={colors.white}>Disabled Button</Text>
        </Button>
      </VStack>

      <VStack space="md">
        <Text fontSize="$lg" color={colors.primaryText}>
          FAB with Ripple Effect
        </Text>
        <Box position="relative" h="$20" w="$full">
          <Fab
            onPress={() => console.log('FAB pressed!')}
            bg={colors.danger}
            rippleColor="rgba(255, 255, 255, 0.4)"
            rippleDuration={350}
            placement="bottom right">
            <Text color={colors.white}>+</Text>
          </Fab>
        </Box>
      </VStack>
    </VStack>
  );
};

export default RippleDemo;
