# GitHub Issues Templates

This document contains 30 GitHub Issue templates for tracking the BMA 2026 implementation. Each issue corresponds to a major task or milestone from the implementation phases.

## Issue Labeling Convention

**Labels:**

- `phase-0`, `phase-1`, `phase-2`, `phase-3`, `phase-4`, `phase-5`, `phase-6` - Phase identification
- `priority-high`, `priority-medium`, `priority-low` - Priority level
- `type-feature`, `type-infrastructure`, `type-bugfix`, `type-testing` - Issue type
- `area-auth`, `area-content`, `area-payment`, `area-chatbot`, `area-admin` - Feature area
- `blocked`, `in-progress`, `ready-for-review` - Status

---

## Phase 0: Foundation (Issues #1-5)

### Issue #1: Setup Supabase Project

```markdown
---
title: Setup Supabase Project and Configure Auth Providers
labels: phase-0, priority-high, type-infrastructure
assignees:
---

## Description

Set up the Supabase project with all required configurations including authentication providers, storage buckets, and base settings.

## Tasks

- [ ] Create Supabase project in ap-south-1 (Mumbai) region
- [ ] Configure email/password authentication with email confirmations
- [ ] Set up Google OAuth provider
- [ ] Set up Facebook OAuth provider
- [ ] Set up Apple OAuth provider (for iOS)
- [ ] Customize email templates with BMA branding
- [ ] Create `avatars` storage bucket (private, 5MB limit)
- [ ] Create `content-media` storage bucket (public, 10MB limit)
- [ ] Create `knowledge-base` storage bucket (private, 20MB limit)
- [ ] Document all credentials securely

## Acceptance Criteria

- [ ] Project accessible via Supabase dashboard
- [ ] All 4 auth providers configured
- [ ] Storage buckets created with correct settings
- [ ] Credentials documented in password manager

## Dependencies

None (starting task)

## Reference

- [Phase 0 Doc - Task 0.1](./01-PHASE-0-FOUNDATION.md#task-01-supabase-project-setup)
```

---

### Issue #2: Implement Database Schema

```markdown
---
title: Implement Database Schema (13 Tables)
labels: phase-0, priority-high, type-infrastructure
assignees:
---

## Description

Create all database tables, enums, functions, triggers, and indexes as defined in the database schema document.

## Tasks

- [ ] Create enum types (9 enums)
- [ ] Create core tables: profiles, memberships, payments
- [ ] Create content tables: content, comments, likes
- [ ] Create chat/AI tables: knowledge_base, chat_conversations, chat_messages, escalations, daily_message_counts
- [ ] Create system tables: audit_logs, notification_logs
- [ ] Enable pgvector extension
- [ ] Create match_documents() function for RAG
- [ ] Create increment_daily_message_count() function
- [ ] Create update_content_counts() trigger
- [ ] Create handle_new_user() trigger for auto profile creation
- [ ] Create updated_at triggers for all relevant tables
- [ ] Add all necessary indexes

## Acceptance Criteria

- [ ] All 13 tables created with correct columns
- [ ] All foreign keys properly set up
- [ ] All triggers firing correctly
- [ ] All indexes created
- [ ] Profile auto-creates on user signup

## Dependencies

- #1 (Supabase project must exist)

## Reference

- [Phase 0 Doc - Task 0.2](./01-PHASE-0-FOUNDATION.md#task-02-database-schema-implementation)
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md)
```

---

### Issue #3: Implement RLS Policies

```markdown
---
title: Implement Row Level Security Policies
labels: phase-0, priority-high, type-infrastructure, area-auth
assignees:
---

## Description

Implement RLS policies on all tables to enforce role-based access control at the database level.

## Tasks

- [ ] Enable RLS on all 13 tables
- [ ] Implement profiles RLS (self-read, member directory, admin access)
- [ ] Implement memberships RLS (self-read, admin manage)
- [ ] Implement payments RLS (self-read, service role insert)
- [ ] Implement content RLS (public read published, editor CRUD)
- [ ] Implement comments RLS (public read, auth create, self edit/delete)
- [ ] Implement likes RLS (public read, auth toggle)
- [ ] Implement knowledge_base RLS (service role read, admin manage)
- [ ] Implement chat_conversations RLS (self-read/create)
- [ ] Implement chat_messages RLS (self-read, service insert)
- [ ] Implement escalations RLS (self-read, paid create, admin manage)
- [ ] Implement daily_message_counts RLS (self-read, service manage)
- [ ] Implement audit_logs RLS (admin read only)
- [ ] Implement notification_logs RLS (self-read, service manage)
- [ ] Test all policies with different user roles

## Acceptance Criteria

- [ ] RLS enabled on all tables
- [ ] Users cannot access other users' data
- [ ] Admins have appropriate elevated access
- [ ] Paid members can access directory
- [ ] Escalation requires paid membership

## Dependencies

- #2 (Tables must exist)

## Reference

- [Phase 0 Doc - Task 0.3](./01-PHASE-0-FOUNDATION.md#task-03-rls-policies-implementation)
- [DATABASE-SCHEMA.md - RLS Section](../DATABASE-SCHEMA.md#rls-policies)
```

---

### Issue #4: Setup CI/CD Pipeline

```markdown
---
title: Setup CI/CD Pipeline (GitHub Actions + EAS)
labels: phase-0, priority-high, type-infrastructure
assignees:
---

## Description

Configure continuous integration and deployment pipelines using GitHub Actions for PR checks and Vercel/EAS for deployments.

## Tasks

- [ ] Create `.github/workflows/pr-checks.yml` for linting, typecheck, tests
- [ ] Create `.github/workflows/deploy-web.yml` for Vercel deployment
- [ ] Create `.github/workflows/eas-build.yml` for mobile builds
- [ ] Configure `eas.json` with development, preview, and production profiles
- [ ] Set up GitHub repository secrets
- [ ] Configure Vercel project
- [ ] Configure EAS project
- [ ] Test PR workflow on a test branch
- [ ] Test deployment workflow

## Acceptance Criteria

- [ ] PR checks run automatically on every PR
- [ ] Lint, typecheck, and tests must pass to merge
- [ ] Web auto-deploys to Vercel on main push
- [ ] EAS builds can be triggered manually or on main push
- [ ] Build artifacts accessible in EAS dashboard

## Dependencies

- None (can run in parallel with #2, #3)

## Reference

- [Phase 0 Doc - Task 0.4](./01-PHASE-0-FOUNDATION.md#task-04-cicd-pipeline-setup)
- [CI-CD-IMPLEMENTATION-PLAN.md](../CI-CD-IMPLEMENTATION-PLAN.md)
```

