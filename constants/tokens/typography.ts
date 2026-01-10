/**
 * Typography Tokens
 *
 * Font sizes, line heights, weights, and font family definitions
 * for consistent typography across all platforms.
 */

import { Platform } from 'react-native';

// =============================================================================
// FONT SIZES
// Based on a 1.25 ratio type scale
// =============================================================================

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

// =============================================================================
// LINE HEIGHTS
// Optimized for readability at each font size
// =============================================================================

export const lineHeights = {
  xs: 16, // 1.33 ratio
  sm: 20, // 1.43 ratio
  base: 24, // 1.5 ratio
  lg: 28, // 1.56 ratio
  xl: 28, // 1.4 ratio
  '2xl': 32, // 1.33 ratio
  '3xl': 40, // 1.25 ratio
  '4xl': 48, // 1.2 ratio
} as const;

// =============================================================================
// FONT WEIGHTS
// Standard weight scale for text hierarchy
// =============================================================================

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// =============================================================================
// FONT FAMILIES
// Platform-specific font stacks for optimal native appearance
// =============================================================================

export const fontFamily = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  ios: 'System', // Uses SF Pro automatically
  android: 'Roboto',
  default: undefined, // System default
});

// =============================================================================
// LETTER SPACING
// Fine-tuned spacing for different text sizes
// =============================================================================

export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// =============================================================================
// TEXT STYLE PRESETS
// Pre-composed text styles for common typography patterns
// =============================================================================

export const textStyles = {
  // Body text variants
  body: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.regular,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
  },
  bodyLarge: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.regular,
  },

  // Heading variants
  h1: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    fontWeight: fontWeights.bold,
  },
  h2: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.bold,
  },
  h3: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.semibold,
  },
  h4: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.semibold,
  },

  // UI text variants
  label: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.medium,
  },
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
  button: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.semibold,
  },
  buttonSmall: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.semibold,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type FontSize = keyof typeof fontSizes;
export type LineHeight = keyof typeof lineHeights;
export type FontWeight = keyof typeof fontWeights;
export type LetterSpacing = keyof typeof letterSpacing;
export type TextStyle = keyof typeof textStyles;
