import React from 'react';
import {Platform, Pressable as RNPressable, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Text, Box} from '@/components';
import {EventGifImage} from '@/components/EventGifImage';
import {getEventIcon} from '@/utils/event-icons';
import {DIMENSIONS} from '@/utils/styles';

export interface DashboardEventCardItem {
  id: string;
  iconId: string;
  title: string;
  gifUrl: string | null;
  isActive: boolean;
  canUpload: boolean;
  startDate: string;
  endDate: string;
  uploadStartDate: string;
  uploadEndDate: string;
}

export interface DashboardEventCardProps {
  item: DashboardEventCardItem;
  index: number;
  onPress: () => void;
  colors: Record<string, string>;
}

export interface DashboardEventRowProps {
  item: DashboardEventCardItem;
  index: number;
  onPressItem: (event: DashboardEventCardItem) => void;
  colors: Record<string, string>;
}

export const DashboardEventRow = React.memo(function DashboardEventRow({
  item,
  index,
  onPressItem,
  colors,
}: DashboardEventRowProps) {
  const onPress = React.useCallback(() => onPressItem(item), [onPressItem, item]);

  return (
    <DashboardEventCard
      item={item}
      index={index}
      onPress={onPress}
      colors={colors}
    />
  );
});

const CARD_WIDTH = DIMENSIONS.cardWidth;
const CARD_HEIGHT = DIMENSIONS.cardHeight;
const MEDIA_HEIGHT = DIMENSIONS.cardMediaHeight;
const MEDIA_PADDING = 8;

export const DashboardEventCard: React.FC<DashboardEventCardProps> = React.memo(
  ({item, index, onPress, colors}) => {
    const animated = useSharedValue(index < 8 ? 0 : 1);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const EventIcon = getEventIcon(item.iconId);
    const mediaBg = colors.accentBackground ?? '#E8F4FD';

    React.useEffect(() => {
      if (index >= 8) {
        animated.value = 1;
        return undefined;
      }

      animated.value = 0;
      timeoutRef.current = setTimeout(() => {
        animated.value = withSpring(1, {damping: 12, stiffness: 100});
      }, index * 60);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [item.id, index, animated]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: animated.value,
      transform: [{scale: 0.92 + animated.value * 0.08}],
    }));

    const gifWidth = CARD_WIDTH - MEDIA_PADDING * 2 - 2;
    const gifHeight = MEDIA_HEIGHT - MEDIA_PADDING * 2;

    return (
      <Animated.View collapsable={false} style={[styles.cardWrap, animatedStyle]}>
        <RNPressable
          testID={`dashboard-event-card-${item.id}`}
          onPress={onPress}
          android_ripple={{color: 'rgba(0, 122, 255, 0.12)'}}
          style={({pressed}) => [
            styles.card,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              opacity: pressed ? 0.92 : 1,
            },
            Platform.select({
              ios: {
                shadowColor: colors.shadow ?? '#000',
              },
              android: {elevation: pressed ? 2 : 4},
            }),
          ]}>
          <View
            style={[
              styles.mediaFrame,
              {
                backgroundColor: mediaBg,
                borderColor: colors.border,
              },
            ]}>
            <EventGifImage
              gifUrl={item.gifUrl}
              FallbackIcon={EventIcon}
              width={gifWidth}
              height={gifHeight}
              color={colors.accentAction ?? '#007AFF'}
              backgroundColor={mediaBg}
              borderRadius={12}
              testID={`dashboard-event-icon-${item.id}`}
            />
          </View>

          <Box style={styles.titleWrap}>
            <Text
              testID={`dashboard-event-title-${item.id}`}
              numberOfLines={2}
              style={[styles.title, {color: colors.primaryText}]}>
              {item.title}
            </Text>
          </Box>
        </RNPressable>
      </Animated.View>
    );
  },
);

DashboardEventCard.displayName = 'DashboardEventCard';

const styles = StyleSheet.create({
  cardWrap: {
    width: CARD_WIDTH,
    marginHorizontal: DIMENSIONS.margin.sm,
    marginBottom: DIMENSIONS.margin.md,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
    overflow: 'hidden',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  mediaFrame: {
    height: MEDIA_HEIGHT,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: MEDIA_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titleWrap: {
    minHeight: 44,
    paddingTop: 10,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.15,
  },
});

export default DashboardEventCard;
