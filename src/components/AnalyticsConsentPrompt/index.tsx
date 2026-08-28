import React from 'react';
import {Modal} from 'react-native';
import {Box, Button, Text, VStack} from '@/components';
import {useThemeColors} from '@/utils/colors';
import {PRIVACY_POLICY} from '@/content';
import {setAnalyticsConsent} from '@/services/analytics-consent-service';

type AnalyticsConsentPromptProps = {
  visible: boolean;
  onComplete: () => void;
};

export function AnalyticsConsentPrompt({
  visible,
  onComplete,
}: AnalyticsConsentPromptProps) {
  const colors = useThemeColors();

  const handleChoice = async (granted: boolean) => {
    await setAnalyticsConsent(granted ? 'granted' : 'denied');
    onComplete();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => void handleChoice(false)}>
      <Box
        flex={1}
        justifyContent="center"
        px="$5"
        style={{backgroundColor: 'rgba(0,0,0,0.55)'}}>
        <Box
          borderRadius={16}
          p="$5"
          style={{
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border || 'rgba(0,0,0,0.08)',
          }}>
          <VStack space="md">
            <Text
              color={colors.primaryText}
              fontSize={18}
              fontWeight="$bold"
              textAlign="center">
              Help us improve Alpha Vlogs
            </Text>
            <Text color={colors.secondaryText} fontSize={14} lineHeight={22}>
              We use privacy-friendly analytics and crash reports to keep the app
              reliable for students and schools. You can change this later in Profile
              settings. See our Privacy Policy for details.
            </Text>
            <Text color={colors.mutedText} fontSize={12} lineHeight={18}>
              {PRIVACY_POLICY.title} — last updated {PRIVACY_POLICY.lastUpdated}
            </Text>
            <Button
              testID="analytics-consent-accept"
              bg={colors.accentAction}
              onPress={() => void handleChoice(true)}>
              <Text color={colors.white} fontWeight="$bold">
                Allow analytics
              </Text>
            </Button>
            <Button
              testID="analytics-consent-decline"
              variant="outline"
              onPress={() => void handleChoice(false)}>
              <Text color={colors.primaryText} fontWeight="$bold">
                Not now
              </Text>
            </Button>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}