---

### Issue #5: Setup Development Environment

```markdown
---
title: Setup Development Environment and Scripts
labels: phase-0, priority-medium, type-infrastructure
assignees:
---

## Description

Configure the development environment with all necessary scripts, environment variables, and TypeScript types.

## Tasks

- [ ] Create `.env.example` with all required variables
- [ ] Update `package.json` scripts (lint, format, typecheck, test, etc.)
- [ ] Generate TypeScript types from database (`supabase gen types`)
- [ ] Create `supabase/config.toml` for local development
- [ ] Document environment setup in README
- [ ] Verify all scripts work correctly

## Acceptance Criteria

- [ ] `npm run check` runs typecheck + lint + format:check
- [ ] `npm run test` runs unit tests
- [ ] TypeScript types match database schema
- [ ] Environment variables documented

## Dependencies

- #2 (Database schema for type generation)

## Reference

- [Phase 0 Doc - Task 0.5](./01-PHASE-0-FOUNDATION.md#task-05-development-environment-setup)
```

---

## Phase 1: Core Infrastructure (Issues #6-10)

### Issue #6: Implement Complete Authentication Flow

```markdown
---
title: Implement Complete Authentication Flow
labels: phase-1, priority-high, type-feature, area-auth
assignees:
---

## Description

Implement the complete authentication system including email/password, OAuth providers, email verification, and password reset.

## Tasks

- [ ] Update AuthContext with OAuth methods (Google, Facebook, Apple)
- [ ] Create OAuth configuration (`lib/oauth.ts`)
- [ ] Create auth callback handler (`app/(auth)/callback.tsx`)
- [ ] Update login screen with social login buttons
- [ ] Update signup screen with social signup
- [ ] Create email verification screen
- [ ] Create password reset screen
- [ ] Implement session refresh handling
- [ ] Add error messages for all auth scenarios
- [ ] Test on all platforms (Web, iOS, Android)

## Acceptance Criteria

- [ ] Email/password login working
- [ ] Google OAuth working on all platforms
- [ ] Facebook OAuth working on all platforms
- [ ] Apple OAuth working on iOS
- [ ] Email verification flow complete
- [ ] Password reset flow complete
- [ ] Session persists across app restarts

## Dependencies

- #1 (Auth providers configured)

## Reference

- [Phase 1 Doc - Task 1.1](./02-PHASE-1-CORE-INFRASTRUCTURE.md#task-11-authentication-implementation)
```

---

### Issue #7: Implement Profile Management

```markdown
---
title: Implement Profile Management
labels: phase-1, priority-high, type-feature, area-auth
assignees:
---

## Description

Implement profile viewing, editing, and avatar upload functionality.

## Tasks

- [ ] Create profile types (`types/profile.ts`)
- [ ] Create profile hooks (useProfile, useUpdateProfile, useUploadAvatar)
- [ ] Create profile view screen
- [ ] Create profile edit screen with all fields
- [ ] Create avatar picker component with camera/gallery
- [ ] Create profile completion flow for membership
- [ ] Implement image cropping
- [ ] Add validation for required fields
- [ ] Test avatar upload on all platforms

## Acceptance Criteria

- [ ] Profile displays current data correctly
- [ ] All fields editable and persist
- [ ] Avatar upload works from camera and gallery
- [ ] Profile completion blocks membership until required fields filled
- [ ] Phone number validation working

## Dependencies

- #6 (Auth must be working)

## Reference

- [Phase 1 Doc - Task 1.2](./02-PHASE-1-CORE-INFRASTRUCTURE.md#task-12-profile-management)
```

---

### Issue #8: Implement Bilingual System (i18n)

