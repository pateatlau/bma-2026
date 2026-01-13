# BMA 2026 - Bangalore Mizo Association Digital Platform

A bilingual (English + Mizo) community platform for the Bangalore Mizo Association, built with Expo for Web, iOS, and Android.

## Overview

BMA 2026 is a unified digital platform serving as the primary communication, membership, and support channel for the Mizo community in Bangalore. The platform features:

- **Bilingual Support**: Full English and Mizo (ISO 639-3: `lus`) language support
- **Cross-Platform**: Single codebase for Web, iOS, and Android
- **Membership Management**: Paid membership tiers with Razorpay integration
- **AI Chatbot**: RAG-powered chatbot with Mizo language support via Google Gemini
- **Content Management**: News, events, articles, newsletters, and photo galleries
- **Admin Dashboard**: Integrated admin and editor dashboards

## Tech Stack

| Layer         | Technology                                                |
| ------------- | --------------------------------------------------------- |
| Frontend      | Expo SDK 54, React 19.1, React Native 0.81, Expo Router 6 |
| Backend       | Supabase (PostgreSQL, Auth, Storage, Edge Functions)      |
| AI            | Google Gemini API (for Mizo language support)             |
| Payments      | Razorpay (webhook verification only)                      |
| Notifications | Gupshup (WhatsApp), Resend (Email)                        |
| DevOps        | GitHub Actions, EAS Build, Vercel                         |

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (`npx expo`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/bma-2026.git
cd bma-2026
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Required environment variables:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the development server

```bash
# Start Expo development server
npm start

# Or start for specific platform
npm run web      # Web
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

## Available Scripts

| Command                    | Description                           |
| -------------------------- | ------------------------------------- |
| `npm start`                | Start Expo development server         |
| `npm run web`              | Start for web                         |
| `npm run ios`              | Start for iOS                         |
| `npm run android`          | Start for Android                     |
| `npm run check`            | Run typecheck, lint, and format check |
| `npm run lint`             | Run ESLint                            |
| `npm run lint:fix`         | Run ESLint with auto-fix              |
| `npm run format`           | Format code with Prettier             |
| `npm run format:check`     | Check code formatting                 |
| `npm run typecheck`        | Run TypeScript type checking          |
| `npm test`                 | Run unit tests                        |
| `npm run test:watch`       | Run tests in watch mode               |
| `npm run test:coverage`    | Run tests with coverage report        |
| `npm run test:integration` | Run integration tests                 |
| `npm run test:e2e`         | Run Playwright E2E tests              |

## Project Structure

```
/bma-2026
├── /app                   # Expo Router app directory
│   ├── /(public)          # Public pages (no auth required)
│   ├── /(auth)            # Authentication screens
│   ├── /(app)             # Logged-in user screens
│   └── /(admin)           # Admin/Editor routes (lazy loaded)
├── /components            # Shared UI components
├── /constants             # Design tokens, theme
├── /contexts              # React contexts (Auth, Theme, i18n)
├── /hooks                 # Custom hooks
├── /lib                   # External service clients (Supabase, Sentry)
├── /locales               # Translation files (en, lus)
├── /utils                 # Utility functions
├── /supabase
│   ├── /migrations        # Database migrations
│   ├── /functions         # Edge functions
│   └── /seed              # Seed data
├── /docs                  # Documentation
└── /e2e                   # Playwright E2E tests
```

## User Roles

| Role          | Access                                       |
| ------------- | -------------------------------------------- |
| Guest         | Public content only                          |
| User (Free)   | Auth, profile, limited chatbot (5/day)       |
| Member (Paid) | Full chatbot (30/day), directory, escalation |
| Editor        | Content management                           |
| Admin         | User management, system settings, audit logs |

## Documentation

### 📋 Core Requirements & Specifications

- **[PRD-BMA-2026.md](docs/PRD-BMA-2026.md)** - Product Requirements Document (v1.4 **LOCKED**)
  - Purpose, goals, and target scale
  - User roles and access control matrix
  - Bilingual support (English + Mizo)
  - Membership & payment flow
  - AI chatbot architecture (RAG-based)
  - Browser & device compatibility
  - Feature specifications

- **[NFR-REQUIREMENTS.md](docs/NFR-REQUIREMENTS.md)** - Non-Functional Requirements (101 NFRs)
  - Performance targets (page load, API response, bundle size)
  - Scalability (concurrent users, data growth)
  - Security (RLS, auth, rate limiting, OWASP compliance)
  - Availability (99.5% uptime, monitoring, backups)
  - Accessibility (WCAG 2.1 AA compliance)
  - Usability (bilingual, offline-lite mode)
  - Compatibility (browsers, mobile platforms, devices)
  - Maintainability (code quality, test coverage, documentation)
  - Compliance (data privacy, app stores, WhatsApp templates)

- **[DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md)** - Database Schema & Design
  - ER diagram and table relationships
  - RLS policies for all tables
  - Indexes for performance
  - Database functions (RPCs)

- **[API-DESIGN.md](docs/API-DESIGN.md)** - API Design & Specifications
  - REST API endpoints
  - Edge Functions (Supabase Deno)
  - Authentication & authorization
  - Rate limiting rules
  - Webhook verification (Razorpay)
  - Error handling & status codes

- **[UI-UX-WIREFRAMES.md](docs/UI-UX-WIREFRAMES.md)** - UI/UX Design & Wireframes
  - Screen wireframes
  - User flows
  - Design system specifications
  - Component library

### 🚀 Implementation Plans (Phased Release)

- **[Implementation Overview](docs/implementation/00-IMPLEMENTATION-OVERVIEW.md)** - Architecture & strategy
- **[Phase 0: Foundation](docs/implementation/01-PHASE-0-FOUNDATION.md)** - Supabase, DB, CI/CD (Days 1-5)
- **[Phase 1: Core Infrastructure](docs/implementation/02-PHASE-1-CORE-INFRASTRUCTURE.md)** - Auth, i18n, design system (Days 6-15)
- **[Phase 2: Public Features](docs/implementation/03-PHASE-2-PUBLIC-FEATURES.md)** - News, events, content (Days 16-28)
- **[Phase 3: Membership & Payments](docs/implementation/04-PHASE-3-MEMBERSHIP-PAYMENTS.md)** - Razorpay, tiers (Days 29-38)
- **[Phase 4: AI Chatbot](docs/implementation/05-PHASE-4-CHATBOT.md)** - RAG, Gemini, escalation (Days 39-50)
- **[Phase 5: Admin Dashboard](docs/implementation/06-PHASE-5-ADMIN-DASHBOARD.md)** - User/content mgmt (Days 51-60)
- **[Phase 6: Polish & Launch](docs/implementation/07-PHASE-6-POLISH-LAUNCH.md)** - Testing, deployment (Days 61-67)
- **[GitHub Issues Templates](docs/implementation/08-GITHUB-ISSUES-TEMPLATE.md)** - 51 issue templates for project tracking

### 📚 Implementation Guides

- **[Implementation Prerequisites](docs/implementation-requirements/00-PREREQUISITES.md)** - Infrastructure, image optimization, cost constraints
- **[Design System Implementation](docs/DESIGN-SYSTEM-IMPLEMENTATION.md)** - Design tokens, components, theming
- **[Prettier & ESLint Setup](docs/PRETTIER-ESLINT-IMPLEMENTATION.md)** - Code quality tooling
- **[Testing Strategy](docs/TESTING-IMPLEMENTATION-PLAN.md)** - Unit, integration, E2E testing
- **[CI/CD & Deployment](docs/CI-CD-IMPLEMENTATION-PLAN.md)** - GitHub Actions, EAS Build, Vercel
- **[Android Deployment](docs/ANDROID-DEPLOYMENT.md)** - Play Store submission guide
- **[iOS Deployment](docs/IOS-DEPLOYMENT.md)** - App Store submission guide

### 🔧 Reference Materials

- **[CLAUDE.md](CLAUDE.md)** - Project rules and instructions for AI assistance
- **Database Types**: Auto-generated from Supabase schema (`lib/database.types.ts`)
- **Supabase Migrations**: Located in `/supabase/migrations/`
- **Edge Functions**: Located in `/supabase/functions/`

### 📖 Quick Links by Role

**For Product Managers:**

- [PRD-BMA-2026.md](docs/PRD-BMA-2026.md) - Full product requirements
- [NFR-REQUIREMENTS.md](docs/NFR-REQUIREMENTS.md) - Quality attributes & constraints
- [UI-UX-WIREFRAMES.md](docs/UI-UX-WIREFRAMES.md) - Design specifications

**For Developers:**

- [Implementation Overview](docs/implementation/00-IMPLEMENTATION-OVERVIEW.md) - Start here
- [DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) - Data model
- [API-DESIGN.md](docs/API-DESIGN.md) - API contracts
- [Design System Implementation](docs/DESIGN-SYSTEM-IMPLEMENTATION.md) - UI components
- [Testing Strategy](docs/TESTING-IMPLEMENTATION-PLAN.md) - Testing approach

**For QA/Testing:**

- [NFR-REQUIREMENTS.md](docs/NFR-REQUIREMENTS.md) - Testable requirements with verification methods
- [Testing Strategy](docs/TESTING-IMPLEMENTATION-PLAN.md) - Test coverage requirements
- [Phase 6: Polish & Launch](docs/implementation/07-PHASE-6-POLISH-LAUNCH.md) - Launch checklist

**For DevOps:**

- [CI/CD & Deployment](docs/CI-CD-IMPLEMENTATION-PLAN.md) - Pipeline setup
- [Android Deployment](docs/ANDROID-DEPLOYMENT.md) - Play Store process
- [iOS Deployment](docs/IOS-DEPLOYMENT.md) - App Store process
- [Implementation Prerequisites](docs/implementation-requirements/00-PREREQUISITES.md) - Infrastructure requirements

## Development Guidelines

### Code Quality

Run the following before committing:

```bash
npm run check  # Runs typecheck + lint + format:check
```

### Commit Conventions

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

### Pre-commit Hooks

Husky and lint-staged are configured to run linting and formatting on staged files before each commit.

## Supabase Commands

```bash
# Generate TypeScript types from database
npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts

# Run migrations locally
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy <function-name>
```

## Design System

- **Primary Colors**: Red (#DC2626), Black (#0A0A0A), White (#FFFFFF)
- **Typography**: System fonts with consistent scale
- **Components**: Located in `/components` directory
- **Tokens**: Located in `/constants/tokens`

Supports both light and dark mode.

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run `npm run check` to ensure code quality
4. Submit a pull request

## License

Private - All rights reserved by Bangalore Mizo Association.
