/**
 * Layout Tokens
 *
 * Fixed dimensions and layout-specific values for consistent
 * component sizing and page structure.
 */

// =============================================================================
// MAX WIDTH CONSTRAINTS
// Maximum content widths for different layout contexts
// =============================================================================

export const maxWidth = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1200,
  '2xl': 1400,
  full: '100%',
} as const;

// =============================================================================
// HEADER HEIGHTS
// Fixed heights for navigation headers across platforms
// =============================================================================

export const headerHeight = {
  mobile: 56,
  desktop: 64,
} as const;

// =============================================================================
// SIDEBAR DIMENSIONS
// Widths for sidebar/drawer navigation
// =============================================================================

export const sidebarWidth = {
  collapsed: 64,
  expanded: 280,
} as const;

// =============================================================================
// TOUCH TARGET SIZES
// Minimum and recommended sizes for interactive elements
// Based on platform accessibility guidelines
// =============================================================================

export const touchTarget = {
  min: 44, // Minimum touch target size (WCAG/Apple HIG)
  recommended: 48, // Recommended size (Material Design)
} as const;

// =============================================================================
// Z-INDEX SCALE
// Consistent layering for overlapping elements
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

// =============================================================================
// ASPECT RATIOS
// Common aspect ratios for images and media containers
// =============================================================================

export const aspectRatio = {
  square: 1,
  video: 16 / 9,
  photo: 4 / 3,
  portrait: 3 / 4,
  wide: 21 / 9,
} as const;

// =============================================================================
// CONTAINER WIDTHS
// Pre-defined container configurations
// =============================================================================

export const container = {
  // Auth forms (login, signup, etc.)
  auth: {
    maxWidth: 440,
    padding: 24,
  },
  // Content pages
  content: {
    maxWidth: 1200,
    padding: 16,
  },
  // Full-width sections
  fullWidth: {
    maxWidth: '100%',
    padding: 16,
  },
  // Narrow reading content
  prose: {
    maxWidth: 680,
    padding: 24,
  },
} as const;

// =============================================================================
// MODAL SIZES
// Standard modal dimensions
// =============================================================================

export const modalSize = {
  sm: {
    width: 400,
    maxWidth: '90%',
  },
  md: {
    width: 560,
    maxWidth: '90%',
  },
  lg: {
    width: 800,
    maxWidth: '90%',
  },
  full: {
    width: '100%',
    maxWidth: '100%',
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type MaxWidth = keyof typeof maxWidth;
export type HeaderHeight = keyof typeof headerHeight;
export type SidebarWidth = keyof typeof sidebarWidth;
export type ZIndex = keyof typeof zIndex;
export type AspectRatio = keyof typeof aspectRatio;
export type ContainerType = keyof typeof container;
export type ModalSize = keyof typeof modalSize;
