# Phase 1: Core Infrastructure (Days 6-15)

## Overview

Phase 1 builds the core infrastructure including authentication flows, user profiles, internationalization (i18n), and the design system. This phase establishes the foundational components that all other features will build upon.

**Duration:** 10 days
**Prerequisites:** Phase 0 completed (database, RLS, CI/CD)
**Deliverables:**

- Complete authentication with 4 OAuth providers
- Profile management with avatar upload
- Bilingual system (English + Mizo)
- 19 design system components in Storybook
- Navigation architecture for all route groups

---

## Task Breakdown

### Task 1.1: Authentication Implementation

**GitHub Issue:** #6 - Implement Complete Authentication Flow

**Reference:** [PROJECT-SCAFFOLDING-STEPS.md - Auth Section](../PROJECT-SCAFFOLDING-STEPS.md)

#### 1.1.1: Update Auth Context with OAuth

**Files:** `contexts/AuthContext.tsx`

**Sub-tasks:**

1. Add OAuth provider methods (Google, Facebook, Apple)
2. Implement session refresh handling
3. Add email verification flow
4. Handle deep link authentication callbacks
5. Add auth error handling with user-friendly messages

```typescript
// Add to AuthContextType interface
interface AuthContextType {
  // ... existing
  loginWithGoogle: () => Promise<AuthResult>;
  loginWithFacebook: () => Promise<AuthResult>;
  loginWithApple: () => Promise<AuthResult>;
  verifyEmail: (token: string) => Promise<AuthResult>;
  resendVerificationEmail: () => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
}
```

**Acceptance Criteria:**

- [ ] Email/password login working
- [ ] Google OAuth working on all platforms
- [ ] Facebook OAuth working on all platforms
- [ ] Apple OAuth working on iOS
- [ ] Email verification flow complete
- [ ] Password reset flow complete
- [ ] Session persists across app restarts
- [ ] Error messages are user-friendly and bilingual

#### 1.1.2: Create OAuth Configuration

**Files:** `lib/oauth.ts`

```typescript
// OAuth redirect URLs per platform
export const getRedirectUrl = (provider: string) => {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/auth/callback`;
  }
  return `bma2026://auth/callback`;
};

// OAuth provider configs
export const oauthConfig = {
  google: {
    scopes: ['email', 'profile'],
    redirectTo: getRedirectUrl('google'),
  },
  facebook: {
    scopes: ['email', 'public_profile'],
    redirectTo: getRedirectUrl('facebook'),
  },
  apple: {
    scopes: ['email', 'name'],
    redirectTo: getRedirectUrl('apple'),
  },
};
```

#### 1.1.3: Create Auth Callback Handler

**Files:** `app/(auth)/callback.tsx`

Handle OAuth callbacks and deep links:

1. Parse URL parameters
2. Exchange code for session
3. Redirect to appropriate screen
4. Handle errors gracefully

**Acceptance Criteria:**

- [ ] OAuth redirects handled on web
- [ ] Deep links handled on mobile
- [ ] Errors shown to user
- [ ] Successful auth redirects to home

#### 1.1.4: Update Login Screen with OAuth

**Files:** `app/(auth)/login.tsx`

**Changes:**

1. Add social login buttons (Google, Facebook, Apple)
2. Add divider "or continue with email"
3. Add loading states per provider
4. Handle platform-specific button visibility (Apple only on iOS)

**UI Layout:**

```
┌────────────────────────────────┐
│         BMA 2026 Logo          │
├────────────────────────────────┤
│  Welcome back                  │
│  Sign in to your account       │
├────────────────────────────────┤
│  [    Google Sign In     ]     │
│  [    Facebook Sign In   ]     │
│  [    Apple Sign In      ] iOS │
├────────────────────────────────┤
│  ─────── or ───────            │
├────────────────────────────────┤
│  Email: [________________]     │
│  Password: [_____________]     │
│  [      Sign In          ]     │
├────────────────────────────────┤
│  Forgot password?              │
│  Don't have an account? Sign up│
└────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Social buttons styled consistently
- [ ] Apple button only shows on iOS
- [ ] Loading states work per button
- [ ] Errors display under relevant section

#### 1.1.5: Update Signup Screen with OAuth

**Files:** `app/(auth)/signup.tsx`

Similar to login but for new users:

1. Social signup options
2. Email/password signup form
3. Terms of service checkbox
4. Email verification notice

