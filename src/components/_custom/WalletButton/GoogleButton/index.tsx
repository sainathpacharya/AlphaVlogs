import GoogleWalletIcon from '@/assets/icons/GoogleWallet';
import { Box, Button, ButtonText, HStack, VStack } from '@/components';
import logger from '@/utils/logger';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import { WalletButtonProps } from '../type';

const GoogleButton: FC<WalletButtonProps> = ({ cardData, onSave }) => {
  const { t } = useTranslation();

  const saveToWallet = () => {
    Linking.canOpenURL(cardData)
      .then(() => Linking.openURL(encodeURI(cardData)))
      .catch((error) => logger.error(error))
      .finally(() => {
        if (onSave) {
          onSave();
        }
      });
  };

  return (
    <Button
      bgColor="$black"
      size="xl"
      w={199}
      h={55}
      rounded="$full"
      onPress={saveToWallet}
      accessibilityRole="imagebutton"
      accessibilityLabel={`${t('CARDS.INFO.WALLET.ANDROID.BTN_FIRST')} ${t('CARDS.INFO.WALLET.ANDROID.BTN_SECOND')}`}
      testID="google-button"
    >
      <HStack alignItems="center" justifyContent="center" gap="$4">
        <Box>
          <GoogleWalletIcon />
        </Box>

        <VStack justifyContent="center" alignItems="flex-start">
          <ButtonText fontWeight="$light" fontSize="$sm" lineHeight="$2xl">
            {t('CARDS.INFO.WALLET.ANDROID.BTN_FIRST')}
          </ButtonText>
          <ButtonText fontSize="$md" lineHeight="$xs">
            {t('CARDS.INFO.WALLET.ANDROID.BTN_SECOND')}
          </ButtonText>
        </VStack>
      </HStack>
    </Button>
  );
};

export default GoogleButton;
