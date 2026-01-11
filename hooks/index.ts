export { useMediaQuery } from './useMediaQuery';

// Breakpoint hooks
export {
  useBreakpoint,
  useBreakpointUp,
  useBreakpointDown,
  useBreakpointBetween,
  type BreakpointInfo,
} from './useBreakpoint';

// Responsive value hooks
export {
  useResponsiveValue,
  useMobileDesktopValue,
  useResponsiveSpacing,
  type ResponsiveValue,
} from './useResponsiveValue';

// Accessibility hooks
export {
  useAccessibility,
  useButtonAccessibility,
  useLinkAccessibility,
  useHeadingAccessibility,
  useImageAccessibility,
  useInputAccessibility,
  type AccessibilityOptions,
} from './useAccessibility';

// Platform hooks
export {
  usePlatform,
  usePlatformValue,
  useNativeWebValue,
  usePlatformStyles,
  usePlatformFeature,
  type PlatformInfo,
  type PlatformValues,
} from './usePlatform';
