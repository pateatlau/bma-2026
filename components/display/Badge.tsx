/**
 * Badge Component
 *
 * Small visual indicators for status, counts, or labels.
 * Supports multiple variants, colors, and sizes.
 */

import React from 'react';
import { View, Text as RNText, ViewStyle, TextStyle } from 'react-native';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { fontSizes, fontWeights, borderRadius } from '@/constants/tokens';
import { withOpacity } from '@/utils/colors';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Color scheme */
  color?: BadgeColor;
  /** Badge size */
  size?: BadgeSize;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Size configurations
 */
const sizeConfig: Record<BadgeSize, { height: number; paddingH: number; fontSize: number }> = {
  sm: { height: 18, paddingH: 6, fontSize: fontSizes.xs - 2 }, // 10px
  md: { height: 22, paddingH: 8, fontSize: fontSizes.xs }, // 12px
  lg: { height: 26, paddingH: 10, fontSize: fontSizes.sm }, // 14px
};

/**
 * Get color values for badge color
 */
function getColorValue(color: BadgeColor, colors: ThemeColors): string {
  switch (color) {
    case 'primary':
      return colors.primary;
    case 'secondary':
      return colors.textSecondary;
    case 'success':
      return colors.success;
    case 'warning':
      return colors.accentYellow;
    case 'error':
      return colors.error;
    case 'info':
      return colors.accentBlue;
  }
}

export function Badge({
  children,
  variant = 'soft',
  color = 'primary',
  size = 'md',
  style,
}: BadgeProps) {
  const { colors } = useTheme();
  const config = sizeConfig[size];
  const baseColor = getColorValue(color, colors);

  // Determine styles based on variant
  let containerStyle: ViewStyle;
  let textColor: string;

  switch (variant) {
    case 'solid':
      containerStyle = {
        backgroundColor: baseColor,
      };
      textColor = colors.textOnPrimary;
      break;
    case 'outline':
      containerStyle = {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: baseColor,
      };
      textColor = baseColor;
      break;
    case 'soft':
    default:
      containerStyle = {
        backgroundColor: withOpacity(baseColor, 0.15),
      };
      textColor = baseColor;
      break;
  }

  const baseContainerStyle: ViewStyle = {
    height: config.height,
    paddingHorizontal: config.paddingH,
    borderRadius: borderRadius['2xl'], // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  };

  const textStyle: TextStyle = {
    fontSize: config.fontSize,
    fontWeight: fontWeights.medium,
    color: textColor,
  };

  return (
    <View style={[baseContainerStyle, containerStyle, style]}>
      <RNText style={textStyle}>{children}</RNText>
    </View>
  );
}

/**
 * Dot badge - small indicator without text
 */
Badge.Dot = function DotBadge({
  color = 'primary',
  size = 8,
  style,
}: {
  color?: BadgeColor;
  size?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const baseColor = getColorValue(color, colors);

  const dotStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: baseColor,
  };

  return <View style={[dotStyle, style]} />;
};

/**
 * Count badge - for notification counts
 */
Badge.Count = function CountBadge({
  count,
  max = 99,
  color = 'error',
  size = 'sm',
  style,
}: {
  count: number;
  max?: number;
  color?: BadgeColor;
  size?: BadgeSize;
  style?: ViewStyle;
}) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge variant="solid" color={color} size={size} style={style}>
      {displayCount}
    </Badge>
  );
};
