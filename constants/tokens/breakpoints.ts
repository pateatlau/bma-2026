/**
 * Breakpoint Tokens
 *
 * Responsive breakpoint definitions for adaptive layouts.
 * These values determine when layouts should adjust for different screen sizes.
 */

// =============================================================================
// BREAKPOINT VALUES
// Min-width values for each breakpoint
// =============================================================================

export const breakpoints = {
  xs: 0, // Mobile portrait
  sm: 480, // Mobile landscape
  md: 768, // Tablet portrait
  lg: 1024, // Tablet landscape / Desktop
  xl: 1280, // Large desktop
  '2xl': 1536, // Extra large desktop
} as const;

// =============================================================================
// BREAKPOINT QUERIES
// Pre-composed media query strings for web usage
// =============================================================================

export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
} as const;

// =============================================================================
// BREAKPOINT RANGES
// Min and max values for targeting specific breakpoint ranges
// =============================================================================

export const breakpointRanges = {
  xs: { min: breakpoints.xs, max: breakpoints.sm - 1 },
  sm: { min: breakpoints.sm, max: breakpoints.md - 1 },
  md: { min: breakpoints.md, max: breakpoints.lg - 1 },
  lg: { min: breakpoints.lg, max: breakpoints.xl - 1 },
  xl: { min: breakpoints.xl, max: breakpoints['2xl'] - 1 },
  '2xl': { min: breakpoints['2xl'], max: Infinity },
} as const;

// =============================================================================
// SEMANTIC BREAKPOINTS
// Named breakpoints for common device categories
// =============================================================================

export const deviceBreakpoints = {
  mobile: breakpoints.md, // Below this is mobile
  tablet: breakpoints.lg, // Below this is tablet (but >= mobile)
  desktop: breakpoints.lg, // At or above this is desktop
} as const;

// =============================================================================
// HELPER FUNCTIONS
// Utilities for working with breakpoints
// =============================================================================

/**
 * Get the current breakpoint name based on width
 */
export function getBreakpoint(width: number): keyof typeof breakpoints {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Check if width is at or above a specific breakpoint
 */
export function isAtLeast(
  width: number,
  breakpoint: keyof typeof breakpoints
): boolean {
  return width >= breakpoints[breakpoint];
}

/**
 * Check if width is below a specific breakpoint
 */
export function isBelow(
  width: number,
  breakpoint: keyof typeof breakpoints
): boolean {
  return width < breakpoints[breakpoint];
}

/**
 * Check if width falls within a specific breakpoint range
 */
export function isBetween(
  width: number,
  minBreakpoint: keyof typeof breakpoints,
  maxBreakpoint: keyof typeof breakpoints
): boolean {
  return (
    width >= breakpoints[minBreakpoint] && width < breakpoints[maxBreakpoint]
  );
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Breakpoint = keyof typeof breakpoints;
export type DeviceBreakpoint = keyof typeof deviceBreakpoints;
