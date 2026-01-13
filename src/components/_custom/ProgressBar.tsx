import {
  HStack,
  Progress,
  ProgressFilledTrack,
  Text,
  VStack,
} from '@/components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  maxValue?: number;
  currentValue?: number;
  name: string;
  showRemaining?: boolean;
  color?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({
  maxValue = 1,
  currentValue = 0,
  name,
  showRemaining = true,
  color = '$chBlue120',
}) => {
  const displayNumber = (numb: number) => Math.floor(numb);
  const { t } = useTranslation();

  const getRemaining = (): number =>
    Math.max(Math.floor(maxValue - Math.floor(currentValue)), 0);
  const getPercentage = (): number => {
    if (maxValue === 0 && currentValue === 0) {return 100;} // Fill bar if no deductible
    if (maxValue === 0) {return 0;} // Avoid divide-by-zero
    return displayNumber((Math.floor(currentValue) * 100) / maxValue);
  };

  return (
    <VStack gap="$1">
      {!!name && (
        <HStack justifyContent="space-between" alignItems="flex-end">
          <Text
            fontWeight={400}
            maxWidth="70%"
            numberOfLines={2}
            fontSize={14}
            accessibilityLabel={name}
            accessibilityRole="text"
          >
            {name}
          </Text>
        </HStack>
      )}

      <Progress
        value={getPercentage()}
        w="$full"
        size="md"
        backgroundColor="$chGray040"
        accessibilityValue={{
          text: getPercentage()?.toString(),
        }}
      >
        <ProgressFilledTrack backgroundColor={color} />
      </Progress>

      <HStack justifyContent="space-between">
        <HStack>
          <Text
            accessibilityLabel={`$${displayNumber(currentValue)}`}
            accessibilityRole="text"
            fontWeight={400}
            fontSize={14}
          >
            {`$${displayNumber(currentValue).toLocaleString()}`}
          </Text>
          <Text
            fontWeight={400}
            px="$1"
            accessibilityLabel="/"
            accessibilityRole="text"
            fontSize={14}
          >
            {'/'}
          </Text>
          <Text
            accessibilityLabel={`$${displayNumber(maxValue)}`}
            accessibilityRole="text"
            fontWeight={400}
            fontSize={14}
          >
            {`$${displayNumber(maxValue).toLocaleString()}`}
          </Text>
        </HStack>
        <HStack justifyContent="flex-end">
          {showRemaining ? (
            <>
              <Text
                fontWeight={600}
                accessibilityLabel={getRemaining()?.toString()}
                accessibilityRole="text"
                fontSize={14}
              >
                {`$${getRemaining().toLocaleString()}`}
              </Text>

              <Text
                fontWeight={600}
                accessibilityLabel={t('COMMON.PROGRESS_BAR.REMAINING')}
                accessibilityRole="text"
                fontSize={14}
              >
                {t('COMMON.PROGRESS_BAR.REMAINING')}
              </Text>
            </>
          ) : (
            <></>
          )}
        </HStack>
      </HStack>
    </VStack>
  );
};

export default ProgressBar;
