import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, typography } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'soft'
  | 'danger'
  | 'dangerOutline';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  /** Button text (not used if iconOnly is true) */
  title?: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon on the left side */
  leftIcon?: IconName;
  /** Icon on the right side */
  rightIcon?: IconName;
  /** Icon-only button (no text) */
  iconOnly?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Fully rounded (pill shape) */
  rounded?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional text styles */
  textStyle?: TextStyle;
}

/**
 * Size configurations
 */
const sizeConfig: Record<
  ButtonSize,
  { height: number; paddingH: number; fontSize: number; iconSize: number }
> = {
  xs: { height: 28, paddingH: 8, fontSize: 12, iconSize: 14 },
  sm: { height: 36, paddingH: 12, fontSize: 14, iconSize: 16 },
  md: { height: 44, paddingH: 16, fontSize: 16, iconSize: 18 },
  lg: { height: 52, paddingH: 20, fontSize: 18, iconSize: 20 },
  xl: { height: 60, paddingH: 24, fontSize: 20, iconSize: 24 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  fullWidth = false,
  rounded = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const config = sizeConfig[size];

  // Variant styles for container
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    soft: {
      backgroundColor: `${colors.primary}1A`, // 10% opacity
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    dangerOutline: {
      backgroundColor: 'transparent',
      borderColor: colors.error,
    },
  };

  // Text colors for each variant
  const textColors: Record<ButtonVariant, string> = {
    primary: colors.textOnPrimary,
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
    soft: colors.primary,
    danger: colors.textOnPrimary,
    dangerOutline: colors.error,
  };

  const textColor = textColors[variant];
  const iconColor = textColor;

  // Container style
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: config.height,
    paddingHorizontal: iconOnly ? 0 : config.paddingH,
    width: iconOnly ? config.height : fullWidth ? '100%' : undefined,
    borderRadius: rounded ? config.height / 2 : borderRadius.md,
    borderWidth: 1,
    ...variantStyles[variant],
  };

  // Text style
  const buttonTextStyle: TextStyle = {
    fontFamily: typography.fontFamily,
    fontSize: config.fontSize,
    fontWeight: typography.weights.semibold,
    color: textColor,
  };

  // Icon gap
  const iconGap = size === 'xs' ? 4 : size === 'sm' ? 6 : 8;

  return (
    <TouchableOpacity
      style={[containerStyle, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={config.iconSize}
              color={iconColor}
              style={!iconOnly && title ? { marginRight: iconGap } : undefined}
            />
          )}
          {!iconOnly && title && (
            <Text style={[buttonTextStyle, textStyle]}>{title}</Text>
          )}
          {rightIcon && !iconOnly && (
            <Ionicons
              name={rightIcon}
              size={config.iconSize}
              color={iconColor}
              style={title ? { marginLeft: iconGap } : undefined}
            />
          )}
          {/* For icon-only buttons with rightIcon but no leftIcon */}
          {iconOnly && !leftIcon && rightIcon && (
            <Ionicons name={rightIcon} size={config.iconSize} color={iconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
