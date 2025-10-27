import ChevronRight from '@/assets/icons/ChevronRight';
import {Box, HStack, Text, VStack, RippleEffect} from '@/components';
import {cleanHtml} from '@/utils/formats';
import {FC, ReactNode} from 'react';
import {DimensionValue, TouchableOpacity} from 'react-native';

export interface ListItemProps {
  label: string;
  description?: string;
  icon?: ReactNode;
  arrow?: boolean;
  contentAlignment?: 'flex-start' | 'center' | 'flex-end';
  action?: () => void;
  contentRight?: string | ReactNode;
  testID?: string;
  accessibilityLabel?: string;
}

interface ListProps {
  items: ListItemProps[];
  arrow?: boolean;
  titleFontSize?:
    | (number & {})
    | '$xs'
    | '$sm'
    | '$md'
    | '$lg'
    | '$xl'
    | '$2xl'
    | '$3xl'
    | '$2xs'
    | '$4xl'
    | '$5xl'
    | '$6xl'
    | '$7xl'
    | '$8xl'
    | '$9xl';
  paddingVertical?: string;
  descLines?: number;
  fullDesc?: boolean;
  titleWeight?: '$regular' | '$medium' | '$bold' | number;
}

const List: FC<ListProps> = ({
  items,
  arrow = true,
  titleFontSize = '$md',
  paddingVertical = '$5',
  descLines = 2,
  fullDesc = false,
  titleWeight = '$medium',
}) => {
  const renderItemContent = (item: ListItemProps, index: number) => (
    <VStack
      py={paddingVertical as DimensionValue}
      borderBottomColor="$chGray040"
      borderBottomWidth={index === items?.length - 1 ? '$0' : '$1'}
      gap="$2">
      <HStack justifyContent="space-between" alignItems="center" gap="$4">
        {item.icon && <Box paddingVertical="$3">{item.icon}</Box>}
        <VStack gap="$2" flex={1}>
          <Text
            fontSize={titleFontSize}
            fontWeight={titleWeight}
            lineHeight={titleFontSize}>
            {item.label}
          </Text>
          {item.description && !fullDesc && (
            <Text
              fontSize="$sm"
              fontWeight={400}
              color="$chBlack100"
              numberOfLines={descLines}>
              {cleanHtml(item.description)}
            </Text>
          )}
        </VStack>
        {arrow || item.arrow ? (
          <ChevronRight />
        ) : item.contentRight && typeof item.contentRight === 'string' ? (
          <Text
            fontWeight={500}
            alignSelf={item.contentAlignment || 'flex-start'}
            fontSize="$md">
            {item.contentRight}
          </Text>
        ) : (
          item.contentRight
        )}
      </HStack>

      {item.description && fullDesc && (
        <Text
          fontSize="$sm"
          fontWeight={400}
          color="$chBlack100"
          numberOfLines={descLines}>
          {cleanHtml(item.description)}
        </Text>
      )}
    </VStack>
  );

  return (
    <VStack style={{width: '100%'}}>
      {items.map((item, key) =>
        item.action !== undefined ? (
          <RippleEffect
            key={`list_item_${key}`}
            onPress={item.action}
            testID={item?.testID}
            accessibilityLabel={item.accessibilityLabel}
            accessibilityRole="button"
            rippleColor="rgba(0, 0, 0, 0.1)"
            rippleOpacity={0.2}
            rippleDuration={200}>
            <TouchableOpacity
              onPress={item.action}
              testID={item?.testID}
              accessibilityLabel={item.accessibilityLabel}
              accessibilityRole="button"
              style={{flex: 1}}>
              {renderItemContent(item, key)}
            </TouchableOpacity>
          </RippleEffect>
        ) : (
          <VStack
            key={`list_item_${key}`}
            testID={item.testID}
            accessible
            accessibilityLabel={
              item.accessibilityLabel ||
              `${item.label} ${item.description} ${typeof item.contentRight === 'string' ? `, ${item.contentRight}` : ''}`
            }
            accessibilityRole="text">
            {renderItemContent(item, key)}
          </VStack>
        ),
      )}
    </VStack>
  );
};

export default List;