**Acceptance Criteria:**

- [ ] OAuth creates new accounts
- [ ] Terms checkbox required
- [ ] Email verification notice shown
- [ ] Profile completion prompt after signup

#### 1.1.6: Create Email Verification Screen

**Files:** `app/(auth)/verify-email.tsx`

**Features:**

1. Show verification status
2. Resend verification email button
3. Check email instructions
4. Continue button (redirects to login)

**Acceptance Criteria:**

- [ ] Shows after signup
- [ ] Resend button works
- [ ] Clear instructions displayed
- [ ] Handles deep link verification

---

### Task 1.2: Profile Management

**GitHub Issue:** #7 - Implement Profile Management

#### 1.2.1: Create Profile Types

**Files:** `types/profile.ts`

```typescript
import { Database } from '@/lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface ProfileFormData {
  full_name: string;
  full_name_lus?: string;
  phone?: string;
  bio?: string;
  bio_lus?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  preferred_language: 'en' | 'lus';
  is_directory_visible: boolean;
}
```

#### 1.2.2: Create Profile Hooks

**Files:** `hooks/useProfile.ts`

```typescript
export function useProfile() {
  // Fetch current user's profile
  // Returns: { profile, isLoading, error, refetch }
}

export function useUpdateProfile() {
  // Mutation hook for profile updates
  // Returns: { mutate, isLoading, error }
}

export function useUploadAvatar() {
  // Upload avatar to Supabase Storage
  // Returns: { upload, isLoading, progress, error }
}
```

**Acceptance Criteria:**

- [ ] Profile fetches on auth state change
- [ ] Updates reflect immediately (optimistic)
- [ ] Avatar upload shows progress
- [ ] Error handling for all operations

#### 1.2.3: Create Profile View Screen

**Files:** `app/(app)/profile/index.tsx`

**Sections:**

1. Avatar with edit button
2. Name and email
3. Membership status badge
4. Profile stats (if applicable)
5. Quick actions (Edit Profile, Settings)

**UI Layout:**

```
┌────────────────────────────────┐
│  [← Back]      Profile         │
├────────────────────────────────┤
│         ┌─────────┐            │
│         │  Avatar │ [📷 Edit]  │
│         └─────────┘            │
│      John Doe                  │
│      john@example.com          │
│      [Member Badge]            │
├────────────────────────────────┤
│  About                         │
│  Bio text here...              │
├────────────────────────────────┤
│  Contact                       │
│  📱 +91 98765 43210            │
│  📍 Bangalore, Karnataka       │
├────────────────────────────────┤
│  [    Edit Profile    ]        │
│  [    Settings        ]        │
└────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Shows current profile data
- [ ] Membership badge accurate
- [ ] Edit button navigates to edit screen
- [ ] Handles missing optional fields gracefully

#### 1.2.4: Create Profile Edit Screen

**Files:** `app/(app)/profile/edit.tsx`

**Form Fields:**

1. Avatar picker (camera/gallery)
2. Full name (required)
3. Full name in Mizo (optional)
4. Phone number with validation
5. Date of birth (date picker)
6. Bio (textarea)
7. Bio in Mizo (textarea)
8. Address fields (address, city, state, pincode)
9. Preferred language toggle
10. Directory visibility toggle

**Acceptance Criteria:**

- [ ] All fields pre-populated
- [ ] Validation on required fields
- [ ] Phone number format validation
- [ ] Changes save successfully
- [ ] Cancel discards changes

#### 1.2.5: Create Avatar Upload Component

**Files:** `components/AvatarPicker.tsx`

**Features:**

1. Display current avatar or initials
2. Press to open action sheet
3. Options: Camera, Gallery, Remove
4. Image cropping (expo-image-picker)
5. Upload progress indicator
6. Error handling

```typescript
interface AvatarPickerProps {
  currentUrl?: string;
  name?: string;
  size?: number;
  onUpload: (url: string) => void;
  onRemove: () => void;
  editable?: boolean;
}
```

**Acceptance Criteria:**

- [ ] Shows initials when no avatar
- [ ] Camera permission requested
- [ ] Gallery permission requested
- [ ] Cropping to square
- [ ] Upload progress visible
- [ ] Errors displayed

#### 1.2.6: Create Profile Completion Flow

**Files:** `app/(app)/profile/complete.tsx`

Required for membership upgrade:

1. Required fields indicator
2. Step-by-step wizard (optional)
3. Progress indicator
4. Skip option for non-essential fields

**Required Fields for Membership:**

- Full name
- Phone number (verified)
- Address (city, state, pincode)

**Acceptance Criteria:**

- [ ] Shows missing required fields
- [ ] Blocks membership upgrade until complete
- [ ] Progress saved between sessions
- [ ] Skip goes to next step

---

### Task 1.3: Internationalization (i18n)

**GitHub Issue:** #8 - Implement Bilingual System

**Reference:** [PRD - Bilingual Support Section](../PRD-BMA-2026.md)

#### 1.3.1: Setup i18n Infrastructure

**Files:** `lib/i18n.ts`, `app/_layout.tsx`

**Dependencies:**

```bash
npm install react-i18next i18next expo-localization
```

**Configuration:**

```typescript
// lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from '@/locales/en/common.json';
import lus from '@/locales/lus/common.json';

