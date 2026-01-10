# Project Scaffolding Implementation Guide

This document provides a comprehensive guide for scaffolding the BMA 2026 Expo universal app from scratch. It serves as both documentation of the current implementation and a reference for future projects.

## Overview

**Goal**: Create a production-ready Expo app with authentication, platform-adaptive navigation, and a polished dark/light theme system.

**Platforms**: Web, Android, iOS (single shared codebase)

**Tech Stack**:
- Expo SDK 54
- Expo Router 6 (file-based routing)
- React Native 0.81
- React 19.1
- TypeScript 5.9

---

## Project Structure

```
BMA-2026/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Entry redirect
│   ├── (auth)/                   # Auth route group
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx             # Login screen
│   │   ├── signup.tsx            # Registration screen
│   │   └── forgot-password.tsx   # Password reset screen
│   └── (app)/                    # Authenticated route group
│       ├── _layout.tsx           # App layout with navigation
│       ├── home.tsx              # Home dashboard
│       └── profile.tsx           # User profile
├── assets/                       # Static assets
│   ├── icon.png                  # App icon (1024x1024)
│   ├── adaptive-icon.png         # Android adaptive icon
│   ├── splash-icon.png           # Splash screen icon
│   ├── favicon.png               # Web favicon
│   └── global.css                # Global CSS for web (autofill fix)
├── components/                   # Reusable UI components
│   ├── index.ts                  # Component exports
│   ├── Button.tsx                # Button component
│   ├── Card.tsx                  # Card container
│   ├── Input.tsx                 # Form input
│   ├── ScreenContainer.tsx       # Screen wrapper
│   └── navigation/               # Navigation components
│       ├── index.ts              # Navigation exports
│       ├── WebHeader.tsx         # Desktop horizontal nav
│       ├── MobileHeader.tsx      # Mobile header bar
│       └── MobileDrawer.tsx      # Mobile drawer menu
├── constants/                    # App constants
│   └── theme.ts                  # Colors, typography, spacing
├── contexts/                     # React contexts
│   ├── AuthContext.tsx           # Authentication state (Supabase)
│   └── ThemeContext.tsx          # Theme state (dark/light)
├── lib/                          # Library configurations
│   └── supabase.ts               # Supabase client setup
├── hooks/                        # Custom hooks
│   ├── index.ts                  # Hook exports
│   └── useMediaQuery.ts          # Responsive layout detection
├── docs/                         # Documentation
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment variables template
├── .env.required                 # Required environment variables
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler configuration
└── .gitignore                    # Git ignore rules
```

---

## Implementation Steps

### Phase 1: Project Configuration

#### Step 1.1: Create package.json
Initialize the project with required dependencies.

**File**: `package.json`

