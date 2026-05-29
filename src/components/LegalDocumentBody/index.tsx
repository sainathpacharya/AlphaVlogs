import React from 'react';
import {Text, VStack} from '@/components';
import {LegalDocumentContent} from '@/content/types';
import {useThemeColors} from '@/utils/colors';

interface LegalDocumentBodyProps {
  document: LegalDocumentContent;
}

export function LegalDocumentBody({document}: LegalDocumentBodyProps) {
  const colors = useThemeColors();

  return (
    <VStack space="lg">
      <VStack
        space="sm"
        style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border || 'rgba(0,0,0,0.08)',
        }}>
        <Text
          style={{
            color: colors.mutedText,
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}>
          Last updated · {document.lastUpdated}
        </Text>
        <Text
          style={{
            color: colors.primaryText,
            fontSize: 15,
            lineHeight: 24,
          }}>
          {document.intro}
        </Text>
      </VStack>

      {document.sections.map((section) => (
        <VStack
          key={section.title}
          space="sm"
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.border || 'rgba(0,0,0,0.08)',
          }}>
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 17,
              fontWeight: '700',
              lineHeight: 24,
            }}>
            {section.title}
          </Text>

          {section.paragraphs?.map((paragraph) => (
            <Text
              key={paragraph}
              style={{
                color: colors.secondaryText ?? colors.mutedText,
                fontSize: 15,
                lineHeight: 24,
              }}>
              {paragraph}
            </Text>
          ))}

          {section.bullets?.map((bullet) => (
            <Text
              key={bullet}
              style={{
                color: colors.secondaryText ?? colors.mutedText,
                fontSize: 15,
                lineHeight: 24,
                paddingLeft: 4,
              }}>
              {'\u2022'} {bullet}
            </Text>
          ))}
        </VStack>
      ))}

      {document.footerNote ? (
        <Text
          style={{
            color: colors.mutedText,
            fontSize: 13,
            lineHeight: 20,
            fontStyle: 'italic',
            paddingHorizontal: 4,
          }}>
          {document.footerNote}
        </Text>
      ) : null}
    </VStack>
  );
}
