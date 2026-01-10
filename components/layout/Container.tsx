/**
 * Container Component
 *
 * A centered content container with max-width constraints.
 * Useful for constraining content width on larger screens.
 */

import React from 'react';
import { View, ViewProps, ViewStyle, DimensionValue } from 'react-native';
import {
  container,
  maxWidth as maxWidthTokens,
  type ContainerType,
  type MaxWidth,
} from '@/constants/tokens';

export interface ContainerProps extends Omit<ViewProps, 'style'> {
  /** Predefined container type */
  type?: ContainerType;
  /** Custom max width - overrides type */
  maxWidth?: MaxWidth | number;
  /** Custom padding - overrides type */
  padding?: number;
  /** Center the container horizontally */
  centered?: boolean;
  /** Additional styles */
  style?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Resolve max width from token or number
 */
function resolveMaxWidth(value: MaxWidth | number): DimensionValue {
  if (typeof value === 'number') return value;
  const tokenValue = maxWidthTokens[value];
  // Handle '100%' string from 'full' token
  if (typeof tokenValue === 'string') return tokenValue as DimensionValue;
  return tokenValue;
}

export function Container({
  type = 'content',
  maxWidth,
  padding,
  centered = true,
  style,
  children,
  ...props
}: ContainerProps) {
  // Get defaults from container type
  const containerConfig = container[type];

  // Resolve final values (props override type defaults)
  const configMaxWidth = containerConfig.maxWidth;
  const finalMaxWidth: DimensionValue = maxWidth
    ? resolveMaxWidth(maxWidth)
    : typeof configMaxWidth === 'string'
      ? (configMaxWidth as DimensionValue)
      : configMaxWidth;
  const finalPadding = padding ?? containerConfig.padding;

  const containerStyle: ViewStyle = {
    width: '100%',
    maxWidth: finalMaxWidth,
    paddingHorizontal: finalPadding,
    ...(centered && {
      alignSelf: 'center',
    }),
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Auth container - optimized for login/signup forms
 */
Container.Auth = function AuthContainer(
  props: Omit<ContainerProps, 'type'>
) {
  return <Container type="auth" {...props} />;
};

/**
 * Content container - standard page content
 */
Container.Content = function ContentContainer(
  props: Omit<ContainerProps, 'type'>
) {
  return <Container type="content" {...props} />;
};

/**
 * Prose container - narrow width for readable text
 */
Container.Prose = function ProseContainer(
  props: Omit<ContainerProps, 'type'>
) {
  return <Container type="prose" {...props} />;
};

/**
 * Full width container
 */
Container.Full = function FullContainer(
  props: Omit<ContainerProps, 'type'>
) {
  return <Container type="fullWidth" {...props} />;
};
