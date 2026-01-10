# Supabase Authentication Integration Plan

This document outlines the step-by-step implementation plan for integrating Supabase authentication into the BMA 2026 Expo app.

## Overview

**Goal**: Replace mock authentication with real Supabase authentication supporting email/password login, with session persistence across app restarts.

**Platforms**: Web, Android, iOS (universal Expo app)

---

## Prerequisites

- [x] Supabase project created
- [x] Environment variables configured in `.env`
- [ ] Supabase Auth enabled in dashboard (Email provider)

---

## Implementation Steps

### Phase 1: Dependencies & Configuration

#### Step 1.1: Install Supabase Dependencies
Install the required packages for Supabase integration with Expo.

```bash
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
```

**Packages**:
- `@supabase/supabase-js` - Official Supabase client
- `@react-native-async-storage/async-storage` - For session persistence on mobile

#### Step 1.2: Create Supabase Client Configuration
Create a new file `lib/supabase.ts` to initialize the Supabase client.

**File**: `lib/supabase.ts`

**Contents**:
- Import Supabase client
- Import AsyncStorage for React Native
- Read environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- Create and export Supabase client with custom storage adapter
- Configure auth options (autoRefreshToken, persistSession, detectSessionInUrl)

**Platform Considerations**:
- Use AsyncStorage for mobile platforms
- Use default localStorage for web
- Handle `detectSessionInUrl` differently for web vs mobile

#### Step 1.3: Update .gitignore
Ensure `.env` files are not committed to version control.

**Add to `.gitignore`**:
```
.env
.env.local
.env.*.local
```

---

### Phase 2: Update Authentication Context

#### Step 2.1: Define Auth Types
Update or create types for authentication state.

**File**: `contexts/AuthContext.tsx`

**Types to define**:
```typescript
interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
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

interface AuthResult {
  success: boolean;
  error?: string;
}
```

#### Step 2.2: Implement Supabase Auth Provider
Replace mock authentication logic with Supabase calls.

**File**: `contexts/AuthContext.tsx`

**Implementation details**:

1. **Initialize session state**:
   - Add `session` state alongside `user`
   - Add `isLoading` state for initial session check

2. **Session listener**:
   - Use `supabase.auth.onAuthStateChange()` to listen for auth events
   - Handle events: `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`
   - Update user state when session changes

3. **Initial session check**:
   - On mount, call `supabase.auth.getSession()`
   - Set loading state during check
   - Restore user from existing session if available

4. **Login function**:
   - Call `supabase.auth.signInWithPassword({ email, password })`
   - Handle errors (invalid credentials, network errors)
   - Return standardized result object

5. **Sign up function** (new):
   - Call `supabase.auth.signUp({ email, password, options: { data: { name } } })`
   - Handle email confirmation requirement
   - Return appropriate success/error messages

6. **Logout function**:
   - Call `supabase.auth.signOut()`
   - Clear local state

7. **Reset password function** (new):
   - Call `supabase.auth.resetPasswordForEmail(email)`
   - Return success/error status

8. **User mapping**:
   - Create helper function to map Supabase User to app User type
   - Extract `id`, `email`, `user_metadata.name`, `user_metadata.avatar_url`

#### Step 2.3: Handle Loading State in Root Layout
Update the root layout to show loading indicator during initial auth check.

**File**: `app/_layout.tsx`

**Changes**:
- Access `isLoading` from auth context
- Show splash/loading screen while `isLoading` is true
- Prevent navigation decisions until loading completes

---

### Phase 3: Update UI Components

#### Step 3.1: Update Login Screen
Modify the login screen to work with Supabase auth.

**File**: `app/(auth)/login.tsx`

**Changes**:
- Keep existing UI structure
- Update error handling to display Supabase error messages
- Remove hardcoded demo credentials hint (or update for testing)
- Add loading state during authentication
- Handle network errors gracefully

#### Step 3.2: Create Sign Up Screen
Add a registration screen for new users.

**File**: `app/(auth)/signup.tsx`

**Features**:
- Email input with validation
- Password input with strength requirements
- Name input (optional)
- Confirm password field
- Link to login screen
- Handle email confirmation flow

#### Step 3.3: Create Forgot Password Screen
Add password reset functionality.

**File**: `app/(auth)/forgot-password.tsx`

**Features**:
- Email input
- Submit button
- Success message after email sent
- Link back to login

