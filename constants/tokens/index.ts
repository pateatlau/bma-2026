/**
 * Design System Tokens - Barrel Export
 *
 * Central export point for all design tokens.
 * Import tokens from this file for consistent access across the app.
 *
 * @example
 * import { primitives, spacing, borderRadius, iconSizes } from '@/constants/tokens';
 */

// =============================================================================
// COLOR TOKENS
// =============================================================================

export {
  primitives,
  darkSemanticColors,
  lightSemanticColors,
  accentColors,
  opacity,
  type PrimitiveColors,
  type SemanticColors,
  type AccentColors,
  type OpacityTokens,
} from './colors';

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

export {
  fontSizes,
  lineHeights,
  fontWeights,
  fontFamily,
  letterSpacing,
  textStyles,
  type FontSize,
  type LineHeight,
  type FontWeight,
  type LetterSpacing,
  type TextStyle,
} from './typography';

// =============================================================================
// SPACING TOKENS
// =============================================================================

export {
  spacing,
  componentPadding,
  stackGap,
  inlineGap,
  screenPadding,
  sectionGap,
  legacySpacing,
  type Spacing,
  type ComponentPadding,
  type StackGap,
  type InlineGap,
  type ScreenPadding,
  type SectionGap,
} from './spacing';

// =============================================================================
// BORDER TOKENS
// =============================================================================

export {
  borderRadius,
  borderWidth,
  borderStyles,
  legacyBorderRadius,
  type BorderRadius,
  type BorderWidth,
  type BorderStyle,
} from './borders';

// =============================================================================
// SHADOW TOKENS
// =============================================================================

export { shadows, getShadow, type ShadowDefinition, type Shadow } from './shadows';

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export {
  duration,
  easing,
  easingCSS,
  springConfig,
  animationPresets,
  type Duration,
  type EasingType,
  type SpringConfig,
  type AnimationPreset,
} from './animation';

// =============================================================================
// BREAKPOINT TOKENS
// =============================================================================

export {
  breakpoints,
  mediaQueries,
  breakpointRanges,
  deviceBreakpoints,
  getBreakpoint,
  isAtLeast,
  isBelow,
  isBetween,
  type Breakpoint,
  type DeviceBreakpoint,
} from './breakpoints';

// =============================================================================
// LAYOUT TOKENS
// =============================================================================

export {
  maxWidth,
  headerHeight,
  sidebarWidth,
  touchTarget,
  zIndex,
  aspectRatio,
  container,
  modalSize,
  type MaxWidth,
  type HeaderHeight,
  type SidebarWidth,
  type ZIndex,
  type AspectRatio,
  type ContainerType,
  type ModalSize,
} from './layout';

// =============================================================================
// ICON SIZE TOKENS
// =============================================================================

export { iconSizes, iconContextSizes, type IconSize, type IconContextSize } from './iconSizes';
