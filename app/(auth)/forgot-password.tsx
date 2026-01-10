import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input, Card } from '@/components';
import { spacing, typography, borderRadius } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      setIsEmailSent(true);
      setSuccessMessage(result.message || 'Password reset email sent. Please check your inbox.');
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isEmailSent
              ? 'Check your email for a password reset link'
              : "No worries, we'll send you reset instructions"}
          </Text>
        </View>

        <Card>
          {error ? (
            <View style={[styles.messageContainer, styles.errorContainer, { borderColor: colors.error }]}>
              <Text style={[styles.messageText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={[styles.messageContainer, styles.successContainer, { borderColor: colors.success }]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={colors.success}
                style={styles.successIcon}
              />
              <Text style={[styles.messageText, { color: colors.success }]}>{successMessage}</Text>
            </View>
          ) : null}

          {!isEmailSent ? (
            <>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon="mail-outline"
                editable={!isLoading}
              />

              <Button
                title="Send Reset Link"
                onPress={handleResetPassword}
                loading={isLoading}
                style={styles.resetButton}
              />
            </>
          ) : (
            <Button
              title="Open Email App"
              onPress={() => {
                // This is a simple approach - on real devices, you might use Linking
              }}
              variant="outline"
              style={styles.resetButton}
            />
          )}

          <View style={styles.footer}>
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
                <Text style={[styles.backText, { color: colors.textSecondary }]}>
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Card>

        {isEmailSent && (
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: colors.textMuted }]}>
              Didn't receive the email?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsEmailSent(false);
                setSuccessMessage('');
              }}
            >
              <Text style={[styles.resendLink, { color: colors.primary }]}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  messageContainer: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  successContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    marginRight: spacing.sm,
  },
  messageText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    flex: 1,
  },
  resetButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
  },
  resendLink: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
