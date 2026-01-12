import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
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
  Avatar,
  ThemeToggle,
} from '@/components';
import { spacing, borderRadius } from '@/constants/theme';
import { container } from '@/constants/tokens';
import { withOpacity } from '@/utils/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Login failed');
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
              <Heading level="h1">Welcome Back</Heading>
              <Text color="secondary" align="center">
                Sign in to continue to BMA 2026
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

                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="off"
                  leftIcon="mail-outline"
                  disabled={isLoading}
                  size="lg"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="off"
                  leftIcon="lock-closed-outline"
                  disabled={isLoading}
                  size="lg"
                />

                <Link href="/forgot-password" asChild>
                  <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
                    <Text color="primary" variant="small" weight="medium">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>

                <Spacer size="sm" />

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isLoading}
                  size="lg"
                  fullWidth
                />

                <Spacer size="md" />

                <Row justify="center" align="center" gap="xs">
                  <Text color="muted" variant="small">
                    Don&apos;t have an account?
                  </Text>
                  <Link href="/signup" asChild>
                    <TouchableOpacity>
                      <Text color="primary" variant="small" weight="semibold">
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </Row>
              </Stack>
            </Card>
          </Stack>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
