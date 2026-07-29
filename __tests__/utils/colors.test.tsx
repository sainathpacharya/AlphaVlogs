import React from 'react';
import {renderHook} from '@testing-library/react-native';
import {
  useAppColorScheme,
  useThemeColors,
  useStatusBarConfig,
} from '../../src/utils/colors';

describe('useThemeColors', () => {
  it('always returns light theme colors', () => {
    const {result} = renderHook(() => useThemeColors());

    expect(result.current.primaryBackground).toBe('#FFFFFF');
    expect(result.current.primaryText).toBe('#1A1A1A');
    expect(result.current.accentAction).toBe('#007AFF');
    expect(result.current.danger).toBe('#DC3545');
    expect(result.current.success).toBe('#28A745');
  });

  it('returns all required light color properties', () => {
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
});

describe('useAppColorScheme', () => {
  it('always reports light', () => {
    const {result} = renderHook(() => useAppColorScheme());
    expect(result.current).toBe('light');
  });
});

describe('useStatusBarConfig', () => {
  it('uses dark-content status bar for light theme', () => {
    const {result} = renderHook(() => useStatusBarConfig());

    expect(result.current.barStyle).toBe('dark-content');
    expect(result.current.backgroundColor).toBe('#FFFFFF');
    expect(result.current.navigationStatusBarStyle).toBe('dark');
  });
});
