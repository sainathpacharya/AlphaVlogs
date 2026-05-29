export type AppStackParamList = {
    Dashboard: undefined;
    Profile: undefined;
    Quiz: undefined;
    Results: undefined;
    Subscription: undefined;
    VideoUpload: {
      eventId: string;
      eventTitle: string;
      iconId?: string;
      eventGifUrl?: string;
    };
    ComingSoon: undefined;
    AboutUs: undefined;
    TermsAndConditions: undefined;
    PrivacyPolicy: undefined;
    BadgePage: {
      header?: React.ReactElement;
      description?: string;
    };
    MockTest: undefined;
    Permissions: undefined;
  };
