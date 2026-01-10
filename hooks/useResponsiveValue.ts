/**
 * useResponsiveValue Hook
 *
 * Provides a way to select values based on current breakpoint.
 * Similar to CSS media queries but for React Native values.
 */

import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import { breakpoints, type Breakpoint } from '@/constants/tokens';

/**
 * Breakpoint values object type
 * Keys are breakpoint names, values are the responsive values
 */
export type ResponsiveValue<T> = {
  [K in Breakpoint]?: T;
} & {
  /** Default value used when no breakpoint matches */
  default?: T;
};

/**
 * Get the current breakpoint based on screen width
 */
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Breakpoint order for cascade resolution
 */
const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

/**
 * Hook that returns a value based on the current breakpoint
 *
 * Values cascade up - if a breakpoint doesn't have a value,
 * it uses the value from the next smaller breakpoint.
 *
 * @param values - Object with breakpoint keys and values
 * @returns The value for the current breakpoint
 *
 * @example
 * // Simple usage with explicit values
 * const columns = useResponsiveValue({
 *   default: 1,
 *   sm: 2,
 *   md: 3,
 *   lg: 4,
 * });
 *
 * @example
 * // Padding that increases on larger screens
 * const padding = useResponsiveValue({
 *   default: 16,
 *   md: 24,
 *   lg: 32,
 * });
 */
export function useResponsiveValue<T>(values: ResponsiveValue<T>): T | undefined {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const currentBreakpoint = getCurrentBreakpoint(width);
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    // Look for a value at the current breakpoint or any smaller breakpoint
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    // Fall back to default value
    return values.default;
  }, [width, values]);
}

/**
 * Hook that returns different values for mobile vs desktop
 *
 * @param mobileValue - Value to use on mobile (< md breakpoint)
 * @param desktopValue - Value to use on desktop (>= md breakpoint)
 * @returns The appropriate value based on screen size
 *
 * @example
 * const fontSize = useMobileDesktopValue(14, 16);
 * const showSidebar = useMobileDesktopValue(false, true);
 */
export function useMobileDesktopValue<T>(mobileValue: T, desktopValue: T): T {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    return width >= breakpoints.md ? desktopValue : mobileValue;
  }, [width, mobileValue, desktopValue]);
}

/**
 * Hook that provides responsive spacing values
 *
 * @param compact - Value for small screens
 * @param regular - Value for medium screens
 * @param spacious - Value for large screens
 * @returns The appropriate spacing value
 *
 * @example
 * const padding = useResponsiveSpacing(8, 16, 24);
 */
export function useResponsiveSpacing(
  compact: number,
  regular: number,
  spacious: number
): number {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    if (width >= breakpoints.lg) return spacious;
    if (width >= breakpoints.md) return regular;
    return compact;
  }, [width, compact, regular, spacious]);
}
