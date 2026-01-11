/**
 * Divider Component
 *
 * A visual separator for dividing content sections.
 * Supports horizontal and vertical orientations with customizable styling.
 */

import React from 'react';
import { View, ViewProps, ViewStyle, Text as RNText, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/tokens';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface DividerProps extends Omit<ViewProps, 'style'> {
  /** Divider orientation */
  orientation?: DividerOrientation;
  /** Border style */
  variant?: DividerVariant;
  /** Thickness of the divider */
  thickness?: number;
  /** Spacing around the divider */
  dividerSpacing?: DividerSpacing;
  /** Optional label text in the center */
  label?: string;
  /** Additional styles */
  style?: ViewStyle;
}

/**
 * Get spacing value from token
 */
function getSpacingValue(spacingToken: DividerSpacing): number {
  switch (spacingToken) {
    case 'none':
      return 0;
    case 'sm':
      return spacing[2]; // 8px
    case 'md':
      return spacing[4]; // 16px
    case 'lg':
      return spacing[6]; // 24px
  }
}

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 1,
  dividerSpacing = 'none',
  label,
  style,
  ...props
}: DividerProps) {
  const { colors } = useTheme();

  const spacingValue = getSpacingValue(dividerSpacing);
  const isHorizontal = orientation === 'horizontal';

  // Build line style based on variant
  // For solid: use backgroundColor
  // For dashed/dotted: use border properties (backgroundColor doesn't support borderStyle)
  const getLineStyle = (): ViewStyle => {
    const baseLayout: ViewStyle = {
      flex: 1,
      ...(isHorizontal ? { height: thickness } : { width: thickness }),
    };

    if (variant === 'solid') {
      return {
        ...baseLayout,
        backgroundColor: colors.border,
      };
    }

    // For dashed and dotted variants, use border properties
    return {
      ...baseLayout,
      borderColor: colors.border,
      borderStyle: variant,
      ...(isHorizontal
        ? { borderBottomWidth: thickness, height: 0 }
        : { borderLeftWidth: thickness, width: 0 }),
    };
  };

  const lineStyle = getLineStyle();

  // Container style with spacing
  const containerStyle: ViewStyle = {
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: 'center',
    ...(isHorizontal ? { marginVertical: spacingValue } : { marginHorizontal: spacingValue }),
  };

  // Label style
  const labelStyle: TextStyle = {
    color: colors.textMuted,
    fontSize: 12,
    paddingHorizontal: isHorizontal ? spacing[3] : 0,
    paddingVertical: isHorizontal ? 0 : spacing[3],
  };

  // If there's a label, render two lines with label in between
  if (label) {
    return (
      <View style={[containerStyle, style]} {...props}>
        <View style={lineStyle} />
        <RNText style={labelStyle}>{label}</RNText>
        <View style={lineStyle} />
      </View>
    );
  }

  // Simple divider without label
  return (
    <View
      style={[
        lineStyle,
        isHorizontal ? { marginVertical: spacingValue } : { marginHorizontal: spacingValue },
        style,
      ]}
      {...props}
    />
  );
}
