import {
  Button,
  ButtonIcon,
  ButtonText,
  HStack,
  Image,
  VStack,
  Box,
} from '@/components';
import {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {WalletButtonProps} from '../type';

const AppleButton: FC<WalletButtonProps> = ({cardData, onSave}) => {
  const {t} = useTranslation();

  const saveToWallet = async () => {
    try {
      if (cardData) {
        // TODO: Implement wallet functionality
        console.log('Saving to wallet:', cardData);

        if (onSave) {
          onSave();
        }
      }
    } catch (error) {
      console.error('Error, saving to wallet', error);
    }
  };

  return (
    <Button
      bgColor="$black"
      size="xl"
      w={164}
      rounded="$lg"
      onPress={saveToWallet}
      testID="apple-button">
      <HStack alignItems="center" gap="$4">
        <Box w={32} h={24} alignItems="center" justifyContent="center">
          {/* Apple logo placeholder - removed missing image */}
          <ButtonText color="$white" fontSize="$xl" fontWeight="$bold">
            􀣺
          </ButtonText>
        </Box>

        <VStack justifyContent="center" alignItems="flex-start">
          <ButtonText fontWeight="$light" fontSize="$sm" lineHeight="$2xl">
            {t('CARDS.INFO.WALLET.APPLE.BTN_FIRST')}
          </ButtonText>
          <ButtonText fontSize="$md" lineHeight="$xs">
            {t('CARDS.INFO.WALLET.APPLE.BTN_SECOND')}
          </ButtonText>
        </VStack>
      </HStack>
    </Button>
  );
};

export default AppleButton;
