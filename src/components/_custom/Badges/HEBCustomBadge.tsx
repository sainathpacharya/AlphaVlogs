import { CircleQuestion } from "@/assets/icons/ui";
import { Box, HStack, Text, VStack } from "@/components";
import { AppStackParamList } from "@/navigation/AppStack/types";
import { IProviderGroup } from "@/types/provider-groups-metadata";
import { trackPlanningForCare } from "@/utils/LogEvent";
import { EventType } from "@/utils/LogEvent/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import IconDLS from "../Icon";
import { TIconList } from "../Icon/type";

interface IHEBCustomBadgeProps {
  providerGroup: IProviderGroup;
  asset?: IProviderGroup["asset"];
  labelFilter?: string[];
}
const HEBCustomBadge = (props: IHEBCustomBadgeProps) => {
  const { providerGroup, asset } = props;
  const { navigate } = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute();

  const handleOpenModal = () => {
    trackPlanningForCare(EventType.amplitude_event_explanation_viewed, {
      source: route.name,
      explanation_topic_name: providerGroup.display,
    });

    navigate("BadgePage", {
      header: (
        <HStack w={250} py="$1" rounded="$md" alignItems="center" gap="$1">
          <Box accessible accessibilityRole="image">
            <IconDLS
              icon={providerGroup.asset.groupIcon as TIconList}
              props={{ size: 24, color: "#2D8560" }}
            />
          </Box>
          <Text
            accessibilityLabel={providerGroup.display}
            accessibilityRole="text"
            fontSize="$md"
            fontWeight={500}
            mr="$2"
          >
            {providerGroup.display}
          </Text>
        </HStack>
      ),
      description: asset?.description || "",
    });
  };

  return (
    <TouchableOpacity
      accessibilityLabel={providerGroup.display}
      accessibilityRole="button"
      onPress={handleOpenModal}
      testID="heb-custom-badge"
    >
      <VStack gap="$3">
        <HStack w={250} py="$1" rounded="$md" alignItems="center" gap="$1">
          <IconDLS
            icon={providerGroup.asset.groupIcon as TIconList}
            props={{ size: 18, color: "#2D8560" }}
          />
          <Text fontSize="$md" fontWeight={500} mr="$2">
            {providerGroup.display}
          </Text>
          <CircleQuestion size={18} color="#006373" />
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};
export default HEBCustomBadge;
