import React, {useState, useEffect} from 'react';
import {FlatList, ListRenderItem} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import {
  Box,
  Text,
  VStack,
  StatusBar,
  Pressable,
  HStack,
  LoadingSpinner,
} from '../../components';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from '../../hooks/useTranslation';
import {DIMENSIONS} from '../../utils/styles';
import {useThemeColors} from '../../utils/colors';
import {useUserStore} from '../../stores';
import {eventsService} from '../../services/events-service';
import {EventItem as EventItemType} from '@/types';
import {usePermissions} from '../../hooks/usePermissions';

// ✅ Proper type for each item
interface EventItem {
  id: string;
  title: string;
}

const CARD_WIDTH = DIMENSIONS.cardWidth;

// ✅ Correctly typed Animated FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<EventItem>);

// ✅ Lottie map
const lottieMap: Record<string, any> = {
  'National Anthem': require('../../assets/lottie/nationalAnthem.json'),
  'Tongue Twister': require('../../assets/lottie/tongueTwister.json'),
  Singing: require('../../assets/lottie/singing.json'),
  Dancing: require('../../assets/lottie/dance.json'),
  'Movie dialogues': require('../../assets/lottie/movieDialogues.json'),
  'Comedy Act / Skit': require('../../assets/lottie/drama.json'),
  Shayari: require('../../assets/lottie/shayari.json'),
  Rhymes: require('../../assets/lottie/poems.json'),
  Poems: require('../../assets/lottie/poetryN.json'),
  Cooking: require('../../assets/lottie/cooking.json'),
  'Twins Act': require('../../assets/lottie/twinsAct.json'),
  'Any special Talent': require('../../assets/lottie/specialTalent.json'),
  'Mom and Kid Act': require('../../assets/lottie/momChild.json'),
  'Craft Making': require('../../assets/lottie/crafting.json'),
  'Kids group performance with teacher': require('../../assets/lottie/kidsTeacher.json'),
};

// ✅ Card component
const DashboardCard: React.FC<{
  item: EventItem;
  index: number;
  onPress: () => void;
  colors: any;
}> = ({item, index, onPress, colors}) => {
  const animated = useSharedValue(0);

  React.useEffect(() => {
    // Animate in with spring & stagger by index
    setTimeout(() => {
      animated.value = withSpring(1, {
        damping: 10,
        stiffness: 90,
      });
    }, index * 100);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animated.value,
    transform: [{scale: animated.value}],
  }));

  const lottieSource =
    lottieMap[item.title] || require('../../assets/lottie/grayButtonDots.json');

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        testID={`dashboard-event-card-${item.id}`}
        onPress={onPress}
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.accentAction,
          borderWidth: 2,
          borderRadius: DIMENSIONS.borderRadius.large,
          padding: DIMENSIONS.padding.sm,
          margin: DIMENSIONS.margin.sm,
          width: CARD_WIDTH,
          height: DIMENSIONS.cardHeight,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <LottieView
          testID={`dashboard-event-lottie-${item.id}`}
          source={lottieSource}
          autoPlay
          loop
          style={{width: 40, height: 40}}
        />
        <Text
          testID={`dashboard-event-title-${item.id}`}
          style={{
            color: colors.primaryText,
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          {item.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ✅ Dashboard screen
const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const colors = useThemeColors();
  const {user} = useUserStore();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const {requestEssentialPermissions} = usePermissions();
  const {t} = useTranslation();

  const handleEventPress = (event: EventItem) => {
    navigation.navigate('VideoUpload', {
      eventId: event.id,
      eventTitle: event.title,
    });
  };

  const handleSubscriptionPress = () => {
    navigation.navigate('Subscription');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Load events from mock service and check permissions
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // Check and request essential permissions
        await requestEssentialPermissions();

        // Load events
        const response = await eventsService.getEvents();

        if (response.success && response.data && response.data.data) {
          // Transform EventItemType to local EventItem
          const transformedEvents = response.data.data.map(
            (event: EventItemType) => ({
              id: event.id,
              title: event.title,
            }),
          );
          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback to static data if API fails
        setEvents([
          {id: 'event_001', title: 'National Anthem'},
          {id: 'event_002', title: 'Tongue Twister'},
          {id: 'event_003', title: 'Singing'},
          {id: 'event_004', title: 'Dancing'},
          {id: 'event_005', title: 'Movie Dialogues'},
        ]);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [requestEssentialPermissions]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    return 'User';
  };

  const renderItem: ListRenderItem<EventItem> = ({item, index}) => (
    <DashboardCard
      item={item}
      index={index}
      onPress={() => handleEventPress(item)}
      colors={colors}
    />
  );

  return (
    <VStack
      testID="dashboard-screen"
      flex={1}
      style={{backgroundColor: colors.primaryBackground}}
      pt="$10">
      <StatusBar
        testID="dashboard-status-bar"
        barStyle={
          colors.primaryBackground === '#FFFFFF'
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={colors.primaryBackground}
      />

      {/* Header with Greeting and Profile */}
      <HStack
        testID="dashboard-header"
        alignItems="center"
        justifyContent="space-between"
        px="$4"
        pb="$4"
        mb="$2">
        <VStack testID="dashboard-greeting" flex={1}>
          <Text
            testID="dashboard-greeting-text"
            style={{
              color: colors.mutedText,
              fontSize: 16,
              fontWeight: '500',
            }}>
            {getGreeting()}
          </Text>
          <Text
            testID="dashboard-user-name"
            style={{
              color: colors.primaryText,
              fontSize: 24,
              fontWeight: 'bold',
            }}>
            {getUserName()}!
          </Text>
        </VStack>
        <HStack space="sm" alignItems="center">
          <Pressable
            testID="dashboard-profile-button"
            onPress={handleProfilePress}
            p="$2"
            borderRadius="$full"
            style={{
              backgroundColor: colors.accentAction,
              width: 50,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {user?.profileImage ? (
              <Text
                testID="dashboard-profile-initial"
                style={{color: colors.white, fontSize: 20}}>
                {user.firstName?.charAt(0) || 'U'}
              </Text>
            ) : (
              <Text
                testID="dashboard-profile-icon"
                style={{color: colors.white, fontSize: 20}}>
                👤
              </Text>
            )}
          </Pressable>
        </HStack>
      </HStack>

      {/* Subscription Banner */}
      <Box
        testID="dashboard-subscription-banner"
        style={{
          backgroundColor: colors.cardBackground,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 16,
        }}>
        <HStack space="md" alignItems="center" justifyContent="space-between">
          <VStack testID="dashboard-subscription-content" flex={1}>
            <Text
              testID="dashboard-subscription-title"
              style={{
                color: colors.primaryText,
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              {t('dashboard.unlockPremium')}
            </Text>
            <Text
              testID="dashboard-subscription-description"
              style={{color: colors.mutedText, fontSize: 14}}>
              {t('dashboard.accessAllQuizzes')}
            </Text>
          </VStack>
          <Pressable
            testID="dashboard-subscription-button"
            onPress={handleSubscriptionPress}
            style={{
              backgroundColor: colors.accentAction,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}>
            <Text
              testID="dashboard-subscription-button-text"
              style={{color: colors.buttonText, fontWeight: 'bold'}}>
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
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={{paddingBottom: 20, paddingHorizontal: 10}}
        />
      )}
    </VStack>
  );
};

export default DashboardScreen;
