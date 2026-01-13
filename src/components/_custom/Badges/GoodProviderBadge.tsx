import { Box, Text } from '@/components';

const GoodProviderBadge = () => {
  return (
    <Box bg="$chGreen140" w={135} px="$3" py="$1" rounded="$md">
      <Text color="$chWhite" fontSize="$xs" fontWeight={500}>
        Good provider
      </Text>
    </Box>
  );
};
export default GoodProviderBadge;
