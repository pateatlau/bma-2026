/**
 * Caption Component
 *
 * Typography component for captions, hints, and helper text.
 * Smallest size, often used for supplementary information.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { fontSizes, lineHeights, fontWeights, fontFamily } from '@/constants/tokens';

export type CaptionColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'error'
  | 'success'
  | 'inherit'
  | keyof ThemeColors;

export interface CaptionProps extends Omit<RNTextProps, 'style'> {
  /** Text color - uses theme colors */
  color?: CaptionColor;
  /** Additional styles */
  style?: TextStyle;
  children: React.ReactNode;
}

/**
 * Resolve color from theme
 */
function resolveColor(color: CaptionColor, colors: ThemeColors): string | undefined {
  if (color === 'inherit') return undefined;
  if (color === 'primary') return colors.text;
  if (color === 'secondary') return colors.textSecondary;
  if (color === 'muted') return colors.textMuted;
  if (color === 'error') return colors.error;
  if (color === 'success') return colors.success;
  return colors[color as keyof ThemeColors];
}

export function Caption({ color = 'muted', style, children, ...props }: CaptionProps) {
  const { colors } = useTheme();

  const resolvedColor = resolveColor(color, colors);

  const captionStyle: TextStyle = {
    fontFamily,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
    color: resolvedColor,
  };

  return (
    <RNText style={[captionStyle, style]} {...props}>
      {children}
    </RNText>
  );
}
