import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Button,
  Input,
  Card,
  ScreenContainer,
  Text,
  Heading,
  Spacer,
  Stack,
  Row,
  ThemeToggle,
} from '@/components';
import { spacing, borderRadius } from '@/constants/theme';
import { container, iconSizes } from '@/constants/tokens';
import { withOpacity } from '@/utils/colors';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { colors } = useTheme();

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
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenContainer
        centered
        safeAreaTop
        safeAreaBottom
        padding="lg"
        style={{ maxWidth: container.auth.maxWidth, width: '100%', alignSelf: 'center' }}
      >
        <View style={{ width: '100%' }}>
          {/* Theme Toggle - Top Right */}
          <View style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
            <ThemeToggle size="md" />
          </View>

          <Stack gap="xl" style={{ width: '100%' }}>
            {/* Header */}
            <Stack gap="md" style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: borderRadius.xl,
                  backgroundColor: withOpacity(colors.primary, 0.1),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="key-outline" size={iconSizes['2xl']} color={colors.primary} />
              </View>
              <Spacer size="sm" />
              <Heading level="h1">Forgot Password?</Heading>
              <Text color="secondary" align="center">
                {isEmailSent
                  ? 'Check your email for a password reset link'
                  : "No worries, we'll send you reset instructions"}
              </Text>
            </Stack>

            {/* Form Card */}
            <Card variant="elevated" padding="lg">
              <Stack gap="md">
                {error ? (
                  <View
                    style={{
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      backgroundColor: withOpacity(colors.error, 0.1),
                      borderWidth: 1,
                      borderColor: colors.error,
                    }}
                  >
                    <Text color="error" variant="small" align="center">
                      {error}
                    </Text>
                  </View>
                ) : null}

                {successMessage ? (
                  <View
                    style={{
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      backgroundColor: withOpacity(colors.success, 0.1),
                      borderWidth: 1,
                      borderColor: colors.success,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={iconSizes.lg}
                      color={colors.success}
                      style={{ marginRight: spacing.sm }}
                    />
                    <Text color="success" variant="small" style={{ flex: 1 }}>
                      {successMessage}
                    </Text>
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
                      disabled={isLoading}
                      size="lg"
                    />

                    <Spacer size="sm" />

                    <Button
                      title="Send Reset Link"
                      onPress={handleResetPassword}
                      loading={isLoading}
                      size="lg"
                      fullWidth
                    />
                  </>
                ) : (
                  <Button
                    title="Open Email App"
                    onPress={() => {}}
                    variant="outline"
                    size="lg"
                    fullWidth
                  />
                )}

                <Spacer size="md" />

                <Link href="/login" asChild>
                  <TouchableOpacity>
                    <Row justify="center" align="center" gap="xs">
                      <Ionicons
                        name="arrow-back"
                        size={iconSizes.sm}
                        color={colors.textSecondary}
                      />
                      <Text color="secondary" variant="small" weight="medium">
                        Back to Sign In
                      </Text>
                    </Row>
                  </TouchableOpacity>
                </Link>
              </Stack>
            </Card>

            {isEmailSent && (
              <Row justify="center" align="center" gap="xs">
                <Text color="muted" variant="small">
                  Didn&apos;t receive the email?
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEmailSent(false);
                    setSuccessMessage('');
                  }}
                >
                  <Text color="primary" variant="small" weight="semibold">
                    Try again
                  </Text>
                </TouchableOpacity>
              </Row>
            )}
          </Stack>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
