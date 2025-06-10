import { CircleQuestion, Star } from "@/assets/icons/ui";
import { Box, HStack, Text } from "@/components";
import { IProviderGroup } from "@/types/provider-groups-metadata";
import { trackPlanningForCare } from "@/utils/LogEvent";
import { EventType } from "@/utils/LogEvent/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { AppStackParamList } from "../../../navigation/AppStack/types";

interface IHEBPreferredBadgeProps {
  asset?: IProviderGroup["asset"];
}

const HEBPreferredBadge = ({ asset }: IHEBPreferredBadgeProps) => {
  const { navigate } = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute();

  const handleOpenModal = () => {
    trackPlanningForCare(EventType.amplitude_event_explanation_viewed, {
      source: route.name,
      explanation_topic_name: "H-E-B Preferred Primary Care",
    });

    navigate("BadgePage", {
      header: (
        <HStack alignItems="center" gap="$1" mb={"$1"}>
          <Box accessible accessibilityRole="image">
            <Star color="#C89211" />
          </Box>
          <Text
            accessibilityLabel="H-E-B Preferred Primary Care"
            accessibilityRole="text"
            fontSize="$sm"
            fontWeight={500}
            mr="$2"
          >
            H-E-B Preferred Primary Care
          </Text>
        </HStack>
      ),
      description: asset?.description || "",
    });
  };

  return (
    <TouchableOpacity
      accessibilityLabel={"H-E-B Preferred Primary Care"}
      accessibilityRole="button"
      onPress={handleOpenModal}
      testID="heb-preferred-badge"
    >
      <HStack w={250} py="$1" rounded="$md" alignItems="center" gap="$1">
        <Star color="#C89211" />
        <Text fontSize="$md" fontWeight={500} mr="$2">
          H-E-B Preferred Primary Care
        </Text>
        <CircleQuestion size={18} color="#006373" />
      </HStack>
    </TouchableOpacity>
  );
};
export default HEBPreferredBadge;
