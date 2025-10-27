import React from 'react';
import {renderHook} from '@testing-library/react-native';
import {useTranslation} from 'react-i18next';
import {useTranslation as useCustomTranslation} from '../../src/hooks/useTranslation';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseI18nTranslation = useTranslation as jest.MockedFunction<
  typeof useTranslation
>;

describe('useTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return translation functions and helpers', () => {
      const mockT = jest.fn((key: string) => key);
      const mockI18n = {
        exists: jest.fn((key: string) => true),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      expect(result.current.t).toBe(mockT);
      expect(result.current.i18n).toBe(mockI18n);
      expect(typeof result.current.tn).toBe('function');
      expect(typeof result.current.hasKey).toBe('function');
      expect(typeof result.current.getCurrentLanguage).toBe('function');
      expect(typeof result.current.changeLanguage).toBe('function');
    });

    it('should call t function with correct parameters', () => {
      const mockT = jest.fn((key: string, params?: any) => key);
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      const testKey = 'test.key';
      const testParams = {name: 'John', count: 5};

      result.current.tn(testKey, testParams);

      expect(mockT).toHaveBeenCalledWith(testKey, testParams);
    });

    it('should call t function without parameters when none provided', () => {
      const mockT = jest.fn((key: string) => key);
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      const testKey = 'test.key';

      result.current.tn(testKey);

      expect(mockT).toHaveBeenCalledWith(testKey, undefined);
    });
  });

  describe('hasKey function', () => {
    it('should call i18n.exists with correct key', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn((key: string) => true),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      const testKey = 'test.key';
      result.current.hasKey(testKey);

      expect(mockI18n.exists).toHaveBeenCalledWith(testKey);
    });

    it('should return the result of i18n.exists', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn((key: string) => key === 'existing.key'),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      expect(result.current.hasKey('existing.key')).toBe(true);
      expect(result.current.hasKey('non.existing.key')).toBe(false);
    });
  });

  describe('getCurrentLanguage function', () => {
    it('should return current language from i18n', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'es',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      expect(result.current.getCurrentLanguage()).toBe('es');
    });

    it('should return different languages when i18n language changes', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result, rerender} = renderHook(() => useCustomTranslation());

      expect(result.current.getCurrentLanguage()).toBe('en');

      // Change language
      mockI18n.language = 'fr';
      rerender();

      expect(result.current.getCurrentLanguage()).toBe('fr');
    });
  });

  describe('changeLanguage function', () => {
    it('should call i18n.changeLanguage with correct language', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      const newLanguage = 'es';
      result.current.changeLanguage(newLanguage);

      expect(mockI18n.changeLanguage).toHaveBeenCalledWith(newLanguage);
    });

    it('should handle different language codes', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      const languages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko'];

      languages.forEach(lang => {
        result.current.changeLanguage(lang);
        expect(mockI18n.changeLanguage).toHaveBeenCalledWith(lang);
      });
    });
  });

  describe('Integration with react-i18next', () => {
    it('should pass through all i18n functionality', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
        // Add other i18n properties that might be used
        isInitialized: true,
        hasResourceBundle: jest.fn(),
        getResourceBundle: jest.fn(),
        addResourceBundle: jest.fn(),
        removeResourceBundle: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      // The i18n object should be passed through completely
      expect(result.current.i18n).toBe(mockI18n);
    });

    it('should handle i18n errors gracefully', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(() => {
          throw new Error('i18n error');
        }),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      expect(() => result.current.hasKey('test.key')).toThrow('i18n error');
    });
  });

  describe('Type safety', () => {
    it('should handle string parameters correctly', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      // Test with string parameters
      const stringParams = {name: 'John', city: 'New York'};
      result.current.tn('test.key', stringParams);
      expect(mockT).toHaveBeenCalledWith('test.key', stringParams);

      // Test with number parameters
      const numberParams = {count: 5, age: 25};
      result.current.tn('test.key', numberParams);
      expect(mockT).toHaveBeenCalledWith('test.key', numberParams);

      // Test with mixed parameters
      const mixedParams = {name: 'John', count: 5, active: true};
      result.current.tn('test.key', mixedParams);
      expect(mockT).toHaveBeenCalledWith('test.key', mixedParams);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string keys', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      result.current.tn('');
      expect(mockT).toHaveBeenCalledWith('', undefined);

      result.current.hasKey('');
      expect(mockI18n.exists).toHaveBeenCalledWith('');

      result.current.changeLanguage('');
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('');
    });

    it('should handle undefined/null parameters', () => {
      const mockT = jest.fn();
      const mockI18n = {
        exists: jest.fn(),
        language: 'en',
        changeLanguage: jest.fn(),
      };

      mockUseI18nTranslation.mockReturnValue({
        t: mockT,
        i18n: mockI18n,
      });

      const {result} = renderHook(() => useCustomTranslation());

      // Should not throw with undefined parameters
      expect(() => result.current.tn('test.key', undefined)).not.toThrow();
      expect(() => result.current.tn('test.key', null as any)).not.toThrow();
    });
  });
});
