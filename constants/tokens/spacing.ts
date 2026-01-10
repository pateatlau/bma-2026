/**
 * Spacing Tokens
 *
 * A consistent spacing scale based on a 4px base unit.
 * Used for margins, padding, gaps, and other spatial relationships.
 */

// =============================================================================
// BASE SPACING SCALE
// Core spacing values following a 4px base unit system
// =============================================================================

export const spacing = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

// =============================================================================
// SEMANTIC SPACING
// Purpose-specific spacing tokens for common use cases
// =============================================================================

export const componentPadding = {
  xs: spacing[1], // 4px
  sm: spacing[2], // 8px
  md: spacing[4], // 16px
  lg: spacing[6], // 24px
  xl: spacing[8], // 32px
} as const;

export const stackGap = {
  xs: spacing[1], // 4px
  sm: spacing[2], // 8px
  md: spacing[4], // 16px
  lg: spacing[6], // 24px
  xl: spacing[8], // 32px
} as const;

export const inlineGap = {
  xs: spacing[1], // 4px
  sm: spacing[2], // 8px
  md: spacing[3], // 12px
  lg: spacing[4], // 16px
  xl: spacing[6], // 24px
} as const;

// =============================================================================
// SCREEN/LAYOUT SPACING
// Spacing tokens specifically for page-level layout
// =============================================================================

export const screenPadding = {
  mobile: spacing[4], // 16px
  tablet: spacing[6], // 24px
  desktop: spacing[8], // 32px
} as const;

export const sectionGap = {
  sm: spacing[6], // 24px
  md: spacing[8], // 32px
  lg: spacing[12], // 48px
} as const;

// =============================================================================
// LEGACY SPACING
// Maintains compatibility with existing theme.ts spacing tokens
// =============================================================================

export const legacySpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Spacing = keyof typeof spacing;
export type ComponentPadding = keyof typeof componentPadding;
export type StackGap = keyof typeof stackGap;
export type InlineGap = keyof typeof inlineGap;
export type ScreenPadding = keyof typeof screenPadding;
export type SectionGap = keyof typeof sectionGap;
