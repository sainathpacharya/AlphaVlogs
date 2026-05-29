import React from 'react';
import {InfoScreenLayout} from '@/components/InfoScreenLayout';
import {LegalDocumentBody} from '@/components/LegalDocumentBody';
import {PRIVACY_POLICY} from '@/content';

const PrivacyPolicyScreen = () => (
  <InfoScreenLayout testID="privacy-screen" title={PRIVACY_POLICY.title}>
    <LegalDocumentBody document={PRIVACY_POLICY} />
  </InfoScreenLayout>
);

export default PrivacyPolicyScreen;
