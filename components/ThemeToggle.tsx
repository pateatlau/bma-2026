import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { borderRadius, spacing } from '@/constants/theme';

export interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  style?: object;
}

const sizes = {
  sm: { icon: 18, padding: spacing.xs },
  md: { icon: 22, padding: spacing.sm },
  lg: { icon: 26, padding: spacing.md },
};

export function ThemeToggle({ size = 'md', style }: ThemeToggleProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const sizeConfig = sizes[size];

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.container,
        {
          padding: sizeConfig.padding,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityRole="button"
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={sizeConfig.icon}
          color={isDark ? '#FBBF24' : '#6366F1'}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
