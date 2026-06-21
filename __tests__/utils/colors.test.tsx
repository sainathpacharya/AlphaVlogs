import React from 'react';
import {renderHook} from '@testing-library/react-native';
import {useColorScheme} from 'react-native';
import {useThemeColors} from '../../src/utils/colors';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;

describe('useThemeColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dark colors when system theme is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#1A1A1A');
    expect(result.current.primaryText).toBe('#FFFFFF');
    expect(result.current.accentAction).toBe('#0A84FF');
    expect(result.current.danger).toBe('#FF453A');
    expect(result.current.success).toBe('#30D158');
  });

  it('should return light colors when system theme is light', () => {
    mockUseColorScheme.mockReturnValue('light');

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#FFFFFF');
    expect(result.current.primaryText).toBe('#1A1A1A');
    expect(result.current.accentAction).toBe('#007AFF');
    expect(result.current.danger).toBe('#DC3545');
    expect(result.current.success).toBe('#28A745');
  });

  it('should fall back to light theme when system theme is unavailable', () => {
    mockUseColorScheme.mockReturnValue(null);

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#FFFFFF');
    expect(result.current.primaryText).toBe('#1A1A1A');
  });

  it('should return all required color properties for dark theme', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const {result} = renderHook(() => useThemeColors());
    const colors = result.current;

    expect(colors.primaryBackground).toBe('#1A1A1A');
    expect(colors.secondaryBackground).toBe('#2D2D2D');
    expect(colors.cardBackground).toBe('#2D2D2D');
    expect(colors.primaryText).toBe('#FFFFFF');
    expect(colors.accentAction).toBe('#0A84FF');
    expect(colors.text).toBe('#FFFFFF');
    expect(colors.background).toBe('#1A1A1A');
  });

  it('should return all required color properties for light theme', () => {
    mockUseColorScheme.mockReturnValue('light');

    const {result} = renderHook(() => useThemeColors());
    const colors = result.current;

    expect(colors.primaryBackground).toBe('#FFFFFF');
    expect(colors.secondaryBackground).toBe('#F8F9FA');
    expect(colors.cardBackground).toBe('#FFFFFF');
    expect(colors.primaryText).toBe('#1A1A1A');
    expect(colors.accentAction).toBe('#007AFF');
    expect(colors.text).toBe('#1A1A1A');
    expect(colors.background).toBe('#FFFFFF');
  });

  it('should handle theme changes dynamically', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const {result, rerender} = renderHook(() => useThemeColors());
    expect(result.current.primaryBackground).toBe('#1A1A1A');

    mockUseColorScheme.mockReturnValue('light');
    rerender(undefined);
    expect(result.current.primaryBackground).toBe('#FFFFFF');
  });
});
