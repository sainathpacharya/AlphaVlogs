export const LEGAL_CONTACT = {
  supportEmail: 'support@alphavlogs.com',
  privacyEmail: 'privacy@alphavlogs.com',
  developerName: 'NSNR Technologies',
} as const;

/** Update these URLs after hosting the pages in docs/hosted/. */
export const LEGAL_URLS = {
  privacyPolicy: 'https://alphavlogs.com/privacy-policy',
  termsOfService: 'https://alphavlogs.com/terms',
  /** Apple's standard EULA — required for auto-renewable subscriptions (guideline 3.1.2). */
  termsOfUseEula:
    'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  deleteAccount: 'https://alphavlogs.com/delete-account',
} as const;
