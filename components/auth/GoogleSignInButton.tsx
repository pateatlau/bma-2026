import React from 'react';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius } from '@/constants/theme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Continue with Google',
}: GoogleSignInButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        (disabled || loading) && styles.buttonDisabled,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textSecondary} />
      ) : (
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text weight="medium" style={styles.label}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
  },
});
