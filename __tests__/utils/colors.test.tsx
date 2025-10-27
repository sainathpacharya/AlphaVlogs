import React from 'react';
import {renderHook} from '@testing-library/react-native';
import {useColorScheme} from 'react-native';
import {useThemeColors} from '../../src/utils/colors';
import {useTheme} from '../../src/stores/user-store';

// Mock dependencies
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('../../src/stores/user-store', () => ({
  useTheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>;
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('useThemeColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dark colors when user theme is dark', () => {
    mockUseColorScheme.mockReturnValue('light');
    mockUseTheme.mockReturnValue('dark');

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#1A1A1A');
    expect(result.current.primaryText).toBe('#FFFFFF');
    expect(result.current.accentAction).toBe('#0A84FF');
    expect(result.current.danger).toBe('#FF453A');
    expect(result.current.success).toBe('#30D158');
  });

  it('should return light colors when user theme is light', () => {
    mockUseColorScheme.mockReturnValue('dark');
    mockUseTheme.mockReturnValue('light');

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#FFFFFF');
    expect(result.current.primaryText).toBe('#1A1A1A');
    expect(result.current.accentAction).toBe('#007AFF');
    expect(result.current.danger).toBe('#DC3545');
    expect(result.current.success).toBe('#28A745');
  });

  it('should fall back to system theme when user theme is not set', () => {
    mockUseColorScheme.mockReturnValue('light');
    mockUseTheme.mockReturnValue(null);

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#FFFFFF');
    expect(result.current.primaryText).toBe('#1A1A1A');
  });

  it('should fall back to dark theme when both user and system themes are not set', () => {
    mockUseColorScheme.mockReturnValue(null);
    mockUseTheme.mockReturnValue(null);

    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#1A1A1A');
    expect(result.current.primaryText).toBe('#FFFFFF');
  });

  it('should return all required color properties for dark theme', () => {
    mockUseTheme.mockReturnValue('dark');

    const {result} = renderHook(() => useThemeColors());

    const colors = result.current;

    // Backgrounds
    expect(colors.primaryBackground).toBe('#1A1A1A');
    expect(colors.secondaryBackground).toBe('#2D2D2D');
    expect(colors.cardBackground).toBe('#2D2D2D');

    // Primary Colors
    expect(colors.primaryText).toBe('#FFFFFF');
    expect(colors.secondaryText).toBe('#B0B0B0');
    expect(colors.mutedText).toBe('#B0B0B0');
    expect(colors.inputBackground).toBe('#2D2D2D');
    expect(colors.inputText).toBe('#FFFFFF');
    expect(colors.inputBorder).toBe('#404040');

    // Accents
    expect(colors.accentAction).toBe('#0A84FF');
    expect(colors.accentBackground).toBe('#1E3A8A');
    expect(colors.link).toBe('#0A84FF');
    expect(colors.buttonBackground).toBe('#0A84FF');
    expect(colors.buttonText).toBe('#FFFFFF');
    expect(colors.highlight).toBe('#0A84FF');

    // Status
    expect(colors.danger).toBe('#FF453A');
    expect(colors.warning).toBe('#FF9F0A');
    expect(colors.success).toBe('#30D158');
    expect(colors.info).toBe('#64D2FF');

    // Miscellaneous
    expect(colors.white).toBe('#FFFFFF');
    expect(colors.black).toBe('#000000');
    expect(colors.gray).toBe('#8E8E93');
    expect(colors.lightGray).toBe('#3A3A3C');
    expect(colors.darkGray).toBe('#1C1C1E');
    expect(colors.border).toBe('#404040');
    expect(colors.shadow).toBe('rgba(0, 0, 0, 0.3)');
    expect(colors.transparent).toBe('rgba(0, 0, 0, 0.0)');
    expect(colors.overlay).toBe('rgba(0, 0, 0, 0.5)');
    expect(colors.modalBackground).toBe('rgba(0, 0, 0, 0.7)');
    expect(colors.modalText).toBe('#FFFFFF');
    expect(colors.toastBackground).toBe('#2D2D2D');
    expect(colors.toastText).toBe('#FFFFFF');
    expect(colors.badgeBackground).toBe('#FF453A');
    expect(colors.badgeText).toBe('#FFFFFF');
    expect(colors.mutedBackground).toBe('#3A3A3C');
  });

  it('should return all required color properties for light theme', () => {
    mockUseTheme.mockReturnValue('light');

    const {result} = renderHook(() => useThemeColors());

    const colors = result.current;

    // Backgrounds
    expect(colors.primaryBackground).toBe('#FFFFFF');
    expect(colors.secondaryBackground).toBe('#F8F9FA');
    expect(colors.cardBackground).toBe('#FFFFFF');

    // Primary Colors
    expect(colors.primaryText).toBe('#1A1A1A');
    expect(colors.secondaryText).toBe('#6C757D');
    expect(colors.mutedText).toBe('#6C757D');
    expect(colors.inputBackground).toBe('#FFFFFF');
    expect(colors.inputText).toBe('#1A1A1A');
    expect(colors.inputBorder).toBe('#DEE2E6');

    // Accents
    expect(colors.accentAction).toBe('#007AFF');
    expect(colors.accentBackground).toBe('#E3F2FD');
    expect(colors.link).toBe('#007AFF');
    expect(colors.buttonBackground).toBe('#007AFF');
    expect(colors.buttonText).toBe('#FFFFFF');
    expect(colors.highlight).toBe('#007AFF');

    // Status
    expect(colors.danger).toBe('#DC3545');
    expect(colors.warning).toBe('#FFC107');
    expect(colors.success).toBe('#28A745');
    expect(colors.info).toBe('#17A2B8');

    // Miscellaneous
    expect(colors.white).toBe('#FFFFFF');
    expect(colors.black).toBe('#000000');
    expect(colors.gray).toBe('#6C757D');
    expect(colors.lightGray).toBe('#F8F9FA');
    expect(colors.darkGray).toBe('#343A40');
    expect(colors.border).toBe('#DEE2E6');
    expect(colors.shadow).toBe('rgba(0, 0, 0, 0.1)');
    expect(colors.transparent).toBe('rgba(0, 0, 0, 0.0)');
    expect(colors.overlay).toBe('rgba(0, 0, 0, 0.3)');
    expect(colors.modalBackground).toBe('rgba(0, 0, 0, 0.6)');
    expect(colors.modalText).toBe('#1A1A1A');
    expect(colors.toastBackground).toBe('#333333');
    expect(colors.toastText).toBe('#FFFFFF');
    expect(colors.badgeBackground).toBe('#FF6B6B');
    expect(colors.badgeText).toBe('#FFFFFF');
    expect(colors.mutedBackground).toBe('#F8F9FA');
  });

  it('should handle theme changes dynamically', () => {
    mockUseColorScheme.mockReturnValue('light');
    mockUseTheme.mockReturnValue('dark');

    const {result, rerender} = renderHook(() => useThemeColors());

    // Initially dark theme
    expect(result.current.primaryBackground).toBe('#1A1A1A');

    // Change to light theme
    mockUseTheme.mockReturnValue('light');
    rerender();

    expect(result.current.primaryBackground).toBe('#FFFFFF');
  });

  it('should prioritize user theme over system theme', () => {
    mockUseColorScheme.mockReturnValue('light');
    mockUseTheme.mockReturnValue('dark');

    const {result} = renderHook(() => useThemeColors());

    // Should use dark theme despite system being light
    expect(result.current.primaryBackground).toBe('#1A1A1A');
    expect(result.current.primaryText).toBe('#FFFFFF');
  });
});
