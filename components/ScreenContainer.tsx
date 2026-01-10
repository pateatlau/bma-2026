import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  centered?: boolean;
  padded?: boolean;
}

export function ScreenContainer({
  children,
  style,
  scrollable = false,
  centered = false,
  padded = true,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle[] = [
    styles.container,
    ...(padded ? [styles.padded] : []),
    ...(centered ? [styles.centered] : []),
    ...(style ? [style] : []),
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          containerStyle,
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
