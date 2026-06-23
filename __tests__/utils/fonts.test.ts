import { mapFonts } from '../../src/utils/fonts';
import { Platform } from 'react-native';

describe('Font Utils', () => {
  describe('mapFonts', () => {
    it('should map font weights correctly', () => {
      const style = { fontWeight: '400', fontFamily: 'Roboto' };
      const result = mapFonts(style);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('fontFamily');
      expect(result).not.toHaveProperty('fontWeight');
      expect(result).not.toHaveProperty('fontStyle');
    });

    it('should handle different font weights', () => {
      const style = { fontWeight: '700', fontFamily: 'Roboto' };
      const result = mapFonts(style);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('fontFamily');
      expect(result).not.toHaveProperty('fontWeight');
      expect(result).not.toHaveProperty('fontStyle');
    });

    it('should handle undefined style', () => {
      const result = mapFonts(undefined as any);
      expect(result).toBeDefined();
      expect(result).toEqual({});
    });

    it('should handle empty style object', () => {
      const result = mapFonts({});
      expect(result).toBeDefined();
      expect(result).toHaveProperty('fontFamily');
      expect(result).not.toHaveProperty('fontWeight');
      expect(result).not.toHaveProperty('fontStyle');
    });

    it('should handle null style', () => {
      const result = mapFonts(null as any);
      expect(result).toBeDefined();
      expect(result).toEqual({});
    });

    it('should handle style with fontFamily matching regex pattern', () => {
      const style = { fontWeight: '400', fontFamily: 'Roboto_400Regular' };
      const result = mapFonts(style);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('fontFamily');
      expect(result).not.toHaveProperty('fontWeight');
      expect(result).not.toHaveProperty('fontStyle');
    });

    it('maps fonts on iOS with italic style', () => {
      Platform.OS = 'ios';
      const style = { fontWeight: '400', fontFamily: 'roboto', fontStyle: 'italic' };
      const result = mapFonts({ ...style });
      expect(result.fontFamily).toContain('Roboto');
      expect(result.fontFamily).toContain('Italic');
    });

    it('maps fonts on iOS with non-regular weight and style', () => {
      Platform.OS = 'ios';
      const style = { fontWeight: '700', fontFamily: 'roboto', fontStyle: 'italic' };
      const result = mapFonts({ ...style });
      expect(result.fontFamily).toContain('Bold');
      expect(result.fontFamily).toContain('Italic');
    });

    it('maps fonts on Android with weight and style', () => {
      Platform.OS = 'android';
      const style = { fontWeight: '500', fontFamily: 'roboto', fontStyle: 'italic' };
      const result = mapFonts({ ...style });
      expect(result.fontFamily).toContain('_500');
      expect(result.fontFamily).toContain('_Italic');
    });

    it('maps fonts on Android without explicit weight', () => {
      Platform.OS = 'android';
      const style = { fontFamily: 'Open Sans' };
      const result = mapFonts({ ...style });
      expect(result.fontFamily).toContain('_400Regular');
    });

    it('handles numeric font weight', () => {
      Platform.OS = 'android';
      const style = { fontWeight: 700, fontFamily: 'roboto' };
      const result = mapFonts({ ...style });
      expect(result.fontFamily).toContain('Bold');
    });
  });
});
