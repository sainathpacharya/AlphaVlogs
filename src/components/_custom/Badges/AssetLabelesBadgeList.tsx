import { Box, HStack, Text, VStack } from '@/components';
import { IProviderGroup } from '@/types/provider-groups-metadata';
import IconDLS from '../Icon';
import { TIconList } from '../Icon/type';

interface IAssetLabelsBadgeListProps {
  asset?: IProviderGroup['asset'];
  labelFilter?: string[];
  fontSize?: any;
  fontWeight?: any;
}
const AssetLabelsBadgeList = (props: IAssetLabelsBadgeListProps) => {
  const { asset, labelFilter, fontSize = '$md', fontWeight = 500 } = props;

  return (
    <VStack gap="$3">
      {asset?.labels
        .filter((label) =>
          labelFilter?.length
            ? label.type.some((type) => labelFilter?.includes(type))
            : false
        )
        .map((label) => (
          <HStack
            w={250}
            py="$1"
            rounded="$md"
            alignItems="center"
            gap="$1"
            key={label.text}
          >
            <Box accessible accessibilityRole="image">
              <IconDLS icon={label.icon as TIconList} props={{ size: 18 }} />
            </Box>

            <Text
              accessibilityLabel={label.text}
              accessibilityRole="text"
              fontSize={fontSize}
              fontWeight={fontWeight}
              mr="$2"
            >
              {label.text}
            </Text>
          </HStack>
        ))}
    </VStack>
  );
};
export default AssetLabelsBadgeList;
