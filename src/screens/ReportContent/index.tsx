import React, {useMemo, useState} from 'react';
import {Alert, Linking} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {
  Box,
  Button,
  Input,
  InputField,
  Select,
  Text,
  VStack,
} from '@/components';
import {InfoScreenLayout} from '@/components/InfoScreenLayout';
import {REPORT_CONTENT_COPY, type ReportReasonId} from '@/content/report-content';
import {LEGAL_CONTACT} from '@/constants/legal';
import {submitContentReport} from '@/services/content-report-service';
import {useUser} from '@/stores';
import {useThemeColors} from '@/utils/colors';
import type {AppStackParamList} from '@/navigation/AppStack/types';

type ReportContentRoute = RouteProp<AppStackParamList, 'ReportContent'>;

const ReportContentScreen = () => {
  const colors = useThemeColors();
  const user = useUser();
  const route = useRoute<ReportContentRoute>();
  const [reasonId, setReasonId] = useState<ReportReasonId>('inappropriate');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState(route.params?.eventTitle ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardStyle = useMemo(
    () => ({
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border || 'rgba(0,0,0,0.08)',
    }),
    [colors],
  );

  const handleSubmit = async () => {
    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 10) {
      Alert.alert(
        'More details needed',
        'Please describe the issue in at least 10 characters so our team can review it.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const sent = await submitContentReport({
        reasonId,
        description: trimmedDescription,
        reference: reference.trim() || undefined,
        eventId: route.params?.eventId,
        eventTitle: route.params?.eventTitle,
        reporterUserId: user?.id,
        reporterEmail: user?.email,
      });

      if (sent) {
        Alert.alert(
          'Report ready to send',
          'Your email app will open with the report details. Send the message to complete your report.',
        );
        setDescription('');
      } else {
        Alert.alert(
          'Unable to open email',
          `Please email ${LEGAL_CONTACT.supportEmail} with the subject "Alpha Vlogs content report" and include the details you entered.`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Copy email',
              onPress: () => {
                void Linking.openURL(`mailto:${LEGAL_CONTACT.supportEmail}`);
              },
            },
          ],
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InfoScreenLayout testID="report-content-screen" title={REPORT_CONTENT_COPY.title}>
      <VStack space="lg">
        <Box style={cardStyle}>
          <Text color={colors.secondaryText} fontSize={15} lineHeight={22}>
            {REPORT_CONTENT_COPY.intro}
          </Text>
        </Box>

        <Box style={cardStyle}>
          <Text
            color={colors.primaryText}
            fontWeight="$bold"
            fontSize={15}
            mb="$3">
            {REPORT_CONTENT_COPY.reasonsTitle}
          </Text>
          <Select
            testID="report-content-reason-select"
            options={REPORT_CONTENT_COPY.reasons.map(reason => ({
              value: reason.id,
              label: reason.label,
            }))}
            value={reasonId}
            placeholder="Select a reason"
            onValueChange={value => setReasonId(value as ReportReasonId)}
          />
        </Box>

        <Box style={cardStyle}>
          <Text
            color={colors.primaryText}
            fontWeight="$bold"
            fontSize={15}
            mb="$2">
            {REPORT_CONTENT_COPY.referenceLabel}
          </Text>
          <Input variant="outline">
            <InputField
              testID="report-content-reference-input"
              value={reference}
              onChangeText={setReference}
              placeholder={REPORT_CONTENT_COPY.referencePlaceholder}
            />
          </Input>
        </Box>

        <Box style={cardStyle}>
          <Text
            color={colors.primaryText}
            fontWeight="$bold"
            fontSize={15}
            mb="$2">
            {REPORT_CONTENT_COPY.descriptionLabel}
          </Text>
          <Input variant="outline" minH={120}>
            <InputField
              testID="report-content-description-input"
              value={description}
              onChangeText={setDescription}
              placeholder={REPORT_CONTENT_COPY.descriptionPlaceholder}
              multiline
              textAlignVertical="top"
            />
          </Input>
        </Box>

        <Button
          testID="report-content-submit-button"
          onPress={handleSubmit}
          isDisabled={isSubmitting}
          bg={colors.accentAction}
          opacity={isSubmitting ? 0.7 : 1}>
          <Text color={colors.white} fontWeight="$bold">
            {isSubmitting ? 'Opening email…' : REPORT_CONTENT_COPY.submitLabel}
          </Text>
        </Button>

        <VStack space="xs">
          <Text color={colors.mutedText} fontSize={13} lineHeight={20}>
            {REPORT_CONTENT_COPY.moderationNote}
          </Text>
          <Text color={colors.mutedText} fontSize={13} lineHeight={20}>
            {REPORT_CONTENT_COPY.emailFallback}{' '}
            <Text
              color={colors.accentAction}
              fontWeight="$bold"
              onPress={() => Linking.openURL(`mailto:${LEGAL_CONTACT.supportEmail}`)}>
              {LEGAL_CONTACT.supportEmail}
            </Text>
          </Text>
        </VStack>
      </VStack>
    </InfoScreenLayout>
  );
};

export default ReportContentScreen;
