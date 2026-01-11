/**
 * Heading Component
 *
 * Typography component for headings with semantic levels (H1-H4).
 * Includes proper accessibility roles for screen readers.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme, ThemeColors } from '@/contexts/ThemeContext';
import { fontSizes, lineHeights, fontWeights, fontFamily } from '@/constants/tokens';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
export type HeadingColor = 'primary' | 'secondary' | 'muted' | 'inherit' | keyof ThemeColors;
export type TextAlign = 'left' | 'center' | 'right';

export interface HeadingProps extends Omit<RNTextProps, 'style'> {
  /** Heading level determining size and weight */
  level: HeadingLevel;
  /** Text color - uses theme colors */
  color?: HeadingColor;
  /** Text alignment */
  align?: TextAlign;
  /** Additional styles */
  style?: TextStyle;
  children: React.ReactNode;
}

/**
 * Get styles for heading level
 */
function getLevelStyles(level: HeadingLevel): {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
} {
  switch (level) {
    case 'h1':
      return {
        fontSize: fontSizes['3xl'],
        lineHeight: lineHeights['3xl'],
        fontWeight: fontWeights.bold,
      };
    case 'h2':
      return {
        fontSize: fontSizes['2xl'],
        lineHeight: lineHeights['2xl'],
        fontWeight: fontWeights.bold,
      };
    case 'h3':
      return {
        fontSize: fontSizes.xl,
        lineHeight: lineHeights.xl,
        fontWeight: fontWeights.semibold,
      };
    case 'h4':
      return {
        fontSize: fontSizes.lg,
        lineHeight: lineHeights.lg,
        fontWeight: fontWeights.semibold,
      };
  }
}

/**
 * Resolve color from theme
 */
function resolveColor(color: HeadingColor, colors: ThemeColors): string | undefined {
  if (color === 'inherit') return undefined;
  if (color === 'primary') return colors.text;
  if (color === 'secondary') return colors.textSecondary;
  if (color === 'muted') return colors.textMuted;
  return colors[color as keyof ThemeColors];
}

export function Heading({
  level,
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}: HeadingProps) {
  const { colors } = useTheme();

  const levelStyles = getLevelStyles(level);
  const resolvedColor = resolveColor(color, colors);

  const headingStyle: TextStyle = {
    fontFamily,
    ...levelStyles,
    color: resolvedColor,
    textAlign: align,
  };

  return (
    <RNText style={[headingStyle, style]} accessibilityRole="header" {...props}>
      {children}
    </RNText>
  );
}

/**
 * Convenience component for H1
 */
Heading.H1 = function H1(props: Omit<HeadingProps, 'level'>) {
  return <Heading level="h1" {...props} />;
};

/**
 * Convenience component for H2
 */
Heading.H2 = function H2(props: Omit<HeadingProps, 'level'>) {
  return <Heading level="h2" {...props} />;
};

/**
 * Convenience component for H3
 */
Heading.H3 = function H3(props: Omit<HeadingProps, 'level'>) {
  return <Heading level="h3" {...props} />;
};

/**
 * Convenience component for H4
 */
Heading.H4 = function H4(props: Omit<HeadingProps, 'level'>) {
  return <Heading level="h4" {...props} />;
};
