import React from 'react';
import {InfoScreenLayout} from '@/components/InfoScreenLayout';
import {LegalDocumentBody} from '@/components/LegalDocumentBody';
import {TERMS_AND_CONDITIONS} from '@/content';

const TermsAndConditionsScreen = () => (
  <InfoScreenLayout
    testID="terms-screen"
    title={TERMS_AND_CONDITIONS.title}>
    <LegalDocumentBody document={TERMS_AND_CONDITIONS} />
  </InfoScreenLayout>
);

export default TermsAndConditionsScreen;
