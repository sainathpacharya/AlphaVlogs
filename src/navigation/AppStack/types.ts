export type AppStackParamList = {
    Dashboard: undefined;
    Profile: undefined;
    SwitchProfile: undefined;
    Quiz: undefined;
    Results: undefined;
    Subscription: undefined;
    VideoUpload: {
      eventId: string;
      eventTitle: string;
      iconId?: string;
      eventGifUrl?: string;
      isActive?: boolean;
      canUpload?: boolean;
      startDate?: string;
      endDate?: string;
      uploadStartDate?: string;
      uploadEndDate?: string;
    };
    ComingSoon: undefined;
    AboutUs: undefined;
    TermsAndConditions: undefined;
    PrivacyPolicy: undefined;
    MockTest: undefined;
    Permissions: undefined;
  };