const resources = {
  en: { translation: en },
  lus: { translation: lus },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getLocales()[0]?.languageCode || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

**Acceptance Criteria:**

- [ ] i18n initialized before app render
- [ ] System language detected
- [ ] Fallback to English working
- [ ] Context accessible everywhere

#### 1.3.2: Create Translation Files Structure

**Files:** `locales/en/*.json`, `locales/lus/*.json`

**Directory Structure:**

```
locales/
├── en/
│   ├── common.json       # Shared strings
│   ├── auth.json         # Auth screens
│   ├── profile.json      # Profile screens
│   ├── content.json      # Content screens
│   ├── chat.json         # Chatbot
│   ├── membership.json   # Membership
│   └── admin.json        # Admin dashboard
└── lus/
    ├── common.json
    ├── auth.json
    ├── profile.json
    ├── content.json
    ├── chat.json
    ├── membership.json
    └── admin.json
```

**Example `locales/en/common.json`:**

```json
{
  "app": {
    "name": "BMA 2026",
    "tagline": "Bangalore Mizo Association"
  },
  "nav": {
    "home": "Home",
    "news": "News",
    "events": "Events",
    "gallery": "Gallery",
    "about": "About",
    "profile": "Profile",
    "chat": "Chat",
    "settings": "Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "submit": "Submit",
    "continue": "Continue",
    "back": "Back",
    "retry": "Retry",
    "loading": "Loading..."
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "network": "No internet connection",
    "unauthorized": "Please sign in to continue"
  }
}
```

**Example `locales/lus/common.json`:**

```json
{
  "app": {
    "name": "BMA 2026",
    "tagline": "Bangalore Mizo Pawl"
  },
  "nav": {
    "home": "Home",
    "news": "Thuthang",
    "events": "Hun Pawimawh",
    "gallery": "Gallery",
    "about": "Kan Chungchang",
    "profile": "Profile",
    "chat": "Inbiak",
    "settings": "Settings"
  },
  "actions": {
    "save": "Dahkhawm",
    "cancel": "Paih",
    "delete": "Paih Hmang",
    "edit": "Siam Thar",
    "submit": "Submit",
    "continue": "Kal Zel",
    "back": "Kir",
    "retry": "Tum Thar",
    "loading": "A load mek..."
  },
  "errors": {
    "generic": "A diklo. Tum thar rawh.",
    "network": "Internet connection a awm lo",
    "unauthorized": "Sign in hmasa rawh"
  }
}
```

**Acceptance Criteria:**

- [ ] All common strings translated
- [ ] File structure organized by domain
- [ ] No hardcoded strings in components
- [ ] Translation keys consistent

#### 1.3.3: Create Language Toggle Component

**Files:** `components/LanguageToggle.tsx`

**Features:**

1. Toggle button (EN | LUS)
2. Current language highlighted
3. Updates user preference
4. Saves to profile (if authenticated)
5. Saves to AsyncStorage (if guest)

```typescript
interface LanguageToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'dropdown';
}
```

**Acceptance Criteria:**

- [ ] Language switches immediately
- [ ] Preference persists
- [ ] Works for guests
- [ ] Syncs with profile preference

#### 1.3.4: Create useTranslation Hook Wrapper

**Files:** `hooks/useAppTranslation.ts`

```typescript
export function useAppTranslation(namespace?: string) {
  const { t, i18n } = useTranslation(namespace);
  const { user } = useAuth();

  // Sync with user preference
  useEffect(() => {
    if (user?.preferred_language) {
      i18n.changeLanguage(user.preferred_language);
    }
  }, [user?.preferred_language]);

  return { t, i18n, currentLanguage: i18n.language };
}
```

#### 1.3.5: Update All Screens with i18n

**Files:** All screen files

Replace hardcoded strings with translation keys:

```typescript
// Before
<Text>Welcome back</Text>

// After
const { t } = useAppTranslation('auth');
<Text>{t('login.welcome')}</Text>
```

**Acceptance Criteria:**

- [ ] No hardcoded user-facing strings
- [ ] All screens use translations
- [ ] Date/number formatting localized
- [ ] Error messages translated

---

### Task 1.4: Design System Components

**GitHub Issue:** #9 - Implement Design System Components

**Reference:** [DESIGN-SYSTEM-IMPLEMENTATION.md](../DESIGN-SYSTEM-IMPLEMENTATION.md), [UI-UX-WIREFRAMES.md](../UI-UX-WIREFRAMES.md)

#### 1.4.1: Setup Storybook

**Files:** `.storybook/*`, `package.json`

**Dependencies:**

```bash
npx storybook@latest init --type react_native
```

**Configuration:**

```javascript
// .storybook/main.js
module.exports = {
  stories: ['../components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};
```

**Acceptance Criteria:**

- [ ] Storybook runs on web
- [ ] Storybook runs on device
- [ ] Theme toggle working
- [ ] Controls addon working

#### 1.4.2: Typography Components

**Files:** `components/typography/*.tsx`

Already implemented from scaffolding. Verify and add Storybook stories:

| Component | File          | Purpose        |
| --------- | ------------- | -------------- |
| Text      | `Text.tsx`    | Body text      |
| Heading   | `Heading.tsx` | H1-H6 headings |
| Label     | `Label.tsx`   | Form labels    |
| Caption   | `Caption.tsx` | Small captions |

**Create Stories:**

```typescript
// components/typography/Text.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  component: Text,
  argTypes: {
    variant: {
      control: 'select',
      options: ['body', 'body-sm', 'body-lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'Body text example',
  },
};

export const AllVariants: Story = {
  render: () => (
    <View>
      <Text variant="body-lg">Large body text</Text>
      <Text variant="body">Regular body text</Text>
      <Text variant="body-sm">Small body text</Text>
    </View>
  ),
};
```

#### 1.4.3: Layout Components

**Files:** `components/layout/*.tsx`

Already implemented. Add stories:

| Component | File            | Purpose             |
| --------- | --------------- | ------------------- |
| Stack     | `Stack.tsx`     | VStack/HStack/Row   |
| Spacer    | `Spacer.tsx`    | Spacing             |
| Divider   | `Divider.tsx`   | Divider lines       |
| Container | `Container.tsx` | Max-width container |

#### 1.4.4: Input Components

**Files:** `components/inputs/*.tsx`

| Component   | File              | Purpose          | Status |
| ----------- | ----------------- | ---------------- | ------ |
| Input       | `Input.tsx`       | Text input       | Exists |
| TextArea    | `TextArea.tsx`    | Multi-line input | Create |
| Checkbox    | `Checkbox.tsx`    | Checkbox         | Create |
| Switch      | `Switch.tsx`      | Toggle switch    | Create |
| DatePicker  | `DatePicker.tsx`  | Date selection   | Create |
| Select      | `Select.tsx`      | Dropdown select  | Create |
| SearchInput | `SearchInput.tsx` | Search with icon | Create |

**TextArea Component:**

```typescript
interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}
```

**Select Component:**

```typescript
interface SelectProps<T> {
  label?: string;
  value?: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
}
```

**Acceptance Criteria:**

- [ ] All input components implemented
- [ ] Consistent styling with design system
- [ ] Accessibility labels
- [ ] Error states
- [ ] Storybook stories for each

#### 1.4.5: Display Components

**Files:** `components/display/*.tsx`

| Component   | File              | Purpose               | Status |
| ----------- | ----------------- | --------------------- | ------ |
| Icon        | `Icon.tsx`        | Themed icons          | Exists |
| Avatar      | `Avatar.tsx`      | User avatars          | Exists |
| Badge       | `Badge.tsx`       | Status badges         | Exists |
| ContentCard | `ContentCard.tsx` | News/article card     | Create |
| EventCard   | `EventCard.tsx`   | Event with date badge | Create |
| MemberCard  | `MemberCard.tsx`  | Directory member      | Create |
| StatsCard   | `StatsCard.tsx`   | Dashboard stat        | Create |
| PricingCard | `PricingCard.tsx` | Membership tier       | Create |

**ContentCard Component:**

```typescript
interface ContentCardProps {
  id: string;
  type: 'news' | 'article' | 'event';
  title: string;
  excerpt?: string;
  imageUrl?: string;
  author?: { name: string; avatar?: string };
  publishedAt?: Date;
  likesCount?: number;
  commentsCount?: number;
  onPress?: () => void;
}
```

**EventCard Component:**

```typescript
interface EventCardProps {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  eventDate: Date;
  location?: string;
  onPress?: () => void;
}
```

**Acceptance Criteria:**

- [ ] All display components implemented
- [ ] Consistent with wireframes
- [ ] Responsive sizing
- [ ] Loading skeletons

#### 1.4.6: Feedback Components

**Files:** `components/feedback/*.tsx`

| Component     | File                | Purpose              | Status |
| ------------- | ------------------- | -------------------- | ------ |
| Toast         | `Toast.tsx`         | Toast notifications  | Create |
| Modal         | `Modal.tsx`         | Modal dialogs        | Create |
| Alert         | `Alert.tsx`         | Alert messages       | Create |
| Skeleton      | `Skeleton.tsx`      | Loading placeholders | Create |
| EmptyState    | `EmptyState.tsx`    | No data states       | Create |
| OfflineBanner | `OfflineBanner.tsx` | Offline indicator    | Create |

**Toast System:**

```typescript
// contexts/ToastContext.tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}
```

**Modal Component:**

```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
}
```

**Acceptance Criteria:**

- [ ] Toast system working globally
- [ ] Modal with backdrop
- [ ] Skeleton animations
- [ ] EmptyState with illustrations
- [ ] OfflineBanner detects network

#### 1.4.7: Navigation Components

**Files:** `components/navigation/*.tsx`

Already implemented. Verify and update:

| Component    | File               | Purpose                  |
| ------------ | ------------------ | ------------------------ |
| WebHeader    | `WebHeader.tsx`    | Desktop header           |
| MobileHeader | `MobileHeader.tsx` | Mobile header            |
| MobileDrawer | `MobileDrawer.tsx` | Mobile drawer            |
| TabBar       | `TabBar.tsx`       | Bottom tabs (create)     |
| Breadcrumb   | `Breadcrumb.tsx`   | Web breadcrumbs (create) |

**TabBar Component (for bottom navigation):**

```typescript
interface TabBarProps {
  tabs: Array<{
    key: string;
    label: string;
    icon: string;
    route: string;
  }>;
  activeTab: string;
  onTabPress: (key: string) => void;
}
```

#### 1.4.8: Pattern Components

**Files:** `components/patterns/*.tsx`

| Component      | File                 | Purpose         |
| -------------- | -------------------- | --------------- |
| CommentThread  | `CommentThread.tsx`  | Nested comments |
| ChatBubble     | `ChatBubble.tsx`     | Chat message    |
| ChatInput      | `ChatInput.tsx`      | Message input   |
| DataTable      | `DataTable.tsx`      | Admin tables    |
| Pagination     | `Pagination.tsx`     | List pagination |
| RichTextEditor | `RichTextEditor.tsx` | Content editor  |

**CommentThread Component:**

```typescript
interface Comment {
  id: string;
  body: string;
  author: { name: string; avatar?: string };
  createdAt: Date;
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  onReply: (parentId: string, body: string) => void;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}
```

**ChatBubble Component:**

```typescript
interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  sources?: Array<{ title: string; url?: string }>;
  classification?: 'informational' | 'guidance' | 'urgent';
  isLoading?: boolean;
}
```

**Acceptance Criteria:**

- [ ] CommentThread supports 2 levels of nesting
- [ ] ChatBubble shows sources
- [ ] DataTable sortable and filterable
- [ ] Pagination works with API
- [ ] RichTextEditor outputs markdown/HTML

---

### Task 1.5: Navigation Architecture

**GitHub Issue:** #10 - Implement Navigation Architecture

**Reference:** [UI-UX-WIREFRAMES.md - Navigation Section](../UI-UX-WIREFRAMES.md)

#### 1.5.1: Create Public Route Group

**Files:** `app/(public)/_layout.tsx`, `app/(public)/*.tsx`

**Routes:**

```
/(public)/
├── _layout.tsx         # Public layout (header, footer)
├── index.tsx           # Home page (redirect or landing)
├── news/
│   ├── index.tsx       # News list
│   └── [slug].tsx      # News detail
├── events/
│   ├── index.tsx       # Events list
│   └── [slug].tsx      # Event detail
├── articles/
│   ├── index.tsx       # Articles list
│   └── [slug].tsx      # Article detail
├── gallery/
│   └── index.tsx       # Photo gallery
├── about/
│   ├── index.tsx       # About BMA
│   ├── history.tsx     # History
│   └── leadership.tsx  # Leadership team
└── newsletter/
    └── index.tsx       # Newsletter archive
```

**Layout Features:**

- Public header with nav
- Language toggle
- Login/Signup buttons (if not authenticated)
- Footer with links

**Acceptance Criteria:**

- [ ] All public routes accessible
- [ ] Navigation working
- [ ] SEO meta tags
- [ ] Guest access working

#### 1.5.2: Create Auth Route Group

**Files:** `app/(auth)/_layout.tsx`, `app/(auth)/*.tsx`

**Routes:**

```
/(auth)/
├── _layout.tsx         # Auth layout (centered card)
├── login.tsx           # Login screen
├── signup.tsx          # Registration
├── forgot-password.tsx # Password reset request
├── reset-password.tsx  # Password reset form
├── verify-email.tsx    # Email verification
└── callback.tsx        # OAuth callback handler
```

**Layout Features:**

- Centered card layout
- Logo at top
- Language toggle
- Back to home link

#### 1.5.3: Create App Route Group

**Files:** `app/(app)/_layout.tsx`, `app/(app)/*.tsx`

**Routes:**

```
/(app)/
├── _layout.tsx         # App layout (auth required)
├── home.tsx            # User dashboard
├── profile/
│   ├── index.tsx       # View profile
│   ├── edit.tsx        # Edit profile
│   └── complete.tsx    # Profile completion
├── membership/
│   ├── index.tsx       # Membership status
│   ├── upgrade.tsx     # Upgrade flow
│   └── history.tsx     # Payment history
├── directory/
│   └── index.tsx       # Member directory (paid only)
├── chat/
│   ├── index.tsx       # Chat list
│   └── [id].tsx        # Chat conversation
└── settings/
    └── index.tsx       # App settings
```

**Layout Features:**

- Auth guard (redirect if not logged in)
- Bottom tabs (mobile)
- Sidebar (web wide)
- Header with user menu

#### 1.5.4: Create Admin Route Group

**Files:** `app/(admin)/_layout.tsx`, `app/(admin)/*.tsx`

**Routes:**

```
/(admin)/
├── _layout.tsx         # Admin layout (admin/editor only)
├── index.tsx           # Admin dashboard
├── users/
│   ├── index.tsx       # User list
│   └── [id].tsx        # User detail
├── content/
│   ├── index.tsx       # Content list
│   ├── new.tsx         # Create content
│   └── [id]/
│       └── edit.tsx    # Edit content
├── memberships/
│   └── index.tsx       # Membership management
├── escalations/
│   └── index.tsx       # Escalation queue
├── knowledge-base/
│   ├── index.tsx       # KB list
│   └── [id].tsx        # KB item edit
├── audit-logs/
│   └── index.tsx       # Audit log viewer
└── analytics/
    └── index.tsx       # Analytics dashboard
```

**Layout Features:**

- Admin/Editor role check
- Sidebar navigation
- Breadcrumbs
- Quick actions header

**Acceptance Criteria:**

- [ ] Role-based access enforced
- [ ] Navigation consistent
- [ ] Deep linking working
- [ ] Breadcrumbs accurate

#### 1.5.5: Create Navigation Hooks

**Files:** `hooks/useNavigation.ts`

```typescript
export function useRouteGuard() {
  // Check if user can access current route
  // Redirect if not authorized
}

export function useNavigationState() {
  // Track current route
  // Provide back navigation
}

export function useBreadcrumbs() {
  // Generate breadcrumb trail
  // Based on current route
}
```

#### 1.5.6: Update Root Layout

**Files:** `app/_layout.tsx`

**Updates:**

1. Add ToastProvider
2. Add i18n initialization
3. Add network status listener
4. Add route guards
5. Handle deep links

```typescript
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NetworkProvider>
              <I18nProvider>
                <RootNavigator />
              </I18nProvider>
            </NetworkProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

**Acceptance Criteria:**

- [ ] All providers properly nested
- [ ] Deep links handled
- [ ] Network status detected
- [ ] Auth state drives navigation

---

## Testing Requirements

### Unit Tests

**Files:** `__tests__/unit/*.test.ts`

- [ ] Auth context methods
- [ ] Profile hooks
- [ ] Translation hook
- [ ] All UI components

### Integration Tests

**Files:** `__tests__/integration/*.test.ts`

- [ ] Login flow (email + OAuth)
- [ ] Signup flow with verification
- [ ] Profile update flow
- [ ] Language switching

### E2E Tests

**Files:** `e2e/*.spec.ts`

- [ ] Complete auth journey
- [ ] Navigation between route groups
- [ ] Profile completion flow

### Storybook

- [ ] All components documented
- [ ] All variants shown
- [ ] Accessibility checks pass

---

## Files Created/Modified Summary

### New Files

| Category      | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | `lib/oauth.ts`, `app/(auth)/callback.tsx`, `app/(auth)/verify-email.tsx`, `app/(auth)/reset-password.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Profile       | `types/profile.ts`, `hooks/useProfile.ts`, `app/(app)/profile/index.tsx`, `app/(app)/profile/edit.tsx`, `app/(app)/profile/complete.tsx`, `components/AvatarPicker.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| i18n          | `lib/i18n.ts`, `hooks/useAppTranslation.ts`, `locales/en/*.json`, `locales/lus/*.json`, `components/LanguageToggle.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Design System | `components/inputs/TextArea.tsx`, `components/inputs/Checkbox.tsx`, `components/inputs/Switch.tsx`, `components/inputs/DatePicker.tsx`, `components/inputs/Select.tsx`, `components/inputs/SearchInput.tsx`, `components/display/ContentCard.tsx`, `components/display/EventCard.tsx`, `components/display/MemberCard.tsx`, `components/display/StatsCard.tsx`, `components/display/PricingCard.tsx`, `components/feedback/Toast.tsx`, `components/feedback/Modal.tsx`, `components/feedback/Alert.tsx`, `components/feedback/Skeleton.tsx`, `components/feedback/EmptyState.tsx`, `components/feedback/OfflineBanner.tsx`, `components/navigation/TabBar.tsx`, `components/navigation/Breadcrumb.tsx`, `components/patterns/CommentThread.tsx`, `components/patterns/ChatBubble.tsx`, `components/patterns/ChatInput.tsx`, `components/patterns/DataTable.tsx`, `components/patterns/Pagination.tsx`, `components/patterns/RichTextEditor.tsx`, `contexts/ToastContext.tsx`, `contexts/NetworkContext.tsx` |
| Navigation    | `app/(public)/_layout.tsx`, `app/(public)/index.tsx`, `app/(admin)/_layout.tsx`, `hooks/useNavigation.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Storybook     | `.storybook/*`, `components/**/*.stories.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Modified Files

| File                       | Changes                  |
| -------------------------- | ------------------------ |
| `contexts/AuthContext.tsx` | Add OAuth methods        |
| `app/(auth)/login.tsx`     | Add social login         |
| `app/(auth)/signup.tsx`    | Add social signup        |
| `app/_layout.tsx`          | Add providers            |
| `package.json`             | Add i18n deps, storybook |

---

## Dependencies

### NPM Packages to Install

```bash
# i18n
npm install react-i18next i18next expo-localization

# Image handling
npm install expo-image-picker expo-image-manipulator

# Date picker
npm install @react-native-community/datetimepicker

# Storybook
npx storybook@latest init --type react_native

# Rich text (for admin)
npm install @10play/tentap-editor
```

### Services to Configure

- [ ] Google OAuth credentials
- [ ] Facebook App ID
- [ ] Apple Services ID

---

## Definition of Done

- [ ] All 4 OAuth providers working
- [ ] Email verification flow complete
- [ ] Profile CRUD working with avatar upload
- [ ] All translation files created (EN + Mizo)
- [ ] Language toggle persists preference
- [ ] All 19 design system components implemented
- [ ] Storybook running with all stories
- [ ] All route groups created
- [ ] Navigation works across all platforms
- [ ] Unit test coverage > 80% for new code
- [ ] All GitHub Issues for Phase 1 closed

---

## Next Phase

Continue to [Phase 2: Public Features](./03-PHASE-2-PUBLIC-FEATURES.md)
