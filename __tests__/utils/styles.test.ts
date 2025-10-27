import { commonStyles, screenStyles, DIMENSIONS } from '../../src/utils/styles';

// Mock React Native components
jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
}));

describe('Style Utils', () => {
  describe('commonStyles', () => {
    it('should be defined', () => {
      expect(commonStyles).toBeDefined();
      expect(typeof commonStyles).toBe('object');
    });

    it('should have expected properties', () => {
      expect(commonStyles).toHaveProperty('container');
      expect(commonStyles).toHaveProperty('text');
    });
  });

  describe('screenStyles', () => {
    it('should be defined', () => {
      expect(screenStyles).toBeDefined();
      expect(typeof screenStyles).toBe('object');
    });
  });

  describe('DIMENSIONS', () => {
    it('should be defined', () => {
      expect(DIMENSIONS).toBeDefined();
      expect(typeof DIMENSIONS).toBe('object');
    });

    it('should have screen width and height properties', () => {
      expect(DIMENSIONS).toHaveProperty('screenWidth');
      expect(DIMENSIONS).toHaveProperty('screenHeight');
    });
  });
});
