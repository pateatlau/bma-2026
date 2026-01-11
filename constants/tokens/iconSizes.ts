/**
 * Icon Size Tokens
 *
 * Consistent icon sizing scale for use with @expo/vector-icons
 * and other icon libraries.
 */

// =============================================================================
// ICON SIZES
// Standard icon size scale
// =============================================================================

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

// =============================================================================
// ICON SIZE CONTEXTS
// Recommended icon sizes for specific UI contexts
// =============================================================================

export const iconContextSizes = {
  // Inline with text
  inlineSmall: iconSizes.sm, // 16px - with small text
  inlineBase: iconSizes.md, // 20px - with body text
  inlineLarge: iconSizes.lg, // 24px - with large text

  // Buttons
  buttonSmall: iconSizes.sm, // 16px
  buttonMedium: iconSizes.md, // 20px
  buttonLarge: iconSizes.lg, // 24px

  // Navigation
  navItem: iconSizes.lg, // 24px
  tabBar: iconSizes.lg, // 24px
  header: iconSizes.lg, // 24px

  // Cards and features
  cardIcon: iconSizes.lg, // 24px
  featureIcon: iconSizes.xl, // 32px
  heroIcon: iconSizes['2xl'], // 48px

  // Status and indicators
  statusIcon: iconSizes.sm, // 16px
  badge: iconSizes.xs, // 14px

  // Input fields
  inputIcon: iconSizes.md, // 20px
  inputAction: iconSizes.lg, // 24px
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type IconSize = keyof typeof iconSizes;
export type IconContextSize = keyof typeof iconContextSizes;
