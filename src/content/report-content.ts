export const REPORT_CONTENT_COPY = {
  title: 'Report Content',
  intro:
    'If you see content that violates our community guidelines, event rules, or applicable laws, please report it. Our team reviews reports and may remove content or take action on accounts when necessary.',
  reasonsTitle: 'Reason for report',
  descriptionLabel: 'Describe the issue',
  descriptionPlaceholder:
    'Include what you saw, when it happened, and any relevant event or video details.',
  referenceLabel: 'Related event or content (optional)',
  referencePlaceholder: 'Event name, video title, or other reference',
  submitLabel: 'Send Report',
  emailFallback:
    'You can also email us directly if the report form does not open on your device.',
  moderationNote:
    'Reports are reviewed by our moderation team. We may contact you using your registered email or mobile number if we need more information.',
  reasons: [
    {id: 'inappropriate', label: 'Inappropriate or harmful content'},
    {id: 'harassment', label: 'Harassment or bullying'},
    {id: 'privacy', label: 'Privacy violation or personal information exposed'},
    {id: 'copyright', label: 'Copyright or ownership concern'},
    {id: 'spam', label: 'Spam or misleading content'},
    {id: 'other', label: 'Other policy violation'},
  ],
} as const;

export type ReportReasonId = (typeof REPORT_CONTENT_COPY.reasons)[number]['id'];
