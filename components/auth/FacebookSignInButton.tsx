import React from 'react';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/typography';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius } from '@/constants/theme';

interface FacebookSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function FacebookSignInButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Continue with Facebook',
}: FacebookSignInButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: '#1877F2', // Facebook blue
          borderColor: '#1877F2',
        },
        (disabled || loading) && styles.buttonDisabled,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View style={styles.content}>
          <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
          <Text weight="medium" style={{ fontSize: 16, color: '#FFFFFF' }}>
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
});
