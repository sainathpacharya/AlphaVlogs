import { HStack, Text } from '@/components';
import { useTranslation } from 'react-i18next';

interface IExcellentProviderBadgeProps {
  py?: string | any;
}

const ExcellentProviderBadge = ({
  py = '$1',
}: IExcellentProviderBadgeProps) => {
  const { t } = useTranslation();

  return (
    <HStack w="$full">
      <HStack bg="$chYellow140" px={'$2'} py={py}>
        <Text
          color="$chWhite"
          fontSize="$xs"
          fontWeight={500}
          textAlign="center"
        >
          {t('GET_CARE.PROVIDERS.DETAILS.EXCELLENT_PROVIDER')}
        </Text>
      </HStack>
    </HStack>
  );
};
export default ExcellentProviderBadge;
