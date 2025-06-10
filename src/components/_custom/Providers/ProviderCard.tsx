import { CircleQuestion } from "@/assets/icons/ui";
import SvgRibbon from "@/assets/icons/ui/Ribbon";
import { Box, Divider, HStack, Text, VStack } from "@/components";
import { useBottomModal } from "@/context/bottom-modal/bottom-modal.providers";
import { navigate } from "@/navigation/lib";
import { ISelectedLocation } from "@/types/places";
import { ProviderLocation } from "@/types/provider-locations";
import { trackGetCareEvents, trackPlanningForCare } from "@/utils/LogEvent";
import { EventType } from "@/utils/LogEvent/types";
import { PROVIDER_CARD_ATTRIBUTES } from "@/utils/colors";
import { providerAddress } from "@/utils/strings";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import AcceptingNewPatientsBadge from "../Badges/AcceptingNewPatientsBadge";
import ScoreTooltip from "./ScoreTooltip";

interface IProviderCardProps {
  provider: ProviderLocation;
  showAssetBadgeList?: boolean;
  selectedLocation: ISelectedLocation;
  totalCount?: number;
}
const ProviderCard = (props: IProviderCardProps) => {
  const { provider, showAssetBadgeList, selectedLocation, totalCount } = props;
  const { openModal } = useBottomModal();
  const { providerDisplayName, location, displaySpecialties, metrics } =
    provider;
  const { t } = useTranslation();
  const route = useRoute();
  const providerAttributes = PROVIDER_CARD_ATTRIBUTES({
    providers: [provider],
  });

  const handleScoreModal = () => {
    trackPlanningForCare(EventType.amplitude_event_explanation_viewed, {
      source: route.name,
      explanation_topic_name: "Provider score",
    });

    openModal({
      size: "100%",
      component: <ScoreTooltip />,
    });
  };

  const handlePress = () => {
    trackGetCareEvents(EventType.amplitude_event_provider_profile_viewed, {
      providerName: provider.providerDisplayName,
      npi: provider.npi,
      address: `${providerAddress(provider)}`,
      page: "list",
      source: "costEstimator",
      bdcProvider: provider.centerOfExcellence?.isCenterOfExcellence
        ? "true"
        : "false",
      groupedPin: "true",
      preferredProvider:
        provider.flags?.preferredMedicalProvider === true ? "true" : "false",
    });

    trackPlanningForCare(
      EventType.amplitude_event_get_care_provider_result_clicked,
      {
        search_result_count: totalCount,
        search_result_view_code: "list",
        source: route.name,
        search_result_type: "provider",
        provider_npi_number: provider.npi,
        provider_name: provider.providerDisplayName,
        provider_specialty_code: provider.displaySpecialties,
        provider_preferred_indicator: provider.flags?.preferredMedicalProvider,
        provider_bdc_indicator:
          provider.centerOfExcellence?.isCenterOfExcellence,
        provider_accepting_new_patients_indicator:
          provider.location.acceptingNewPatients === "ACCEPTING",
      }
    );

    trackPlanningForCare(EventType.amplitude_event_get_care_provider_detail, {
      search_result_type: "provider",
      search_text: "",
      search_result_count: totalCount,
      source: route.name,
      procedure_name: provider.providerDisplayName,
    });

    navigate("ProviderPage", { provider, selectedLocation });
  };

  return (
    <TouchableOpacity
      onPress={() => handlePress()}
      accessibilityRole="text"
      testID="provider-card"
    >
      <Box
        w="$full"
        borderBottomWidth={1}
        borderColor="$warmGray300"
        bg={providerAttributes?.bg}
        p="$6"
      >
        <VStack
          borderRadius="$sm"
          w="$full"
          space="sm"
          position="relative"
          gap="$3"
        >
          {providerAttributes?.badge && (
            <HStack
              justifyContent="space-between"
              alignItems="center"
              testID="provider-badge"
            >
              <Box w={"$1/2"}>{providerAttributes?.badge}</Box>
              <Text color="$chGray070">{location?.distance} mi</Text>
            </HStack>
          )}

          <VStack gap={"$1"} mb={"$2"}>
            <HStack justifyContent="space-between" gap="$3">
              <Text fontWeight={500} w="$4/5">
                {providerDisplayName}
              </Text>

              {!providerAttributes?.badge && (
                <Text color="$chGray070">{location?.distance} mi</Text>
              )}
            </HStack>
            <Text color="$chGray070">{displaySpecialties}</Text>
          </VStack>

          {showAssetBadgeList && providerAttributes.badgeList}

          {!!metrics?.overallScore && (
            <HStack alignItems="center" gap={3}>
              <Text fontWeight={500} fontSize="$sm">
                {t("GET_CARE.PROVIDERS.DETAILS.SCORE")}
              </Text>
              {metrics?.overallScore >= 87 && (
                <SvgRibbon color="#C89211" size={18} />
              )}
              <Text fontSize="$sm">{metrics?.overallScore}</Text>
              <TouchableOpacity
                onPress={handleScoreModal}
                testID="score-tooltip"
              >
                <CircleQuestion size={18} color="#007E8C" />
              </TouchableOpacity>
            </HStack>
          )}

          {!!metrics?.displaySpecialties?.length && (
            <>
              <Text>
                <Text fontWeight={500} fontSize="$sm">
                  {t("GET_CARE.PROVIDERS.DETAILS.SPECIALTIES")}
                </Text>
                <Text fontSize="$sm">
                  {metrics?.displaySpecialties?.join(", ")}
                </Text>
              </Text>
            </>
          )}

          {(!!metrics?.overallScore || !!metrics?.displaySpecialties?.length) &&
            location?.acceptingNewPatients === "ACCEPTING" && (
              <Divider bg="$chGray040" my="$1" />
            )}

          <AcceptingNewPatientsBadge
            acceptingNewPatients={
              location?.acceptingNewPatients === "ACCEPTING"
            }
            fontSize={"$sm"}
          />

          <Text color="$coolGray500" fontSize="$sm">
            {providerAddress(provider)}
          </Text>

          {providerAttributes?.bottomBadge}
        </VStack>
      </Box>
    </TouchableOpacity>
  );
};

export default ProviderCard;
