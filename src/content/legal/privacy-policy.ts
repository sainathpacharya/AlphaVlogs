import {LegalDocumentContent} from '../types';

export const PRIVACY_POLICY: LegalDocumentContent = {
  title: 'Privacy Policy',
  lastUpdated: 'May 23, 2026',
  intro:
    'Alpha Vlogs respects your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices available to you when you use our mobile application.',
  sections: [
    {
      title: '1. Information We Collect',
      paragraphs: ['We collect information necessary to operate the app and provide student services.'],
      bullets: [
        'Account details such as name, mobile number, email address, and school-related information.',
        'Authentication data including OTP verification records and session tokens.',
        'Profile and participation data such as event selections, submissions, and subscription status.',
        'Uploaded content including videos and related metadata submitted for events.',
        'Device and usage information such as app version, device type, and basic diagnostic logs.',
      ],
    },
    {
      title: '2. How We Use Information',
      paragraphs: ['We use personal information for legitimate platform purposes, including:'],
      bullets: [
        'Creating and securing your account through OTP login.',
        'Enabling event discovery, participation, and content submissions.',
        'Managing subscriptions and premium feature access.',
        'Communicating service updates, support responses, and important notices.',
        'Improving app performance, security, and user experience.',
        'Complying with legal obligations and enforcing our policies.',
      ],
    },
    {
      title: '3. Legal Basis and Consent',
      paragraphs: [
        'We process information based on your use of the app, consent where required, contractual necessity to provide services, and legitimate interests such as security and product improvement.',
      ],
    },
    {
      title: '4. Sharing of Information',
      paragraphs: [
        'We do not sell personal information. We may share limited data only when necessary:',
      ],
      bullets: [
        'With schools, event organizers, or partners involved in programs you join.',
        'With service providers that help us host, secure, or operate the platform.',
        'When required by law, regulation, court order, or to protect users and the service.',
        'With your consent or at your direction.',
      ],
    },
    {
      title: '5. Data Retention',
      paragraphs: [
        'We retain information for as long as needed to provide services, meet legal requirements, resolve disputes, and enforce agreements. When data is no longer required, we delete or anonymize it where feasible.',
      ],
    },
    {
      title: '6. Security',
      paragraphs: [
        'We use reasonable technical and organizational safeguards to protect personal information, including encrypted transport (HTTPS) for API communication and access controls on backend systems.',
      ],
      bullets: [
        'No method of transmission or storage is completely secure.',
        'Please protect your device and avoid sharing OTP codes or account access.',
      ],
    },
    {
      title: '7. Children and Student Privacy',
      paragraphs: [
        'Alpha Vlogs is intended for student participation, often with school or parental involvement. We collect only information needed for platform use and event participation.',
      ],
      bullets: [
        'Parents or guardians may contact us regarding a student account.',
        'We encourage responsible use and supervision for younger users.',
      ],
    },
    {
      title: '8. Your Choices and Rights',
      paragraphs: ['Depending on applicable law, you may have rights to:'],
      bullets: [
        'Access or update profile information within the app.',
        'Request correction or deletion of personal data.',
        'Withdraw consent where processing is consent-based.',
        'Raise concerns about how your information is handled.',
      ],
    },
    {
      title: '9. Third-Party Services',
      paragraphs: [
        'The app may link to or integrate with third-party payment, media, or platform services. Those services have their own privacy policies, and we encourage you to review them.',
      ],
    },
    {
      title: '10. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. Updates will be posted in the app with a revised effective date. Continued use after changes means you accept the updated policy.',
      ],
    },
    {
      title: '11. Contact Us',
      paragraphs: [
        'For privacy questions or requests, contact us at privacy@alphavlogs.com.',
      ],
    },
  ],
  footerNote:
    'This policy describes Alpha Vlogs app practices. Schools or event partners may have separate privacy notices for their programs.',
};
