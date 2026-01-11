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
