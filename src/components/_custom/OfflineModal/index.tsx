import { Button, ButtonText, HStack, Text, VStack } from '@/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';

interface Props {
  show: boolean;
  onRetry: () => void;
  onClose: () => void;
}

const OfflineModal = ({ show, onRetry, onClose }: Props) => {
  const { t } = useTranslation();
  const [displayModal, setDisplayModal] = useState<boolean>(false);

  useEffect(() => {
    setDisplayModal(show);
  }, [show]);

  return (
    <Modal
      isVisible={displayModal}
      style={{
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <VStack w="90%" bg="$white" py="$8" px="$6" borderRadius="$md">
        <Text size="xl" fontWeight={500} mb="$4">
          {t('COMMON.OFFLINE_MODAL.TITLE')}
        </Text>
        <Text mb="$4" size={'xl'}>
          {t('COMMON.OFFLINE_MODAL.DESCRIPTION')}
        </Text>

        <HStack justifyContent="space-between">
          <Button
            width={'48%'}
            maxWidth={300}
            onPress={onClose}
            rounded="$full"
            borderColor="$trueGray300"
            backgroundColor="$backgroundLight0"
            variant="outline"
          >
            <ButtonText color="$black">
              {t('COMMON.OFFLINE_MODAL.CLOSE_BUTTON')}
            </ButtonText>
          </Button>

          <Button
            width={'48%'}
            maxWidth={300}
            onPress={onRetry}
            rounded="$full"
            mb="$2"
          >
            <ButtonText>{t('COMMON.OFFLINE_MODAL.RETRY_BUTTON')}</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
};

export default OfflineModal;
