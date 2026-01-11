import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input, Card, Text, Heading, Spacer, Stack, Row, Avatar } from '@/components';
import { spacing, borderRadius } from '@/constants/theme';
import { container } from '@/constants/tokens';
import { withOpacity } from '@/utils/colors';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
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

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await signUp(email.trim(), password, name.trim() || undefined);
    setIsLoading(false);

    if (result.success) {
      if (result.message) {
        setSuccessMessage(result.message);
      }
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            maxWidth: container.auth.maxWidth,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          <Stack gap="xl">
            {/* Header */}
            <Stack gap="md" style={{ alignItems: 'center' }}>
              <Avatar
                name="B"
                size="xl"
                style={{
                  backgroundColor: colors.primary,
                  width: 80,
                  height: 80,
                  borderRadius: borderRadius.xl,
                }}
              />
              <Spacer size="sm" />
              <Heading level="h1">Create Account</Heading>
              <Text color="secondary" align="center">
                Sign up to get started with BMA 2026
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
                    }}
                  >
                    <Text color="success" variant="small" align="center">
                      {successMessage}
                    </Text>
                  </View>
                ) : null}

                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  leftIcon="person-outline"
                  disabled={isLoading}
                  size="lg"
                />

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

                <Input
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  leftIcon="lock-closed-outline"
                  disabled={isLoading}
                  size="lg"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  leftIcon="lock-closed-outline"
                  disabled={isLoading}
                  size="lg"
                />

                <Spacer size="sm" />

                <Button
                  title="Create Account"
                  onPress={handleSignUp}
                  loading={isLoading}
                  size="lg"
                  fullWidth
                />

                <Spacer size="md" />

                <Row justify="center" align="center" gap="xs">
                  <Text color="muted" variant="small">
                    Already have an account?
                  </Text>
                  <Link href="/login" asChild>
                    <TouchableOpacity>
                      <Text color="primary" variant="small" weight="semibold">
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </Row>
              </Stack>
            </Card>
          </Stack>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
