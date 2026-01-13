import { CircleExclamationSmall } from '@/assets/icons/misc';
import { CircleCheck } from '@/assets/icons/ui';
import { Box } from '@/components/box';
import { HStack } from '@/components/hstack';
import { Text } from '@/components/text';
import { VStack } from '@/components/vstack';
import { navigate } from '@/navigation/lib';
import CostEstimateAmount from '@/screens/App/GetCare/CostEstimator/components/CostEstimateAmount';
import { ISelectedLocation } from '@/types/places';
import {
  ETotalBeforeInsuranceUnitType,
  ProviderLocation,
} from '@/types/provider-locations';
import { PROVIDER_CARD_ATTRIBUTES } from '@/utils/colors';
import { trackGetCareEvents, trackPlanningForCare } from '@/utils/LogEvent';
import { EventType } from '@/utils/LogEvent/types';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
  item: ProviderLocation;
  onPressQuestion?: (item: ProviderLocation) => void;
  selectedLocation: ISelectedLocation;
}

const ProviderFacilitieCard = ({
  item,
  onPressQuestion,
  selectedLocation,
}: Props) => {
  const { t } = useTranslation();
  const { providerDisplayName, location, displaySpecialties } = item;
  const route = useRoute();

  const providerAttributes = PROVIDER_CARD_ATTRIBUTES({
    providers: [item],
    labelFilter: ['cost_search'],
    fontSize: '$xs',
    fontWeight: '$normal',
  });

  const handlePressItem = () => {
    trackGetCareEvents(EventType.amplitude_event_provider_profile_viewed, {
      providerName: item.providerDisplayName,
      npi: item.npi,
      address: item.location.address,
      page: 'search',
      source: 'costEstimator',
      bdcProvider: item.centerOfExcellence?.isCenterOfExcellence
        ? 'true'
        : 'false',
      groupedPin: 'false',
      preferredProvider:
        item.flags?.preferredMedicalProvider === true ? 'true' : 'false',
    });

    trackPlanningForCare(EventType.amplitude_event_get_care_provider_detail, {
      search_result_type: 'provider',
      search_text: '',
      search_result_count: 0,
      source: route.name,
      procedure_name: item.providerDisplayName,
    });

    navigate('ProviderPage', {
      provider: item,
      selectedLocation,
      showSkeleton: true,
    });
  };

  return (
    <>
      <VStack
        py="$4"
        borderBottomWidth={1}
        borderColor="$chGray030"
        px={'$5'}
        pb={'$8'}
        bgColor={providerAttributes.bg}
      >
        {providerAttributes?.badge && (
          <Box mb={'$2'} testID="provider-badge">
            {providerAttributes.badge}
          </Box>
        )}
        <TouchableOpacity
          accessible={false}
          onPress={() => handlePressItem()}
          testID="provider-card"
        >
          <Text
            accessibilityLabel={providerDisplayName}
            accessibilityRole="text"
            fontWeight={500}
            mb={'$3'}
          >
            {providerDisplayName}
          </Text>
          <HStack flex={1} justifyContent="space-between">
            <Text
              accessibilityLabel={`${displaySpecialties} - ${location?.distance} ${
                location.distance > 1
                  ? t('GET_CARE.COST_ESTIMATOR.FILTERS.DISTANCE_PLURAL')
                  : t('GET_CARE.COST_ESTIMATOR.FILTERS.DISTANCE_SINGULAR')
              }`}
              accessibilityRole="text"
              fontSize={'$xs'}
              fontWeight="$light"
              color="$chGray070"
              maxWidth={'$56'}
            >
              {displaySpecialties} - {location?.distance}{' '}
              {location.distance > 1
                ? t('GET_CARE.COST_ESTIMATOR.FILTERS.DISTANCE_PLURAL')
                : t('GET_CARE.COST_ESTIMATOR.FILTERS.DISTANCE_SINGULAR')}
            </Text>
            <Text
              accessibilityLabel={t(
                'GET_CARE.COST_ESTIMATOR.ITEMS.TOTAL_BENEFITS'
              )}
              accessibilityRole="text"
              textAlign="right"
              fontSize={'$xs'}
              color="$chGray070"
            >
              {t('GET_CARE.COST_ESTIMATOR.ITEMS.TOTAL_BENEFITS')}
            </Text>
          </HStack>
          <HStack flex={1} justifyContent="space-between" mt={'$2'}>
            <VStack justifyContent="center">
              {providerAttributes?.badgeList && (
                <Box mb={'$3'}>{providerAttributes.badgeList}</Box>
              )}
              {item?.flags?.acceptNewPatients && (
                <HStack alignItems="center" testID="accepting-new-patients">
                  <Box accessible accessibilityRole="image">
                    <CircleCheck color="#007E8C" size={14} />
                  </Box>
                  <Text
                    accessibilityLabel={t(
                      'GET_CARE.COST_ESTIMATOR.ITEMS.ACCEPTING_NEW'
                    )}
                    accessibilityRole="text"
                    fontSize={'$xs'}
                    ml={'$2'}
                  >
                    {t('GET_CARE.COST_ESTIMATOR.ITEMS.ACCEPTING_NEW')}
                  </Text>
                </HStack>
              )}
              {!item?.flags?.inNetwork && (
                <HStack alignItems="center" mt={'$2'}>
                  <Box accessible accessibilityRole="image">
                    <CircleExclamationSmall color="#F76056" size={20} />
                  </Box>
                  <Text
                    accessibilityLabel={t(
                      'GET_CARE.COST_ESTIMATOR.ITEMS.OUT_OF_NETWORK'
                    )}
                    accessibilityRole="text"
                    fontSize={'$xs'}
                    pb={'$1.5'}
                    ml={'$0.5'}
                  >
                    {t('GET_CARE.COST_ESTIMATOR.ITEMS.OUT_OF_NETWORK')}
                  </Text>
                </HStack>
              )}
            </VStack>
            <Box my={'$2'}>
              <CostEstimateAmount
                maxAmount={item?.totalBeforeInsurance?.maxAmount || 0}
                minAmount={item?.totalBeforeInsurance?.minAmount || 0}
                type={
                  item?.totalBeforeInsurance?.unitType ||
                  ETotalBeforeInsuranceUnitType.USD
                }
              />
            </Box>
          </HStack>
          <TouchableOpacity
            testID="question-label"
            accessibilityLabel={t(
              'GET_CARE.COST_ESTIMATOR.ITEMS.QUESTION_LABEL'
            )}
            accessibilityRole="button"
            onPress={() => !!onPressQuestion && onPressQuestion(item)}
          >
            <HStack flex={1} justifyContent="flex-end">
              <Text textAlign="right" fontSize={'$sm'} color="$chTeal120">
                {t('GET_CARE.COST_ESTIMATOR.ITEMS.QUESTION_LABEL')}
              </Text>
            </HStack>
          </TouchableOpacity>
        </TouchableOpacity>
        {providerAttributes?.bottomBadge && providerAttributes?.bottomBadge}
      </VStack>
    </>
  );
};

export default ProviderFacilitieCard;
