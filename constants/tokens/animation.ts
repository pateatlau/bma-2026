/**
 * Animation Tokens
 *
 * Duration and easing definitions for consistent motion design.
 * These tokens ensure animations feel cohesive across the app.
 */

import { Easing } from 'react-native';

// =============================================================================
// DURATION
// Standard timing values for animations and transitions
// =============================================================================

export const duration = {
  instant: 0,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

// =============================================================================
// EASING - NATIVE VALUES
// Easing functions for React Native Animated API
// =============================================================================

export const easing = {
  linear: Easing.linear,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  // Specific curves for different animation types
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
  standard: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

// =============================================================================
// EASING - CSS VALUES
// CSS cubic-bezier strings for web transitions
// =============================================================================

export const easingCSS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// =============================================================================
// SPRING CONFIGURATIONS
// React Native Animated spring presets
// =============================================================================

export const springConfig = {
  // Subtle, gentle spring
  gentle: {
    tension: 100,
    friction: 10,
    useNativeDriver: true,
  },
  // Default, balanced spring
  default: {
    tension: 170,
    friction: 26,
    useNativeDriver: true,
  },
  // Bouncy, playful spring
  bouncy: {
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  },
  // Stiff, quick spring
  stiff: {
    tension: 400,
    friction: 30,
    useNativeDriver: true,
  },
} as const;

// =============================================================================
// ANIMATION PRESETS
// Pre-composed animation configurations for common patterns
// =============================================================================

export const animationPresets = {
  // Quick feedback for micro-interactions
  microInteraction: {
    duration: duration.fast,
    easing: easing.easeOut,
  },
  // Standard UI transitions
  transition: {
    duration: duration.normal,
    easing: easing.easeInOut,
  },
  // Page/screen transitions
  pageTransition: {
    duration: duration.slow,
    easing: easing.decelerate,
  },
  // Entrance animations
  entrance: {
    duration: duration.slow,
    easing: easing.decelerate,
  },
  // Exit animations
  exit: {
    duration: duration.normal,
    easing: easing.accelerate,
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Duration = keyof typeof duration;
export type EasingType = keyof typeof easing;
export type SpringConfig = keyof typeof springConfig;
export type AnimationPreset = keyof typeof animationPresets;
