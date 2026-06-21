

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ComingSoon: undefined;
  ProfileSelection: {
    mobile: string;
    profiles: import('@/types').StudentProfile[];
  };
  setIsLoggedIn?: (v: boolean) => void;
};
export type {AuthStackParamList};
