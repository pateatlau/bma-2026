/**
 * Text Component
 *
 * A flexible text component with predefined variants and theme integration.
 * Replaces direct usage of React Native's Text for consistent typography.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import {
  fontSizes,
  lineHeights,
  fontWeights,
  fontFamily,
  type FontWeight,
} from '@/constants/tokens';

export type TextVariant = 'body' | 'small' | 'large';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'error'
  | 'success'
  | 'inherit'
  | keyof ThemeColors;
export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Text variant determining size and line height */
  variant?: TextVariant;
  /** Font weight */
  weight?: FontWeight;
  /** Text color - uses theme colors */
  color?: TextColor;
  /** Text alignment */
  align?: TextAlign;
  /** Additional styles */
  style?: TextStyle;
  children: React.ReactNode;
}

/**
 * Get font size and line height for variant
 */
function getVariantStyles(variant: TextVariant): { fontSize: number; lineHeight: number } {
  switch (variant) {
    case 'small':
      return { fontSize: fontSizes.sm, lineHeight: lineHeights.sm };
    case 'large':
      return { fontSize: fontSizes.lg, lineHeight: lineHeights.lg };
    case 'body':
    default:
      return { fontSize: fontSizes.base, lineHeight: lineHeights.base };
  }
}

/**
 * Resolve color from theme
 */
function resolveColor(color: TextColor, colors: ThemeColors): string | undefined {
  if (color === 'inherit') return undefined;
  if (color === 'primary') return colors.text;
  if (color === 'secondary') return colors.textSecondary;
  if (color === 'muted') return colors.textMuted;
  if (color === 'error') return colors.error;
  if (color === 'success') return colors.success;
  return colors[color as keyof ThemeColors];
}

export function Text({
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  const { colors } = useTheme();

  const variantStyles = getVariantStyles(variant);
  const resolvedColor = resolveColor(color, colors);

  const textStyle: TextStyle = {
    fontFamily,
    ...variantStyles,
    fontWeight: fontWeights[weight],
    color: resolvedColor,
    textAlign: align,
  };

  return (
    <RNText style={[textStyle, style]} {...props}>
      {children}
    </RNText>
  );
}

/**
 * Convenience component for small text
 */
Text.Small = function TextSmall(props: Omit<TextProps, 'variant'>) {
  return <Text variant="small" {...props} />;
};

/**
 * Convenience component for large text
 */
Text.Large = function TextLarge(props: Omit<TextProps, 'variant'>) {
  return <Text variant="large" {...props} />;
};
