import React from 'react';
import {Image, Linking} from 'react-native';
import {
  Crown,
  LucideIcon,
  Shield,
  Sparkles,
  Target,
  Video,
} from 'lucide-react-native';
import {Box, Pressable, Text, VStack} from '@/components';
import {InfoScreenLayout} from '@/components/InfoScreenLayout';
import {ABOUT_US_CONTENT} from '@/content';
import {AboutUsIconKey} from '@/content/types';
import {APP_CONFIG} from '@/constants';
import {getAppVersion} from '@/utils/platform';
import {useThemeColors} from '@/utils/colors';
import appLogo from '@/assets/png/appLogo.png';

const HIGHLIGHT_ICONS: Record<AboutUsIconKey, LucideIcon> = {
  sparkles: Sparkles,
  target: Target,
  video: Video,
  shield: Shield,
  crown: Crown,
};

const AboutUsScreen = () => {
  const colors = useThemeColors();
  const content = ABOUT_US_CONTENT;
  const version = getAppVersion() || APP_CONFIG.version;

  const cardStyle = {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border || 'rgba(0,0,0,0.08)',
  } as const;

  return (
    <InfoScreenLayout testID="about-us-screen" title="About Us">
      <VStack space="lg">
        <VStack alignItems="center" space="md" style={[cardStyle, {paddingVertical: 28}]}>
          <Image
            source={appLogo}
            style={{width: 96, height: 96}}
            resizeMode="contain"
          />
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 26,
              fontWeight: '800',
              letterSpacing: -0.5,
            }}>
            {content.appName}
          </Text>
          <Text
            style={{
              color: colors.accentAction,
              fontSize: 15,
              fontWeight: '600',
              textAlign: 'center',
            }}>
            {content.tagline}
          </Text>
          <Text
            style={{
              color: colors.secondaryText ?? colors.mutedText,
              fontSize: 15,
              lineHeight: 24,
              textAlign: 'center',
            }}>
            {content.heroDescription}
          </Text>
        </VStack>

        <VStack space="sm" style={cardStyle}>
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 18,
              fontWeight: '700',
            }}>
            {content.missionTitle}
          </Text>
          <Text
            style={{
              color: colors.secondaryText ?? colors.mutedText,
              fontSize: 15,
              lineHeight: 24,
            }}>
            {content.missionText}
          </Text>
        </VStack>

        {content.highlights.map((item) => {
          const Icon = HIGHLIGHT_ICONS[item.icon];
          return (
            <VStack key={item.title} space="sm" style={cardStyle}>
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.accentBackground ?? 'rgba(0,122,255,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon size={22} color={colors.accentAction} strokeWidth={2} />
              </Box>
              <Text
                style={{
                  color: colors.primaryText,
                  fontSize: 17,
                  fontWeight: '700',
                }}>
                {item.title}
              </Text>
              <Text
                style={{
                  color: colors.secondaryText ?? colors.mutedText,
                  fontSize: 15,
                  lineHeight: 23,
                }}>
                {item.description}
              </Text>
            </VStack>
          );
        })}

        <VStack space="md" style={cardStyle}>
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 18,
              fontWeight: '700',
            }}>
            {content.featuresTitle}
          </Text>
          {content.features.map((feature) => (
            <Text
              key={feature}
              style={{
                color: colors.secondaryText ?? colors.mutedText,
                fontSize: 15,
                lineHeight: 23,
              }}>
              {'\u2713'} {feature}
            </Text>
          ))}
        </VStack>

        <VStack space="sm" style={cardStyle}>
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 18,
              fontWeight: '700',
            }}>
            {content.trustTitle}
          </Text>
          <Text
            style={{
              color: colors.secondaryText ?? colors.mutedText,
              fontSize: 15,
              lineHeight: 24,
            }}>
            {content.trustText}
          </Text>
        </VStack>

        <VStack space="sm" style={[cardStyle, {alignItems: 'center'}]}>
          <Text
            style={{
              color: colors.primaryText,
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
            }}>
            {content.contactLabel}
          </Text>
          <Pressable onPress={() => Linking.openURL(`mailto:${content.contactEmail}`)}>
            <Text
              style={{
                color: colors.accentAction,
                fontSize: 15,
                fontWeight: '600',
              }}>
              {content.contactEmail}
            </Text>
          </Pressable>
          <Text style={{color: colors.mutedText, fontSize: 12, marginTop: 8}}>
            Version {version}
          </Text>
        </VStack>
      </VStack>
    </InfoScreenLayout>
  );
};

export default AboutUsScreen;
