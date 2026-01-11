import React from 'react';
import { View, StyleSheet, ViewStyle, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '@/constants/theme';

export type ScreenPadding = 'none' | 'sm' | 'md' | 'lg' | 'responsive';

export interface ScreenContainerProps {
  /** Screen content */
  children: React.ReactNode;
  /** Enable scrolling */
  scrollable?: boolean;
  /** Center content both horizontally and vertically */
  centered?: boolean;
  /** Horizontal padding size */
  padding?: ScreenPadding;
  /** @deprecated Use padding prop instead */
  padded?: boolean;
  /** Apply safe area insets to top */
  safeAreaTop?: boolean;
  /** Apply safe area insets to bottom */
  safeAreaBottom?: boolean;
  /** Maximum content width (useful for wide screens) */
  maxWidth?: number;
  /** Additional styles */
  style?: ViewStyle;
  /** Content container styles (for scrollable) */
  contentStyle?: ViewStyle;
}

/**
 * Padding values based on screen width for responsive padding
 */
const getResponsivePadding = (width: number): number => {
  if (width >= 1280) return spacing.xxl; // xl screens
  if (width >= 1024) return spacing.xl; // lg screens
  if (width >= 768) return spacing.lg; // md screens (tablet)
  if (width >= 480) return spacing.md; // sm screens (large phone)
  return spacing.md; // xs screens (phone)
};

/**
 * Padding configurations
 */
const paddingConfig: Record<Exclude<ScreenPadding, 'responsive'>, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

export function ScreenContainer({
  children,
  scrollable = false,
  centered = false,
  padding = 'lg',
  padded, // deprecated
  safeAreaTop = false,
  safeAreaBottom = true,
  maxWidth,
  style,
  contentStyle,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Handle legacy padded prop
  const effectivePadding = padded !== undefined ? (padded ? 'lg' : 'none') : padding;

  // Calculate horizontal padding
  const horizontalPadding =
    effectivePadding === 'responsive'
      ? getResponsivePadding(width)
      : paddingConfig[effectivePadding];

  // Base container styles
  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: horizontalPadding,
    paddingTop: safeAreaTop ? insets.top : 0,
    paddingBottom: safeAreaBottom ? insets.bottom : 0,
  };

  // Centered styles
  const centeredStyle: ViewStyle = centered
    ? {
        justifyContent: 'center',
        alignItems: 'center',
      }
    : {};

  // Content wrapper for maxWidth
  const renderContent = () => {
    if (maxWidth && width > maxWidth) {
      return (
        <View style={[styles.maxWidthWrapper, { maxWidth, width: '100%', alignSelf: 'center' }]}>
          {children}
        </View>
      );
    }
    return children;
  };

  if (scrollable) {
    return (
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          baseStyle,
          centeredStyle,
          // Override flex: 1 for scroll content
          { flex: undefined, flexGrow: 1 },
          // Add extra bottom padding for scroll
          { paddingBottom: (safeAreaBottom ? insets.bottom : 0) + spacing.lg },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    );
  }

  return <View style={[baseStyle, centeredStyle, style]}>{renderContent()}</View>;
}

/**
 * ScreenContainer.Header - Header section for screens
 */
ScreenContainer.Header = function ScreenHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.header, style]}>{children}</View>;
};

/**
 * ScreenContainer.Body - Main content section
 */
ScreenContainer.Body = function ScreenBody({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.body, style]}>{children}</View>;
};

/**
 * ScreenContainer.Footer - Footer section (sticks to bottom in non-scrollable)
 */
ScreenContainer.Footer = function ScreenFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.footer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  maxWidthWrapper: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  body: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto' as unknown as number,
    paddingTop: spacing.lg,
  },
});
