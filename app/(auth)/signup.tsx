import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input, Card } from '@/components';
import { spacing, typography, borderRadius } from '@/constants/theme';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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

    // Validation
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
        // Email confirmation required
        setSuccessMessage(result.message);
      } else {
        // Auto-signed in, redirect will happen automatically
      }
    } else {
      setError(result.error || 'Sign up failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logo, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoText}>B</Text>
              </View>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign up to get started with BMA 2026
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
                <Text style={[styles.messageText, { color: colors.success }]}>{successMessage}</Text>
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
              editable={!isLoading}
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
              editable={!isLoading}
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
              editable={!isLoading}
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
              editable={!isLoading}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.signUpButton}
            />

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                Already have an account?{' '}
              </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: typography.fontFamily,
    fontSize: 40,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
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
  },
  messageText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  signUpButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
  },
  linkText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
