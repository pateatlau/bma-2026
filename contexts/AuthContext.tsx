import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
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

  // Initialize session and set up auth listener
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        // On web, check if there's a hash fragment with auth tokens (from email confirmation)
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hash) {
          console.log('Detected URL hash, checking for auth tokens...');
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
      console.log('Auth state changed:', event);

      // Handle specific events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in');
          setSession(newSession);
          setUser(mapSupabaseUser(newSession?.user ?? null));
          break;

        case 'SIGNED_OUT':
          console.log('User signed out');
          setSession(null);
          setUser(null);
          break;

        case 'TOKEN_REFRESHED':
          console.log('Session token refreshed');
          setSession(newSession);
          // User data typically doesn't change on token refresh
          break;

        case 'USER_UPDATED':
          console.log('User data updated');
          setSession(newSession);
          setUser(mapSupabaseUser(newSession?.user ?? null));
          break;

        case 'PASSWORD_RECOVERY':
          console.log('Password recovery initiated');
          // This event fires when user clicks password reset link
          // The app should navigate to a password reset form
          break;

        default:
          // Handle any other events
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
          console.log('Processing email confirmation from deep link...');
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email',
          });

          if (error) {
            console.error('Email confirmation error:', error);
          } else {
            console.log('Email confirmed successfully via deep link');
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
      logout,
      resetPassword,
    }),
    [user, session, isLoading, login, signUp, logout, resetPassword]
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