#### Step 3.4: Update Auth Layout
Add navigation between auth screens.

**File**: `app/(auth)/_layout.tsx`

**Changes**:
- Add Stack.Screen entries for new screens
- Configure screen options (titles, animations)

---

### Phase 4: Session Management

#### Step 4.1: Implement Token Refresh
Ensure tokens are automatically refreshed.

**Location**: `lib/supabase.ts` client configuration

**Details**:
- Enable `autoRefreshToken: true`
- Supabase client handles refresh automatically
- Verify refresh works across app restarts

#### Step 4.2: Handle Session Expiry
Gracefully handle expired sessions.

**File**: `contexts/AuthContext.tsx`

**Implementation**:
- Listen for `TOKEN_REFRESHED` event
- Listen for `SIGNED_OUT` event (triggered on refresh failure)
- Redirect to login when session expires
- Show appropriate message to user

#### Step 4.3: Secure API Calls (Future)
Prepare for authenticated API calls.

**Pattern to establish**:
```typescript
// For future data fetching
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', user.id);
```

---

### Phase 5: Testing & Validation

#### Step 5.1: Test Authentication Flows
Verify all auth flows work correctly.

**Test cases**:
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (wrong password)
- [ ] Login with non-existent user
- [ ] Logout and verify session cleared
- [ ] App restart with valid session (auto-login)
- [ ] App restart with expired session
- [ ] Sign up with new email
- [ ] Sign up with existing email (should show error)
- [ ] Password reset flow (request reset email)
- [ ] Navigate between login, signup, and forgot password screens

#### Step 5.2: Test Cross-Platform
Verify authentication works on all platforms.

**Platforms to test**:
- [ ] Web browser
- [ ] iOS Simulator / Device
- [ ] Android Emulator / Device

**Platform-specific checks**:
- Session persistence works on each platform
- Deep linking for password reset (web)
- Keyboard handling on mobile

#### Step 5.3: Error Handling
Verify error messages are user-friendly.

**Error scenarios**:
- Network offline
- Invalid email format
- Weak password
- Rate limiting
- Server errors

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add Supabase dependencies |
| `.gitignore` | Modify | Add .env files |
| `lib/supabase.ts` | Create | Supabase client configuration |
| `contexts/AuthContext.tsx` | Modify | Replace mock auth with Supabase |
| `app/_layout.tsx` | Modify | Handle loading state |
| `app/(auth)/login.tsx` | Modify | Update error handling |
| `app/(auth)/signup.tsx` | Create | Registration screen |
| `app/(auth)/forgot-password.tsx` | Create | Password reset screen |
| `app/(auth)/_layout.tsx` | Modify | Add new screen routes |

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGc...` |

**Note**: The `EXPO_PUBLIC_` prefix is required for Expo to expose these variables to the client bundle.

---

## Security Considerations

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use anon key only** - The anon key is safe for client-side use
3. **Row Level Security (RLS)** - Enable RLS on Supabase tables for data access control
4. **Email confirmation** - Consider enabling email confirmation for production
5. **Password requirements** - Supabase enforces minimum 6 characters by default

---

## Rollback Plan

If issues arise during implementation:

1. Keep mock auth code commented (not deleted) initially
2. Use feature flag or environment variable to toggle between mock/real auth
3. Full rollback: Revert `AuthContext.tsx` to previous version

---

## Post-Implementation Tasks

- [ ] Remove demo credentials from login screen
- [ ] Add proper loading indicators
- [ ] Implement "Remember me" functionality (optional)
- [ ] Add social auth providers (Google, Apple) - future enhancement
- [ ] Set up email templates in Supabase dashboard
- [ ] Configure password policies in Supabase dashboard

---

## Estimated Implementation Order

1. **Step 1.1-1.3**: Dependencies & Configuration (~10 min)
2. **Step 2.1-2.3**: Auth Context Update (~30 min)
3. **Step 3.1**: Login Screen Update (~15 min)
4. **Step 3.2**: Sign Up Screen (~20 min)
5. **Step 3.3**: Forgot Password Screen (~15 min)
6. **Step 3.4**: Auth Layout Update (~5 min)
7. **Step 4.1-4.2**: Session Management (~15 min)
8. **Step 5.1-5.3**: Testing (~20 min)

**Total estimated time**: ~2.5 hours
