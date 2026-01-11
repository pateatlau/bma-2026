/**
 * useBreakpoint hook tests
 *
 * Tests the breakpoint detection hooks. Due to React Native 0.81's architecture,
 * we test the hook behavior with actual window dimensions from the test environment.
 */
import { renderHook } from '@testing-library/react-native';
import {
  useBreakpoint,
  useBreakpointUp,
  useBreakpointDown,
  useBreakpointBetween,
} from '@/hooks/useBreakpoint';
import { breakpoints } from '@/constants/tokens';

describe('useBreakpoint hooks', () => {
  describe('useBreakpoint', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(result.current).toHaveProperty('isXs');
      expect(result.current).toHaveProperty('isSm');
      expect(result.current).toHaveProperty('isMd');
      expect(result.current).toHaveProperty('isLg');
      expect(result.current).toHaveProperty('isXl');
      expect(result.current).toHaveProperty('is2xl');
      expect(result.current).toHaveProperty('isMobile');
      expect(result.current).toHaveProperty('isTablet');
      expect(result.current).toHaveProperty('isDesktop');
      expect(result.current).toHaveProperty('current');
      expect(result.current).toHaveProperty('width');
      expect(result.current).toHaveProperty('height');
    });

    it('returns correct boolean types for breakpoint flags', () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(typeof result.current.isXs).toBe('boolean');
      expect(typeof result.current.isSm).toBe('boolean');
      expect(typeof result.current.isMd).toBe('boolean');
      expect(typeof result.current.isLg).toBe('boolean');
      expect(typeof result.current.isXl).toBe('boolean');
      expect(typeof result.current.is2xl).toBe('boolean');
      expect(typeof result.current.isMobile).toBe('boolean');
      expect(typeof result.current.isTablet).toBe('boolean');
      expect(typeof result.current.isDesktop).toBe('boolean');
    });

    it('has numeric width and height values', () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(typeof result.current.width).toBe('number');
      expect(typeof result.current.height).toBe('number');
      expect(result.current.width).toBeGreaterThanOrEqual(0);
      expect(result.current.height).toBeGreaterThanOrEqual(0);
    });

    it('returns valid breakpoint name', () => {
      const { result } = renderHook(() => useBreakpoint());

      const validBreakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      expect(validBreakpoints).toContain(result.current.current);
    });

    it('has mutually exclusive individual breakpoint flags', () => {
      const { result } = renderHook(() => useBreakpoint());

      // Only one individual breakpoint should be true
      const breakpointFlags = [
        result.current.isXs,
        result.current.isSm,
        result.current.isMd,
        result.current.isLg,
        result.current.isXl,
        result.current.is2xl,
      ];
      const trueCount = breakpointFlags.filter(Boolean).length;

      expect(trueCount).toBe(1);
    });

    it('has consistent semantic helpers', () => {
      const { result } = renderHook(() => useBreakpoint());

      // isMobile should be true if width < md breakpoint
      if (result.current.width < breakpoints.md) {
        expect(result.current.isMobile).toBe(true);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.isDesktop).toBe(false);
      }

      // isTablet should be true if md <= width < lg
      if (result.current.width >= breakpoints.md && result.current.width < breakpoints.lg) {
        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(true);
        expect(result.current.isDesktop).toBe(false);
      }

      // isDesktop should be true if width >= lg
      if (result.current.width >= breakpoints.lg) {
        expect(result.current.isMobile).toBe(false);
        expect(result.current.isTablet).toBe(false);
        expect(result.current.isDesktop).toBe(true);
      }
    });

    it('returns stable reference on re-render', () => {
      const { result, rerender } = renderHook(() => useBreakpoint());

      const firstResult = result.current;
      rerender({});
      const secondResult = result.current;

      // Should be the same reference due to useMemo
      expect(firstResult).toBe(secondResult);
    });
  });

  describe('useBreakpointUp', () => {
    it('returns boolean value', () => {
      const { result } = renderHook(() => useBreakpointUp('md'));
      expect(typeof result.current).toBe('boolean');
    });

    it('always returns true for xs breakpoint', () => {
      const { result } = renderHook(() => useBreakpointUp('xs'));
      // xs starts at 0, so any width is >= 0
      expect(result.current).toBe(true);
    });

    it('is consistent with useBreakpoint width', () => {
      const { result: breakpointResult } = renderHook(() => useBreakpoint());
      const { result: upResult } = renderHook(() => useBreakpointUp('md'));

      const width = breakpointResult.current.width;
      const shouldBeUp = width >= breakpoints.md;

      expect(upResult.current).toBe(shouldBeUp);
    });
  });

  describe('useBreakpointDown', () => {
    it('returns boolean value', () => {
      const { result } = renderHook(() => useBreakpointDown('md'));
      expect(typeof result.current).toBe('boolean');
    });

    it('is consistent with useBreakpoint width', () => {
      const { result: breakpointResult } = renderHook(() => useBreakpoint());
      const { result: downResult } = renderHook(() => useBreakpointDown('md'));

      const width = breakpointResult.current.width;
      const shouldBeDown = width < breakpoints.md;

      expect(downResult.current).toBe(shouldBeDown);
    });

    it('is inverse of useBreakpointUp for same breakpoint', () => {
      const { result: upResult } = renderHook(() => useBreakpointUp('lg'));
      const { result: downResult } = renderHook(() => useBreakpointDown('lg'));

      // These should be mutually exclusive
      expect(upResult.current).not.toBe(downResult.current);
    });
  });

  describe('useBreakpointBetween', () => {
    it('returns boolean value', () => {
      const { result } = renderHook(() => useBreakpointBetween('md', 'lg'));
      expect(typeof result.current).toBe('boolean');
    });

    it('is consistent with useBreakpoint width', () => {
      const { result: breakpointResult } = renderHook(() => useBreakpoint());
      const { result: betweenResult } = renderHook(() => useBreakpointBetween('md', 'lg'));

      const width = breakpointResult.current.width;
      const shouldBeBetween = width >= breakpoints.md && width < breakpoints.lg;

      expect(betweenResult.current).toBe(shouldBeBetween);
    });
  });
});

describe('breakpoints token values', () => {
  it('has expected breakpoint values', () => {
    expect(breakpoints.xs).toBe(0);
    expect(breakpoints.sm).toBe(480);
    expect(breakpoints.md).toBe(768);
    expect(breakpoints.lg).toBe(1024);
    expect(breakpoints.xl).toBe(1280);
    expect(breakpoints['2xl']).toBe(1536);
  });

  it('has increasing breakpoint values', () => {
    expect(breakpoints.xs).toBeLessThan(breakpoints.sm);
    expect(breakpoints.sm).toBeLessThan(breakpoints.md);
    expect(breakpoints.md).toBeLessThan(breakpoints.lg);
    expect(breakpoints.lg).toBeLessThan(breakpoints.xl);
    expect(breakpoints.xl).toBeLessThan(breakpoints['2xl']);
  });
});
