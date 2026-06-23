/**
 * Shared Jest mocks for screen component tests.
 * Import this file as the first import in each screen test file.
 */

jest.mock('@/components', () => require('../__mocks__/components.js'));

jest.mock('@/components/AppLogoImage', () => {
  const React = require('react');
  const {Image} = require('react-native');
  return {
    AppLogoImage: (props: Record<string, unknown>) =>
      React.createElement(Image, props),
  };
});

jest.mock('@/components/InfoScreenLayout', () => {
  const React = require('react');
  const {View, Text, ScrollView} = require('react-native');
  return {
    InfoScreenLayout: ({
      children,
      testID,
      title,
    }: {
      children?: React.ReactNode;
      testID?: string;
      title?: string;
    }) =>
      React.createElement(
        View,
        {testID},
        title
          ? React.createElement(Text, {testID: `${testID}-title`}, title)
          : null,
        React.createElement(ScrollView, {testID: `${testID}-scroll`}, children),
      ),
  };
});

jest.mock('@/components/LegalDocumentBody', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return {
    LegalDocumentBody: ({
      document,
    }: {
      document: {intro: string; sections: Array<{title: string}>};
    }) =>
      React.createElement(
        View,
        {testID: 'legal-document-body'},
        React.createElement(Text, {testID: 'legal-document-intro'}, document.intro),
        ...document.sections.map((section, index) =>
          React.createElement(
            Text,
            {key: section.title, testID: `legal-section-${index}`},
            section.title,
          ),
        ),
      ),
  };
});

jest.mock('@/components/UserAvatar', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return {
    UserAvatar: ({
      testID,
      user,
    }: {
      testID?: string;
      user?: {firstName?: string};
    }) =>
      React.createElement(
        View,
        {testID},
        React.createElement(Text, {}, user?.firstName || 'Avatar'),
      ),
  };
});

jest.mock('@/components/DashboardEventCard', () => {
  const React = require('react');
  const {View, Text, Pressable} = require('react-native');
  return {
    DashboardEventRow: ({
      item,
      onPressItem,
      testID,
    }: {
      item: {id: string; title: string};
      onPressItem?: (item: {id: string; title: string}) => void;
      testID?: string;
    }) =>
      React.createElement(
        Pressable,
        {testID: testID || `dashboard-event-${item.id}`, onPress: () => onPressItem?.(item)},
        React.createElement(Text, {}, item.title),
      ),
  };
});

jest.mock('@/components/StudentProfileCard', () => {
  const React = require('react');
  const {Pressable, Text} = require('react-native');
  return {
    StudentProfileCardRow: ({
      testID,
      profile,
      onPressProfile,
      isLoading,
    }: {
      testID?: string;
      profile: {studentId: number; firstName: string; lastName?: string};
      onPressProfile?: (id: number) => void;
      isLoading?: boolean;
    }) =>
      React.createElement(
        Pressable,
        {
          testID,
          onPress: () => onPressProfile?.(profile.studentId),
          disabled: isLoading,
        },
        React.createElement(
          Text,
          {},
          `${profile.firstName} ${profile.lastName || ''}`.trim(),
        ),
      ),
  };
});

jest.mock('@/components/EventGifImage', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    EventGifImage: (props: Record<string, unknown>) =>
      React.createElement(View, {testID: 'event-gif-image', ...props}),
  };
});

jest.mock('@/components/GifPlayer', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, {testID: 'gif-player-component', ...props}),
  };
});

jest.mock('@/components/YouTubePlayer', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, {testID: 'youtube-player-component', ...props}),
  };
});

jest.mock('@/components/YouTubeUpload', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      React.createElement(View, {testID: 'youtube-upload-component', ...props}),
  };
});

jest.mock('@/assets/png/appLogo.png', () => 'appLogo.png');

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      replace: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      dispatch: jest.fn(),
    })),
    useRoute: jest.fn(() => ({
      key: 'test-route',
      name: 'Test',
      params: {},
    })),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
  SafeAreaView: ({children, ...props}: {children: React.ReactNode}) => {
    const React = require('react');
    const {View} = require('react-native');
    return React.createElement(View, props, children);
  },
  useSafeAreaInsets: jest.fn(() => ({top: 44, bottom: 34, left: 0, right: 0})),
}));

