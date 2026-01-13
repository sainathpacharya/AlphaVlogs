import { Box, HStack, VStack } from '@/components';
import Skeleton from './Skeleton';

interface Props {
  hasDescription?: boolean;
}

const CardSkeleton = ({ hasDescription }: Props) => (
  <Box
    bg="$white"
    px={24}
    py="$8"
    borderColor="$trueGray300"
    borderWidth="$1"
    borderRadius={8}
  >
    <HStack gap="$4" justifyContent="space-between">
      <Skeleton width="30%" height="$2" />
      <Skeleton width="30%" height="$2" />
    </HStack>

    {hasDescription ? (
      <HStack
        mt="$6"
        gap="$4"
        justifyContent="space-between"
        testID="description"
      >
        <Skeleton height="$4" />
      </HStack>
    ) : (
      <></>
    )}

    {[1, 2].map((i) => (
      <VStack mt="$6" key={i}>
        <HStack gap="$4" justifyContent="space-between" mb="$2">
          <Skeleton width="30%" height="$2" />
          <Skeleton width="30%" height="$2" />
        </HStack>

        <Skeleton width="100%" height="$3" />
        <HStack justifyContent="flex-end" mt="$2">
          <Skeleton width="40%" height="$3" />
        </HStack>
      </VStack>
    ))}
  </Box>
);

export default CardSkeleton;
