# Facebook OAuth Implementation Guide

**Status:** ✅ Implemented | ⚠️ Android requires Development Build (expected)

This document details the implementation of Facebook OAuth authentication for the BMA 2026 application using Supabase Auth.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Facebook Developer Platform Setup](#facebook-developer-platform-setup)
4. [Supabase Dashboard Configuration](#supabase-dashboard-configuration)
5. [Code Implementation](#code-implementation)
6. [Testing](#testing)
7. [Local Development with ngrok](#local-development-with-ngrok)
8. [Known Issues](#known-issues)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Facebook OAuth integration allows users to sign in using their Facebook account. The implementation uses:

- **Supabase Auth**: Handles OAuth flow server-side
- **expo-web-browser**: Opens OAuth consent screen on mobile
- **expo-auth-session**: Generates proper redirect URIs
- **Custom redirect handling**: Extracts tokens and establishes session

### Platform Support

| Platform            | Status              | Notes                                       |
| ------------------- | ------------------- | ------------------------------------------- |
| Web                 | ✅ Expected to work | Auto-redirect after OAuth                   |
| iOS                 | ✅ Expected to work | Uses in-app browser with custom scheme      |
| Android (Expo Go)   | ⚠️ Limited          | Requires Development Build for full support |
| Android (Dev Build) | ✅ Expected to work | Full OAuth support with custom scheme       |

---

## Prerequisites

- Supabase project created
- Facebook Developer account
- Expo project with `expo-web-browser` and `expo-auth-session` installed (already installed for Google OAuth)

```bash
# Should already be installed from Google OAuth implementation
npm install expo-web-browser expo-auth-session expo-crypto
```

---

## Facebook Developer Platform Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** in the top right
3. Click **Create App**
4. Select **Use Case**: **Authenticate and request data from users with Facebook Login**
5. Click **Next**
6. **App Type**: Select **Consumer**
7. Click **Next**
8. Fill in app details:
   - **App Name**: `BMA 2026` or `Bangalore Mizo Association`
   - **App Contact Email**: Your email
   - **Business Account**: (Optional) Create or select if you have one
9. Click **Create App**

### 2. Add Facebook Login Product

1. From the App Dashboard, find **Add Products to Your App**
2. Locate **Facebook Login** and click **Set Up**
3. Choose platform: **Web** (for initial setup)
4. Click **Next**

### 3. Configure OAuth Settings

**CRITICAL: There are TWO places in Facebook Developer Console where you need to configure settings. The console is confusing - pay close attention to which section you're in!**

---

#### LOCATION 1: Dashboard > Use Case Settings (MOST IMPORTANT)

This is the **primary location** that actually controls OAuth redirects:

1. In the left sidebar, click **Dashboard** (not "App Settings"!)
2. Find the section **"Customize the Authenticate and request data from users with Facebook Login use case"**
3. Click **Settings** in that section
4. Find **"Valid OAuth Redirect URIs"** input box
5. Enter your Supabase callback URL:

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

**Example:**

```
https://dxwwnvlgtymnaawgcofd.supabase.co/auth/v1/callback
```

6. Click **Save**

**This is the setting that actually fixes the "Can't load URL" error!**

---

#### LOCATION 2: App Settings > Basic (Secondary)

This section is for general app configuration:

1. In the left sidebar, click **App Settings** > **Basic**
2. Configure:
   - **App Domains**: `bma-2026.vercel.app` (no https://, just domain)
   - **Privacy Policy URL**: `https://bma-2026.vercel.app/privacy`
   - **Website Platform**: Add with Site URL `https://bma-2026.vercel.app`

---

#### Common Confusion Points

| Section                             | Location                               | What to Configure                                 |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------- |
| **Dashboard > Use Case > Settings** | Left sidebar → Dashboard               | **Valid OAuth Redirect URIs** (Supabase callback) |
| **App Settings > Basic**            | Left sidebar → App Settings → Basic    | App Domains, Website Platform, Privacy Policy     |
| **App Settings > Advanced**         | Left sidebar → App Settings → Advanced | Advanced settings (usually not needed)            |

**The "Can't load URL" error is almost always caused by missing the OAuth Redirect URI in the Dashboard > Use Case > Settings section!**

Click **Save Changes**

### 4. Configure App Settings

1. Go to **Settings** > **Basic** in the left sidebar
2. Fill in required fields:
   - **App Domains**: Add your domain(s)
     ```
     bma-2026.vercel.app
     localhost
     ```
   - **Privacy Policy URL**: `https://bma-2026.vercel.app/privacy` (create this page if it doesn't exist)
   - **Terms of Service URL**: (Optional) `https://bma-2026.vercel.app/terms`
   - **App Icon**: Upload BMA logo (1024x1024px recommended)

3. **Add Platform** (if not already added):
   - Click **Add Platform** at the bottom
   - Choose **Website**
   - **Site URL**: `https://bma-2026.vercel.app`
   - For local development, also add: `http://localhost:8081`

4. Scroll down and note your credentials:
   - **App ID**: `123456789012345`
   - **App Secret**: Click **Show** to reveal

### 5. Configure Data Access

1. Go to **App Review** > **Permissions and Features**
2. Request the following permissions (if not already granted):
   - **email** (should be granted by default)
   - **public_profile** (granted by default)

### 6. App Mode Settings

#### During Development

- Keep app in **Development Mode**
- Add test users: Go to **Roles** > **Test Users** > **Add Test Users**
- Test users can sign in without app review

#### Before Production Launch

1. Go to **App Review** > **Requests**
2. Submit for **App Review** if you need additional permissions beyond `email` and `public_profile`
3. Switch app to **Live Mode** in **Settings** > **Basic**
4. Note: `email` and `public_profile` don't require review for most cases

---

## Supabase Dashboard Configuration

### 1. Enable Facebook Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Facebook** in the list
5. **Toggle ON** to enable

### 2. Add Facebook Credentials

In the Facebook provider settings:

- **Facebook client ID**: Paste your Facebook **App ID**
- **Facebook secret**: Paste your Facebook **App Secret**
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

The redirect URLs should already be configured from Google OAuth setup. Verify these are present:

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

#### Interface Update

Add the new method to the `AuthContextType` interface:

```typescript
interface AuthContextType {
  // ... existing methods
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithFacebook: () => Promise<AuthResult>; // Add this
}
```

#### signInWithFacebook Method

Add this new method to the `AuthProvider` component (after `signInWithGoogle`):

```typescript
const signInWithFacebook = useCallback(async (): Promise<AuthResult> => {
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

    console.warn('[Facebook OAuth] Generated redirect URI:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web', // Don't auto-redirect on mobile
        // Facebook specific scopes (email and public_profile are default)
        scopes: 'email public_profile',
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
        console.warn('[Facebook OAuth] Opening browser for authentication...');
        console.warn('[Facebook OAuth] Platform:', Platform.OS);

        // Use different approach for Android vs iOS
        let result: WebBrowser.WebBrowserAuthSessionResult;

        if (Platform.OS === 'android') {
          // For Android, use auth session with options
          try {
            result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
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
          result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        }

        console.warn('[Facebook OAuth] Browser result type:', result.type);

        if (result.type === 'success' && result.url) {
          const url = result.url;
          console.warn('[Facebook OAuth] Callback URL received');

          // Extract tokens from callback URL
          const createSession = async (callbackUrl: string) => {
            try {
              let params: URLSearchParams;

              if (callbackUrl.includes('#')) {
                const hashPart = callbackUrl.split('#')[1];
                params = new URLSearchParams(hashPart);
              } else if (callbackUrl.includes('?')) {
                const queryPart = callbackUrl.split('?')[1];
                params = new URLSearchParams(queryPart);
              } else {
                console.error('No tokens found in callback URL');
                return null;
              }

              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');

              console.warn('[Facebook OAuth] Token extraction:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
              });

              if (!accessToken) {
                console.error('No access token found');
                return null;
              }

              if (!refreshToken) {
                console.error('No refresh token found in OAuth callback');
                return null;
              }

              // Set the session with the extracted tokens
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                console.error('Error setting session:', sessionError);
                return null;
              }

              console.warn('[Facebook OAuth] Session set successfully:', {
                hasUser: !!sessionData.user,
                hasSession: !!sessionData.session,
                userEmail: sessionData.user?.email,
              });

              return sessionData;
            } catch (err) {
              console.error('Error creating session:', err);
              return null;
            }
          };

          const sessionData = await createSession(url);

          if (sessionData && sessionData.session) {
            return { success: true };
          }

          return { success: false, error: 'Failed to establish session after Facebook sign-in.' };
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
```

#### Provider Value Update

Add `signInWithFacebook` to the provider value:

```typescript
const value = useMemo(
  () => ({
    user,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    login,
    signUp,
    signInWithGoogle,
    signInWithFacebook, // Add this
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
```

### 2. Facebook Sign-In Button Component

Create a new file: `components/auth/FacebookSignInButton.tsx`

```typescript
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
          <Text weight="medium" style={[styles.label, { color: '#FFFFFF' }]}>
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

### 3. Export Component

Update `components/index.ts`:

```typescript
// Auth components
export { GoogleSignInButton } from './auth/GoogleSignInButton';
export { FacebookSignInButton } from './auth/FacebookSignInButton'; // Add this
```

### 4. Login Screen Integration

Update `app/(auth)/login.tsx`:

```typescript
import { GoogleSignInButton, FacebookSignInButton } from '@/components';

export default function LoginScreen() {
  const { login, signInWithGoogle, signInWithFacebook } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    const result = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (!result.success) {
      setError(result.error || 'Google sign-in failed');
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    setIsFacebookLoading(true);
    const result = await signInWithFacebook();
    setIsFacebookLoading(false);

    if (!result.success) {
      setError(result.error || 'Facebook sign-in failed');
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
      disabled={isLoading || isGoogleLoading || isFacebookLoading}
    />

    <Spacer size="sm" />

    {/* Facebook Sign-In Button */}
    <FacebookSignInButton
      onPress={handleFacebookSignIn}
      loading={isFacebookLoading}
      disabled={isLoading || isGoogleLoading || isFacebookLoading}
    />

    // ... rest of form
  );
}
```

### 5. SignUp Screen Integration

Update `app/(auth)/signup.tsx` with similar code:

```typescript
<GoogleSignInButton
  onPress={handleGoogleSignIn}
  loading={isGoogleLoading}
  disabled={isLoading || isGoogleLoading || isFacebookLoading}
  label="Sign up with Google"
/>

<Spacer size="sm" />

<FacebookSignInButton
  onPress={handleFacebookSignIn}
  loading={isFacebookLoading}
  disabled={isLoading || isGoogleLoading || isFacebookLoading}
  label="Sign up with Facebook"
/>
```

### 6. App Configuration

No changes needed to `app.json` - the existing configuration from Google OAuth already supports Facebook OAuth:

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

### 7. Environment Variables

No additional environment variables needed! Facebook OAuth credentials are stored in Supabase Dashboard.

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
3. Click "Continue with Facebook"
4. Browser redirects to Facebook OAuth consent
5. After approval, redirects back to app
6. User is logged in ✅

### iOS Simulator

1. Run: `npm run ios`
2. Navigate to login or signup page
3. Click "Continue with Facebook"
4. In-app browser opens Facebook OAuth
5. After approval, browser closes
6. User is logged in ✅

### Android Emulator (Expo Go)

1. Run: `npm run android`
2. Navigate to login or signup page
3. Click "Continue with Facebook"
4. **Expected Issue**: May redirect to production instead of app
5. **Workaround**: Use Development Build (see below)

### Android Development Build

1. Create development build:

   ```bash
   eas build --profile development --platform android
   ```

2. Install APK on device/emulator
3. Test OAuth flow - should work correctly ✅

---

## Local Development with ngrok

**Important:** Unlike Google OAuth, Facebook OAuth does **NOT** support `localhost` testing. Facebook requires real domains with TLDs (like `.com`, `.app`). To test Facebook OAuth locally, you must use a tunneling service like ngrok.

### Why ngrok is Required

| Provider | Localhost Support | Reason                                                                 |
| -------- | ----------------- | ---------------------------------------------------------------------- |
| Google   | ✅ Yes            | Google allows `localhost` in OAuth redirect URIs                       |
| Facebook | ❌ No             | Facebook requires domains with TLDs (rejects `localhost`, `127.0.0.1`) |

### Step 1: Install ngrok

```bash
# Option A: Install globally via npm
npm install -g ngrok

# Option B: Install via Homebrew (macOS)
brew install ngrok

# Option C: Download from https://ngrok.com/download
```

### Step 2: Create ngrok Account (Free)

1. Go to [https://ngrok.com/](https://ngrok.com/)
2. Sign up for a free account
3. Get your auth token from the dashboard
4. Configure ngrok with your token:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Your Local App

```bash
# In terminal 1: Start Expo
npm start

# Press 'w' to open web version
# App runs at http://localhost:8081
```

### Step 4: Create ngrok Tunnel

```bash
# In terminal 2: Create HTTPS tunnel to your local server
ngrok http 8081
```

You'll see output like:

```
Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:8081
```

**Copy the `https://....ngrok-free.app` URL** - you'll need this for configuration.

### Step 5: Configure Facebook Developer Console

Add your ngrok URL to Facebook:

#### Location 1: Dashboard > Use Case > Settings

1. Go to Facebook Developer Console
2. Click **Dashboard** in left sidebar
3. Find **"Customize the Authenticate and request data from users with Facebook Login use case"**
4. Click **Settings**
5. In **"Valid OAuth Redirect URIs"**, you should already have:
   ```
   https://dxwwnvlgtymnaawgcofd.supabase.co/auth/v1/callback
   ```
   (This stays the same - ngrok doesn't change the Supabase callback)

#### Location 2: App Settings > Basic

1. Click **App Settings** > **Basic** in left sidebar
2. **App Domains**: Add your ngrok domain (without https://):
   ```
   abc123def456.ngrok-free.app
   bma-2026.vercel.app
   ```
3. **Add Platform** or edit existing **Website**:
   - You may need to add a second Website platform for ngrok
   - Or temporarily change the existing Site URL to your ngrok URL
   - Site URL: `https://abc123def456.ngrok-free.app`
4. Click **Save Changes**

### Step 6: Configure Supabase

Add ngrok URL to Supabase redirect allowlist:

1. Go to **Supabase Dashboard** > **Authentication** > **URL Configuration**
2. In **Redirect URLs**, add:
   ```
   https://abc123def456.ngrok-free.app/**
   ```
3. Optionally, temporarily change **Site URL** to your ngrok URL:
   ```
   https://abc123def456.ngrok-free.app
   ```
4. Click **Save**

### Step 7: Test Facebook OAuth Locally

1. Open your ngrok URL in the browser:
   ```
   https://abc123def456.ngrok-free.app
   ```
2. Navigate to the login page
3. Click "Continue with Facebook"
4. Complete the OAuth flow
5. You should be redirected back and logged in ✅

### Step 8: Cleanup After Testing

**Important:** After testing, revert your configurations:

#### Facebook Developer Console:

- Remove ngrok domain from App Domains (or leave it - won't hurt)
- Change Website Site URL back to: `https://bma-2026.vercel.app`

#### Supabase Dashboard:

- Change Site URL back to: `https://bma-2026.vercel.app`
- You can leave the ngrok redirect URL in the list (it won't cause issues)

### ngrok Tips and Notes

#### Free Plan Limitations

- URLs change every time you restart ngrok
- You need to reconfigure Facebook/Supabase each time
- Consider ngrok paid plan ($8/month) for stable URLs

#### Paid Plan Benefits

- Static/reserved domains (e.g., `bma-dev.ngrok.io`)
- No need to reconfigure Facebook/Supabase
- Multiple tunnels simultaneously

#### Alternative: Use Vercel Preview Deployments

If ngrok setup is too cumbersome:

1. Create a feature branch:

   ```bash
   git checkout -b feature/test-facebook
   ```

2. Push to trigger Vercel preview deployment:

   ```bash
   git commit --allow-empty -m "test: Facebook OAuth testing"
   git push origin feature/test-facebook
   ```

3. Vercel creates a preview URL like:

   ```
   https://bma-2026-git-feature-test-facebook-username.vercel.app
   ```

4. Add this URL to Facebook App Domains and test

#### Web Interface for Debugging

ngrok provides a local web interface for inspecting requests:

```
http://127.0.0.1:4040
```

This shows all HTTP requests passing through the tunnel - useful for debugging OAuth callbacks.

### Quick Reference: Local Testing Checklist

```
□ ngrok installed and configured with auth token
□ Local app running (npm start → w for web)
□ ngrok tunnel created (ngrok http 8081)
□ Facebook App Domains updated with ngrok domain
□ Facebook Website platform URL updated (or added)
□ Supabase Redirect URLs includes ngrok URL
□ Supabase Site URL temporarily set to ngrok URL
□ Test Facebook OAuth at ngrok URL
□ Revert Facebook and Supabase settings after testing
```

---

## Known Issues

### Android Expo Go Limitation

**Issue:** Facebook OAuth may not work properly in Expo Go on Android.

**Reason:** Expo Go on Android has limitations with custom URL scheme redirects (`exp://...`) from Chrome Custom Tabs after OAuth completion.

**Workaround:** Use a Development Build or Production Build for Android OAuth testing.

**Status:**

- ✅ Web: Expected to work
- ✅ iOS Expo Go: Expected to work
- ⚠️ Android Expo Go: Requires Development Build
- ✅ Android Development Build: Expected to work
- ✅ Production Builds: Expected to work

### OAuth Consent Screen Domain

**Issue:** Consent screen shows `dxwwnvlgtymnaawgcofd.supabase.co` instead of your domain.

**Reason:** OAuth redirect goes through Supabase's authentication endpoint.

**Solution:** Upgrade to Supabase Pro ($25/month) to use custom domain (e.g., `auth.bma2026.com`).

**Current Status:** Acceptable for development. Users see your app branding (name + logo) prominently.

### Facebook Email Permission

**Issue:** Some users may not grant email permission, or their Facebook account doesn't have an email.

**Handling:** Check if `user.email` is null after OAuth. If so, prompt user to add an email or use another sign-in method.

---

## Troubleshooting

### "Unsupported provider: provider is not enabled"

**Solution:** Enable Facebook provider in Supabase Dashboard > Authentication > Providers. Make sure the toggle is ON and credentials are saved.

### "URL Blocked: This redirect failed because the redirect URI is not whitelisted"

**Solution:** Add the Supabase callback URL to the correct location in Facebook:

**IMPORTANT: Go to the Dashboard section, NOT App Settings!**

1. Go to Facebook Developer Console
2. Click **Dashboard** in the left sidebar
3. Find **"Customize the Authenticate and request data from users with Facebook Login use case"**
4. Click **Settings**
5. Add `https://<your-project-ref>.supabase.co/auth/v1/callback` to **Valid OAuth Redirect URIs**
6. Click Save

### OAuth redirects to production instead of localhost

**Solution:** Add redirect URL to Supabase:

- Go to Authentication > URL Configuration > Redirect URLs
- Add: `http://localhost:8081/**`
- Click Save

### iOS: User logged in but redirected back to login screen

**Solution:** Check that the session is being established. Look for `[Facebook OAuth] Session set successfully` in logs. If missing, tokens may not be extracted properly from callback URL.

### Android: Browser opens but gets stuck

**Solution:**

1. Verify `exp://*` is added to Supabase redirect URLs
2. Ensure `expo-web-browser` plugin is in `app.json`
3. Use Development Build for full OAuth support

### "Can't Load URL: The domain of this URL isn't included in the app's domains"

**Solution:** This error is almost always caused by configuring the wrong section in Facebook Developer Console.

**The fix:**

1. Go to Facebook Developer Console
2. Click **Dashboard** in the left sidebar (NOT "App Settings"!)
3. Find **"Customize the Authenticate and request data from users with Facebook Login use case"**
4. Click **Settings**
5. In **"Valid OAuth Redirect URIs"**, add: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
6. Click **Save**

**Common mistake:** Configuring "App Settings > Basic" but missing the "Dashboard > Use Case > Settings" section. Both are needed, but the Dashboard section is what fixes this specific error.

**Also verify App Settings > Basic has:**

- App Domains: `bma-2026.vercel.app`
- Website Platform with Site URL

### Facebook Login Button Doesn't Appear

**Solution:** Make sure you've added the platform in Facebook App Settings:

- Go to Settings > Basic
- Click "Add Platform"
- Choose "Website"
- Add your Site URL

### Testing in Expo Go vs Production

| Environment       | URL Scheme                    | Works?      |
| ----------------- | ----------------------------- | ----------- |
| Web (localhost)   | `http://localhost:8081`       | ✅ Expected |
| Web (production)  | `https://bma-2026.vercel.app` | ✅ Expected |
| iOS Expo Go       | `exp://192.168.x.x:8081`      | ✅ Expected |
| Android Expo Go   | `exp://192.168.x.x:8081`      | ⚠️ Limited  |
| iOS Dev Build     | `bma2026://`                  | ✅ Expected |
| Android Dev Build | `bma2026://`                  | ✅ Expected |

---

## Security Notes

1. **App ID & Secret**: Stored in Supabase Dashboard (server-side), never exposed to client
2. **OAuth Flow**: Handled by Supabase Auth (secure, industry-standard)
3. **Token Storage**: Managed by Supabase client with AsyncStorage encryption
4. **HTTPS Required**: All OAuth redirects must use HTTPS (except localhost)
5. **Individual Accounts**: Safe to use personal Facebook Developer account during development

---

## Next Steps

### For Production Launch

1. **Facebook App Review**:
   - Switch app from "Development" to "Live" mode in Settings > Basic
   - If using permissions beyond `email` and `public_profile`, submit for App Review
   - Add privacy policy and terms of service URLs
   - Ensure app icon is uploaded (1024x1024px)

2. **Supabase Custom Domain** (Optional):
   - Upgrade to Supabase Pro
   - Configure custom domain (e.g., `auth.bma2026.com`)
   - Update Facebook OAuth redirect URIs

3. **Mobile Builds**:
   - Create production builds with EAS Build
   - Test OAuth on physical devices
   - Deploy to App Store and Play Store

4. **Privacy Policy**:
   - Create a comprehensive privacy policy that includes:
     - What data you collect from Facebook (email, name, profile picture)
     - How you use this data
     - How long you retain it
     - User's rights to delete their data
   - Host it at `https://bma-2026.vercel.app/privacy`
   - Link it in Facebook App Settings

### Email Handling

Facebook OAuth may return users without email addresses in some cases:

- User didn't grant email permission
- Facebook account doesn't have a verified email

**Handle this by:**

```typescript
// After successful OAuth
if (!user.email) {
  // Prompt user to add email
  // OR allow them to use the app without email (if your use case allows)
  // OR ask them to sign up with a different method
}
```

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook App Development](https://developers.facebook.com/docs/development)
- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Expo WebBrowser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)

---

**Last Updated:** 2026-01-14
**Status:** ✅ Implemented
**Tested Versions:** Expo SDK 54, React Native 0.81, Supabase JS v2
