/**
 * Shadow Tokens
 *
 * Platform-aware shadow definitions that work across iOS, Android, and Web.
 * iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius
 * Android uses elevation
 * Web uses boxShadow (handled by React Native Web)
 */

import { Platform, ViewStyle } from 'react-native';

// =============================================================================
// SHADOW DEFINITIONS
// Cross-platform shadow tokens with consistent visual appearance
// =============================================================================

export type ShadowDefinition = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const shadows: Record<string, ShadowDefinition> = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
} as const;

// =============================================================================
// SHADOW HELPER FUNCTION
// Returns platform-appropriate shadow styles
// =============================================================================

export function getShadow(size: keyof typeof shadows): ViewStyle {
  const shadow = shadows[size];

  if (Platform.OS === 'android') {
    // Android only uses elevation for shadows
    return {
      elevation: shadow.elevation,
    };
  }

  // iOS and Web use full shadow properties
  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
  };
}

// =============================================================================
// LEGACY SHADOWS
// Maintains compatibility with existing theme.ts
// =============================================================================

export const legacyShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Shadow = keyof typeof shadows;
