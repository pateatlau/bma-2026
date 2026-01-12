import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { Text, Heading, Card, Button, Stack, ScreenContainer } from '@/components';
import { Ionicons } from '@expo/vector-icons';
import { container } from '@/constants/tokens';

// Check if user is on mobile browser (for showing "return to app" instructions)
function isMobileBrowser(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const userAgent = window.navigator?.userAgent || '';
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
}

export default function AuthConfirmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobileWeb, setIsMobileWeb] = useState(false);

  useEffect(() => {
    // Detect if user is on mobile browser
    setIsMobileWeb(isMobileBrowser());

    const confirmEmail = async () => {
      // Get token_hash and type from query params
      let tokenHash = params.token_hash;
      let type = params.type;

      // On web, also check URL search params (Supabase uses query params, not hash)
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (!tokenHash && urlParams.get('token_hash')) {
          tokenHash = urlParams.get('token_hash') || undefined;
        }
        if (!type && urlParams.get('type')) {
          type = urlParams.get('type') || undefined;
        }
      }

      if (!tokenHash) {
        // No token - check if user is already authenticated (auto-detection worked)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          // Don't auto-redirect on mobile web - let user manually return to app
          if (!isMobileBrowser()) {
            setTimeout(() => {
              router.replace('/(app)/home');
            }, 1500);
          }
          return;
        }

        setStatus('error');
        setErrorMessage('Invalid confirmation link. Please request a new one.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email',
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Failed to confirm email. The link may have expired.');
        } else {
          setStatus('success');
          // Don't auto-redirect on mobile web - let user manually return to app
          if (!isMobileBrowser()) {
            setTimeout(() => {
              router.replace('/(app)/home');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    };

    confirmEmail();
  }, [params, router]);

  return (
    <ScreenContainer
      centered
      safeAreaTop
      safeAreaBottom
      padding="lg"
      style={{ maxWidth: container.auth.maxWidth, width: '100%', alignSelf: 'center' }}
    >
      <Card variant="elevated" padding="lg">
        <Stack gap="lg" style={{ alignItems: 'center' }}>
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color={colors.primary} />
              <Heading level="h2">Confirming your email...</Heading>
              <Text color="secondary" align="center">
                Please wait while we verify your email address.
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              </View>
              <Heading level="h2">Email Confirmed!</Heading>
              {isMobileWeb ? (
                <>
                  <Text color="secondary" align="center">
                    Your email has been verified successfully. You can now close this browser and
                    return to the BMA 2026 app to log in.
                  </Text>
                  <Button
                    title="Open App"
                    onPress={() => {
                      // Try to open the app via deep link
                      Linking.openURL('bma2026://login').catch(() => {
                        // If deep link fails, just let user manually open the app
                      });
                    }}
                    size="lg"
                    fullWidth
                  />
                </>
              ) : (
                <Text color="secondary" align="center">
                  Your email has been verified. Redirecting you to the app...
                </Text>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.error + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="close-circle" size={48} color={colors.error} />
              </View>
              <Heading level="h2">Confirmation Failed</Heading>
              <Text color="secondary" align="center">
                {errorMessage}
              </Text>
              <Button
                title="Go to Login"
                onPress={() => router.replace('/(auth)/login')}
                size="lg"
                fullWidth
              />
            </>
          )}
        </Stack>
      </Card>
    </ScreenContainer>
  );
}
