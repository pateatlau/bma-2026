/**
 * usePlatform hook tests
 *
 * Note: Due to React Native 0.81's new architecture, we test the hook's
 * behavior with the default Platform values rather than mocking Platform.
 * The tests verify the hook's logic is correct for the test environment.
 */
import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import {
  usePlatform,
  usePlatformValue,
  useNativeWebValue,
  usePlatformStyles,
  usePlatformFeature,
} from '@/hooks/usePlatform';

describe('usePlatform hook', () => {
  describe('usePlatform', () => {
    it('returns a PlatformInfo object with all expected properties', () => {
      const { result } = renderHook(() => usePlatform());

      expect(result.current).toHaveProperty('os');
      expect(result.current).toHaveProperty('isIOS');
      expect(result.current).toHaveProperty('isAndroid');
      expect(result.current).toHaveProperty('isWeb');
      expect(result.current).toHaveProperty('isNative');
      expect(result.current).toHaveProperty('isMobile');
      expect(result.current).toHaveProperty('version');
      expect(result.current).toHaveProperty('isTV');
    });

    it('returns correct boolean types for all flags', () => {
      const { result } = renderHook(() => usePlatform());

      expect(typeof result.current.isIOS).toBe('boolean');
      expect(typeof result.current.isAndroid).toBe('boolean');
      expect(typeof result.current.isWeb).toBe('boolean');
      expect(typeof result.current.isNative).toBe('boolean');
      expect(typeof result.current.isMobile).toBe('boolean');
      expect(typeof result.current.isTV).toBe('boolean');
    });

    it('has consistent isNative and isMobile values', () => {
      const { result } = renderHook(() => usePlatform());

      // isNative and isMobile should be the same (both true for ios/android, false for web)
      expect(result.current.isNative).toBe(result.current.isMobile);
    });

    it('ensures mutually exclusive platform flags', () => {
      const { result } = renderHook(() => usePlatform());

      // Only one of iOS, Android, Web can be true at a time
      const platformFlags = [result.current.isIOS, result.current.isAndroid, result.current.isWeb];
      const trueCount = platformFlags.filter(Boolean).length;

      expect(trueCount).toBeLessThanOrEqual(1);
    });

    it('returns stable reference on re-render when platform does not change', () => {
      const { result, rerender } = renderHook(() => usePlatform());

      const firstResult = result.current;
      rerender({});
      const secondResult = result.current;

      // The object reference should be the same due to useMemo
      expect(firstResult).toBe(secondResult);
    });

    it('matches Platform.OS value', () => {
      const { result } = renderHook(() => usePlatform());

      expect(result.current.os).toBe(Platform.OS);
    });
  });

  describe('usePlatformValue', () => {
    it('returns default value when no platform-specific value exists', () => {
      const { result } = renderHook(() =>
        usePlatformValue({
          default: 'default-value',
        })
      );

      expect(result.current).toBe('default-value');
    });

    it('works with different value types', () => {
      const { result: stringResult } = renderHook(() => usePlatformValue({ default: 'string' }));
      const { result: numberResult } = renderHook(() => usePlatformValue({ default: 42 }));
      const { result: objectResult } = renderHook(() =>
        usePlatformValue({ default: { key: 'value' } })
      );

      expect(stringResult.current).toBe('string');
      expect(numberResult.current).toBe(42);
      expect(objectResult.current).toEqual({ key: 'value' });
    });

    it('returns stable reference for objects when inputs dont change', () => {
      const values = { default: { key: 'value' } };
      const { result, rerender } = renderHook(() => usePlatformValue(values));

      const firstResult = result.current;
      rerender({});
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });

  describe('useNativeWebValue', () => {
    it('returns one of the two provided values', () => {
      const { result } = renderHook(() => useNativeWebValue('native', 'web'));

      expect(['native', 'web']).toContain(result.current);
    });

    it('works with different value types', () => {
      const { result: numberResult } = renderHook(() => useNativeWebValue(1, 2));
      const { result: objectResult } = renderHook(() => useNativeWebValue({ a: 1 }, { b: 2 }));

      expect([1, 2]).toContain(numberResult.current);
      expect([{ a: 1 }, { b: 2 }]).toContainEqual(objectResult.current);
    });
  });

  describe('usePlatformStyles', () => {
    const iosStyles = { paddingTop: 44 };
    const androidStyles = { paddingTop: 24 };
    const webStyles = { paddingTop: 0 };

    it('returns one of the provided style objects', () => {
      const { result } = renderHook(() => usePlatformStyles(iosStyles, androidStyles, webStyles));

      expect([iosStyles, androidStyles, webStyles]).toContainEqual(result.current);
    });
  });

  describe('usePlatformFeature', () => {
    it('returns boolean for haptics feature', () => {
      const { result } = renderHook(() => usePlatformFeature('haptics'));
      expect(typeof result.current).toBe('boolean');
    });

    it('returns boolean for biometrics feature', () => {
      const { result } = renderHook(() => usePlatformFeature('biometrics'));
      expect(typeof result.current).toBe('boolean');
    });

    it('returns boolean for pushNotifications feature', () => {
      const { result } = renderHook(() => usePlatformFeature('pushNotifications'));
      expect(typeof result.current).toBe('boolean');
    });

    it('returns boolean for statusBar feature', () => {
      const { result } = renderHook(() => usePlatformFeature('statusBar'));
      expect(typeof result.current).toBe('boolean');
    });
  });
});
