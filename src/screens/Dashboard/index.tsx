import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, FlatList, ListRenderItem, Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Box,
  Text,
  VStack,
  Pressable,
  HStack,
  LoadingSpinner,
  UserAvatar,
} from '../../components';
import {
  DashboardEventCard,
  DashboardEventCardItem,
  DashboardEventRow,
} from '../../components/DashboardEventCard';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from '../../hooks/useTranslation';
import {useEventsQuery} from '../../hooks';
import {useThemeColors} from '../../utils/colors';
import {useUser} from '../../stores';
import {subscriptionService} from '../../services/subscription-service';
import {canAccessPayment} from '../../utils/payment';
import {isSubscribedFromUser} from '../../utils/subscription';
import {DIMENSIONS} from '../../utils/styles';

const SUBSCRIBERS_ONLY_MESSAGE =
  'This feature is only for subscribed students only.';

const EVENT_ROW_HEIGHT = DIMENSIONS.cardHeight + DIMENSIONS.margin.md;

const DashboardEmptyList = React.memo(function DashboardEmptyList({
  message,
  color,
}: {
  message: string;
  color: string;
}) {
  return (
    <VStack flex={1} alignItems="center" justifyContent="center" py="$8" px="$4">
      <Text style={{color, textAlign: 'center', fontSize: 15}}>{message}</Text>
    </VStack>
  );
});

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const {t} = useTranslation();
  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useEventsQuery();
  const [isSubscribed, setIsSubscribed] = useState(
    () => isSubscribedFromUser(user) || user?.isSubscribed === true,
  );

  const eventsError = isError
    ? error instanceof Error
      ? error.message
      : 'Unable to load events. Please try again later.'
    : null;

  const handleEventPress = useCallback(
    (event: DashboardEventCardItem) => {
      if (isSubscribed) {
        navigation.navigate('VideoUpload', {
          eventId: event.id,
          eventTitle: event.title,
          iconId: event.iconId,
          eventGifUrl: event.gifUrl ?? undefined,
        });
        return;
      }

      Alert.alert('Subscription required', SUBSCRIBERS_ONLY_MESSAGE, [
        {
          text: 'Subscribe',
          onPress: () => navigation.navigate('Subscription'),
        },
        {
          text: 'OK',
          onPress: () => navigation.navigate('ComingSoon'),
        },
      ]);
    },
    [navigation, isSubscribed],
  );

  const handleSubscriptionPress = useCallback(() => {
    navigation.navigate('Subscription');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;

    const checkSubscription = async () => {
      if (!canAccessPayment(user)) {
        return;
      }
      try {
        const subscribed = await subscriptionService.isStudentSubscribed(user);
        if (!cancelled) {
          setIsSubscribed(subscribed);
        }
      } catch {
        if (!cancelled) {
          setIsSubscribed(isSubscribedFromUser(user));
        }
      }
    };

    checkSubscription();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    }
    if (hour < 17) {
      return 'Good Afternoon';
    }
    return 'Good Evening';
  }, []);

  const userName = useMemo(() => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    return 'User';
  }, [user?.firstName, user?.lastName]);

  const renderItem = useCallback<ListRenderItem<DashboardEventCardItem>>(
    ({item, index}) => (
      <DashboardEventRow
        item={item}
        index={index}
        onPressItem={handleEventPress}
        colors={colors}
      />
    ),
    [handleEventPress, colors],
  );

  const listContentStyle = useMemo(
    () => ({
      paddingBottom: insets.bottom + 24,
      paddingHorizontal: 8,
      flexGrow: 1 as const,
    }),
    [insets.bottom],
  );

  const columnWrapperStyle = useMemo(
    () => (events.length > 0 ? {justifyContent: 'space-between' as const} : undefined),
    [events.length],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<DashboardEventCardItem> | null | undefined, index: number) => ({
      length: EVENT_ROW_HEIGHT,
      offset: EVENT_ROW_HEIGHT * Math.floor(index / 2),
      index,
    }),
    [],
  );

  const emptyMessage = eventsError || 'No events available right now.';
  const showInitialLoading = isLoading && events.length === 0;

  return (
    <VStack
      testID="dashboard-screen"
      flex={1}
      style={{
        backgroundColor: colors.secondaryBackground ?? colors.primaryBackground,
        paddingTop: insets.top + 4,
      }}>
      <HStack
        testID="dashboard-header"
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        pb="$3"
        mb="$1">
        <VStack testID="dashboard-greeting" flex={1}>
          <Text
            testID="dashboard-greeting-text"
            style={{
              color: colors.mutedText,
              fontSize: 15,
              fontWeight: '500',
            }}>
            {greeting}
          </Text>
          <Text
            testID="dashboard-user-name"
            style={{
              color: colors.primaryText,
              fontSize: 22,
              fontWeight: '700',
              letterSpacing: -0.3,
            }}>
            {userName}!
          </Text>
        </VStack>
        <Pressable
          testID="dashboard-profile-button"
          onPress={handleProfilePress}
          enableRipple={false}>
          <UserAvatar user={user} size="md" testID="dashboard-profile-icon" />
        </Pressable>
      </HStack>

      {canAccessPayment(user) && !isSubscribed && (
        <Box
          testID="dashboard-subscription-banner"
          mx="$4"
          mb="$3"
          style={{
            backgroundColor: colors.cardBackground,
            padding: 14,
            borderRadius: 14,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.06,
                shadowRadius: 8,
              },
              android: {elevation: 2},
            }),
          }}>
          <HStack space="md" alignItems="center" justifyContent="space-between">
            <VStack testID="dashboard-subscription-content" flex={1}>
              <Text
                testID="dashboard-subscription-title"
                style={{
                  color: colors.primaryText,
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                {t('dashboard.unlockPremium')}
              </Text>
              <Text
                testID="dashboard-subscription-description"
                style={{color: colors.mutedText, fontSize: 13, marginTop: 2}}>
                {t('dashboard.accessAllQuizzes')}
              </Text>
            </VStack>
            <Pressable
              testID="dashboard-subscription-button"
              onPress={handleSubscriptionPress}
              style={{
                backgroundColor: colors.subscriptionCta ?? '#EA580C',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                alignSelf: 'center',
                flexShrink: 0,
                marginLeft: 8,
              }}>
              <Text
                testID="dashboard-subscription-button-text"
                style={{
                  color: colors.subscriptionCtaText ?? colors.white,
                  fontWeight: '700',
                  fontSize: 12,
                }}>
                {t('dashboard.subscribe')}
              </Text>
            </Pressable>
          </HStack>
        </Box>
      )}

      {showInitialLoading ? (
        <VStack
          testID="dashboard-loading"
          flex={1}
          justifyContent="center"
          alignItems="center">
          <LoadingSpinner
            testID="dashboard-loading-spinner"
            size={40}
            color={colors.accentAction}
          />
          <Text
            testID="dashboard-loading-text"
            style={{color: colors.mutedText, marginTop: 16}}>
            Loading events...
          </Text>
        </VStack>
      ) : (
        <FlatList
          testID="dashboard-events-list"
          data={events}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          style={{flex: 1}}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={getItemLayout}
          contentContainerStyle={listContentStyle}
          columnWrapperStyle={columnWrapperStyle}
          ListEmptyComponent={
            <DashboardEmptyList message={emptyMessage} color={colors.mutedText} />
          }
        />
      )}
    </VStack>
  );
};

export default DashboardScreen;
