# Project Rules

## Project Overview

BMA (Bangalore Mizo Association) Digital Platform - A bilingual (English + Mizo) community app with membership management, content publishing, AI chatbot, and admin dashboard.

**PRD Status:** Locked (v1.4) - No feature creep allowed.

## General

- This is a real production-style Expo project
- Code must be runnable, not illustrative
- Prefer correctness and clarity over cleverness

## Platform

- Target: Web, Android, iOS
- Use Expo SDK 54, React 19.1, React Native 0.81
- Use Expo Router for navigation
- One shared codebase for all platforms

## Backend & Database

- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI:** Google Gemini API (for Mizo language support)
- **Payments:** Razorpay (async webhook verification only)
- **Notifications:** Gupshup (WhatsApp), Resend (Email)
- **Authorization:** RLS (Row Level Security) as primary layer
- **Type Safety:** Use `supabase gen types` for database types

## User Roles

| Role          | Access                                         |
| ------------- | ---------------------------------------------- |
| Guest         | Public content only                            |
| User (Free)   | + Auth, profile, limited chatbot (5/day)       |
| Member (Paid) | + Full chatbot (30/day), directory, escalation |
| Editor        | + Content management                           |
| Admin         | + User management, system settings, audit logs |

## Bilingual Support (i18n)

- Languages: English (`en`) + Mizo (`lus`, ISO 639-3)
- Use `react-i18next` with `expo-localization`
- Translation files in `/locales/{en,lus}/*.json`
- AI-first translation (Gemini) with human review for cultural terms
- All content supports dual-language entries

## Route Structure

```
/(public)/     # No auth required (Home, News, Events, About)
/(auth)/       # Auth screens (Login, Signup, Reset)
/(app)/        # Authenticated users (Profile, Membership, Chat)
/(admin)/      # Admin/Editor only (Dashboard, Users, Content)
```

## Restrictions

- Do NOT use web-only libraries (no react-router-dom, no Next.js)
- Do NOT use deprecated APIs
- Do NOT invent libraries
- Do NOT trust client-side payment callbacks (use webhook only)
- Do NOT skip RLS policies on any table

## Code Quality

- Maintain clean file structure
- Avoid duplicated logic
- Ensure navigation and providers are wired correctly
- Handle platform differences intentionally
- Run `npm run check` before committing (typecheck + lint + format:check)

## Formatting & Linting

- ESLint 9.x with flat config (`eslint.config.js`)
- Prettier for code formatting
- Run `npm run lint:fix` to auto-fix linting issues
- Run `npm run format` to format code

## Testing

- Unit tests: Jest + React Native Testing Library
- Integration tests: Jest + MSW for API mocking
- E2E (Web): Playwright
- E2E (Mobile): Maestro
- Run `npm run test` for unit tests
- Run `npm run test:integration` for integration tests

## UI

