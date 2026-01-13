# Google OAuth Implementation Guide

**Status:** ✅ Working on Web and iOS | ⚠️ Android requires Development Build

This document details the implementation of Google OAuth authentication for the BMA 2026 application using Supabase Auth.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google Cloud Console Setup](#google-cloud-console-setup)
4. [Supabase Dashboard Configuration](#supabase-dashboard-configuration)
5. [Code Implementation](#code-implementation)
6. [Testing](#testing)
7. [Known Issues](#known-issues)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Google OAuth integration allows users to sign in using their Google account. The implementation uses:

- **Supabase Auth**: Handles OAuth flow server-side
- **expo-web-browser**: Opens OAuth consent screen on mobile
- **expo-auth-session**: Generates proper redirect URIs
- **Custom redirect handling**: Extracts tokens and establishes session

### Platform Support

| Platform            | Status     | Notes                                       |
| ------------------- | ---------- | ------------------------------------------- |
| Web                 | ✅ Working | Auto-redirect after OAuth                   |
| iOS                 | ✅ Working | Uses in-app browser with custom scheme      |
| Android (Expo Go)   | ⚠️ Limited | Requires Development Build for full support |
| Android (Dev Build) | ✅ Working | Full OAuth support with custom scheme       |

---

## Prerequisites

- Supabase project created
- Google Cloud Platform account
- Expo project with `expo-web-browser` and `expo-auth-session` installed

```bash
npm install expo-web-browser expo-auth-session expo-crypto
```

---

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Select **Application type**: **Web application**
6. Name: `BMA 2026 - Supabase Auth`

### 2. Configure Authorized Redirect URIs

Add your Supabase callback URL:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

**Example:**

```
https://dxwwnvlgtymnaawgcofd.supabase.co/auth/v1/callback
```

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - **App name**: `BMA 2026` or `Bangalore Mizo Association`
   - **User support email**: Your email
   - **App logo**: (Optional) Upload BMA logo (120x120px)
   - **Application home page**: `https://bma-2026.vercel.app`
   - **Developer contact email**: Your email

4. Add OAuth scopes:
   - `userinfo.email`
   - `userinfo.profile`

5. Add test users (if in Testing mode):
   - Add email addresses of users who can test during development

6. **Publishing status**: Keep as "Testing" during development

### 4. Copy Credentials

After creating the OAuth client, copy:

- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxx`

You'll need these for Supabase configuration.

---

## Supabase Dashboard Configuration

### 1. Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list
5. **Toggle ON** to enable

### 2. Add Google Credentials

In the Google provider settings:

- **Client ID (for OAuth)**: Paste your Google Client ID
- **Client Secret (for OAuth)**: Paste your Google Client Secret
- **Authorized Client IDs**: Leave empty (not needed for web/mobile)

Click **Save**

### 3. Configure URL Settings

Go to **Authentication** > **URL Configuration**:

#### Site URL

Set to your production URL:

```
https://bma-2026.vercel.app
```

For local development, you can use:

```
http://localhost:8081
```

#### Redirect URLs

Add all required redirect URLs:

```
# Local development
http://localhost:8081
http://localhost:8081/**

# Production
https://bma-2026.vercel.app
https://bma-2026.vercel.app/**

# Mobile - Custom scheme (for production builds)
bma2026://
bma2026://**

# Mobile - Expo Go (for development)
exp://*
exp://localhost:8081/**
```

**Important:** The `exp://*` wildcard allows OAuth to work in Expo Go during development.

Click **Save**

---

## Code Implementation

### 1. AuthContext Updates (`contexts/AuthContext.tsx`)

#### Imports

```typescript
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Complete any pending auth sessions (needed for Android)
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}
```

#### Interface Update

```typescript
interface AuthContextType {
  // ... existing methods
  signInWithGoogle: () => Promise<AuthResult>;
}
```

#### WebBrowser Warmup

```typescript
// Warmup WebBrowser for better OAuth performance on mobile
useEffect(() => {
  if (Platform.OS !== 'web') {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }
}, []);
```

#### signInWithGoogle Method

```typescript
const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
  try {
    // Build redirect URL based on platform
    let redirectTo: string;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      redirectTo = window.location.origin;
    } else {
      // For mobile, generate redirect URI
      // In Expo Go: exp://ip:port/--/auth/callback
      // In standalone: bma2026://auth/callback
      redirectTo = makeRedirectUri({
        scheme: 'bma2026',
        path: 'auth/callback',
      });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.url) {
      if (Platform.OS !== 'web') {
        // Mobile: Open OAuth URL in browser
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type === 'success' && result.url) {
          // Extract tokens from callback URL
          let params: URLSearchParams;

          if (result.url.includes('#')) {
            const hashPart = result.url.split('#')[1];
            params = new URLSearchParams(hashPart);
          } else if (result.url.includes('?')) {
            const queryPart = result.url.split('?')[1];
            params = new URLSearchParams(queryPart);
          } else {
            return { success: false, error: 'No tokens in callback' };
          }

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (!accessToken) {
            return { success: false, error: 'No access token' };
          }

          // Set session with extracted tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            return { success: false, error: sessionError.message };
          }

          return { success: true };
        } else if (result.type === 'cancel') {
          return { success: false, error: 'Sign-in cancelled' };
        }

        return { success: false, error: 'Sign-in failed' };
      }

      return { success: true }; // Web will auto-redirect
    }

    return { success: false, error: 'Google sign-in failed' };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}, []);
```

#### Provider Value

```typescript
const value = useMemo(
  () => ({
    user,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    login,
    signUp,
    signInWithGoogle, // Add this
    logout,
    resetPassword,
  }),
  [user, session, isLoading, login, signUp, signInWithGoogle, logout, resetPassword]
);
```

### 2. Google Sign-In Button Component (`components/auth/GoogleSignInButton.tsx`)

```typescript
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
```

### 3. Export Component (`components/index.ts`)

```typescript
// Auth components
export { GoogleSignInButton } from './auth/GoogleSignInButton';
```

### 4. Login Screen Integration (`app/(auth)/login.tsx`)

```typescript
import { GoogleSignInButton } from '@/components';

export default function LoginScreen() {
  const { login, signInWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (!result.success) {
      setError(result.error || 'Google sign-in failed');
    }
  };

  return (
    // ... existing form fields

    <Button
      title="Sign In"
      onPress={handleLogin}
      loading={isLoading}
      size="lg"
      fullWidth
    />

    <Spacer size="md" />

    {/* Divider with "OR" text */}
    <Row align="center" gap="md">
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text color="muted" variant="small">OR</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </Row>

    <Spacer size="md" />

    {/* Google Sign-In Button */}
    <GoogleSignInButton
      onPress={handleGoogleSignIn}
      loading={isGoogleLoading}
      disabled={isLoading || isGoogleLoading}
    />

    // ... rest of form
  );
}
```

### 5. SignUp Screen Integration (`app/(auth)/signup.tsx`)

Same implementation as login screen, but with:

```typescript
<GoogleSignInButton
  onPress={handleGoogleSignIn}
  loading={isGoogleLoading}
  disabled={isLoading || isGoogleLoading}
  label="Sign up with Google"
/>
```

### 6. App Configuration (`app.json`)

```json
{
  "expo": {
    "scheme": "bma2026",
    "android": {
      "package": "com.bma.app2026",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "bma2026"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "plugins": ["expo-router", "expo-web-browser"]
  }
}
```

### 7. Environment Variables (`.env`)

No additional environment variables needed! Google OAuth credentials are stored in Supabase Dashboard.

```bash
# Existing variables (sufficient for OAuth)
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_SUPABASE_URL=https://dxwwnvlgtymnaawgcofd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Testing

### Web

1. Run: `npm start` → Press `w`
2. Navigate to login or signup page
3. Click "Continue with Google"
4. Browser redirects to Google OAuth consent
5. After approval, redirects back to app
6. User is logged in ✅

### iOS Simulator

1. Run: `npm run ios`
2. Navigate to login or signup page
3. Click "Continue with Google"
4. In-app browser opens Google OAuth
5. After approval, browser closes
6. User is logged in ✅

### Android Emulator (Expo Go)

1. Run: `npm run android`
2. Navigate to login or signup page
3. Click "Continue with Google"
4. **Known Issue**: May redirect to production instead of app
5. **Workaround**: Use Development Build (see below)

### Android Development Build

1. Create development build:

   ```bash
   eas build --profile development --platform android
   ```

2. Install APK on device/emulator
3. Test OAuth flow - works correctly ✅

---

## Known Issues

### Android Expo Go Limitation

**Issue:** Google OAuth doesn't work properly in Expo Go on Android.

**Reason:** Expo Go on Android has limitations with custom URL scheme redirects (`exp://...`) from Chrome Custom Tabs after OAuth completion.

**Workaround:** Use a Development Build or Production Build for Android OAuth testing.

**Status:**

- ✅ Web: Working
- ✅ iOS Expo Go: Working
- ⚠️ Android Expo Go: Requires Development Build
- ✅ Android Development Build: Working
- ✅ Production Builds: Working

### OAuth Consent Screen Domain

**Issue:** Consent screen shows `dxwwnvlgtymnaawgcofd.supabase.co` instead of your domain.

**Reason:** OAuth redirect goes through Supabase's authentication endpoint.

**Solution:** Upgrade to Supabase Pro ($25/month) to use custom domain (e.g., `auth.bma2026.com`).

**Current Status:** Acceptable for development. Users see your app branding (name + logo) prominently.

---

## Troubleshooting

### "Unsupported provider: provider is not enabled"

**Solution:** Enable Google provider in Supabase Dashboard > Authentication > Providers. Make sure the toggle is ON and credentials are saved.

### OAuth redirects to production instead of localhost

**Solution:** Add redirect URL to Supabase:

- Go to Authentication > URL Configuration > Redirect URLs
- Add: `http://localhost:8081/**`
- Click Save

### iOS: User logged in but redirected back to login screen

**Solution:** Check that the session is being established. Look for `[OAuth] Session set successfully` in logs. If missing, tokens may not be extracted properly from callback URL.

### Android: Browser opens but gets stuck

**Solution:**

1. Verify `exp://*` is added to Supabase redirect URLs
2. Ensure `expo-web-browser` plugin is in `app.json`
3. Use Development Build for full OAuth support

### "No access token found" error

**Solution:** Supabase callback URL format may have changed. Check logs for the actual callback URL structure and adjust token extraction code if needed.

### Testing in Expo Go vs Production

| Environment       | URL Scheme                    | Works?     |
| ----------------- | ----------------------------- | ---------- |
| Web (localhost)   | `http://localhost:8081`       | ✅ Yes     |
| Web (production)  | `https://bma-2026.vercel.app` | ✅ Yes     |
| iOS Expo Go       | `exp://192.168.x.x:8081`      | ✅ Yes     |
| Android Expo Go   | `exp://192.168.x.x:8081`      | ⚠️ Limited |
| iOS Dev Build     | `bma2026://`                  | ✅ Yes     |
| Android Dev Build | `bma2026://`                  | ✅ Yes     |

---

## Security Notes

1. **Client ID & Secret**: Stored in Supabase Dashboard (server-side), never exposed to client
2. **OAuth Flow**: Handled by Supabase Auth (secure, industry-standard)
3. **Token Storage**: Managed by Supabase client with AsyncStorage encryption
4. **HTTPS Required**: All OAuth redirects must use HTTPS (except localhost)
5. **Individual Accounts**: Safe to use personal Google Cloud account during development

---

## Next Steps

### For Production Launch

1. **Google OAuth Verification**:
   - Change OAuth consent screen from "Testing" to "In Production"
   - Submit for Google verification (1-2 weeks)
   - Add privacy policy and terms of service URLs

2. **Supabase Custom Domain** (Optional):
   - Upgrade to Supabase Pro
   - Configure custom domain (e.g., `auth.bma2026.com`)
   - Update Google Cloud redirect URIs

3. **Mobile Builds**:
   - Create production builds with EAS Build
   - Test OAuth on physical devices
   - Deploy to App Store and Play Store

### Adding More Providers

To add Facebook, Apple, or other OAuth providers:

1. Follow similar setup in provider's developer console
2. Enable in Supabase Dashboard > Authentication > Providers
3. Add provider button in login/signup screens
4. Create `signInWith[Provider]` methods following same pattern

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo WebBrowser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)

---

**Last Updated:** 2026-01-14
**Tested Versions:** Expo SDK 54, React Native 0.81, Supabase JS v2
