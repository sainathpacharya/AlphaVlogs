import { DEFAULT_HEADER_HEIGHT } from '../../src/utils/sizes';

describe('Size Utils', () => {
  describe('DEFAULT_HEADER_HEIGHT', () => {
    it('should have correct default header height', () => {
      expect(DEFAULT_HEADER_HEIGHT).toBe(180);
    });

    it('should be a number', () => {
      expect(typeof DEFAULT_HEADER_HEIGHT).toBe('number');
    });

    it('should be greater than 0', () => {
      expect(DEFAULT_HEADER_HEIGHT).toBeGreaterThan(0);
    });
  });
});
