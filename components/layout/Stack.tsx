/**
 * Stack Component
 *
 * A layout component for arranging children in a vertical or horizontal stack
 * with consistent spacing. Inspired by SwiftUI's VStack/HStack.
 */

import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { stackGap, type StackGap } from '@/constants/tokens';

export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps extends Omit<ViewProps, 'style'> {
  /** Stack direction */
  direction?: StackDirection;
  /** Gap between children - uses token keys or numeric values */
  gap?: StackGap | number;
  /** Alignment along cross axis */
  align?: StackAlign;
  /** Justification along main axis */
  justify?: StackJustify;
  /** Whether children should wrap */
  wrap?: boolean;
  /** Additional styles */
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Map align prop to flexbox alignItems
 */
function mapAlign(align: StackAlign): ViewStyle['alignItems'] {
  switch (align) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'stretch':
      return 'stretch';
  }
}

/**
 * Map justify prop to flexbox justifyContent
 */
function mapJustify(justify: StackJustify): ViewStyle['justifyContent'] {
  switch (justify) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'between':
      return 'space-between';
    case 'around':
      return 'space-around';
    case 'evenly':
      return 'space-evenly';
  }
}

/**
 * Resolve gap value from token or number
 */
function resolveGap(gap: StackGap | number): number {
  if (typeof gap === 'number') return gap;
  return stackGap[gap];
}

export function Stack({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  style,
  children,
  ...props
}: StackProps) {
  const stackStyle: ViewStyle = {
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    alignItems: mapAlign(align),
    justifyContent: mapJustify(justify),
    gap: resolveGap(gap),
    flexWrap: wrap ? 'wrap' : 'nowrap',
  };

  return (
    <View style={[stackStyle, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Convenience component for vertical stacks
 */
export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="vertical" {...props} />;
}

/**
 * Convenience component for horizontal stacks
 */
export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="horizontal" {...props} />;
}
