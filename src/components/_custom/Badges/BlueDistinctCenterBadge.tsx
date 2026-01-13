import { Plus } from '@/assets/icons/misc';
import BlueDistinctCenterIcon from '@/assets/svg/BlueDistinctCenterIcon';
import BlueDistinctCenterPlusIcon from '@/assets/svg/BlueDistinctCenterPlusIcon';
import { Box, HStack, Text, VStack } from '@/components';
import { useBottomModal } from '@/context/bottom-modal/bottom-modal.providers';
import { ProviderLocation } from '@/types/provider-locations';
import { BDC_PLUS_LEVEL } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';
import BadgeModal from './BadgeModal';

interface IBlueDistinctcenterBadgeProps {
  maxLevel?: number;
  provider?: ProviderLocation;
}
const BlueDistinctcenterBadge = (props: IBlueDistinctcenterBadgeProps) => {
  const { maxLevel, provider } = props;
  const { t } = useTranslation();
  const { openModal } = useBottomModal();
  const isBdcPlus = maxLevel === BDC_PLUS_LEVEL;

  const handleOpenModal = () => {
    openModal({
      component: (
        <BadgeModal
          header={
            <VStack mt={'$4'}>
              <Box accessible accessibilityRole="image">
                {isBdcPlus ? (
                  <BlueDistinctCenterPlusIcon />
                ) : (
                  <BlueDistinctCenterIcon />
                )}
              </Box>
            </VStack>
          }
          body={
            <VStack mt={'$5'} gap={'$5'}>
              <Text
                accessibilityLabel={t('GET_CARE.BLUE_DISTINCTION.MODAL.TITLE', {
                  type: isBdcPlus ? 'BDC+' : 'BDC',
                  displayName: provider?.providerDisplayName,
                  connection:
                    provider?.centerOfExcellence?.type === 'FERTILITY'
                      ? 'for'
                      : 'at',
                })}
                accessibilityRole="text"
                fontSize={'$sm'}
              >
                {t('GET_CARE.BLUE_DISTINCTION.MODAL.TITLE', {
                  type: isBdcPlus ? 'BDC+' : 'BDC',
                  displayName: provider?.providerDisplayName,
                  connection:
                    provider?.centerOfExcellence?.type === 'FERTILITY'
                      ? 'for'
                      : 'at',
                })}
              </Text>
              {provider?.centerOfExcellence?.specialties?.map((item) => (
                <HStack alignItems="center" key={item.code}>
                  <Text
                    accessibilityLabel={'\u2022'}
                    accessibilityRole="text"
                    fontSize={'$3xl'}
                    mr={'$2'}
                  >{'\u2022'}</Text>
                  <Text
                    accessibilityLabel={item.name}
                    accessibilityRole="text"
                    fontWeight={500}
                    w={'$80'}
                    fontSize={'$sm'}
                  >
                    {item.name}
                  </Text>
                </HStack>
              ))}
              <Text
                accessibilityLabel={t('GET_CARE.BLUE_DISTINCTION.MODAL.FOOTER')}
                accessibilityRole="text"
                fontSize={'$sm'}
              >
                {t('GET_CARE.BLUE_DISTINCTION.MODAL.FOOTER')}
              </Text>
            </VStack>
          }
        />
      ),
    });
  };

  return (
    <HStack w="$full">
      <TouchableOpacity
        testID="blue-distinction-badge"
        accessibilityLabel={t('GET_CARE.BLUE_DISTINCTION.BADGE')}
        accessibilityRole="button"
        onPress={handleOpenModal}
      >
        <HStack bg="#0082CA" px="$3" py="$1" rounded="$sm" alignItems="center">
          <Text color="$chBlue020" fontSize="$xs" fontWeight={500}>
            {t('GET_CARE.BLUE_DISTINCTION.BADGE')}
          </Text>
          {isBdcPlus && (
            <Box mt={6} ml={2}>
              <Plus color="white" size={16} />
            </Box>
          )}
        </HStack>
      </TouchableOpacity>
    </HStack>
  );
};
export default BlueDistinctcenterBadge;
