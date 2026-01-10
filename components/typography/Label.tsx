/**
 * Label Component
 *
 * Typography component for form labels and UI labels.
 * Medium weight, smaller size for labeling inputs and sections.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import {
  fontSizes,
  lineHeights,
  fontWeights,
  fontFamily,
} from '@/constants/tokens';

export type LabelColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'error'
  | 'inherit'
  | keyof ThemeColors;

export interface LabelProps extends Omit<RNTextProps, 'style'> {
  /** Text color - uses theme colors */
  color?: LabelColor;
  /** Whether the label is for a required field */
  required?: boolean;
  /** Additional styles */
  style?: TextStyle;
  children: React.ReactNode;
}

/**
 * Resolve color from theme
 */
function resolveColor(color: LabelColor, colors: ThemeColors): string | undefined {
  if (color === 'inherit') return undefined;
  if (color === 'primary') return colors.text;
  if (color === 'secondary') return colors.textSecondary;
  if (color === 'muted') return colors.textMuted;
  if (color === 'error') return colors.error;
  return colors[color as keyof ThemeColors];
}

export function Label({
  color = 'primary',
  required = false,
  style,
  children,
  ...props
}: LabelProps) {
  const { colors } = useTheme();

  const resolvedColor = resolveColor(color, colors);

  const labelStyle: TextStyle = {
    fontFamily,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.medium,
    color: resolvedColor,
  };

  return (
    <RNText style={[labelStyle, style]} {...props}>
      {children}
      {required && (
        <RNText style={{ color: colors.error }}> *</RNText>
      )}
    </RNText>
  );
}
