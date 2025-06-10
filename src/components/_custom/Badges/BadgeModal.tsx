import { Close } from "@/assets/icons/ui";
import { SafeAreaView } from "@/components/safe-area-view";
import { ScrollView } from "@/components/scroll-view";
import { VStack } from "@/components/vstack";
import { useBottomModal } from "@/context/bottom-modal/bottom-modal.providers";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

interface IBadgeModalProps {
  header: ReactNode;
  body: ReactNode;
}

const BadgeModal = ({ body, header }: IBadgeModalProps) => {
  const { closeModal } = useBottomModal();
  const { t } = useTranslation();
  return (
    <SafeAreaView>
      <VStack px={"$5"} pt={"$2"} gap={"$1"}>
        <TouchableOpacity
          accessibilityLabel={t("COMMON.CLOSE")}
          accessibilityRole="button"
          onPress={closeModal}
          style={{
            height: 40,
            width: 40,
          }}
        >
          <Close />
        </TouchableOpacity>
        {header}

        <ScrollView>{body}</ScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default BadgeModal;
