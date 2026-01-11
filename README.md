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

### Architecture & Design

- [PRD-BMA-2026.md](docs/PRD-BMA-2026.md) - Product Requirements (v1.4 LOCKED)
- [DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) - Database schema & ER diagram
- [API-DESIGN.md](docs/API-DESIGN.md) - API endpoints & Edge Functions
- [UI-UX-WIREFRAMES.md](docs/UI-UX-WIREFRAMES.md) - Wireframes & design specifications

### Implementation Guides

- [Implementation Overview](docs/implementation/00-IMPLEMENTATION-OVERVIEW.md) - Overview & architecture
- [Design System Guide](docs/DESIGN-SYSTEM-IMPLEMENTATION.md) - Design system implementation
- [Testing Plan](docs/TESTING-IMPLEMENTATION-PLAN.md) - Testing strategy
- [CI/CD Plan](docs/CI-CD-IMPLEMENTATION-PLAN.md) - CI/CD & deployment

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
