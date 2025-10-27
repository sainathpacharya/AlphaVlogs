// Simple platform test that doesn't rely on complex mocking
describe('Platform Utils - Simple', () => {
  it('should import PLATFORM_STRING without errors', () => {
    expect(() => {
      require('../../src/utils/platform');
    }).not.toThrow();
  });

  it('should have PLATFORM_STRING as a string', () => {
    const { PLATFORM_STRING } = require('../../src/utils/platform');
    expect(typeof PLATFORM_STRING).toBe('string');
  });

  it('should contain ApplicationVersion in the string', () => {
    const { PLATFORM_STRING } = require('../../src/utils/platform');
    expect(PLATFORM_STRING).toContain('ApplicationVersion:');
  });

  it('should be a non-empty string', () => {
    const { PLATFORM_STRING } = require('../../src/utils/platform');
    expect(PLATFORM_STRING.length).toBeGreaterThan(0);
  });
});
