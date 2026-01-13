export type AppStackParamList = {
    Dashboard: undefined;
    Profile: undefined;
    Quiz: undefined;
    Results: undefined;
    Subscription: undefined;
    VideoUpload: {
      eventId: string;
      eventTitle: string;
    };
    BadgePage: {
      header?: React.ReactElement;
      description?: string;
    };
    MockTest: undefined;
    Permissions: undefined;
  };
