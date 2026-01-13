import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { i18n } from '@/services/i18n-service';

export const TranslationTest: React.FC = () => {
  const { t, tn, hasKey, getCurrentLanguage } = useTranslation();

  // Test both the new hook and legacy service
  const legacyTranslation = i18n.t('dashboard.unlockPremium');
  const hookTranslation = t('dashboard.unlockPremium');

  return (
    <View style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        Translation Test
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Legacy Service: {legacyTranslation}
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Hook Translation: {hookTranslation}
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Direct Key: dashboard.unlockPremium
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Has Key: {hasKey('dashboard.unlockPremium') ? 'Yes' : 'No'}
      </Text>

      <Text style={{ marginBottom: 10 }}>
        Current Language: {getCurrentLanguage()}
      </Text>

      <Text style={{ marginBottom: 10 }}>
        I18n Ready: {i18n.isReady() ? 'Yes' : 'No'}
      </Text>

      <Button
        title="Test More Translations"
        onPress={() => {
          console.log('Testing translations...');
          console.log('dashboard.unlockPremium:', t('dashboard.unlockPremium'));
          console.log('dashboard.accessAllQuizzes:', t('dashboard.accessAllQuizzes'));
          console.log('dashboard.subscribe:', t('dashboard.subscribe'));
        }}
      />
    </View>
  );
};

export default TranslationTest;
