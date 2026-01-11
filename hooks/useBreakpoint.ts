/**
 * useBreakpoint Hook
 *
 * Provides responsive breakpoint information based on screen width.
 * Uses the design system breakpoint tokens for consistent behavior.
 */

import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { breakpoints, getBreakpoint, type Breakpoint } from '@/constants/tokens';

export interface BreakpointInfo {
  // Individual breakpoint checks
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;

  // Semantic helpers
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Current breakpoint name
  current: Breakpoint;

  // Screen dimensions
  width: number;
  height: number;
}

/**
 * Hook that provides current breakpoint information
 *
 * @returns BreakpointInfo object with breakpoint states and dimensions
 *
 * @example
 * const { isMobile, isDesktop, current } = useBreakpoint();
 *
 * if (isMobile) {
 *   // Render mobile layout
 * }
 *
 * // Use current breakpoint for conditional rendering
 * const columns = current === 'xs' ? 1 : current === 'sm' ? 2 : 3;
 */
export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();

  const breakpointInfo = useMemo((): BreakpointInfo => {
    const current = getBreakpoint(width);

    return {
      // Individual breakpoint checks (exact match)
      isXs: width < breakpoints.sm,
      isSm: width >= breakpoints.sm && width < breakpoints.md,
      isMd: width >= breakpoints.md && width < breakpoints.lg,
      isLg: width >= breakpoints.lg && width < breakpoints.xl,
      isXl: width >= breakpoints.xl && width < breakpoints['2xl'],
      is2xl: width >= breakpoints['2xl'],

      // Semantic helpers
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,

      // Current breakpoint
      current,

      // Dimensions
      width,
      height,
    };
  }, [width, height]);

  return breakpointInfo;
}

/**
 * Hook that checks if the screen is at or above a specific breakpoint
 *
 * @param breakpoint - The breakpoint to check against
 * @returns boolean indicating if current width is at or above the breakpoint
 *
 * @example
 * const isAtLeastMd = useBreakpointUp('md');
 * // true if width >= 768px
 */
export function useBreakpointUp(breakpoint: Breakpoint): boolean {
  const { width } = useWindowDimensions();
  return width >= breakpoints[breakpoint];
}

/**
 * Hook that checks if the screen is below a specific breakpoint
 *
 * @param breakpoint - The breakpoint to check against
 * @returns boolean indicating if current width is below the breakpoint
 *
 * @example
 * const isBelowLg = useBreakpointDown('lg');
 * // true if width < 1024px
 */
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  const { width } = useWindowDimensions();
  return width < breakpoints[breakpoint];
}

/**
 * Hook that checks if the screen is between two breakpoints
 *
 * @param min - The minimum breakpoint (inclusive)
 * @param max - The maximum breakpoint (exclusive)
 * @returns boolean indicating if current width is between the breakpoints
 *
 * @example
 * const isTablet = useBreakpointBetween('md', 'lg');
 * // true if width >= 768px && width < 1024px
 */
export function useBreakpointBetween(min: Breakpoint, max: Breakpoint): boolean {
  const { width } = useWindowDimensions();
  return width >= breakpoints[min] && width < breakpoints[max];
}
