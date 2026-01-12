import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { primitives, darkSemanticColors, lightSemanticColors } from '@/constants/tokens/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

// Build theme colors from tokens
export const darkColors = {
  // Primary palette
  primary: darkSemanticColors.primary,
  primaryDark: darkSemanticColors.primaryDark,
  primaryLight: darkSemanticColors.primaryLight,

  // Neutrals
  black: darkSemanticColors.black,
  darkGray: darkSemanticColors.darkGray,
  mediumGray: darkSemanticColors.mediumGray,
  lightGray: darkSemanticColors.lightGray,
  offWhite: darkSemanticColors.offWhite,
  white: darkSemanticColors.white,

  // Semantic
  background: darkSemanticColors.background,
  surface: darkSemanticColors.surface,
  surfaceElevated: darkSemanticColors.surfaceElevated,
  text: darkSemanticColors.text,
  textSecondary: darkSemanticColors.textSecondary,
  textMuted: darkSemanticColors.textMuted,
  textOnPrimary: darkSemanticColors.textOnPrimary,
  border: darkSemanticColors.border,
  borderLight: darkSemanticColors.borderLight,

  // States
  error: darkSemanticColors.error,
  success: darkSemanticColors.success,

  // Accent colors for features
  accentBlue: primitives.blue[500],
  accentGreen: primitives.green[500],
  accentPurple: primitives.purple[500],
  accentYellow: primitives.yellow[500],
  accentIndigo: primitives.blue[600],
};

export const lightColors = {
  // Primary palette
  primary: lightSemanticColors.primary,
  primaryDark: lightSemanticColors.primaryDark,
  primaryLight: lightSemanticColors.primaryLight,

  // Neutrals
  black: lightSemanticColors.black,
  darkGray: lightSemanticColors.darkGray,
  mediumGray: lightSemanticColors.mediumGray,
  lightGray: lightSemanticColors.lightGray,
  offWhite: lightSemanticColors.offWhite,
  white: lightSemanticColors.white,

  // Semantic
  background: lightSemanticColors.background,
  surface: lightSemanticColors.surface,
  surfaceElevated: lightSemanticColors.surfaceElevated,
  text: lightSemanticColors.text,
  textSecondary: lightSemanticColors.textSecondary,
  textMuted: lightSemanticColors.textMuted,
  textOnPrimary: lightSemanticColors.textOnPrimary,
  border: lightSemanticColors.border,
  borderLight: lightSemanticColors.borderLight,

  // States
  error: lightSemanticColors.error,
  success: lightSemanticColors.success,

  // Accent colors for features
  accentBlue: primitives.blue[500],
  accentGreen: primitives.green[500],
  accentPurple: primitives.purple[500],
  accentYellow: primitives.yellow[500],
  accentIndigo: primitives.blue[600],
};

// Use string type for colors to allow both light and dark variants
export type ThemeColors = {
  [K in keyof typeof darkColors]: string;
};

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
