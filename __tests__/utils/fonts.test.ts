import { mapFonts } from '../../src/utils/fonts';

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
  });
});
