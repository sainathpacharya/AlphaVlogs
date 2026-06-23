import {ABOUT_US_CONTENT} from '@/content/about-us';
import {PRIVACY_POLICY} from '@/content/legal/privacy-policy';
import {TERMS_AND_CONDITIONS} from '@/content/legal/terms-and-conditions';

describe('Content files', () => {
  describe('about-us.ts', () => {
    it('exports complete About Us content', () => {
      expect(ABOUT_US_CONTENT.appName).toBe('Alpha Vlogs');
      expect(ABOUT_US_CONTENT.tagline).toBeTruthy();
      expect(ABOUT_US_CONTENT.heroDescription).toBeTruthy();
      expect(ABOUT_US_CONTENT.missionTitle).toBe('Our Mission');
      expect(ABOUT_US_CONTENT.missionText).toBeTruthy();
      expect(ABOUT_US_CONTENT.highlights.length).toBeGreaterThan(0);
      expect(ABOUT_US_CONTENT.features.length).toBeGreaterThan(0);
      expect(ABOUT_US_CONTENT.contactEmail).toContain('@');
    });

    it('has valid highlight icons', () => {
      const validIcons = ['sparkles', 'target', 'video', 'shield', 'crown'];
      ABOUT_US_CONTENT.highlights.forEach(highlight => {
        expect(validIcons).toContain(highlight.icon);
        expect(highlight.title).toBeTruthy();
        expect(highlight.description).toBeTruthy();
      });
    });
  });

  describe('privacy-policy.ts', () => {
    it('exports valid privacy policy document', () => {
      expect(PRIVACY_POLICY.title).toBe('Privacy Policy');
      expect(PRIVACY_POLICY.lastUpdated).toBeTruthy();
      expect(PRIVACY_POLICY.intro).toBeTruthy();
      expect(PRIVACY_POLICY.sections.length).toBeGreaterThan(0);
    });

    it('has sections with titles and content', () => {
      PRIVACY_POLICY.sections.forEach(section => {
        expect(section.title).toBeTruthy();
        expect(
          (section.paragraphs?.length ?? 0) > 0 ||
            (section.bullets?.length ?? 0) > 0,
        ).toBe(true);
      });
    });
  });

  describe('terms-and-conditions.ts', () => {
    it('exports valid terms and conditions document', () => {
      expect(TERMS_AND_CONDITIONS.title).toBe('Terms and Conditions');
      expect(TERMS_AND_CONDITIONS.lastUpdated).toBeTruthy();
      expect(TERMS_AND_CONDITIONS.intro).toBeTruthy();
      expect(TERMS_AND_CONDITIONS.sections.length).toBeGreaterThan(0);
    });

    it('has sections with titles and content', () => {
      TERMS_AND_CONDITIONS.sections.forEach(section => {
        expect(section.title).toBeTruthy();
        expect(
          (section.paragraphs?.length ?? 0) > 0 ||
            (section.bullets?.length ?? 0) > 0,
        ).toBe(true);
      });
    });
  });
});
