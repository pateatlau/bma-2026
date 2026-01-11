/**
 * @deprecated This file is deprecated. Use @/constants/tokens instead.
 *
 * Migration guide:
 * - colors → use ThemeContext or lightSemanticColors/darkSemanticColors from tokens
 * - spacing → use legacySpacing from tokens
 * - borderRadius → use borderRadius from tokens
 * - typography → use fontSizes, fontWeights, fontFamily from tokens
 * - shadows → use getShadow() from tokens for platform-aware shadows
 */
import { Platform } from 'react-native';

export const colors = {
  // Primary palette
  primary: '#DC2626', // Rich red
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
  border: '#404040',
  borderLight: '#2A2A2A',

  // States
  error: '#EF4444',
  success: '#22C55E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  fontFamily: Platform.select({
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    default: undefined,
  }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};
