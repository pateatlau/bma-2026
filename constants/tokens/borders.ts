/**
 * Border Tokens
 *
 * Border radius and border width definitions for consistent
 * component styling across the design system.
 */

// =============================================================================
// BORDER RADIUS
// Consistent corner rounding scale
// =============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// =============================================================================
// BORDER WIDTH
// Standard border thickness values
// =============================================================================

export const borderWidth = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  medium: 2,
  thick: 4,
} as const;

// =============================================================================
// BORDER STYLES
// Pre-composed border style objects for common patterns
// =============================================================================

export const borderStyles = {
  // Subtle border - for cards, containers
  subtle: {
    borderWidth: borderWidth.thin,
    borderRadius: borderRadius.lg,
  },
  // Default border - for inputs, interactive elements
  default: {
    borderWidth: borderWidth.thin,
    borderRadius: borderRadius.md,
  },
  // Prominent border - for focus states, emphasis
  prominent: {
    borderWidth: borderWidth.medium,
    borderRadius: borderRadius.md,
  },
  // Pill shape - for tags, badges, pills
  pill: {
    borderWidth: borderWidth.thin,
    borderRadius: borderRadius.full,
  },
  // Circle - for avatars, icon containers
  circle: {
    borderWidth: borderWidth.thin,
    borderRadius: borderRadius.full,
  },
} as const;

// =============================================================================
// LEGACY BORDER RADIUS
// Maintains compatibility with existing theme.ts
// =============================================================================

export const legacyBorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type BorderRadius = keyof typeof borderRadius;
export type BorderWidth = keyof typeof borderWidth;
export type BorderStyle = keyof typeof borderStyles;