- Red (#DC2626), black (#0A0A0A), and white (#FFFFFF) theme
- Clean, modern, professional look
- Avoid default-looking starter UI
- Use design system components from `/components`
- Use design tokens from `/constants/tokens`
- Support light and dark mode

## Behavior

- Think through architecture before writing code
- If unsure, resolve the uncertainty before outputting code
- Fix issues fully, not partially

## Key Architecture Decisions

| Decision             | Choice                   | Rationale                           |
| -------------------- | ------------------------ | ----------------------------------- |
| AI Provider          | Google Gemini            | Better Mizo language support        |
| Admin Dashboard      | Integrated in main app   | Single codebase, faster development |
| Chatbot              | RAG with pgvector        | Grounds responses in official docs  |
| Payment Verification | Async webhook-only       | Never trust client-side callbacks   |
| Authorization        | RLS as primary           | Database-level security             |
| Offline Support      | Offline-Lite (read-only) | Stale-while-revalidate caching      |

## Documentation

### Architecture & Design

- [PRD-BMA-2026.md](docs/PRD-BMA-2026.md) - Product Requirements (LOCKED v1.4)
- [DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) - Database schema & ER diagram
- [API-DESIGN.md](docs/API-DESIGN.md) - API endpoints & Edge Functions
- [UI-UX-WIREFRAMES.md](docs/UI-UX-WIREFRAMES.md) - Wireframes & Storybook plan

### Implementation Plan (Phased)

- [Implementation Overview](docs/implementation/00-IMPLEMENTATION-OVERVIEW.md) - Overview & architecture
- [Phase 0: Foundation](docs/implementation/01-PHASE-0-FOUNDATION.md) - Supabase, DB, CI/CD (Days 1-5)
- [Phase 1: Core Infrastructure](docs/implementation/02-PHASE-1-CORE-INFRASTRUCTURE.md) - Auth, i18n, design system (Days 6-15)
- [Phase 2: Public Features](docs/implementation/03-PHASE-2-PUBLIC-FEATURES.md) - News, events, content (Days 16-28)
- [Phase 3: Membership & Payments](docs/implementation/04-PHASE-3-MEMBERSHIP-PAYMENTS.md) - Razorpay, tiers (Days 29-38)
- [Phase 4: AI Chatbot](docs/implementation/05-PHASE-4-CHATBOT.md) - RAG, Gemini, escalation (Days 39-50)
- [Phase 5: Admin Dashboard](docs/implementation/06-PHASE-5-ADMIN-DASHBOARD.md) - User/content mgmt (Days 51-60)
- [Phase 6: Polish & Launch](docs/implementation/07-PHASE-6-POLISH-LAUNCH.md) - Testing, deployment (Days 61-67)
- [GitHub Issues](docs/implementation/08-GITHUB-ISSUES-TEMPLATE.md) - 51 issue templates

### Implementation Guides

- [DESIGN-SYSTEM-IMPLEMENTATION.md](docs/DESIGN-SYSTEM-IMPLEMENTATION.md) - Design system guide
- [PRETTIER-ESLINT-IMPLEMENTATION.md](docs/PRETTIER-ESLINT-IMPLEMENTATION.md) - Code quality setup
- [TESTING-IMPLEMENTATION-PLAN.md](docs/TESTING-IMPLEMENTATION-PLAN.md) - Testing strategy
- [CI-CD-IMPLEMENTATION-PLAN.md](docs/CI-CD-IMPLEMENTATION-PLAN.md) - CI/CD & deployment
- [ANDROID-DEPLOYMENT.md](docs/ANDROID-DEPLOYMENT.md) - Android/Play Store guide
- [IOS-DEPLOYMENT.md](docs/IOS-DEPLOYMENT.md) - iOS/App Store guide

## Database Schema

Key tables: `profiles`, `memberships`, `payments`, `content`, `comments`, `likes`, `knowledge_base`, `chat_conversations`, `chat_messages`, `escalations`, `audit_logs`

See [DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) for full schema.

## Supabase Commands

```bash
# Generate TypeScript types from database
npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts

# Run migrations locally
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy <function-name>
```

## Known Issues

### Mobile Email Verification (TODO)

**Status:** Parked for later resolution

**Problem:** Email verification does not work properly on mobile (iOS/Android). When a user signs up from the mobile app and clicks the confirmation link in their email:

1. The link opens in the device's browser (not the app)
2. The browser navigates to the production web URL instead of triggering the app's deep link (`bma2026://auth/confirm`)
3. User sees the web confirmation page but the mobile app doesn't know about the verification

**Root Cause:** Supabase sends confirmation emails with HTTPS URLs (e.g., `https://[project].supabase.co/auth/v1/verify?...&redirect_to=bma2026://auth/confirm`). The browser intercepts the HTTPS link, and even though Supabase redirects to the custom scheme after verification, the deep link doesn't reliably open the app.

**Current Workaround:** The web `/auth/confirm` page detects mobile browsers and shows a message: "Your email has been verified. You can now close this browser and return to the BMA 2026 app to log in." Users must manually return to the app and log in.

**Potential Solutions to Explore:**

1. **Android App Links / iOS Universal Links:** Configure verified domain association so HTTPS URLs open directly in the app. Requires domain verification and hosting `/.well-known/assetlinks.json` (Android) or `apple-app-site-association` (iOS).
2. **Magic Link with OTP:** Instead of click-to-verify, send a 6-digit code that users enter in the app.
3. **Supabase Native Deep Link Support:** Check if Supabase has updated their email templates or auth flow to better support mobile deep links.

**Web verification works correctly.** This issue only affects native mobile apps.
