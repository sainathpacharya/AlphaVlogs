import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {VStack, HStack, Text, Box, Pressable} from '@/components';
import {useThemeColors} from '@/utils/colors';

const QuizScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();

  return (
    <VStack
      testID="quiz-screen"
      flex={1}
      style={{backgroundColor: colors.primaryBackground}}>
      {/* Custom Header with Back Button */}
      <HStack
        testID="quiz-header"
        alignItems="center"
        justifyContent="space-between"
        p="$4"
        pt="$12"
        style={{backgroundColor: colors.primaryBackground}}>
        <Pressable
          testID="quiz-back-button"
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
          <Text
            testID="quiz-back-arrow"
            style={{color: colors.white, fontSize: 18}}>
            ←
          </Text>
        </Pressable>
        <Text
          testID="quiz-title"
          style={{
            color: colors.primaryText,
            fontSize: 20,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
          }}>
          Quiz
        </Text>
        <Box w="$10" />
      </HStack>

      <VStack
        testID="quiz-content"
        flex={1}
        p="$4"
        space="lg"
        alignItems="center"
        justifyContent="center">
        <Text
          testID="quiz-coming-soon"
          style={{color: colors.primaryText, fontSize: 18}}>
          Quiz Screen - Coming Soon
        </Text>
        <Text
          testID="quiz-development-message"
          style={{color: colors.mutedText, fontSize: 14, textAlign: 'center'}}>
          This screen is under development
        </Text>
      </VStack>
    </VStack>
  );
};

export default QuizScreen;
