import { Box, Text } from "@/components";
import { FC } from "react";
import { TouchableOpacity } from "react-native";

interface TabProps {
  action: (value: string | number) => void;
  label: string;
  value: string | number;
  selected?: boolean;
  showUnderline: boolean;
  underLineBottom?: string;
}

const Tab: FC<TabProps> = ({
  action,
  label,
  value,
  selected = false,
  showUnderline,
  underLineBottom = "$1",
}) => {
  if (!selected) {
    return (
      <Box pb="$2">
        <TouchableOpacity
          onPress={() => action(value)}
          accessibilityLabel={label}
          accessibilityRole="text"
          testID={label}
        >
          <Text>{label}</Text>
        </TouchableOpacity>
      </Box>
    );
  }

  if (showUnderline) {
    return (
      <Box
        pb={underLineBottom as any}
        borderBottomColor="$chBlue120"
        borderBottomWidth={4}
      >
        <Text
          color="$chBlue120"
          fontWeight={500}
          accessibilityLabel={label}
          accessibilityRole="text"
          testID={label}
        >
          {label}
        </Text>
      </Box>
    );
  }

  return (
    <Box pb="$2" borderBottomColor="$chBlue120" borderBottomWidth={0}>
      <Text
        fontWeight={500}
        accessibilityLabel={label}
        accessibilityRole="text"
      >
        {label}
      </Text>
    </Box>
  );
};

export default Tab;
