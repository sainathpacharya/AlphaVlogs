import { Close } from '@/assets/icons/ui';
import { Text } from '@/components/text';
import { VStack } from '@/components/vstack';
import { useBottomModal } from '@/context/bottom-modal/bottom-modal.providers';
import { useUserCachedStore } from '@/stores/user-cached-store';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ScoreTooltip = () => {
  const { closeModal } = useBottomModal();
  const { t } = useTranslation();
  const { providerGroupsMetaData } = useUserCachedStore();

  const metricsSystem = providerGroupsMetaData?.metricsSystem;

  const isPEAQ = metricsSystem === 'PEAQ';

  return (
    <SafeAreaView>
      <VStack mx="$5">
        <TouchableOpacity
          accessibilityLabel={t('COMMON.CLOSE')}
          accessibilityRole="button"
          style={{ height: 40, width: 40 }}
          onPress={closeModal}
        >
          <Close />
        </TouchableOpacity>

        <Text fontWeight={500} fontSize="$lg" my="$4">
          {t('GET_CARE.CARDS.SCORE_MODAL.TITLE')}
        </Text>

        {isPEAQ ? (
          <>
            {/* Embold content via i18n keys */}
            <Text lineHeight="$md" mb={'$5'} fontSize={14} fontWeight={400}>
              {t('GET_CARE.CARDS.SCORE_MODAL.FIRST_PARAGRAPH_PEAQ')}
            </Text>
            <Text lineHeight={'$md'} mb={'$5'} fontSize={14} fontWeight={400}>
              {t('GET_CARE.CARDS.SCORE_MODAL.SECOND_PARAGRAPH')}
            </Text>
            <Text lineHeight={'$md'} fontSize={14} fontWeight={400}>
              {t('GET_CARE.CARDS.SCORE_MODAL.THIRD_PARAGRAPH')}
            </Text>
          </>
        ) : (
          <>
            {/* Embold content via i18n keys */}
            <Text lineHeight="$md" mb={'$5'} fontSize={14} fontWeight={400}>
              {t('GET_CARE.CARDS.SCORE_MODAL.FIRST_PARAGRAPH')}
            </Text>
            <Text lineHeight={'$md'} mb={'$5'} fontSize={14} fontWeight={400}>
              {t('GET_CARE.CARDS.SCORE_MODAL.SECOND_PARAGRAPH')}
            </Text>
            <Text lineHeight={'$md'} fontSize={14} fontWeight={400}>
              {t('GET_CARE.CARDS.SCORE_MODAL.THIRD_PARAGRAPH')}
            </Text>
          </>
        )}
      </VStack>
    </SafeAreaView>
  );
};

export default ScoreTooltip;
