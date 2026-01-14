import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

// Complete any pending auth sessions (needed for Android)
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

// App User type (mapped from Supabase User)
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

// Result type for auth operations
export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Helper function to extract tokens from OAuth callback URL and create session
async function createSessionFromCallbackUrl(
  callbackUrl: string,
  provider: string
): Promise<{
  data: { user: any; session: any } | null;
  error: string | null;
}> {
  try {
    let params: URLSearchParams;

    if (callbackUrl.includes('#')) {
      const hashPart = callbackUrl.split('#')[1];
      params = new URLSearchParams(hashPart);
    } else if (callbackUrl.includes('?')) {
      const queryPart = callbackUrl.split('?')[1];
      params = new URLSearchParams(queryPart);
    } else {
      console.error(`[${provider} OAuth] No tokens found in callback URL`);
      return { data: null, error: 'No tokens in callback URL' };
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    console.warn(`[${provider} OAuth] Token extraction:`, {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (!accessToken) {
      console.error(`[${provider} OAuth] No access token found`);
      return { data: null, error: 'No access token found' };
    }

    if (!refreshToken) {
      console.error(`[${provider} OAuth] No refresh token found in OAuth callback`);
      return { data: null, error: 'No refresh token found' };
    }

    // Set the session with the extracted tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.error(`[${provider} OAuth] Error setting session:`, sessionError);
      return { data: null, error: sessionError.message };
    }

    console.warn(`[${provider} OAuth] Session set successfully:`, {
      hasUser: !!sessionData.user,
      hasSession: !!sessionData.session,
      userEmail: sessionData.user?.email,
    });

    return { data: sessionData, error: null };
  } catch (err) {
    console.error(`[${provider} OAuth] Error creating session:`, err);
    return { data: null, error: 'Failed to create session' };
  }
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithFacebook: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to map Supabase User to App User
function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || null,
    avatar: supabaseUser.user_metadata?.avatar_url || null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true for initial session check

  // Warmup WebBrowser for better OAuth performance on mobile
  useEffect(() => {
    if (Platform.OS !== 'web') {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);

  // Initialize session and set up auth listener
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // On web, check if there's a hash fragment with auth tokens (from email confirmation)
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hash) {
          console.warn('Detected URL hash, checking for auth tokens...');
          // Supabase will automatically handle the hash tokens when detectSessionInUrl is true
          // We just need to wait for the auth state change listener to pick it up
        }

        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          // Clear any invalid session state
          setSession(null);
          setUser(null);
        } else if (initialSession?.user) {
          // Verify user still exists in database by attempting to get their profile
          // This handles the case where a user was deleted from the DB but still has a valid token
          const { error: userError } = await supabase.auth.getUser();

          if (userError) {
            // User no longer exists or token is invalid - sign them out
            console.warn('User validation failed, signing out:', userError.message);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          } else {
            setSession(initialSession);
            setUser(mapSupabaseUser(initialSession.user));
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.warn('Auth state changed:', event, {
        hasSession: !!newSession,
        hasUser: !!newSession?.user,
        userId: newSession?.user?.id,
      });

      // Handle specific events
      switch (event) {
        case 'SIGNED_IN':
          console.warn('User signed in:', newSession?.user?.email);
          setSession(newSession);
          setUser(mapSupabaseUser(newSession?.user ?? null));
          break;

        case 'SIGNED_OUT':
          console.warn('User signed out');
          setSession(null);
          setUser(null);
          break;

        case 'TOKEN_REFRESHED':
          console.warn('Session token refreshed');
          setSession(newSession);
          // User data typically doesn't change on token refresh
          break;

        case 'USER_UPDATED':
          console.warn('User data updated');
          setSession(newSession);
          setUser(mapSupabaseUser(newSession?.user ?? null));
          break;

        case 'PASSWORD_RECOVERY':
          console.warn('Password recovery initiated');
          // This event fires when user clicks password reset link
          // The app should navigate to a password reset form
          break;

        default:
          // Handle any other events
          console.warn('Other auth event:', event);
          setSession(newSession);
          setUser(mapSupabaseUser(newSession?.user ?? null));
      }
    });

    // Handle deep links for mobile email confirmation
    const handleDeepLink = async (url: string) => {
      if (!url) return;

      try {
        const parsedUrl = Linking.parse(url);
        const tokenHash = parsedUrl.queryParams?.token_hash as string | undefined;
        const type = parsedUrl.queryParams?.type as string | undefined;

        if (tokenHash && type === 'email') {
          console.warn('Processing email confirmation from deep link...');
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email',
          });

          if (error) {
            console.error('Email confirmation error:', error);
          } else {
            console.warn('Email confirmed successfully via deep link');
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Check initial URL (app opened via deep link)
    if (Platform.OS !== 'web') {
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink(url);
        }
      });

      // Listen for deep links while app is running
      const linkingSubscription = Linking.addEventListener('url', (event) => {
        handleDeepLink(event.url);
      });

      // Cleanup subscriptions on unmount
      return () => {
        subscription.unsubscribe();
        linkingSubscription.remove();
      };
    }

    // Cleanup subscription on unmount (web only path)
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name?: string): Promise<AuthResult> => {
      try {
        // Build redirect URL for email confirmation
        // Web: Use current origin + /auth/confirm path
        // Mobile: Use deep link scheme (bma2026://)
        // Note: Supabase email template must use {{ .RedirectTo }} for this to work
        const emailRedirectTo =
          Platform.OS === 'web' && typeof window !== 'undefined'
            ? `${window.location.origin}/auth/confirm`
            : 'bma2026://auth/confirm';

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || null,
            },
            emailRedirectTo,
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          return {
            success: true,
            message: 'Please check your email to confirm your account.',
          };
        }

        if (data.user && data.session) {
          return { success: true };
        }

        return { success: false, error: 'Sign up failed. Please try again.' };
      } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Ignore "Auth session missing" error - user is already logged out
        if (error.name === 'AuthSessionMissingError') {
          // Clear local state anyway to ensure clean logout
          setSession(null);
          setUser(null);
          return;
        }
        console.error('Logout error:', error);
      }
      // State will be cleared by the auth state change listener
    } catch (error) {
      // Handle unexpected errors - still clear local state
      console.error('Logout error:', error);
      setSession(null);
      setUser(null);
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      // Build redirect URL based on platform
      // Web: Use current origin (will redirect back to the app)
      // Mobile: Use Expo's makeRedirectUri for proper deep link handling
      let redirectTo: string;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        redirectTo = window.location.origin;
      } else {
        // For mobile (both iOS and Android), generate the redirect URI
        // In Expo Go, this generates: exp://ip:port/--/auth/callback
        // In standalone builds, this generates: bma2026://auth/callback
        redirectTo = makeRedirectUri({
          scheme: 'bma2026',
          path: 'auth/callback',
        });
      }

      console.warn('[OAuth] Generated redirect URI:', redirectTo);
      console.warn(
        '[OAuth] IMPORTANT: Add this URL to Supabase Dashboard > Authentication > URL Configuration > Redirect URLs'
      );

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: Platform.OS !== 'web', // Don't auto-redirect on mobile
          // Request specific scopes if needed
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // For OAuth, signInWithOAuth returns a URL that the user needs to visit
      // The actual session will be established after the OAuth flow completes
      if (data?.url) {
        // On web, the browser will automatically redirect
        // On mobile, we need to open the URL (handled by Expo's WebBrowser)
        if (Platform.OS !== 'web') {
          console.warn('[OAuth] Opening browser for authentication...');
          console.warn('[OAuth] Auth URL:', data.url.substring(0, 100) + '...');
          console.warn('[OAuth] Redirect URL:', redirectTo);
          console.warn('[OAuth] Platform:', Platform.OS);

          // Use different approach for Android vs iOS
          // Android in Expo Go has issues with openAuthSessionAsync and custom schemes
          // iOS works fine with openAuthSessionAsync
          let result: WebBrowser.WebBrowserAuthSessionResult;

          if (Platform.OS === 'android') {
            // For Android, we'll use maybeCompleteAuthSession approach
            // First, try the standard auth session
            try {
              result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
                showInRecents: true,
                createTask: false,
              });
            } catch (e) {
              console.warn('[OAuth] Android auth session error, trying alternative:', e);
              // Fallback: open in browser and rely on deep link handling
              await WebBrowser.openBrowserAsync(data.url);
              return {
                success: true,
                message: 'Please complete sign-in in your browser and return to the app.',
              };
            }
          } else {
            result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          }

          console.warn('[OAuth] Browser result type:', result.type);
          console.warn('[OAuth] Full result:', JSON.stringify(result, null, 2));

          if (result.type === 'success' && result.url) {
            console.warn('[OAuth] Callback URL received');

            const { data: sessionData, error: sessionError } = await createSessionFromCallbackUrl(
              result.url,
              'Google'
            );

            if (sessionError || !sessionData?.session) {
              return {
                success: false,
                error: sessionError || 'Failed to establish session after Google sign-in.',
              };
            }

            return { success: true };
          } else if (result.type === 'cancel') {
            return { success: false, error: 'Google sign-in was cancelled.' };
          } else {
            return { success: false, error: 'Google sign-in failed.' };
          }
        }
        return { success: true }; // Web will auto-redirect
      }

      return { success: false, error: 'Google sign-in failed. Please try again.' };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  const signInWithFacebook = useCallback(async (): Promise<AuthResult> => {
    try {
      // Build OAuth options based on platform
      // Web: Don't pass redirectTo - let Supabase use configured Site URL to avoid Facebook App Domains conflict
      // Mobile: Use Expo's makeRedirectUri for proper deep link handling
      const isWeb = Platform.OS === 'web';
      const oauthOptions: any = {
        skipBrowserRedirect: !isWeb, // Don't auto-redirect on mobile
        scopes: 'email public_profile', // Facebook specific scopes
      };

      if (!isWeb) {
        // For mobile only, generate the redirect URI
        // In Expo Go, this generates: exp://ip:port/--/auth/callback
        // In standalone builds, this generates: bma2026://auth/callback
        const redirectTo = makeRedirectUri({
          scheme: 'bma2026',
          path: 'auth/callback',
        });
        oauthOptions.redirectTo = redirectTo;
        console.warn('[Facebook OAuth] Mobile redirect URI:', redirectTo);
      } else {
        console.warn('[Facebook OAuth] Web platform - using Supabase Site URL');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: oauthOptions,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // For OAuth, signInWithOAuth returns a URL that the user needs to visit
      // The actual session will be established after the OAuth flow completes
      if (data?.url) {
        // On web, the browser will automatically redirect
        // On mobile, we need to open the URL (handled by Expo's WebBrowser)
        if (Platform.OS !== 'web') {
          console.warn('[Facebook OAuth] Opening browser for authentication...');
          console.warn('[Facebook OAuth] Platform:', Platform.OS);

          // Get the mobile redirect URI from options
          const mobileRedirectTo = oauthOptions.redirectTo;

          // Use different approach for Android vs iOS
          let result: WebBrowser.WebBrowserAuthSessionResult;

          if (Platform.OS === 'android') {
            // For Android, use auth session with options
            try {
              result = await WebBrowser.openAuthSessionAsync(data.url, mobileRedirectTo, {
                showInRecents: true,
                createTask: false,
              });
            } catch (e) {
              console.warn('[Facebook OAuth] Android auth session error, trying alternative:', e);
              // Fallback: open in browser and rely on deep link handling
              await WebBrowser.openBrowserAsync(data.url);
              return {
                success: true,
                message: 'Please complete sign-in in your browser and return to the app.',
              };
            }
          } else {
            result = await WebBrowser.openAuthSessionAsync(data.url, mobileRedirectTo);
          }

          console.warn('[Facebook OAuth] Browser result type:', result.type);

          if (result.type === 'success' && result.url) {
            console.warn('[Facebook OAuth] Callback URL received');

            const { data: sessionData, error: sessionError } = await createSessionFromCallbackUrl(
              result.url,
              'Facebook'
            );

            if (sessionError || !sessionData?.session) {
              return {
                success: false,
                error: sessionError || 'Failed to establish session after Facebook sign-in.',
              };
            }

            return { success: true };
          } else if (result.type === 'cancel') {
            return { success: false, error: 'Facebook sign-in was cancelled.' };
          } else {
            return { success: false, error: 'Facebook sign-in failed.' };
          }
        }
        return { success: true }; // Web will auto-redirect
      }

      return { success: false, error: 'Facebook sign-in failed. Please try again.' };
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      // Build redirect URL only for web platform
      const redirectTo =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      isAuthenticated: !!session && !!user,
      isLoading,
      login,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      logout,
      resetPassword,
    }),
    [
      user,
      session,
      isLoading,
      login,
      signUp,
      signInWithGoogle,
      signInWithFacebook,
      logout,
      resetPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
