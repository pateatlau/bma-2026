/**
 * Icon Component
 *
 * A wrapper around Ionicons with consistent sizing and theme integration.
 * Provides type-safe icon names and standardized size tokens.
 */

import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { iconSizes, type IconSize } from '@/constants/tokens';

export type IconName = keyof typeof Ionicons.glyphMap;
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'error'
  | 'success'
  | 'inherit'
  | keyof ThemeColors;

export interface IconProps {
  /** Icon name from Ionicons */
  name: IconName;
  /** Icon size - uses token keys or numeric values */
  size?: IconSize | number;
  /** Icon color - uses theme colors */
  color?: IconColor | string;
}

/**
 * Resolve size from token or number
 */
function resolveSize(size: IconSize | number): number {
  if (typeof size === 'number') return size;
  return iconSizes[size];
}

/**
 * Resolve color from theme
 */
function resolveColor(color: IconColor | string, colors: ThemeColors): string {
  // Check if it's a hex color or other raw color value
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color;
  }

  switch (color) {
    case 'primary':
      return colors.primary;
    case 'secondary':
      return colors.textSecondary;
    case 'muted':
      return colors.textMuted;
    case 'error':
      return colors.error;
    case 'success':
      return colors.success;
    case 'inherit':
      return colors.text;
    default:
      // Try to get from theme colors
      if (color in colors) {
        return colors[color as keyof ThemeColors];
      }
      return color;
  }
}

export function Icon({ name, size = 'md', color = 'inherit' }: IconProps) {
  const { colors } = useTheme();

  const resolvedSize = resolveSize(size);
  const resolvedColor = resolveColor(color, colors);

  return <Ionicons name={name} size={resolvedSize} color={resolvedColor} />;
}
