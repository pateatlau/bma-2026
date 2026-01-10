/**
 * Color Utility Functions
 *
 * Helper functions for working with colors in the design system.
 * Includes opacity manipulation, contrast calculation, and color parsing.
 */

// =============================================================================
// OPACITY UTILITIES
// =============================================================================

/**
 * Apply opacity to a hex color, returning an rgba string
 *
 * @param hexColor - Hex color string (e.g., '#DC2626' or 'DC2626')
 * @param opacity - Opacity value between 0 and 1
 * @returns rgba color string
 *
 * @example
 * withOpacity('#DC2626', 0.5) // 'rgba(220, 38, 38, 0.5)'
 * withOpacity('#DC2626', 0.1) // 'rgba(220, 38, 38, 0.1)'
 */
export function withOpacity(hexColor: string, opacity: number): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Handle shorthand hex (e.g., #FFF)
  const fullHex =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;

  // Parse RGB values
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // Clamp opacity between 0 and 1
  const clampedOpacity = Math.max(0, Math.min(1, opacity));

  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
}

// =============================================================================
// CONTRAST UTILITIES
// =============================================================================

/**
 * Get contrasting text color (black or white) for a given background color
 *
 * Uses relative luminance calculation per WCAG 2.1 guidelines.
 *
 * @param hexColor - Background hex color
 * @returns '#FFFFFF' for dark backgrounds, '#000000' for light backgrounds
 *
 * @example
 * getContrastText('#DC2626') // '#FFFFFF' (white text on red)
 * getContrastText('#FFFFFF') // '#000000' (black text on white)
 */
export function getContrastText(hexColor: string): '#FFFFFF' | '#000000' {
  const hex = hexColor.replace('#', '');

  // Handle shorthand hex
  const fullHex =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  // Calculate relative luminance using sRGB formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds (luminance < 0.5)
  // Return black for light backgrounds (luminance >= 0.5)
  return luminance < 0.5 ? '#FFFFFF' : '#000000';
}

/**
 * Calculate the relative luminance of a color
 *
 * @param hexColor - Hex color string
 * @returns Luminance value between 0 (black) and 1 (white)
 */
export function getLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');

  const fullHex =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;

  const r = parseInt(fullHex.substring(0, 2), 16) / 255;
  const g = parseInt(fullHex.substring(2, 4), 16) / 255;
  const b = parseInt(fullHex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const gammaCorrectedR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gammaCorrectedG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const gammaCorrectedB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance per WCAG 2.1
  return 0.2126 * gammaCorrectedR + 0.7152 * gammaCorrectedG + 0.0722 * gammaCorrectedB;
}

/**
 * Calculate contrast ratio between two colors
 *
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1 to 21)
 *
 * @example
 * getContrastRatio('#000000', '#FFFFFF') // 21 (maximum contrast)
 * getContrastRatio('#DC2626', '#FFFFFF') // ~4.5 (meets AA for large text)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG contrast requirements
 *
 * @param foreground - Text/foreground hex color
 * @param background - Background hex color
 * @param level - WCAG level ('AA' or 'AAA')
 * @param isLargeText - Whether text is large (18px+ bold or 24px+ regular)
 * @returns Whether the contrast meets the specified level
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  // AA level
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// =============================================================================
// COLOR PARSING UTILITIES
// =============================================================================

/**
 * Parse a hex color to RGB values
 *
 * @param hexColor - Hex color string
 * @returns Object with r, g, b values (0-255)
 */
export function hexToRgb(hexColor: string): { r: number; g: number; b: number } {
  const hex = hexColor.replace('#', '');

  const fullHex =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex;

  return {
    r: parseInt(fullHex.substring(0, 2), 16),
    g: parseInt(fullHex.substring(2, 4), 16),
    b: parseInt(fullHex.substring(4, 6), 16),
  };
}

/**
 * Convert RGB values to a hex color string
 *
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string with # prefix
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// =============================================================================
// COLOR MANIPULATION UTILITIES
// =============================================================================

/**
 * Lighten a hex color by a percentage
 *
 * @param hexColor - Hex color to lighten
 * @param amount - Amount to lighten (0-1, where 1 = white)
 * @returns Lightened hex color
 */
export function lighten(hexColor: string, amount: number): string {
  const { r, g, b } = hexToRgb(hexColor);
  const clampedAmount = Math.max(0, Math.min(1, amount));

  return rgbToHex(
    r + (255 - r) * clampedAmount,
    g + (255 - g) * clampedAmount,
    b + (255 - b) * clampedAmount
  );
}

/**
 * Darken a hex color by a percentage
 *
 * @param hexColor - Hex color to darken
 * @param amount - Amount to darken (0-1, where 1 = black)
 * @returns Darkened hex color
 */
export function darken(hexColor: string, amount: number): string {
  const { r, g, b } = hexToRgb(hexColor);
  const clampedAmount = Math.max(0, Math.min(1, amount));

  return rgbToHex(
    r * (1 - clampedAmount),
    g * (1 - clampedAmount),
    b * (1 - clampedAmount)
  );
}
