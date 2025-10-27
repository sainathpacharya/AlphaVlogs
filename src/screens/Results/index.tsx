import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {VStack, HStack, Text, Box, Pressable} from '@/components';
import {useThemeColors} from '@/utils/colors';

const ResultsScreen = () => {
  const navigation = useNavigation();
  const colors = useThemeColors();

  return (
    <VStack flex={1} style={{backgroundColor: colors.primaryBackground}}>
      {/* Custom Header with Back Button */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        p="$4"
        pt="$12"
        style={{backgroundColor: colors.primaryBackground}}>
        <Pressable
          onPress={() => navigation.goBack()}
          p="$2"
          borderRadius="$md"
          style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
          <Text style={{color: colors.white, fontSize: 18}}>←</Text>
        </Pressable>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 20,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
          }}>
          Results
        </Text>
        <Box w="$10" />
      </HStack>

      <VStack
        flex={1}
        p="$4"
        space="lg"
        alignItems="center"
        justifyContent="center">
        <Text style={{color: colors.primaryText, fontSize: 18}}>
          Results Screen - Coming Soon
        </Text>
        <Text
          style={{color: colors.mutedText, fontSize: 14, textAlign: 'center'}}>
          This screen is under development
        </Text>
      </VStack>
    </VStack>
  );
};

export default ResultsScreen;