```json
{
  "name": "bma-2026",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@supabase/supabase-js": "^2.90.1",
    "expo": "^54.0.0",
    "expo-constants": "~18.0.13",
    "expo-linking": "~8.0.11",
    "expo-router": "~6.0.21",
    "expo-status-bar": "~3.0.9",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-web": "^0.21.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~19.1.10",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

**Key points**:
- `"main": "expo-router/entry"` - Required for Expo Router
- Compatible versions for Expo SDK 54
- React 19.1 and React Native 0.81
- Supabase for authentication
- TypeScript 5.9 support included

#### Step 1.2: Create app.json
Configure Expo project settings.

**File**: `app.json`

```json
{
  "expo": {
    "name": "BMA 2026",
    "slug": "bma-2026",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "bma2026",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0a"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.bma.app2026"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0a"
      },
      "package": "com.bma.app2026"
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/favicon.png"
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

**Key points**:
- `scheme` - Required for deep linking
- `newArchEnabled` - Enables React Native's new architecture
- `output: "single"` - SPA mode for web (avoids SSR issues with Supabase auth)
- `plugins: ["expo-router"]` - Required for file-based routing
- `experiments.typedRoutes` - Enables TypeScript route checking

#### Step 1.3: Create tsconfig.json
Configure TypeScript with path aliases.

**File**: `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

**Key points**:
- Extends Expo's base TypeScript config
- `@/*` path alias for cleaner imports
- Strict mode enabled for better type safety

#### Step 1.4: Create babel.config.js
Configure Babel for Expo.

**File**: `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

#### Step 1.5: Create metro.config.js
Configure Metro bundler.

**File**: `metro.config.js`

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

#### Step 1.6: Create .gitignore
Configure files to exclude from version control.

**File**: `.gitignore`

```
# Dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native builds
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local
.env

# TypeScript
*.tsbuildinfo

# Testing
coverage/

# IDE
.idea/
.vscode/
*.swp
*.swo
```

#### Step 1.7: Create Placeholder Assets
Generate placeholder images for app icons and splash screen.

**Files to create**:
- `assets/icon.png` - 1024x1024 (or 256x256 placeholder)
- `assets/adaptive-icon.png` - 1024x1024 (or 256x256 placeholder)
- `assets/splash-icon.png` - 200x200
- `assets/favicon.png` - 48x48

**Placeholder approach**: Solid color matching theme (e.g., #DC2626 red)

---

### Phase 2: Theme System

#### Step 2.1: Create Theme Constants
Define the design system tokens.

**File**: `constants/theme.ts`

**Contents**:
1. **Colors** - Dark and light palette (defined in ThemeContext for dynamic use)
2. **Spacing** - Consistent spacing scale (xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48)
3. **Border Radius** - Rounded corner values (sm: 4, md: 8, lg: 12, xl: 16, full: 9999)
4. **Typography** - Font family, sizes, weights
5. **Shadows** - Elevation styles for cards and modals

**Color Palette (Dark Theme)**:
| Token | Value | Usage |
|-------|-------|-------|
| primary | #DC2626 | Buttons, accents |
| background | #0A0A0A | Screen background |
| surface | #1F1F1F | Cards, inputs |
| text | #FFFFFF | Primary text |
| textSecondary | #A3A3A3 | Secondary text |
| border | #404040 | Borders, dividers |

**Color Palette (Light Theme)**:
| Token | Value | Usage |
|-------|-------|-------|
| primary | #DC2626 | Buttons, accents |
| background | #FFFFFF | Screen background |
| surface | #FEF2F2 | Cards, inputs (light red tint) |
| text | #0A0A0A | Primary text |
| textSecondary | #525252 | Secondary text |
| border | #FECACA | Borders (light red) |
| borderLight | #FEE2E2 | Light borders (very light red) |

#### Step 2.2: Create Theme Context
Implement dynamic theme switching.

**File**: `contexts/ThemeContext.tsx`

**Features**:
1. **Theme modes**: 'light', 'dark', 'system'
2. **State management**: Current mode, resolved isDark boolean
3. **Color object**: Dynamic colors based on current theme
4. **Toggle function**: Switch between light and dark
5. **System detection**: Use `useColorScheme()` for system preference

**Exports**:
- `ThemeProvider` - Context provider component
- `useTheme()` - Hook returning `{ mode, isDark, colors, setMode, toggleTheme }`
- `darkColors` - Dark theme color object
- `lightColors` - Light theme color object
- `ThemeColors` - TypeScript type for colors

---

### Phase 3: Authentication System (Supabase)

#### Step 3.1: Create Supabase Client
Configure Supabase client with platform-specific storage.

**File**: `lib/supabase.ts`

**Implementation**:
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isBrowser = typeof window !== 'undefined';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web' && isBrowser,
    flowType: 'pkce',
  },
});
```

**Key points**:
- Use AsyncStorage for mobile, localStorage for web
- PKCE flow for secure email confirmation
- `detectSessionInUrl` only on web in browser context (prevents SSR crashes)

#### Step 3.2: Create Auth Context
Implement authentication state management with Supabase.

**File**: `contexts/AuthContext.tsx`

**User type**:
```typescript
interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}
```

**Context type**:
```typescript
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
```

**Implementation details**:
1. Session and user state with `useState`
2. Loading state for initial session check
3. Auth state listener with `supabase.auth.onAuthStateChange()`
4. Handle events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY
5. `login` function using `signInWithPassword`
6. `signUp` function with email confirmation handling
7. `resetPassword` function with platform-aware redirect URL
8. User mapping from Supabase User to App User type
9. Memoized context value for performance

---

### Phase 4: Reusable Components

#### Step 4.1: Create Button Component
Versatile button with multiple variants.

**File**: `components/Button.tsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | required | Button label |
| onPress | function | required | Press handler |
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| disabled | boolean | false | Disabled state |
| loading | boolean | false | Show loading spinner |
| style | ViewStyle | - | Container style override |
| textStyle | TextStyle | - | Text style override |

**Features**:
- Dynamic theme colors via `useTheme()`
- Loading state with ActivityIndicator
- Disabled opacity
- Touch feedback with `activeOpacity`

#### Step 4.2: Create Input Component
Form input with icons and validation.

**File**: `components/Input.tsx`

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| label | string | Input label above field |
| error | string | Error message below field |
| leftIcon | Ionicons name | Icon on left side |
| rightIcon | Ionicons name | Icon on right side |
| secureTextEntry | boolean | Password input with toggle |
| ...TextInputProps | - | All React Native TextInput props |

**Features**:
- Focus state with border color change
- Error state styling
- Password visibility toggle (eye icon)
- Dynamic theme colors
- Icon color changes on focus
- Web-specific: Remove browser focus outline (`outlineStyle: 'none'`)
- Web-specific: Override autofill background color via global CSS

#### Step 4.3: Create Card Component
Container for content grouping.

**File**: `components/Card.tsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Card content |
| style | ViewStyle | - | Style override |
| elevated | boolean | false | Add shadow/elevation |

**Features**:
- Dynamic background from theme
- Border and border radius
- Optional shadow for elevation
- Flexible padding

#### Step 4.4: Create ScreenContainer Component
Wrapper for screen content.

**File**: `components/ScreenContainer.tsx`

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Screen content |
| scrollable | boolean | false | Enable ScrollView |
| centered | boolean | false | Center content |
| padded | boolean | true | Add horizontal padding |
| style | ViewStyle | - | Style override |

**Features**:
- Safe area insets handling
- Optional ScrollView wrapper
- Keyboard-aware scrolling
- Consistent padding

#### Step 4.5: Create Component Index
Export all components from single entry point.

**File**: `components/index.ts`

```typescript
export { Button } from './Button';
export { Input } from './Input';
export { ScreenContainer } from './ScreenContainer';
export { Card } from './Card';
```

---

### Phase 5: Navigation Components

#### Step 5.1: Create useMediaQuery Hook
Detect screen size and platform for adaptive layouts.

**File**: `hooks/useMediaQuery.ts`

**Returns**:
```typescript
{
  width: number;           // Screen width
  height: number;          // Screen height
  isWeb: boolean;          // Platform is web
  isMobile: boolean;       // Platform is iOS/Android
  isWideScreen: boolean;   // Width >= 768px
  useHorizontalNav: boolean; // Should use horizontal nav
}
```

**Implementation**:
- Use `Dimensions.get('window')`
- Listen to dimension changes with `Dimensions.addEventListener`
- Cleanup listener on unmount
- `useHorizontalNav = isWeb && isWideScreen`

#### Step 5.2: Create WebHeader Component
Horizontal navigation for desktop web.

**File**: `components/navigation/WebHeader.tsx`

**Features**:
- Logo with brand name
- Horizontal nav links (Home, Profile)
- Active state highlighting
- Theme toggle button (sun/moon icon)
- User name display
- Logout button
- Hover states using Pressable
- Safe area insets for notched devices
- Max-width container (1200px) for large screens

**Navigation items**:
```typescript
const NAV_ITEMS = [
  { label: 'Home', path: '/(app)/home', icon: 'home-outline' },
  { label: 'Profile', path: '/(app)/profile', icon: 'person-outline' },
];
```

#### Step 5.3: Create MobileHeader Component
Header bar with hamburger menu for mobile.

**File**: `components/navigation/MobileHeader.tsx`

**Features**:
- Hamburger menu button (left)
- Centered logo and title
- Safe area insets
- Dynamic theme colors

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| onMenuPress | function | Opens drawer |
| title | string | Header title (default: 'BMA 2026') |

#### Step 5.4: Create MobileDrawer Component
Slide-out drawer menu for mobile.

**File**: `components/navigation/MobileDrawer.tsx`

**Features**:
- Modal overlay with backdrop
- Animated slide-in from left
- Logo and user info header
- Navigation links with active state
- Theme toggle with switch UI
- Logout button
- Close on backdrop press
- Close on navigation

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| visible | boolean | Drawer visibility |
| onClose | function | Close handler |

#### Step 5.5: Create Navigation Index
Export all navigation components.

**File**: `components/navigation/index.ts`

```typescript
export { WebHeader } from './WebHeader';
export { MobileHeader } from './MobileHeader';
export { MobileDrawer } from './MobileDrawer';
```

---

### Phase 6: App Routing

#### Step 6.1: Create Root Layout
Set up providers and auth-based navigation.

**File**: `app/_layout.tsx`

**Structure**:
```tsx
// Import global CSS for web (autofill fix)
if (Platform.OS === 'web') {
  require('@/assets/global.css');
}

<SafeAreaProvider>
  <ThemeProvider>
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  </ThemeProvider>
</SafeAreaProvider>
```

**RootLayoutNav features**:
- StatusBar style based on theme (light/dark)
- Loading screen while checking initial session
- Auth state monitoring with useEffect
- Redirect to login if not authenticated
- Redirect to home if authenticated but on auth screen
- Stack navigator with fade animation

#### Step 6.2: Create Index Redirect
Entry point that redirects based on auth state.

**File**: `app/index.tsx`

```tsx
export default function Index() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
```

#### Step 6.3: Create Auth Layout
Stack navigator for auth screens.

**File**: `app/(auth)/_layout.tsx`

**Features**:
- Stack navigator with slide animation
- Hidden header
- Dynamic theme background
- Routes: login, signup, forgot-password

#### Step 6.4: Create App Layout
Layout with platform-adaptive navigation.

**File**: `app/(app)/_layout.tsx`

**Features**:
- Detect platform with `useMediaQuery`
- Show WebHeader for wide web screens
- Show MobileHeader + MobileDrawer for mobile/narrow
- Drawer state management
- Slot for child routes

---

### Phase 7: Screens

#### Step 7.1: Create Login Screen
Authentication screen with email/password.

**File**: `app/(auth)/login.tsx`

**Features**:
- Centered card layout
- Logo and welcome text
- Email input with validation
- Password input with visibility toggle
- Sign in button with loading state
- Error message display
- Forgot password link
- Sign up link
- KeyboardAvoidingView for mobile
- Max-width container for web
- `autoComplete="off"` to prevent browser autofill

**Validation**:
- Required email
- Required password
- Display Supabase error messages

#### Step 7.2: Create Sign Up Screen
Registration screen for new users.

**File**: `app/(auth)/signup.tsx`

**Features**:
- Name input (stored in user metadata)
- Email input with validation
- Password input (min 6 characters)
- Confirm password with match validation
- Sign up button with loading state
- Email confirmation message handling
- Link to login screen

#### Step 7.3: Create Forgot Password Screen
Password reset request screen.

**File**: `app/(auth)/forgot-password.tsx`

**Features**:
- Email input with validation
- Submit button with loading state
- Success state with confirmation message
- "Try again" option to resend
- Back to Sign In link

#### Step 7.4: Create Home Screen
Dashboard with stats and quick actions.

**File**: `app/(app)/home.tsx`

**Sections**:
1. **Welcome section** - Greeting with user name
2. **Stats grid** - 3 stat cards (Views, Completion, Tasks)
3. **Quick actions** - 4 action buttons (Analytics, Team, Settings, Help)
4. **Recent activity** - List of recent items

**Features**:
- ScrollView with safe area padding
- Responsive max-width for wide screens
- Dynamic theme colors
- Icon integration with @expo/vector-icons

#### Step 7.5: Create Profile Screen
User profile with settings menu.

**File**: `app/(app)/profile.tsx`

**Sections**:
1. **Profile card** - Avatar, name, email, stats
2. **Settings menu** - List of setting options
3. **Danger zone** - Logout section
4. **Footer** - App version

**Features**:
- Avatar with initials
- Verified badge
- Stats row (Projects, Followers, Following)
- Menu items with icons and descriptions
- Chevron indicators
- Danger zone with red styling

---

## Testing Checklist

### Platform Testing
- [ ] Web browser (Chrome, Safari, Firefox)
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical iOS device
- [ ] Physical Android device

### Feature Testing
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Theme toggle (dark/light)
- [ ] Navigation between screens
- [ ] Responsive layout (resize browser)
- [ ] Keyboard handling on mobile
- [ ] Safe area insets (notched devices)

### Visual Testing
- [ ] Colors match design spec
- [ ] Typography is consistent
- [ ] Spacing is uniform
- [ ] Icons display correctly
- [ ] Loading states visible
- [ ] Error states styled correctly

---

## Running the App

### Installation
```bash
cd BMA-2026
npm install
```

### Development
```bash
# Start Expo dev server
npx expo start

# Then press:
# w - Open in web browser
# a - Open in Android emulator
# i - Open in iOS simulator
```

### Platform-Specific
```bash
# Web only
npm run web

# iOS only
npm run ios

# Android only
npm run android
```

---

## Common Issues & Solutions

### Issue: Module not found errors
**Solution**: Run `npm install` and restart Metro bundler

### Issue: TypeScript path alias not working
**Solution**: Ensure `tsconfig.json` has correct paths configuration and restart IDE

### Issue: Fonts not loading on web
**Solution**: Expo handles this automatically; ensure @expo/vector-icons is installed

### Issue: Safe area not working
**Solution**: Wrap app in SafeAreaProvider from react-native-safe-area-context

### Issue: Navigation not working
**Solution**: Check file naming in app/ directory matches Expo Router conventions

---

## Future Enhancements

- [x] Real authentication (Supabase integration) ✅ Completed
- [ ] Persistent theme preference
- [ ] Push notifications
- [ ] Offline support
- [ ] Internationalization (i18n)
- [ ] Multilingual helpdesk chatbot (Supabase pgvector + Gemini API)
- [ ] Analytics integration
- [ ] Error boundary implementation
- [ ] Automated testing setup

---

## Dependencies Reference

| Package | Version | Purpose |
|---------|---------|---------|
| expo | ^54.0.0 | Core Expo SDK |
| expo-router | ~6.0.21 | File-based routing |
| react | 19.1.0 | React library |
| react-native | 0.81.5 | React Native framework |
| react-native-web | ^0.21.0 | Web platform support |
| react-native-safe-area-context | ~5.6.0 | Safe area handling |
| react-native-screens | ~4.16.0 | Native screen containers |
| @expo/vector-icons | ^15.0.3 | Icon library |
| expo-status-bar | ~3.0.9 | Status bar control |
| expo-linking | ~8.0.11 | Deep linking support |
| expo-constants | ~18.0.13 | App constants access |
| @supabase/supabase-js | ^2.90.1 | Supabase client |
| @react-native-async-storage/async-storage | ^2.2.0 | Session storage (mobile) |
| typescript | ~5.9.2 | TypeScript compiler |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| EXPO_PUBLIC_SUPABASE_URL | Supabase project URL |
| EXPO_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous/public key |

**Note**: The `EXPO_PUBLIC_` prefix is required for Expo to expose variables to the client.
