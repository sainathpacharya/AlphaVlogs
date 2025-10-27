import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';

export const TranslationExample: React.FC = () => {
  const { t, tn, hasKey, getCurrentLanguage, changeLanguage } = useTranslation();

  const handleLanguageChange = () => {
    // Example of changing language (you can add more languages later)
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'en' : 'en'; // For now, just toggle back to English
    changeLanguage(newLang);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        {t('common.loading')}
      </Text>
      
      <Text style={{ marginBottom: 10 }}>
        {t('auth.login')}
      </Text>
      
      <Text style={{ marginBottom: 10 }}>
        {t('dashboard.welcome')}
      </Text>
      
      {/* Example with parameters */}
      <Text style={{ marginBottom: 10 }}>
        {t('events.eventReminderMessage', { eventTitle: 'School Event' })}
      </Text>
      
      {/* Using the tn helper for nested keys */}
      <Text style={{ marginBottom: 10 }}>
        {tn('events.eventCategories.singing')}
      </Text>
      
      {/* Check if a key exists */}
      <Text style={{ marginBottom: 10 }}>
        Key exists: {hasKey('common.loading') ? 'Yes' : 'No'}
      </Text>
      
      {/* Current language */}
      <Text style={{ marginBottom: 20 }}>
        Current Language: {getCurrentLanguage()}
      </Text>
      
      <Button title="Change Language" onPress={handleLanguageChange} />
    </View>
  );
};

export default TranslationExample;