```markdown
---
title: Implement Bilingual System (English + Mizo)
labels: phase-1, priority-high, type-feature
assignees:
---

## Description

Implement internationalization support for English and Mizo languages using react-i18next.

## Tasks

- [ ] Setup i18n infrastructure (`lib/i18n.ts`)
- [ ] Create translation file structure (`locales/en/*.json`, `locales/lus/*.json`)
- [ ] Translate all common strings to Mizo
- [ ] Translate auth screens to Mizo
- [ ] Translate profile screens to Mizo
- [ ] Create language toggle component
- [ ] Create useAppTranslation hook with user preference sync
- [ ] Update all screens to use translation keys
- [ ] Persist language preference (AsyncStorage + profile)

## Acceptance Criteria

- [ ] System language detected on first launch
- [ ] Language toggle switches immediately
- [ ] Preference persists across sessions
- [ ] All user-facing strings use translations
- [ ] Mizo translations reviewed for accuracy

## Dependencies

- #6 (Auth for preference sync)

## Reference

- [Phase 1 Doc - Task 1.3](./02-PHASE-1-CORE-INFRASTRUCTURE.md#task-13-internationalization-i18n)
```

---

### Issue #9: Implement Design System Components

```markdown
---
title: Implement Design System Components
labels: phase-1, priority-high, type-feature
assignees:
---

## Description

Implement all 19 design system components with Storybook documentation.

## Tasks

- [ ] Setup Storybook for React Native
- [ ] Create/verify typography components (Text, Heading, Label, Caption)
- [ ] Create/verify layout components (Stack, Spacer, Divider, Container)
- [ ] Create input components (TextArea, Checkbox, Switch, DatePicker, Select, SearchInput)
- [ ] Create display components (ContentCard, EventCard, MemberCard, StatsCard, PricingCard)
- [ ] Create feedback components (Toast, Modal, Alert, Skeleton, EmptyState, OfflineBanner)
- [ ] Create navigation components (TabBar, Breadcrumb)
- [ ] Create pattern components (CommentThread, ChatBubble, ChatInput, DataTable, Pagination, RichTextEditor)
- [ ] Create ToastContext for global toast management
- [ ] Write Storybook stories for all components
- [ ] Add accessibility labels to all components

## Acceptance Criteria

- [ ] All 19 components implemented
- [ ] Storybook running with all stories
- [ ] Components responsive across breakpoints
- [ ] Dark/light mode support
- [ ] Accessibility labels present

## Dependencies

- None (can start early in Phase 1)

## Reference

- [Phase 1 Doc - Task 1.4](./02-PHASE-1-CORE-INFRASTRUCTURE.md#task-14-design-system-components)
- [DESIGN-SYSTEM-IMPLEMENTATION.md](../DESIGN-SYSTEM-IMPLEMENTATION.md)
```

---

### Issue #10: Implement Navigation Architecture

```markdown
---
title: Implement Navigation Architecture
labels: phase-1, priority-high, type-feature
assignees:
---

## Description

Implement the complete navigation structure with route groups for public, auth, app, and admin sections.

## Tasks

- [ ] Create public route group (`/(public)/`) with layout
- [ ] Create auth route group (`/(auth)/`) with layout
- [ ] Create app route group (`/(app)/`) with auth guard
- [ ] Create admin route group (`/(admin)/`) with role guard
- [ ] Create navigation hooks (useRouteGuard, useNavigationState, useBreadcrumbs)
- [ ] Update root layout with all providers
- [ ] Implement deep link handling
- [ ] Test navigation on all platforms

## Acceptance Criteria

- [ ] Public routes accessible without auth
- [ ] App routes redirect to login if not authenticated
- [ ] Admin routes redirect if not admin/editor
- [ ] Deep links work on all platforms
- [ ] Navigation consistent across platforms

## Dependencies

- #6 (Auth for route guards)

## Reference

- [Phase 1 Doc - Task 1.5](./02-PHASE-1-CORE-INFRASTRUCTURE.md#task-15-navigation-architecture)
```

---

## Phase 2: Public Features (Issues #11-22)

### Issue #11: Implement Content Data Layer

```markdown
---
title: Implement Content Data Layer
labels: phase-2, priority-high, type-feature, area-content
assignees:
---

## Description

Create the content data layer with types, hooks, and API client for fetching and managing content.

## Tasks

- [ ] Create content types (`types/content.ts`)
- [ ] Create useContentList hook with pagination
- [ ] Create useContentBySlug hook
- [ ] Create useFeaturedContent hook
- [ ] Create useRelatedContent hook
- [ ] Create useIncrementViews hook
- [ ] Create content API client (`lib/api/content.ts`)
- [ ] Implement caching with react-query

## Acceptance Criteria

- [ ] List pagination working
- [ ] Single content fetch by slug
- [ ] View count increments
- [ ] Caching reduces API calls

## Dependencies

- #2 (Content table must exist)

## Reference

- [Phase 2 Doc - Task 2.1](./03-PHASE-2-PUBLIC-FEATURES.md#task-21-content-data-layer)
```

---

### Issue #12: Implement News Feature

```markdown
---
title: Implement News Feature
labels: phase-2, priority-high, type-feature, area-content
assignees:
---

## Description

Implement the news listing and detail screens with comments and likes.

## Tasks

- [ ] Create news list screen with hero card
- [ ] Create news detail screen
- [ ] Create markdown renderer component
- [ ] Implement infinite scroll/pagination
- [ ] Implement pull to refresh
- [ ] Add comments section
- [ ] Add like functionality
- [ ] Add share functionality
- [ ] Add related news section

## Acceptance Criteria

- [ ] News list displays with featured hero
- [ ] Grid responsive across breakpoints
- [ ] Detail page renders markdown correctly
- [ ] Comments and likes working
- [ ] Share opens native share sheet

## Dependencies

- #11 (Content data layer)
- #9 (Design system components)

## Reference

- [Phase 2 Doc - Task 2.2](./03-PHASE-2-PUBLIC-FEATURES.md#task-22-news-feature)
```

---

### Issue #13: Implement Events Feature

```markdown
---
title: Implement Events Feature
labels: phase-2, priority-high, type-feature, area-content
assignees:
---

## Description

Implement events listing and detail with date badges and calendar integration.

## Tasks

- [ ] Create events list screen
- [ ] Create event detail screen
- [ ] Create DateBadge component
- [ ] Implement upcoming/past filter
- [ ] Add "Add to Calendar" functionality
- [ ] Add location with map link
- [ ] Add event countdown for upcoming events

## Acceptance Criteria

- [ ] Events sorted by date
- [ ] Date badges display correctly
- [ ] Add to calendar works on iOS/Android
- [ ] Location links to maps
- [ ] Past events show differently

## Dependencies

- #11 (Content data layer)

## Reference

- [Phase 2 Doc - Task 2.3](./03-PHASE-2-PUBLIC-FEATURES.md#task-23-events-feature)
```

---

### Issue #14: Implement Articles Feature

```markdown
---
title: Implement Articles Feature
labels: phase-2, priority-medium, type-feature, area-content
assignees:
---

## Description

Implement articles listing and detail with reading time and category filtering.

## Tasks

- [ ] Create articles list screen
- [ ] Create article detail screen
- [ ] Implement reading time calculator
- [ ] Add category/topic filtering
- [ ] Add scroll progress indicator
- [ ] Add "Continue reading" suggestions

## Acceptance Criteria

- [ ] Articles display with excerpts
- [ ] Reading time calculated correctly
- [ ] Category filter works
- [ ] Progress indicator on detail page

## Dependencies

- #11 (Content data layer)

## Reference

- [Phase 2 Doc - Task 2.4](./03-PHASE-2-PUBLIC-FEATURES.md#task-24-articles-feature)
```

---

### Issue #15: Implement Photo Gallery

```markdown
---
title: Implement Photo Gallery
labels: phase-2, priority-medium, type-feature, area-content
assignees:
---

## Description

Implement photo gallery with lightbox viewing and album organization.

## Tasks

- [ ] Create gallery screen with grid layout
- [ ] Create lightbox component
- [ ] Implement album organization
- [ ] Add pinch-to-zoom
- [ ] Add swipe navigation
- [ ] Add download option
- [ ] Add share option
- [ ] Create album detail screen

## Acceptance Criteria

- [ ] Grid displays images in masonry layout
- [ ] Lightbox opens on tap
- [ ] Zoom and swipe work smoothly
- [ ] Share functionality works
- [ ] Albums organize photos correctly

## Dependencies

- #11 (Content data layer)

## Reference

- [Phase 2 Doc - Task 2.5](./03-PHASE-2-PUBLIC-FEATURES.md#task-25-gallery-feature)
```

---

### Issue #16: Implement About Pages

```markdown
---
title: Implement About Pages
labels: phase-2, priority-medium, type-feature, area-content
assignees:
---

## Description

Implement About, History, and Leadership pages.

## Tasks

- [ ] Create About page with mission/vision
- [ ] Create History page with timeline
- [ ] Create Timeline component
- [ ] Create Leadership page
- [ ] Add leadership team cards
- [ ] Add contact information
- [ ] Add social media links
- [ ] Ensure bilingual content displays

## Acceptance Criteria

- [ ] All about pages render correctly
- [ ] Timeline visualizes history
- [ ] Leadership ordered correctly
- [ ] Bilingual content works

## Dependencies

- #11 (Content data layer for leadership)

## Reference

- [Phase 2 Doc - Task 2.6](./03-PHASE-2-PUBLIC-FEATURES.md#task-26-about-pages)
```

---

### Issue #17: Implement Newsletter Archive

```markdown
---
title: Implement Newsletter Archive
labels: phase-2, priority-low, type-feature, area-content
assignees:
---

## Description

Implement newsletter archive with PDF download functionality.

## Tasks

- [ ] Create newsletter list screen
- [ ] Add newsletter subscription form (future)
- [ ] Implement PDF download links
- [ ] Add newsletter thumbnails

## Acceptance Criteria

- [ ] Newsletter list displays
- [ ] PDF downloads work
- [ ] Thumbnails display correctly

## Dependencies

- #11 (Content data layer)

## Reference

- [Phase 2 Doc - Task 2.7](./03-PHASE-2-PUBLIC-FEATURES.md#task-27-newsletter-archive)
```

---

### Issue #18: Implement Comments and Likes

```markdown
---
title: Implement Comments and Likes System
labels: phase-2, priority-high, type-feature, area-content
assignees:
---

## Description

Implement the comments system with replies and the likes system.

## Tasks

- [ ] Create comment types and hooks
- [ ] Create CommentsSection component
- [ ] Implement comment CRUD
- [ ] Implement reply functionality (1 level nesting)
- [ ] Create LikeButton component
- [ ] Implement like toggle with optimistic updates
- [ ] Add authentication prompts for guests

## Acceptance Criteria

- [ ] Comments load and display
- [ ] Authenticated users can add comments
- [ ] Replies nest correctly
- [ ] Users can edit/delete own comments
- [ ] Like updates count immediately
- [ ] Likes persist to database

## Dependencies

- #6 (Auth for authenticated features)
- #11 (Content data layer)

## Reference

- [Phase 2 Doc - Task 2.8](./03-PHASE-2-PUBLIC-FEATURES.md#task-28-comments--likes-system)
```

---

### Issue #19: Implement Home Page

```markdown
---
title: Implement Public Home Page
labels: phase-2, priority-high, type-feature, area-content
assignees:
---

## Description

Implement the public home page with all content sections.

## Tasks

- [ ] Create home page with hero section
- [ ] Add latest news section
- [ ] Add upcoming events section
- [ ] Add featured articles section
- [ ] Add photo gallery preview
- [ ] Add about BMA summary
- [ ] Create footer component
- [ ] Ensure responsive layout

## Acceptance Criteria

- [ ] All sections load correctly
- [ ] Responsive across breakpoints
- [ ] Links navigate correctly
- [ ] Bilingual content displays

## Dependencies

- #11, #12, #13, #14, #15 (Content features)

## Reference

- [Phase 2 Doc - Task 2.9](./03-PHASE-2-PUBLIC-FEATURES.md#task-29-home-page)
```

---

### Issue #20: Implement SEO and Meta Tags

```markdown
---
title: Implement SEO and Meta Tags
labels: phase-2, priority-medium, type-feature
assignees:
---

## Description

Implement SEO meta tags for all public pages.

## Tasks

- [ ] Create SEO component using expo-router Head
- [ ] Add meta tags to all public pages
- [ ] Implement Open Graph tags
- [ ] Implement Twitter Card tags
- [ ] Add dynamic meta for content pages

## Acceptance Criteria

- [ ] All public pages have meta tags
- [ ] Open Graph preview works
- [ ] Twitter card preview works
- [ ] Dynamic content has correct meta

## Dependencies

- #19 (Public pages exist)

## Reference

- [Phase 2 Doc - Task 2.10](./03-PHASE-2-PUBLIC-FEATURES.md#task-210-seo--meta-tags)
```

---

### Issue #21: Implement Image Optimization

```markdown
---
title: Implement Image Optimization
labels: phase-2, priority-medium, type-feature
assignees:
---

## Description

Implement image optimization with Supabase transforms and lazy loading.

## Tasks

- [ ] Create OptimizedImage component
- [ ] Configure Supabase image transforms
- [ ] Implement responsive image sizes
- [ ] Add blur placeholders
- [ ] Implement lazy loading

## Acceptance Criteria

- [ ] Images load with correct sizes
- [ ] Blur placeholder works
- [ ] WebP format used when supported
- [ ] Off-screen images lazy load

## Dependencies

- #1 (Storage buckets configured)

## Reference

- [Phase 2 Doc - Task 2.11](./03-PHASE-2-PUBLIC-FEATURES.md#task-211-image-optimization)
```

---

### Issue #22: Implement Offline-Lite Caching

```markdown
---
title: Implement Offline-Lite Caching
labels: phase-2, priority-medium, type-feature
assignees:
---

## Description

Implement offline-lite caching with stale-while-revalidate pattern.

## Tasks

- [ ] Setup QueryClient with caching
- [ ] Configure AsyncStorage persister
- [ ] Create NetworkContext for status detection
- [ ] Create OfflineBanner component
- [ ] Configure cache TTLs per query type

## Acceptance Criteria

- [ ] Cache persists across restarts
- [ ] Offline banner shows when disconnected
- [ ] Cached content accessible offline
- [ ] Stale data shows with indicator

## Dependencies

- #11 (Data layer using react-query)

## Reference

- [Phase 2 Doc - Task 2.12](./03-PHASE-2-PUBLIC-FEATURES.md#task-212-offline-lite-foundation)
```

---

## Phase 3: Membership & Payments (Issues #23-28)

### Issue #23: Implement Membership Data Layer

```markdown
---
title: Implement Membership Data Layer
labels: phase-3, priority-high, type-feature, area-payment
assignees:
---

## Description

Create the membership data layer with types, constants, and hooks.

## Tasks

- [ ] Create membership types
- [ ] Define MEMBERSHIP_TIERS constants with pricing
- [ ] Create useMembership hook
- [ ] Create usePaymentHistory hook
- [ ] Create useIsPaidMember hook
- [ ] Create useMembershipExpiry hook

## Acceptance Criteria

- [ ] Membership status fetches correctly
- [ ] Payment history paginates
- [ ] Paid member check works
- [ ] Expiry calculations accurate

## Dependencies

- #2 (Membership/payment tables)

## Reference

- [Phase 3 Doc - Task 3.1](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md#task-31-membership-data-layer)
```

---

### Issue #24: Implement Razorpay Payment Integration

```markdown
---
title: Implement Razorpay Payment Integration
labels: phase-3, priority-high, type-feature, area-payment
assignees:
---

## Description

Implement Razorpay payment integration with secure webhook verification.

## Tasks

- [ ] Create create-payment-order Edge Function
- [ ] Create razorpay-webhook Edge Function with HMAC verification
- [ ] Implement payment client hook
- [ ] Implement Razorpay checkout opening
- [ ] Implement payment status polling
- [ ] Handle idempotency for duplicate prevention
- [ ] Test with Razorpay test mode

## Acceptance Criteria

- [ ] Order creation works
- [ ] Checkout opens on all platforms
- [ ] Webhook verifies HMAC signature
- [ ] Membership activates on payment capture
- [ ] User role updates to 'member'
- [ ] Failed payments logged correctly

## Dependencies

- #23 (Membership data layer)

## Reference

- [Phase 3 Doc - Task 3.2](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md#task-32-razorpay-integration)
```

---

### Issue #25: Implement Membership UI

```markdown
---
title: Implement Membership UI
labels: phase-3, priority-high, type-feature, area-payment
assignees:
---

## Description

Implement membership status, upgrade flow, and confirmation screens.

## Tasks

- [ ] Create membership status screen
- [ ] Create upgrade flow screen with pricing cards
- [ ] Create PricingCard component
- [ ] Create payment confirmation screen (processing/success/failed)
- [ ] Implement upgrade button logic
- [ ] Add profile completion gate for payment

## Acceptance Criteria

- [ ] Status displays correctly
- [ ] Expiry countdown accurate
- [ ] Upgrade button shows for eligible users
- [ ] Pricing cards display correctly
- [ ] Confirmation shows receipt info

## Dependencies

- #24 (Payment integration)

## Reference

- [Phase 3 Doc - Task 3.3](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md#task-33-membership-ui)
```

---

### Issue #26: Implement Payment History

```markdown
---
title: Implement Payment History and Receipts
labels: phase-3, priority-medium, type-feature, area-payment
assignees:
---

## Description

Implement payment history display and receipt download.

## Tasks

- [ ] Create payment history screen
- [ ] Display payment status badges
- [ ] Implement receipt download/generation
- [ ] Add pagination for long history

## Acceptance Criteria

- [ ] Payment history displays
- [ ] Status badges correct
- [ ] Receipt downloads work
- [ ] Pagination works

## Dependencies

- #24 (Payment records exist)

## Reference

- [Phase 3 Doc - Task 3.4](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md#task-34-payment-history)
```

---

### Issue #27: Implement Member Directory

```markdown
---
title: Implement Member Directory
labels: phase-3, priority-medium, type-feature, area-payment
assignees:
---

## Description

Implement the member directory accessible only to paid members.

## Tasks

- [ ] Create directory screen with access control
- [ ] Create directory hook with paid member check
- [ ] Create MemberCard component
- [ ] Implement search by name
- [ ] Implement filter by city
- [ ] Add pagination
- [ ] Show upgrade prompt for free users

## Acceptance Criteria

- [ ] Only paid members can access
- [ ] Search works
- [ ] City filter works
- [ ] Hidden members not shown
- [ ] Pagination works

## Dependencies

- #24 (Membership status check)

## Reference

- [Phase 3 Doc - Task 3.5](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md#task-35-member-directory)
```

---

### Issue #28: Implement Notification System

```markdown
---
title: Implement Notification System (Email + WhatsApp)
labels: phase-3, priority-high, type-feature
assignees:
---

## Description

Implement the notification system for membership events via email and WhatsApp.

## Tasks

- [ ] Create send-notification Edge Function
- [ ] Implement Resend email integration
- [ ] Implement Gupshup WhatsApp integration
- [ ] Create notification templates (membership_activated, membership_expiring, etc.)
- [ ] Create membership-expiry cron function
- [ ] Setup Supabase cron job
- [ ] Support bilingual templates

## Acceptance Criteria

- [ ] Email notifications send
- [ ] WhatsApp notifications send
- [ ] Templates support EN + Mizo
- [ ] Notification logs stored
- [ ] Expiry reminders sent at 7 days

## Dependencies

- #24 (Payment triggers notifications)

## Reference

- [Phase 3 Doc - Task 3.6](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md#task-36-notifications-system)
```

---

## Phase 4: AI Chatbot (Issues #29-34)

### Issue #29: Implement Knowledge Base System

```markdown
---
title: Implement Knowledge Base System
labels: phase-4, priority-high, type-feature, area-chatbot
assignees:
---

## Description

Implement the knowledge base management with vector embeddings.

## Tasks

- [ ] Create KB types
- [ ] Create embedding generation function (Gemini)
- [ ] Create admin KB Edge Function (CRUD)
- [ ] Implement embedding regeneration on update
- [ ] Add admin-only access control

## Acceptance Criteria

- [ ] KB items can be created with embeddings
- [ ] Embeddings regenerate on content update
- [ ] Admin-only access enforced
- [ ] Audit logs created

## Dependencies

- #2 (knowledge_base table with pgvector)

## Reference

- [Phase 4 Doc - Task 4.1](./05-PHASE-4-CHATBOT.md#task-41-knowledge-base-system)
```

---

### Issue #30: Implement Chat Edge Functions

```markdown
---
title: Implement Chat Edge Functions
labels: phase-4, priority-high, type-feature, area-chatbot
assignees:
---

## Description

Implement the core chat Edge Functions for starting conversations, rate limiting, and message handling.

## Tasks

- [ ] Create chat/start Edge Function
- [ ] Create chat/rate-limit Edge Function
- [ ] Create chat/message Edge Function with RAG
- [ ] Implement vector search (match_documents)
- [ ] Implement Gemini response generation
- [ ] Implement message classification
- [ ] Implement rate limiting enforcement

## Acceptance Criteria

- [ ] Conversation starts correctly
- [ ] Rate limiting enforced (5/30)
- [ ] RAG retrieval returns relevant docs
- [ ] Responses are bilingual
- [ ] Classification works
- [ ] Sources returned

## Dependencies

- #29 (Knowledge base for RAG)

## Reference

- [Phase 4 Doc - Task 4.2](./05-PHASE-4-CHATBOT.md#task-42-chat-edge-functions)
```

---

### Issue #31: Implement Escalation System

```markdown
---
title: Implement Escalation System
labels: phase-4, priority-high, type-feature, area-chatbot
assignees:
---

## Description

Implement the escalation system for human support requests.

## Tasks

- [ ] Create chat/escalate Edge Function
- [ ] Create escalation types and hooks
- [ ] Implement paid member check
- [ ] Add system message to conversation
- [ ] Notify admins of new escalations
- [ ] Prevent duplicate escalations

## Acceptance Criteria

- [ ] Paid members can escalate
- [ ] Free members see upgrade prompt
- [ ] Existing escalation prevented
- [ ] Admins notified
- [ ] Audit trail created

## Dependencies

- #30 (Chat system for conversations)

## Reference

- [Phase 4 Doc - Task 4.3](./05-PHASE-4-CHATBOT.md#task-43-escalation-system)
```

---

### Issue #32: Implement Chat UI

```markdown
---
title: Implement Chat UI
labels: phase-4, priority-high, type-feature, area-chatbot
assignees:
---

## Description

Implement the chat user interface screens and components.

## Tasks

- [ ] Create chat list screen
- [ ] Create chat conversation screen
- [ ] Create ChatBubble component
- [ ] Create ChatInput component
- [ ] Create ChatDisclaimer component
- [ ] Add typing indicator
- [ ] Add source references display
- [ ] Add classification badge
- [ ] Add escalation button for paid/urgent

## Acceptance Criteria

- [ ] Messages display correctly
- [ ] Typing indicator works
- [ ] Sources shown as links
- [ ] Disclaimer displayed
- [ ] Escalation button visible when appropriate

## Dependencies

- #30, #31 (Chat backend)

## Reference

- [Phase 4 Doc - Task 4.4](./05-PHASE-4-CHATBOT.md#task-44-chat-ui-components)
```

---

### Issue #33: Implement Chat State Management

```markdown
---
title: Implement Chat State Management
labels: phase-4, priority-medium, type-feature, area-chatbot
assignees:
---

## Description

Implement chat hooks and state management.

## Tasks

- [ ] Create useConversations hook
- [ ] Create useMessages hook
- [ ] Create useStartConversation mutation
- [ ] Create useSendMessage mutation
- [ ] Create useRateLimit hook
- [ ] Implement optimistic updates

## Acceptance Criteria

- [ ] Conversations list fetches
- [ ] Messages load for conversation
- [ ] Send updates optimistically
- [ ] Rate limit refreshes

## Dependencies

- #30 (Chat Edge Functions)

## Reference

- [Phase 4 Doc - Task 4.5](./05-PHASE-4-CHATBOT.md#task-45-chat-hooks-and-state)
```

---

### Issue #34: Seed Initial Knowledge Base

```markdown
---
title: Seed Initial Knowledge Base
labels: phase-4, priority-medium, type-feature, area-chatbot
assignees:
---

## Description

Create and seed the initial knowledge base content.

## Tasks

- [ ] Create KB seed script
- [ ] Write membership-related KB items
- [ ] Write events-related KB items
- [ ] Write contact information items
- [ ] Write community guidelines items
- [ ] Write FAQ items
- [ ] Run seed script
- [ ] Verify embeddings generated

## Acceptance Criteria

- [ ] All categories seeded
- [ ] Embeddings generated correctly
- [ ] RAG returns relevant results

## Dependencies

- #29 (KB system working)

## Reference

- [Phase 4 Doc - Task 4.6](./05-PHASE-4-CHATBOT.md#task-46-knowledge-base-seeding)
```

---

## Phase 5: Admin Dashboard (Issues #35-43)

### Issue #35: Implement Admin Layout

```markdown
---
title: Implement Admin Layout and Navigation
labels: phase-5, priority-high, type-feature, area-admin
assignees:
---

## Description

Implement the admin layout with sidebar navigation and role-based access.

## Tasks

- [ ] Create admin layout with role guard
- [ ] Create AdminSidebar component
- [ ] Create AdminHeader component with breadcrumbs
- [ ] Implement role-based nav item visibility
- [ ] Add "Back to App" link

## Acceptance Criteria

- [ ] Sidebar shows role-appropriate items
- [ ] Editor cannot see admin-only routes
- [ ] Mobile shows hamburger menu
- [ ] Breadcrumbs work correctly

## Dependencies

- #10 (Navigation architecture)

## Reference

- [Phase 5 Doc - Task 5.1](./06-PHASE-5-ADMIN-DASHBOARD.md#task-51-admin-layout-and-navigation)
```

---

### Issue #36: Implement Admin Dashboard

```markdown
---
title: Implement Admin Dashboard
labels: phase-5, priority-high, type-feature, area-admin
assignees:
---

## Description

Implement the admin dashboard with key metrics and quick actions.

## Tasks

- [ ] Create admin/stats Edge Function
- [ ] Create dashboard screen
- [ ] Create StatsCard displays
- [ ] Add quick actions
- [ ] Add pending items count
- [ ] Add recent activity feed

## Acceptance Criteria

- [ ] Stats cards display correctly
- [ ] Quick actions work
- [ ] Pending items show counts
- [ ] Activity feed updates

## Dependencies

- #35 (Admin layout)

## Reference

- [Phase 5 Doc - Task 5.2](./06-PHASE-5-ADMIN-DASHBOARD.md#task-52-admin-dashboard)
```

---

### Issue #37: Implement User Management

```markdown
---
title: Implement User Management
labels: phase-5, priority-high, type-feature, area-admin
assignees:
---

## Description

Implement user listing, detail view, and role management.

## Tasks

- [ ] Create users list screen with DataTable
- [ ] Create user detail screen
- [ ] Create role update Edge Function
- [ ] Implement search and filters
- [ ] Add pagination
- [ ] Add user activity section
- [ ] Prevent self-demotion

## Acceptance Criteria

- [ ] User list loads with pagination
- [ ] Search and filters work
- [ ] Role update works
- [ ] Cannot demote self
- [ ] Audit trail created

## Dependencies

- #35 (Admin layout)

## Reference

- [Phase 5 Doc - Task 5.3](./06-PHASE-5-ADMIN-DASHBOARD.md#task-53-user-management)
```

---

### Issue #38: Implement Content Management

```markdown
---
title: Implement Content Management
labels: phase-5, priority-high, type-feature, area-admin, area-content
assignees:
---

## Description

Implement content CRUD with bilingual rich text editor.

## Tasks

- [ ] Create content list screen
- [ ] Create content editor screen (new + edit)
- [ ] Create RichTextEditor component
- [ ] Implement bilingual editing tabs
- [ ] Implement slug auto-generation
- [ ] Implement image upload
- [ ] Implement scheduling
- [ ] Add event-specific fields

## Acceptance Criteria

- [ ] Content list shows all statuses
- [ ] Editor loads existing content
- [ ] Bilingual editing works
- [ ] Rich text formatting works
- [ ] Image upload works
- [ ] Scheduling works

## Dependencies

- #35 (Admin layout)
- #11 (Content data layer)

## Reference

- [Phase 5 Doc - Task 5.4](./06-PHASE-5-ADMIN-DASHBOARD.md#task-54-content-management)
```

---

### Issue #39: Implement Membership Management

```markdown
---
title: Implement Membership Management
labels: phase-5, priority-medium, type-feature, area-admin, area-payment
assignees:
---

## Description

Implement membership override capabilities for admins.

## Tasks

- [ ] Create membership management screen
- [ ] Create override Edge Function
- [ ] Implement manual activation
- [ ] Implement expiry extension
- [ ] Implement cancellation
- [ ] Add reason field for audit

## Acceptance Criteria

- [ ] Manual activation works
- [ ] Extension works
- [ ] Cancellation works
- [ ] Audit trail created
- [ ] User notified

## Dependencies

- #23 (Membership data layer)

## Reference

- [Phase 5 Doc - Task 5.5](./06-PHASE-5-ADMIN-DASHBOARD.md#task-55-membership-management)
```

---

### Issue #40: Implement Escalation Management

```markdown
---
title: Implement Escalation Management
labels: phase-5, priority-high, type-feature, area-admin, area-chatbot
assignees:
---

## Description

Implement the escalation queue and resolution workflow.

## Tasks

- [ ] Create escalation queue screen
- [ ] Create EscalationModal component
- [ ] Create resolve Edge Function
- [ ] Implement acknowledge action
- [ ] Implement resolve/dismiss actions
- [ ] Add resolution notes
- [ ] Notify user of resolution

## Acceptance Criteria

- [ ] Escalation list shows with status
- [ ] Conversation viewable
- [ ] Acknowledge updates status
- [ ] Resolution saves notes
- [ ] User notified
- [ ] Audit trail created

## Dependencies

- #31 (Escalation system)

## Reference

- [Phase 5 Doc - Task 5.6](./06-PHASE-5-ADMIN-DASHBOARD.md#task-56-escalation-management)
```

---

### Issue #41: Implement KB Management UI

```markdown
---
title: Implement Knowledge Base Management UI
labels: phase-5, priority-medium, type-feature, area-admin, area-chatbot
assignees:
---

## Description

Implement the knowledge base management interface.

## Tasks

- [ ] Create KB list screen
- [ ] Create KB editor screen
- [ ] Implement bilingual editing
- [ ] Implement category filter
- [ ] Implement search
- [ ] Add active toggle

## Acceptance Criteria

- [ ] KB list displays
- [ ] Editor loads items
- [ ] Bilingual editing works
- [ ] Save regenerates embedding
- [ ] Delete soft-deletes

## Dependencies

- #29 (KB system)

## Reference

- [Phase 5 Doc - Task 5.7](./06-PHASE-5-ADMIN-DASHBOARD.md#task-57-knowledge-base-management)
```

---

### Issue #42: Implement Audit Log Viewer

```markdown
---
title: Implement Audit Log Viewer
labels: phase-5, priority-low, type-feature, area-admin
assignees:
---

## Description

Implement the audit log viewer for security monitoring.

## Tasks

- [ ] Create audit logs screen
- [ ] Implement date range filter
- [ ] Implement actor filter
- [ ] Implement action type filter
- [ ] Implement table filter
- [ ] Add expandable details (diff view)
- [ ] Add pagination

## Acceptance Criteria

- [ ] Logs load with pagination
- [ ] Filters work correctly
- [ ] Details show diff
- [ ] Export to CSV works (optional)

## Dependencies

- #35 (Admin layout)

## Reference

- [Phase 5 Doc - Task 5.8](./06-PHASE-5-ADMIN-DASHBOARD.md#task-58-audit-log-viewer)
```

---

### Issue #43: Implement Analytics Dashboard

```markdown
---
title: Implement Analytics Dashboard
labels: phase-5, priority-medium, type-feature, area-admin
assignees:
---

## Description

Implement the analytics dashboard with charts and metrics.

## Tasks

- [ ] Create analytics screen
- [ ] Create analytics hooks
- [ ] Implement user growth chart (line)
- [ ] Implement revenue chart (bar)
- [ ] Implement membership breakdown (pie)
- [ ] Add date range selector
- [ ] Add content engagement metrics

## Acceptance Criteria

- [ ] Charts render correctly
- [ ] Data accurate
- [ ] Date range selectable
- [ ] Responsive on all screens

## Dependencies

- #35 (Admin layout)

## Reference

- [Phase 5 Doc - Task 5.9](./06-PHASE-5-ADMIN-DASHBOARD.md#task-59-analytics-dashboard)
```

---

## Phase 6: Polish & Launch (Issues #44-51)

### Issue #44: Complete Test Coverage

```markdown
---
title: Complete Test Coverage
labels: phase-6, priority-high, type-testing
assignees:
---

## Description

Achieve comprehensive test coverage across all test types.

## Tasks

- [ ] Write remaining unit tests (target 80%+)
- [ ] Write integration tests for key flows
- [ ] Write E2E tests for web (Playwright)
- [ ] Write E2E tests for mobile (Maestro)
- [ ] Achieve 95%+ coverage on critical paths
- [ ] Fix any failing tests

## Acceptance Criteria

- [ ] Unit test coverage > 80%
- [ ] Critical path coverage > 95%
- [ ] All tests passing

## Dependencies

- All features implemented (Phases 0-5)

## Reference

- [Phase 6 Doc - Task 6.1](./07-PHASE-6-POLISH-LAUNCH.md#task-61-comprehensive-testing)
```

---

### Issue #45: Optimize Performance

```markdown
---
title: Optimize Performance
labels: phase-6, priority-high, type-feature
assignees:
---

## Description

Optimize app performance to meet launch targets.

## Tasks

- [ ] Analyze and reduce bundle size
- [ ] Optimize image loading
- [ ] Optimize database queries
- [ ] Implement list virtualization
- [ ] Memoize expensive components
- [ ] Run Lighthouse audit
- [ ] Fix performance issues

## Acceptance Criteria

- [ ] Initial load < 3 seconds
- [ ] Interaction response < 100ms
- [ ] Bundle size < 1MB gzipped
- [ ] Lighthouse score > 90

## Dependencies

- All features implemented

## Reference

- [Phase 6 Doc - Task 6.2](./07-PHASE-6-POLISH-LAUNCH.md#task-62-performance-optimization)
```

---

### Issue #46: Complete Accessibility Audit

```markdown
---
title: Complete Accessibility Audit
labels: phase-6, priority-medium, type-testing
assignees:
---

## Description

Complete accessibility audit and fix issues.

## Tasks

- [ ] Test with screen reader
- [ ] Test keyboard navigation
- [ ] Check color contrast
- [ ] Add missing accessibility labels
- [ ] Fix focus management
- [ ] Add skip links

## Acceptance Criteria

- [ ] All images have alt text
- [ ] All interactive elements accessible
- [ ] Color contrast WCAG AA
- [ ] Focus order logical

## Dependencies

- All features implemented

## Reference

- [Phase 6 Doc - Task 6.3](./07-PHASE-6-POLISH-LAUNCH.md#task-63-accessibility-audit)
```

---

### Issue #47: Security Review and Hardening

```markdown
---
title: Security Review and Hardening
labels: phase-6, priority-high, type-testing
assignees:
---

## Description

Complete security review and fix vulnerabilities.

## Tasks

- [ ] Verify all RLS policies
- [ ] Test auth security
- [ ] Validate input sanitization
- [ ] Check for sensitive data exposure
- [ ] Verify rate limiting
- [ ] Test webhook signature verification
- [ ] Run security scanning

## Acceptance Criteria

- [ ] RLS verified on all tables
- [ ] No sensitive data in client
- [ ] Rate limiting enforced
- [ ] Webhook verification working

## Dependencies

- All features implemented

## Reference

- [Phase 6 Doc - Task 6.4](./07-PHASE-6-POLISH-LAUNCH.md#task-64-security-hardening)
```

---

### Issue #48: Deploy Web to Production

```markdown
---
title: Deploy Web to Production
labels: phase-6, priority-high, type-infrastructure
assignees:
---

## Description

Deploy the web application to production on Vercel.

## Tasks

- [ ] Configure vercel.json
- [ ] Set environment variables
- [ ] Configure custom domain
- [ ] Enable SSL
- [ ] Deploy to production
- [ ] Verify all features
- [ ] Test payment flow (live)

## Acceptance Criteria

- [ ] Web app accessible at production URL
- [ ] SSL certificate valid
- [ ] All features working
- [ ] Payment flow working in live mode

## Dependencies

- #44, #45, #46, #47 (Testing and optimization)

## Reference

- [Phase 6 Doc - Task 6.5](./07-PHASE-6-POLISH-LAUNCH.md#task-65-web-deployment)
```

---

### Issue #49: Deploy iOS to App Store

```markdown
---
title: Deploy iOS to App Store
labels: phase-6, priority-high, type-infrastructure
assignees:
---

## Description

Build and submit iOS app to the App Store.

## Tasks

- [ ] Setup App Store Connect app record
- [ ] Configure EAS submit for iOS
- [ ] Prepare screenshots and metadata
- [ ] Build production iOS binary
- [ ] Submit to App Store
- [ ] Prepare demo account for review
- [ ] Respond to review feedback

## Acceptance Criteria

- [ ] Build successful
- [ ] App submitted to App Store
- [ ] Review approved
- [ ] App published

## Dependencies

- #48 (Web deployed first)

## Reference

- [Phase 6 Doc - Task 6.6](./07-PHASE-6-POLISH-LAUNCH.md#task-66-ios-deployment)
- [IOS-DEPLOYMENT.md](../IOS-DEPLOYMENT.md)
```

---

### Issue #50: Deploy Android to Play Store

```markdown
---
title: Deploy Android to Play Store
labels: phase-6, priority-high, type-infrastructure
assignees:
---

## Description

Build and submit Android app to the Play Store.

## Tasks

- [ ] Setup Play Console app record
- [ ] Configure EAS submit for Android
- [ ] Prepare screenshots and metadata
- [ ] Build production Android binary (AAB)
- [ ] Submit to internal testing track
- [ ] Test with internal testers
- [ ] Promote to production

## Acceptance Criteria

- [ ] Build successful
- [ ] App submitted to Play Console
- [ ] Review approved
- [ ] App published to production

## Dependencies

- #48 (Web deployed first)

## Reference

- [Phase 6 Doc - Task 6.7](./07-PHASE-6-POLISH-LAUNCH.md#task-67-android-deployment)
- [ANDROID-DEPLOYMENT.md](../ANDROID-DEPLOYMENT.md)
```

---

### Issue #51: Setup Production Monitoring

```markdown
---
title: Setup Production Monitoring
labels: phase-6, priority-high, type-infrastructure
assignees:
---

## Description

Setup monitoring, error tracking, and alerting for production.

## Tasks

- [ ] Configure Sentry for error tracking
- [ ] Setup uptime monitoring
- [ ] Configure Supabase logs and alerts
- [ ] Create runbook document
- [ ] Setup alerting channels
- [ ] Test alerting

## Acceptance Criteria

- [ ] Sentry receiving errors
- [ ] Uptime monitoring active
- [ ] Alerts configured
- [ ] Runbook documented

## Dependencies

- #48 (Production deployment)

## Reference

- [Phase 6 Doc - Task 6.8](./07-PHASE-6-POLISH-LAUNCH.md#task-68-monitoring-setup)
```

---

## Summary

| Phase   | Issues | Priority Issues         |
| ------- | ------ | ----------------------- |
| Phase 0 | #1-5   | #1, #2, #3              |
| Phase 1 | #6-10  | #6, #7, #8              |
| Phase 2 | #11-22 | #11, #12, #18, #19      |
| Phase 3 | #23-28 | #24, #25, #28           |
| Phase 4 | #29-34 | #30, #32                |
| Phase 5 | #35-43 | #36, #37, #38, #40      |
| Phase 6 | #44-51 | #44, #47, #48, #49, #50 |

**Total:** 51 GitHub Issues (30 as requested + 21 additional for comprehensive coverage)
