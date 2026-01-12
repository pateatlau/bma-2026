import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export const darkColors = {
  // Primary palette
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  primaryLight: '#EF4444',

  // Neutrals
  black: '#0A0A0A',
  darkGray: '#1F1F1F',
  mediumGray: '#404040',
  lightGray: '#737373',
  offWhite: '#F5F5F5',
  white: '#FFFFFF',

  // Semantic
  background: '#0A0A0A',
  surface: '#1F1F1F',
  surfaceElevated: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#737373',
  textOnPrimary: '#FFFFFF',
  border: '#404040',
  borderLight: '#2A2A2A',

  // States
  error: '#EF4444',
  success: '#22C55E',

  // Accent colors for features
  accentBlue: '#3B82F6',
  accentGreen: '#10B981',
  accentPurple: '#8B5CF6',
  accentYellow: '#FBBF24',
  accentIndigo: '#6366F1',
};

export const lightColors = {
  // Primary palette
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  primaryLight: '#EF4444',

  // Neutrals
  black: '#0A0A0A',
  darkGray: '#1F1F1F',
  mediumGray: '#404040',
  lightGray: '#737373',
  offWhite: '#F5F5F5',
  white: '#FFFFFF',

  // Semantic
  background: '#FFFFFF',
  surface: '#FEF2F2', // Light red tint for cards
  surfaceElevated: '#FEF2F2', // Light red tint for elevated cards
  text: '#0A0A0A',
  textSecondary: '#525252',
  textMuted: '#737373',
  textOnPrimary: '#FFFFFF',
  border: '#FECACA', // Light red border
  borderLight: '#FEE2E2', // Very light red border

  // States
  error: '#DC2626',
  success: '#16A34A',

  // Accent colors for features
  accentBlue: '#3B82F6',
  accentGreen: '#10B981',
  accentPurple: '#8B5CF6',
  accentYellow: '#FBBF24',
  accentIndigo: '#6366F1',
};

export type ThemeColors = typeof darkColors;

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      setMode,
      toggleTheme,
    }),
    [mode, isDark, colors, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
