import React, {useState, useEffect, useCallback} from 'react';
import {Alert, FlatList, ListRenderItem, Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import {
  Box,
  Text,
  VStack,
  Pressable,
  HStack,
  LoadingSpinner,
  UserAvatar,
} from '../../components';
import {DashboardEventCard, DashboardEventCardItem} from '../../components/DashboardEventCard';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from '../../hooks/useTranslation';
import {useThemeColors} from '../../utils/colors';
import {useUserStore} from '../../stores';
import {eventsService} from '../../services/events-service';
import {resolveDashboardEventId} from '../../utils/event-icons';
import {resolveEventGifUrl} from '../../utils/event-media';
import {subscriptionService} from '../../services/subscription-service';

const SUBSCRIBERS_ONLY_MESSAGE =
  'This feature is only for subscribed students only.';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<DashboardEventCardItem>);

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const {user} = useUserStore();
  const [events, setEvents] = useState<DashboardEventCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const {t} = useTranslation();

  const handleEventPress = useCallback(
    async (event: DashboardEventCardItem) => {
      try {
        const subscribed = await subscriptionService.isStudentSubscribed(user);
        if (subscribed) {
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
      } catch (error) {
        if (__DEV__) {
          console.error('Subscription check failed:', error);
        }
        Alert.alert('Subscription required', SUBSCRIBERS_ONLY_MESSAGE, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ComingSoon'),
          },
        ]);
      }
    },
    [navigation, user],
  );

  const handleSubscriptionPress = useCallback(() => {
    navigation.navigate('Subscription');
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setEventsError(null);

        const response = await eventsService.getEvents();
        const list = response.data?.data;

        if (response.success && Array.isArray(list) && list.length > 0) {
          setEvents(
            list.map((event) => ({
              id: String(event.id),
              iconId: resolveDashboardEventId({
                id: event.id,
                title: event.title,
              }),
              title: event.title,
              gifUrl: resolveEventGifUrl(event.eventGif),
            })),
          );
        } else if (response.success && Array.isArray(list) && list.length === 0) {
          setEvents([]);
          setEventsError('No events available for your account.');
        } else {
          setEvents([]);
          setEventsError(
            response.error ||
              response.message ||
              'Failed to load events. Please log in again.',
          );
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading events:', error);
        }
        setEvents([]);
        setEventsError('Unable to load events. Pull to refresh or try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    }
    if (hour < 17) {
      return 'Good Afternoon';
    }
    return 'Good Evening';
  };

  const getUserName = () => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    return 'User';
  };

  const renderItem = useCallback<ListRenderItem<DashboardEventCardItem>>(
    ({item, index}) => (
      <DashboardEventCard
        item={item}
        index={index}
        onPress={() => handleEventPress(item)}
        colors={colors}
      />
    ),
    [handleEventPress, colors],
  );

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
            {getGreeting()}
          </Text>
          <Text
            testID="dashboard-user-name"
            style={{
              color: colors.primaryText,
              fontSize: 22,
              fontWeight: '700',
              letterSpacing: -0.3,
            }}>
            {getUserName()}!
          </Text>
        </VStack>
        <Pressable
          testID="dashboard-profile-button"
          onPress={handleProfilePress}
          enableRipple={false}>
          <UserAvatar user={user} size="md" testID="dashboard-profile-icon" />
        </Pressable>
      </HStack>

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

      {loading ? (
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
        <AnimatedFlatList
          testID="dashboard-events-list"
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          style={{flex: 1}}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'ios'}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 8,
            flexGrow: 1,
          }}
          columnWrapperStyle={events.length > 0 ? {justifyContent: 'space-between'} : undefined}
          ListEmptyComponent={
            <VStack flex={1} alignItems="center" justifyContent="center" py="$8" px="$4">
              <Text style={{color: colors.mutedText, textAlign: 'center', fontSize: 15}}>
                {eventsError || 'No events available right now.'}
              </Text>
            </VStack>
          }
        />
      )}
    </VStack>
  );
};

export default DashboardScreen;
