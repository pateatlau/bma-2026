/**
 * Color Tokens
 *
 * Primitive and semantic color definitions for the BMA design system.
 * These tokens provide the foundation for theming and ensure consistent
 * color usage across all platforms.
 */

// =============================================================================
// PRIMITIVE COLORS
// Raw color values that form the foundation of the color system
// =============================================================================

export const primitives = {
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626', // Primary brand color
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },
  // Semantic accent colors
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB', // Primary brand color (blue theme)
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  green: {
    500: '#22C55E',
    600: '#16A34A',
  },
  yellow: {
    500: '#EAB308',
    600: '#CA8A04',
  },
  orange: {
    500: '#F97316',
    600: '#EA580C',
  },
  purple: {
    500: '#8B5CF6',
    600: '#7C3AED',
  },
  // Absolute colors
  white: '#FFFFFF',
  black: '#000000',
} as const;

// =============================================================================
// SEMANTIC COLOR TOKENS - DARK MODE
// Semantic tokens that map primitive colors to their intended usage
// =============================================================================

export const darkSemanticColors = {
  // Primary palette
  primary: primitives.red[600],
  primaryHover: primitives.red[500],
  primaryActive: primitives.red[700],
  primaryLight: primitives.red[500],
  primaryDark: primitives.red[700],

  // Neutrals
  black: primitives.gray[950],
  darkGray: primitives.gray[800],
  mediumGray: primitives.gray[700],
  lightGray: primitives.gray[500],
  offWhite: primitives.gray[100],
  white: primitives.white,

  // Surfaces
  background: primitives.gray[950],
  surface: primitives.gray[800],
  surfaceHover: primitives.gray[700],
  surfaceElevated: '#2A2A2A',

  // Text
  text: primitives.white,
  textSecondary: primitives.gray[400],
  textMuted: primitives.gray[500],
  textOnPrimary: primitives.white,

  // Borders
  border: primitives.gray[700],
  borderLight: primitives.gray[800],

  // States
  error: primitives.red[500],
  errorBackground: primitives.red[900],
  success: primitives.green[500],
  successBackground: '#052E16',
  warning: primitives.yellow[500],
  warningBackground: '#422006',
  info: primitives.blue[500],
  infoBackground: '#1E3A5F',
} as const;

// =============================================================================
// SEMANTIC COLOR TOKENS - LIGHT MODE
// =============================================================================

export const lightSemanticColors = {
  // Primary palette
  primary: primitives.red[600],
  primaryHover: primitives.red[700],
  primaryActive: primitives.red[800],
  primaryLight: primitives.red[500],
  primaryDark: primitives.red[700],

  // Neutrals
  black: primitives.gray[950],
  darkGray: primitives.gray[800],
  mediumGray: primitives.gray[700],
  lightGray: primitives.gray[500],
  offWhite: primitives.gray[100],
  white: primitives.white,

  // Surfaces
  background: primitives.white,
  surface: primitives.red[50],
  surfaceHover: primitives.red[100],
  surfaceElevated: primitives.red[50], // Light red tint for elevated cards

  // Text
  text: primitives.gray[950],
  textSecondary: primitives.gray[600],
  textMuted: primitives.gray[500],
  textOnPrimary: primitives.white,

  // Borders
  border: primitives.red[200],
  borderLight: primitives.red[100],

  // States
  error: primitives.red[600],
  errorBackground: primitives.red[50],
  success: primitives.green[600],
  successBackground: '#DCFCE7',
  warning: primitives.yellow[600],
  warningBackground: '#FEF9C3',
  info: primitives.blue[600],
  infoBackground: '#DBEAFE',
} as const;

// =============================================================================
// ACCENT COLORS
// Feature-specific accent colors for UI elements like cards and icons
// =============================================================================

export const accentColors = {
  analytics: {
    base: primitives.red[600],
    bg: 'rgba(220, 38, 38, 0.1)',
  },
  team: {
    base: primitives.blue[500],
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  settings: {
    base: primitives.purple[500],
    bg: 'rgba(139, 92, 246, 0.1)',
  },
  help: {
    base: primitives.green[500],
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  warning: {
    base: primitives.orange[500],
    bg: 'rgba(249, 115, 22, 0.1)',
  },
} as const;

// =============================================================================
// OPACITY TOKENS
// Standard opacity values for consistent transparency across the app
// =============================================================================

export const opacity = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.5,
  subtle: 0.1,
  medium: 0.15,
  strong: 0.25,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type PrimitiveColors = typeof primitives;
export type SemanticColors = typeof darkSemanticColors;
export type AccentColors = typeof accentColors;
export type OpacityTokens = typeof opacity;
