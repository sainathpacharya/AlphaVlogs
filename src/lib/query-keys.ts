export const queryKeys = {
  events: {
    all: ['events'] as const,
    list: () => [...queryKeys.events.all, 'list'] as const,
  },
  auth: {
    all: ['auth'] as const,
    sendOtp: () => [...queryKeys.auth.all, 'send-otp'] as const,
    verifyOtp: () => [...queryKeys.auth.all, 'verify-otp'] as const,
    selectProfile: () => [...queryKeys.auth.all, 'select-profile'] as const,
    switchProfile: () => [...queryKeys.auth.all, 'switch-profile'] as const,
    profiles: () => [...queryKeys.auth.all, 'profiles'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    register: () => [...queryKeys.auth.all, 'register'] as const,
    logout: () => [...queryKeys.auth.all, 'logout'] as const,
    deleteAccount: () => [...queryKeys.auth.all, 'delete-account'] as const,
  },
} as const;