jest.mock('@/hooks', () => {
  const mountedRef = {current: true};
  return {
    useIsMounted: jest.fn(() => mountedRef),
  useEventsQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
  useSendOtpMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  })),
  useVerifyOtpMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  })),
  useSelectProfileMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue({success: true, data: {user: {firstName: 'Test'}}}),
    isPending: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  })),
  useStudentProfilesQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    isRefetching: false,
  })),
  useSwitchProfileMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  })),
  useDeleteAccountMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  })),
  useRegisterMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  })),
  };
});

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: {language: 'en'},
  })),
}));

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(() => ({
    permissions: {
      camera: {granted: true, blocked: false, unavailable: false},
      microphone: {granted: true, blocked: false, unavailable: false},
      photoLibrary: {granted: true, blocked: false, unavailable: false},
      storage: {granted: true, blocked: false, unavailable: false},
      location: {granted: false, blocked: false, unavailable: false},
      notifications: {granted: false, blocked: false, unavailable: false},
    },
    loading: false,
    requestPermission: jest.fn().mockResolvedValue(true),
    requestVideoUploadPermissions: jest.fn().mockResolvedValue(true),
    requestVideoRecordingPermissions: jest.fn().mockResolvedValue(true),
    requestEssentialPermissions: jest.fn().mockResolvedValue(true),
    refreshPermissions: jest.fn(),
    openSettings: jest.fn(),
    hasPermission: jest.fn(() => true),
    isPermissionBlocked: jest.fn(() => false),
    isPermissionUnavailable: jest.fn(() => false),
    getPermissionStatus: jest.fn(() => ({granted: true})),
    hasEssentialPermissions: jest.fn(() => true),
    hasVideoRecordingPermissions: jest.fn(() => true),
    hasVideoUploadPermissions: jest.fn(() => true),
    isIOS: true,
    isAndroid: false,
  })),
}));

jest.mock('@/stores', () => ({
  useUser: jest.fn(() => ({
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    mobile: '9876543210',
    isSubscribed: false,
  })),
  useUserStore: jest.fn((selector?: (state: Record<string, unknown>) => unknown) => {
    const state = {
      user: {id: '1', firstName: 'Test', lastName: 'User'},
      setUser: jest.fn(),
      setAuthenticated: jest.fn(),
      reset: jest.fn(),
    };
    return selector ? selector(state) : state;
  }),
  useTokens: jest.fn(() => ({
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh',
  })),
}));

jest.mock('@/stores/user-cached-store', () => ({
  useUserCachedStore: jest.fn(() => ({
    clearLocalSession: jest.fn(),
  })),
}));

jest.mock('@/services/subscription-service', () => ({
  subscriptionService: {
    isStudentSubscribed: jest.fn().mockResolvedValue(false),
    subscribe: jest.fn(),
    cancelSubscription: jest.fn(),
    getPaymentMethods: jest.fn().mockResolvedValue([]),
    getSubscriptionStatus: jest.fn().mockResolvedValue({isSubscribed: false}),
  },
}));

jest.mock('@/services/gif-service', () => ({
  gifService: {
    getGifs: jest.fn().mockResolvedValue([]),
    getCategories: jest.fn().mockResolvedValue([]),
    searchGifs: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@/services/youtube-service', () => ({
  youtubeService: {
    getVideos: jest.fn().mockResolvedValue([]),
    searchVideos: jest.fn().mockResolvedValue([]),
    getVideoDetails: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('@/services/video-service', () => ({
  videoService: {
    getUploadGuidelines: jest.fn().mockResolvedValue({
      maxDuration: 180,
      minDuration: 30,
      maxFileSize: 100,
      supportedFormats: ['mp4'],
    }),
    uploadVideo: jest.fn(),
  },
}));

jest.mock('@/services/mock-api', () => ({
  mockApiService: {
    login: jest.fn().mockResolvedValue({success: true, data: {user: {firstName: 'Test'}}}),
    getEvents: jest.fn().mockResolvedValue({success: true, data: {events: []}}),
    register: jest.fn().mockResolvedValue({success: true}),
  },
}));

jest.mock('@/services/mock-wrapper', () => ({
  MockWrapperService: {
    getStatus: jest.fn().mockReturnValue('mock'),
    isEnabled: jest.fn().mockReturnValue(true),
    isMockMode: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('@/services/i18n-service', () => ({
  i18n: {
    t: (key: string) => key,
    language: 'en',
  },
}));

jest.mock('@/services/payment-service', () => ({
  PaymentApiError: class PaymentApiError extends Error {},
}));

jest.mock('@/config/api-config', () => ({
  isMockMode: jest.fn(() => true),
  getApiBaseUrl: jest.fn(() => 'http://mock-api.test'),
}));

jest.mock('@/utils/platform', () => ({
  getAppVersion: jest.fn(() => '1.0.0'),
}));

jest.mock('@/utils/payment', () => ({
  canAccessPayment: jest.fn(() => false),
}));

jest.mock('@/utils/subscription', () => ({
  isSubscribedFromUser: jest.fn(() => false),
}));

jest.mock('@/utils/event-icons', () => ({
  getEventIcon: jest.fn(() => {
    const React = require('react');
    const {View} = require('react-native');
    return (props: Record<string, unknown>) =>
      React.createElement(View, {testID: 'event-icon', ...props});
  }),
}));

jest.mock('@/utils/dev-log', () => ({
  devLog: jest.fn(),
}));

jest.mock('@/utils/jwt', () => ({
  formatJwtSummary: jest.fn(() => 'mock-jwt-summary'),
}));

export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
};
