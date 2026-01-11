/**
 * Spacer Component
 *
 * A flexible spacing component that can either take up available space
 * or add a fixed amount of space between elements.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { spacing, legacySpacing, type Spacing } from '@/constants/tokens';

/** Semantic spacing sizes */
export type SemanticSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/** All accepted spacing values */
export type SpacerSize = Spacing | SemanticSpacing | number;

export interface SpacerProps {
  /** Fixed size using spacing tokens - if provided, spacer has fixed size */
  size?: SpacerSize;
  /** Direction of the spacer (for fixed size) */
  direction?: 'horizontal' | 'vertical';
  /** If true, spacer expands to fill available space (default when no size) */
  flex?: boolean;
}

/**
 * Resolve size value from token or number
 */
function resolveSize(size: SpacerSize): number {
  if (typeof size === 'number') return size;
  // Check semantic spacing first (xs, sm, md, lg, xl, xxl)
  if (size in legacySpacing) {
    return legacySpacing[size as SemanticSpacing];
  }
  // Otherwise use numeric spacing tokens
  return spacing[size as Spacing];
}

export function Spacer({ size, direction = 'vertical', flex }: SpacerProps) {
  // Determine if spacer should flex
  const shouldFlex = flex ?? size === undefined;

  const spacerStyle: ViewStyle = shouldFlex
    ? { flex: 1 }
    : direction === 'vertical'
      ? { height: resolveSize(size!) }
      : { width: resolveSize(size!) };

  return <View style={spacerStyle} />;
}

/**
 * Convenience component for vertical spacing
 */
Spacer.Vertical = function VerticalSpacer({
  size,
}: Omit<SpacerProps, 'direction' | 'flex'> & { size: SpacerSize }) {
  return <Spacer size={size} direction="vertical" />;
};

/**
 * Convenience component for horizontal spacing
 */
Spacer.Horizontal = function HorizontalSpacer({
  size,
}: Omit<SpacerProps, 'direction' | 'flex'> & { size: SpacerSize }) {
  return <Spacer size={size} direction="horizontal" />;
};

/**
 * Convenience component for flex spacer
 */
Spacer.Flex = function FlexSpacer() {
  return <Spacer flex />;
};
