import {LegalDocumentContent} from '../types';

export const TERMS_AND_CONDITIONS: LegalDocumentContent = {
  title: 'Terms and Conditions',
  lastUpdated: 'May 23, 2026',
  intro:
    'Welcome to Alpha Vlogs. These Terms and Conditions govern your access to and use of our mobile application and related services. By creating an account or using the app, you agree to these terms.',
  sections: [
    {
      title: '1. Eligibility',
      paragraphs: [
        'Alpha Vlogs is designed for students participating in school-based creative events and competitions. You must provide accurate registration details and use a valid mobile number to access the app.',
      ],
      bullets: [
        'You must be authorized to use the mobile number registered on your account.',
        'Parents or guardians may assist younger students with account setup where required.',
        'You agree that the information you provide is true and kept up to date.',
      ],
    },
    {
      title: '2. Account and Authentication',
      paragraphs: [
        'Access to the app is provided through mobile OTP verification. You are responsible for maintaining the security of your device and account credentials.',
      ],
      bullets: [
        'Do not share OTP codes or login tokens with others.',
        'Notify us promptly if you suspect unauthorized access to your account.',
        'We may suspend or terminate accounts that violate these terms.',
      ],
    },
    {
      title: '3. Use of the Application',
      paragraphs: [
        'You may use Alpha Vlogs to browse events, participate in activities, upload permitted content, and access subscription features where available.',
      ],
      bullets: [
        'Use the app only for lawful and intended educational or creative purposes.',
        'Do not attempt to disrupt, reverse engineer, or misuse the platform.',
        'Do not upload harmful, abusive, obscene, or infringing content.',
        'Respect other students, schools, and event guidelines at all times.',
      ],
    },
    {
      title: '4. User Content and Submissions',
      paragraphs: [
        'When you upload videos, images, or other materials, you confirm that you have the right to share that content and that it complies with event rules and applicable laws.',
      ],
      bullets: [
        'You retain ownership of content you submit, subject to the license below.',
        'You grant Alpha Vlogs a limited license to store, display, process, and share your submissions for event participation, evaluation, and platform operation.',
        'We may remove content that violates policies, event rules, or legal requirements.',
      ],
    },
    {
      title: '5. Subscriptions and Payments',
      paragraphs: [
        'Some features may require an active subscription or approved payment method. Pricing, billing cycles, and benefits will be shown before purchase.',
      ],
      bullets: [
        'Subscription access is personal and non-transferable unless stated otherwise.',
        'Refunds, cancellations, and billing disputes are handled according to store policies and applicable law.',
        'We may modify subscription plans or pricing with reasonable notice where required.',
      ],
    },
    {
      title: '6. Intellectual Property',
      paragraphs: [
        'The Alpha Vlogs app, branding, software, design, and platform content are protected by intellectual property laws. You may not copy, modify, or distribute platform materials without permission.',
      ],
    },
    {
      title: '7. Privacy',
      paragraphs: [
        'Your use of the app is also governed by our Privacy Policy, which explains how we collect, use, and protect personal information.',
      ],
    },
    {
      title: '8. Disclaimers and Limitation of Liability',
      paragraphs: [
        'Alpha Vlogs is provided on an "as available" basis. We strive for reliable service but do not guarantee uninterrupted access or error-free operation.',
      ],
      bullets: [
        'We are not liable for indirect, incidental, or consequential damages to the extent permitted by law.',
        'Event outcomes, rankings, and third-party services may be subject to separate rules or providers.',
      ],
    },
    {
      title: '9. Changes to These Terms',
      paragraphs: [
        'We may update these Terms and Conditions from time to time. Material changes will be reflected in the app with an updated effective date. Continued use after changes constitutes acceptance of the revised terms.',
      ],
    },
    {
      title: '10. Contact',
      paragraphs: [
        'If you have questions about these Terms and Conditions, contact us at support@alphavlogs.com.',
      ],
    },
  ],
  footerNote:
    'These terms are provided for general application use. Organizations, schools, or event partners may apply additional rules for specific programs.',
};
