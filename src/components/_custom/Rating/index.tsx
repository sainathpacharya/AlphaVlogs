import { Star } from '@/assets/icons/ui';
import { Box, HStack, VStack } from '@/components';
import { FC } from 'react';

interface RatingProps {
  rating?: number;
}

const Rating: FC<RatingProps> = ({ rating = 0 }) => {
  const paintPoint = (ratePoint: number) => {
    return (
      <Box
        bgColor="$chGray040"
        w="$full"
        h="$full"
        left={0}
        top={0}
        position="absolute"
      >
        <Box
          bgColor="$chRed100"
          w={
            rating >= ratePoint
              ? '$full'
              : `${-(ratePoint - 1 - rating) * 100}%`
          }
          h="$full"
          left={0}
          top={0}
          position="absolute"
        />
      </Box>
    );
  };

  return (
    <HStack gap="$1">
      {[1, 2, 3, 4, 5].map((point) => (
        <VStack
          alignItems="center"
          justifyContent="center"
          rounded="$sm"
          overflow="hidden"
          position="relative"
        >
          {paintPoint(point)}

          <Box m="$0.5">
            <Star color="#fff" size={12} />
          </Box>
        </VStack>
      ))}
    </HStack>
  );
};

export default Rating;
