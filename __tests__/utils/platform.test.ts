import { getSystemName, getAppVersion, getPlatformString, PLATFORM_STRING } from '../../src/utils/platform';

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getSystemName: jest.fn(() => 'iOS'),
  getVersion: jest.fn(() => '1.0.0'),
}));

describe('Platform Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Platform Functions', () => {
    it('should get system name', () => {
      const mockDeviceInfo = require('react-native-device-info');
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      
      expect(getSystemName()).toBe('iOS');
    });

    it('should get app version', () => {
      const mockDeviceInfo = require('react-native-device-info');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');
      
      expect(getAppVersion()).toBe('1.0.0');
    });

    it('should generate correct platform string for iOS', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');
      
      expect(getPlatformString()).toBe('iOS iOS ApplicationVersion: 1.0.0');
    });

    it('should generate correct platform string for Android', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('Android');
      mockDeviceInfo.getVersion.mockReturnValue('2.0.0');

      expect(getPlatformString()).toBe('Android Android ApplicationVersion: 2.0.0');
    });

    it('should handle empty system name', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      expect(getPlatformString()).toBe('  ApplicationVersion: 1.0.0');
    });

    it('should handle undefined system name', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue(undefined as any);
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      expect(getPlatformString()).toBe('undefined undefined ApplicationVersion: 1.0.0');
    });

    it('should handle different app versions', () => {
      const testCases = [
        { version: '1.0.0', expected: 'iOS iOS ApplicationVersion: 1.0.0' },
        { version: '2.1.3', expected: 'iOS iOS ApplicationVersion: 2.1.3' },
        { version: '10.15.2', expected: 'iOS iOS ApplicationVersion: 10.15.2' },
        { version: '', expected: 'iOS iOS ApplicationVersion: ' },
        { version: 'beta-1.0.0', expected: 'iOS iOS ApplicationVersion: beta-1.0.0' },
      ];

      testCases.forEach(({ version, expected }) => {
        const mockDeviceInfo = require('react-native-device-info');
        
        mockDeviceInfo.getSystemName.mockReturnValue('iOS');
        mockDeviceInfo.getVersion.mockReturnValue(version);

        expect(getPlatformString()).toBe(expected);
      });
    });

    it('should handle different system names', () => {
      const testCases = [
        'iOS',
        'Android',
        'Windows',
        'macOS',
        'Linux',
        'Unknown',
        'Custom OS',
      ];

      testCases.forEach(systemName => {
        const mockDeviceInfo = require('react-native-device-info');
        
        mockDeviceInfo.getSystemName.mockReturnValue(systemName);
        mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

        expect(getPlatformString()).toBe(`${systemName} ${systemName} ApplicationVersion: 1.0.0`);
      });
    });

    it('should be a string type', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      expect(typeof getPlatformString()).toBe('string');
    });

    it('should contain all required components', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      const platformString = getPlatformString();
      expect(platformString).toContain('iOS');
      expect(platformString).toContain('ApplicationVersion:');
      expect(platformString).toContain('1.0.0');
    });

    it('should handle special characters in version', () => {
      const specialVersions = [
        '1.0.0-alpha',
        '1.0.0-beta',
        '1.0.0-rc.1',
        '1.0.0+build.1',
        '1.0.0-alpha.1+build.1',
      ];

      specialVersions.forEach(version => {
        const mockDeviceInfo = require('react-native-device-info');
        
        mockDeviceInfo.getSystemName.mockReturnValue('iOS');
        mockDeviceInfo.getVersion.mockReturnValue(version);

        expect(getPlatformString()).toBe(`iOS iOS ApplicationVersion: ${version}`);
      });
    });
  });

  describe('Module Integration', () => {
    it('should call DeviceInfo.getSystemName', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      getPlatformString();
      expect(mockDeviceInfo.getSystemName).toHaveBeenCalled();
    });

    it('should access VersionInfo.appVersion', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      getPlatformString();
      expect(mockDeviceInfo.getVersion).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle DeviceInfo.getSystemName throwing an error', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockImplementation(() => {
        throw new Error('DeviceInfo error');
      });
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      expect(() => getPlatformString()).toThrow('DeviceInfo error');
    });

    it('should handle VersionInfo.appVersion being undefined', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      mockDeviceInfo.getVersion.mockReturnValue(undefined as any);

      expect(getPlatformString()).toBe('iOS iOS ApplicationVersion: undefined');
    });
  });

  describe('PLATFORM_STRING Constant', () => {
    it('should be defined', () => {
      expect(PLATFORM_STRING).toBeDefined();
      expect(typeof PLATFORM_STRING).toBe('string');
    });

    it('should match the function output', () => {
      const mockDeviceInfo = require('react-native-device-info');
      
      mockDeviceInfo.getSystemName.mockReturnValue('iOS');
      mockDeviceInfo.getVersion.mockReturnValue('1.0.0');

      expect(PLATFORM_STRING).toBe(getPlatformString());
    });
  });
});