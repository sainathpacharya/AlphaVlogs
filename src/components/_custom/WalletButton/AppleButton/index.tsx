import {
  Button,
  ButtonIcon,
  ButtonText,
  HStack,
  Image,
  VStack,
} from "@/components";
import { addPassToWallet } from "@/modules/WalletModule";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { WalletButtonProps } from "../type";
import logger from "@/utils/logger";

const AppleButton: FC<WalletButtonProps> = ({ cardData, onSave }) => {
  const { t } = useTranslation();

  const saveToWallet = async () => {
    try {
      if (cardData) {
        await addPassToWallet(cardData);

        if (onSave) {
          onSave();
        }
      }
    } catch (error) {
      logger.error("Error, saving to wallet", error);
    }
  };

  return (
    <Button
      bgColor="$black"
      size="xl"
      w={164}
      rounded="$lg"
      onPress={saveToWallet}
      testID="apple-button"
    >
      <HStack alignItems="center" gap="$4">
        <ButtonIcon w={32} h={24}>
          <Image
            source={require("../../../../assets/png/AppleWallet.png")}
            width={32}
            height={24}
            resizeMode="contain"
            alt=""
          />
        </ButtonIcon>

        <VStack justifyContent="center" alignItems="flex-start">
          <ButtonText fontWeight="$light" fontSize="$sm" lineHeight="$2xl">
            {t("CARDS.INFO.WALLET.APPLE.BTN_FIRST")}
          </ButtonText>
          <ButtonText fontSize="$md" lineHeight="$xs">
            {t("CARDS.INFO.WALLET.APPLE.BTN_SECOND")}
          </ButtonText>
        </VStack>
      </HStack>
    </Button>
  );
};

export default AppleButton;
