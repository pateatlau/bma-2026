/**
 * usePlatform Hook
 *
 * Provides platform detection and platform-specific value selection.
 * Useful for handling platform differences in a declarative way.
 */

import { useMemo } from 'react';
import { Platform, PlatformOSType } from 'react-native';

/**
 * Platform information object
 */
export interface PlatformInfo {
  /** Current platform OS */
  os: PlatformOSType;
  /** Whether running on iOS */
  isIOS: boolean;
  /** Whether running on Android */
  isAndroid: boolean;
  /** Whether running on Web */
  isWeb: boolean;
  /** Whether running on a native platform (iOS or Android) */
  isNative: boolean;
  /** Whether running on a mobile platform (iOS or Android, not web) */
  isMobile: boolean;
  /** Platform version (may be undefined on web) */
  version: string | number | undefined;
  /** Whether the platform is TV (Apple TV or Android TV) */
  isTV: boolean;
}

/**
 * Hook that provides current platform information
 *
 * @returns PlatformInfo object with platform detection booleans
 *
 * @example
 * const { isWeb, isNative, isIOS } = usePlatform();
 *
 * if (isWeb) {
 *   // Web-specific behavior
 * }
 */
export function usePlatform(): PlatformInfo {
  return useMemo(() => {
    const os = Platform.OS;
    const isIOS = os === 'ios';
    const isAndroid = os === 'android';
    const isWeb = os === 'web';
    const isNative = isIOS || isAndroid;
    const isMobile = isNative;
    const isTV = Platform.isTV ?? false;

    return {
      os,
      isIOS,
      isAndroid,
      isWeb,
      isNative,
      isMobile,
      version: Platform.Version,
      isTV,
    };
  }, []);
}

/**
 * Platform-specific values type
 */
export type PlatformValues<T> = {
  ios?: T;
  android?: T;
  web?: T;
  native?: T;
  default: T;
};

/**
 * Hook that returns a value based on the current platform
 *
 * Priority order:
 * 1. Specific platform (ios, android, web)
 * 2. Native (for ios/android when native is specified)
 * 3. Default
 *
 * @param values - Object with platform keys and values
 * @returns The value for the current platform
 *
 * @example
 * const shadowStyle = usePlatformValue({
 *   ios: { shadowColor: '#000', shadowOpacity: 0.2 },
 *   android: { elevation: 4 },
 *   web: { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
 *   default: {},
 * });
 *
 * @example
 * // Native vs Web
 * const fontFamily = usePlatformValue({
 *   native: 'System',
 *   web: '-apple-system, BlinkMacSystemFont, sans-serif',
 *   default: undefined,
 * });
 */
export function usePlatformValue<T>(values: PlatformValues<T>): T {
  const { os, isNative } = usePlatform();

  return useMemo(() => {
    // Check for specific platform first
    if (os === 'ios' && values.ios !== undefined) {
      return values.ios;
    }
    if (os === 'android' && values.android !== undefined) {
      return values.android;
    }
    if (os === 'web' && values.web !== undefined) {
      return values.web;
    }

    // Check for native (ios or android)
    if (isNative && values.native !== undefined) {
      return values.native;
    }

    // Fall back to default
    return values.default;
  }, [os, isNative, values]);
}

/**
 * Hook that returns one value for native platforms and another for web
 *
 * @param nativeValue - Value for iOS and Android
 * @param webValue - Value for Web
 * @returns The appropriate value based on platform
 *
 * @example
 * const keyboardBehavior = useNativeWebValue('padding', 'height');
 */
export function useNativeWebValue<T>(nativeValue: T, webValue: T): T {
  const { isNative } = usePlatform();

  return useMemo(() => {
    return isNative ? nativeValue : webValue;
  }, [isNative, nativeValue, webValue]);
}

/**
 * Hook that provides platform-specific styles
 *
 * @param ios - iOS-specific styles
 * @param android - Android-specific styles
 * @param web - Web-specific styles
 * @returns The styles for the current platform
 *
 * @example
 * const platformStyles = usePlatformStyles(
 *   { paddingTop: 44 }, // iOS
 *   { paddingTop: 24 }, // Android
 *   { paddingTop: 0 },  // Web
 * );
 */
export function usePlatformStyles<T extends object>(
  ios: T,
  android: T,
  web: T
): T {
  return usePlatformValue({
    ios,
    android,
    web,
    default: web,
  });
}

/**
 * Hook that checks if a specific feature is available on current platform
 *
 * @param feature - The feature to check
 * @returns boolean indicating if the feature is available
 *
 * @example
 * const hasHaptics = usePlatformFeature('haptics');
 * if (hasHaptics) {
 *   // Enable haptic feedback
 * }
 */
export function usePlatformFeature(
  feature: 'haptics' | 'biometrics' | 'pushNotifications' | 'statusBar'
): boolean {
  const { isNative, isIOS, isAndroid } = usePlatform();

  return useMemo(() => {
    switch (feature) {
      case 'haptics':
        return isNative;
      case 'biometrics':
        return isNative;
      case 'pushNotifications':
        return isNative;
      case 'statusBar':
        return isIOS || isAndroid;
      default:
        return false;
    }
  }, [feature, isNative, isIOS, isAndroid]);
}
