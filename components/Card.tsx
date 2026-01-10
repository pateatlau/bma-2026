import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, shadows } from '@/constants/theme';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Press handler - makes card pressable */
  onPress?: (event: GestureResponderEvent) => void;
  /** Long press handler */
  onLongPress?: (event: GestureResponderEvent) => void;
  /** Disabled state (only for pressable cards) */
  disabled?: boolean;
  /** Additional styles */
  style?: ViewStyle;
  /** @deprecated Use variant="elevated" instead */
  elevated?: boolean;
}

/**
 * Padding configurations
 */
const paddingConfig: Record<CardPadding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

export function Card({
  children,
  variant = 'default',
  padding = 'lg',
  onPress,
  onLongPress,
  disabled = false,
  style,
  elevated = false,
}: CardProps) {
  const { colors } = useTheme();
  const isPressable = onPress || onLongPress;

  // Handle legacy elevated prop
  const effectiveVariant = elevated ? 'elevated' : variant;

  // Variant styles
  const getVariantStyles = (): ViewStyle => {
    switch (effectiveVariant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'elevated':
        return {
          backgroundColor: colors.surfaceElevated,
          borderColor: 'transparent',
          borderWidth: 0,
          ...shadows.md,
        };
      case 'filled':
        return {
          backgroundColor: colors.surface,
          borderColor: 'transparent',
          borderWidth: 0,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderWidth: 1,
        };
    }
  };

  const cardStyle: ViewStyle = {
    borderRadius: borderRadius.lg,
    padding: paddingConfig[padding],
    ...getVariantStyles(),
  };

  if (isPressable) {
    return (
      <TouchableOpacity
        style={[cardStyle, disabled && styles.disabled, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

/**
 * Card.Header - Header section for cards
 */
Card.Header = function CardHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.header, style]}>{children}</View>;
};

/**
 * Card.Body - Body section for cards
 */
Card.Body = function CardBody({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.body, style]}>{children}</View>;
};

/**
 * Card.Footer - Footer section for cards
 */
Card.Footer = function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.footer,
        { borderTopColor: colors.borderLight },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  header: {
    marginBottom: spacing.md,
  },
  body: {
    // Default body styles
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
});
