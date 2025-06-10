import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "../text";
import { VStack } from "../vstack";

interface iState {
  state: string;
}

const ColorItems = {
  blue: ["recurring", "received", "in_review", "payment_approved"],
  yellow: ["draft", "missing_info"],
  red: ["denied","partial_denied"],
  green: ["paid", "updated", "approved"],
  gray: [
    "payment_processing",
    "payment_canceled",
    "outdated",
  ],
};
const ColorVar = {
  blue: "#566FB8",
  yellow: "#EAB308",
  red: "#D1352A",
  green: "#4DA878",
  gray: "#999",
};

const StateBadge = ({ state }: iState) => {
  const { t } = useTranslation();
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    borderColor();
  }, [state]);

  const borderColor = () => {
    const parsedState = state?.toLowerCase()?.replace(" ", "_");
    let color = "";

    if (ColorItems.blue.includes(parsedState)) {
      color = ColorVar.blue;
    } else if (ColorItems.yellow.includes(parsedState)) {
      color = ColorVar.yellow;
    } else if (ColorItems.red.includes(parsedState)) {
      color = ColorVar.red;
    } else if (ColorItems.green.includes(parsedState)) {
      color = ColorVar.green;
    } else if (ColorItems.gray.includes(parsedState)) {
      color = ColorVar.gray;
    }

    setColor(color);
  };

  if (!color) {
    return null;
  }

  return (
    <VStack
      borderColor={color}
      borderWidth={"$1"}
      px="$1.5"
      py="$1"
      borderRadius={4}
      justifyContent="center"
      alignItems="center"
      testID="state-badge"
    >
      <Text fontSize={"$sm"} fontWeight={500}>
        {t(`COMMON.STATES.${state?.toUpperCase()?.replace(" ", "_")}`)}
      </Text>
    </VStack>
  );
};

export default StateBadge;
