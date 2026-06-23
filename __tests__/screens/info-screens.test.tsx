import './setupScreenMocks';
import React from 'react';
import {renderScreen} from '../utils/screen-test-utils';
import AboutUsScreen from '@/screens/AboutUs';
import ComingSoonScreen from '@/screens/ComingSoon';
import {ABOUT_US_CONTENT} from '@/content';

describe('Info Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AboutUsScreen', () => {
    it('renders about us screen with app content', () => {
      const {getByTestId, getByText} = renderScreen(AboutUsScreen);

      expect(getByTestId('about-us-screen')).toBeTruthy();
      expect(getByText(ABOUT_US_CONTENT.appName)).toBeTruthy();
      expect(getByText(ABOUT_US_CONTENT.tagline)).toBeTruthy();
      expect(getByText(ABOUT_US_CONTENT.missionTitle)).toBeTruthy();
      expect(getByText(ABOUT_US_CONTENT.contactEmail)).toBeTruthy();
    });

    it('renders all highlight sections', () => {
      const {getByText} = renderScreen(AboutUsScreen);

      ABOUT_US_CONTENT.highlights.forEach(highlight => {
        expect(getByText(highlight.title)).toBeTruthy();
      });
    });

    it('is a valid React component', () => {
      expect(AboutUsScreen).toBeDefined();
      expect(typeof AboutUsScreen).toBe('function');
    });
  });

  describe('ComingSoonScreen', () => {
    it('renders coming soon screen with key elements', () => {
      const {getByTestId, getByText} = renderScreen(ComingSoonScreen);

      expect(getByTestId('coming-soon-screen')).toBeTruthy();
      expect(getByTestId('coming-soon-container')).toBeTruthy();
      expect(getByTestId('coming-soon-logo')).toBeTruthy();
      expect(getByText('Coming soon')).toBeTruthy();
    });

    it('is a valid React component', () => {
      expect(ComingSoonScreen).toBeDefined();
      expect(typeof ComingSoonScreen).toBe('function');
    });
  });
});
