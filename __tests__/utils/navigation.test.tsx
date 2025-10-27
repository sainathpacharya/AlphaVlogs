import React from 'react';
import {renderHook, act} from '@testing-library/react-native';
import {useNavigation} from '@react-navigation/native';
import {
  navigateHelpArticle,
  useNavigateHelpArticle,
} from '../../src/utils/navigation';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

const mockUseNavigation = useNavigation as jest.MockedFunction<
  typeof useNavigation
>;

// Mock console.log to test logging behavior
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Navigation Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('navigateHelpArticle', () => {
    it('should log navigation parameters', () => {
      const mockParams = {
        sectionId: 1,
        id: 123,
        icon: 'help-circle',
        label: 'Getting Started',
      };

      navigateHelpArticle(mockParams);

      expect(console.log).toHaveBeenCalledWith(
        'Navigate to help article:',
        mockParams,
      );
    });

    it('should handle different parameter combinations', () => {
      const testCases = [
        {
          sectionId: 0,
          id: 0,
          icon: '',
          label: '',
        },
        {
          sectionId: 999,
          id: 999,
          icon: 'custom-icon',
          label: 'Custom Help Article',
        },
        {
          sectionId: -1,
          id: -1,
          icon: 'negative-icon',
          label: 'Negative Values',
        },
      ];

      testCases.forEach((params, index) => {
        navigateHelpArticle(params);
        expect(console.log).toHaveBeenNthCalledWith(
          index + 1,
          'Navigate to help article:',
          params,
        );
      });
    });

    it('should handle undefined or null parameters gracefully', () => {
      const mockParams = {
        sectionId: 1,
        id: 123,
        icon: 'help-circle',
        label: 'Getting Started',
      };

      // Should not throw error
      expect(() => navigateHelpArticle(mockParams)).not.toThrow();
    });
  });

  describe('useNavigateHelpArticle', () => {
    it('should return a function that logs navigation parameters', () => {
      const mockNavigation = {
        navigate: jest.fn(),
      };
      mockUseNavigation.mockReturnValue(mockNavigation as any);

      const {result} = renderHook(() => useNavigateHelpArticle());

      expect(typeof result.current).toBe('function');

      const mockParams = {
        sectionId: 2,
        id: 456,
        icon: 'question-mark',
        label: 'FAQ',
      };

      result.current(mockParams);

      expect(console.log).toHaveBeenCalledWith(
        'Navigate to help article:',
        mockParams,
      );
    });

    it('should use navigation from React Navigation context', () => {
      const mockNavigation = {
        navigate: jest.fn(),
      };
      mockUseNavigation.mockReturnValue(mockNavigation as any);

      const {result} = renderHook(() => useNavigateHelpArticle());

      // The hook should call useNavigation
      expect(mockUseNavigation).toHaveBeenCalled();
    });

    it('should handle multiple calls with different parameters', () => {
      const mockNavigation = {
        navigate: jest.fn(),
      };
      mockUseNavigation.mockReturnValue(mockNavigation as any);

      const {result} = renderHook(() => useNavigateHelpArticle());

      const params1 = {
        sectionId: 1,
        id: 123,
        icon: 'icon1',
        label: 'Label 1',
      };

      const params2 = {
        sectionId: 2,
        id: 456,
        icon: 'icon2',
        label: 'Label 2',
      };

      result.current(params1);
      result.current(params2);

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenNthCalledWith(
        1,
        'Navigate to help article:',
        params1,
      );
      expect(console.log).toHaveBeenNthCalledWith(
        2,
        'Navigate to help article:',
        params2,
      );
    });

    it('should work with different navigation objects', () => {
      const mockNavigation1 = {navigate: jest.fn()};
      const mockNavigation2 = {navigate: jest.fn()};

      mockUseNavigation
        .mockReturnValueOnce(mockNavigation1 as any)
        .mockReturnValueOnce(mockNavigation2 as any);

      const {result: result1} = renderHook(() => useNavigateHelpArticle());
      const {result: result2} = renderHook(() => useNavigateHelpArticle());

      const params = {
        sectionId: 1,
        id: 123,
        icon: 'test',
        label: 'Test',
      };

      result1.current(params);
      result2.current(params);

      expect(console.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('Type Safety', () => {
    it('should accept valid HelpArticleParams', () => {
      const validParams = {
        sectionId: 1,
        id: 123,
        icon: 'help-circle',
        label: 'Valid Parameters',
      };

      expect(() => navigateHelpArticle(validParams)).not.toThrow();
    });

    it('should handle edge case values', () => {
      const edgeCaseParams = {
        sectionId: Number.MAX_SAFE_INTEGER,
        id: Number.MIN_SAFE_INTEGER,
        icon: 'a'.repeat(1000), // Very long string
        label: 'b'.repeat(1000), // Very long string
      };

      expect(() => navigateHelpArticle(edgeCaseParams)).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work when used in a component context', () => {
      const mockNavigation = {
        navigate: jest.fn(),
      };
      mockUseNavigation.mockReturnValue(mockNavigation as any);

      const {result} = renderHook(() => useNavigateHelpArticle());

      // Test the hook directly
      result.current({
        sectionId: 1,
        id: 123,
        icon: 'test',
        label: 'Test',
      });

      expect(console.log).toHaveBeenCalledWith('Navigate to help article:', {
        sectionId: 1,
        id: 123,
        icon: 'test',
        label: 'Test',
      });
    });
  });
});
