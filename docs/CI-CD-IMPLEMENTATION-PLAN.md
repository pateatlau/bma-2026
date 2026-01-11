# CI/CD Implementation Plan

This document outlines the comprehensive CI/CD strategy for the BMA 2026 Expo project, including deployment plans for Web, Android, and iOS platforms targeting ~5000 users initially in India.

## Implementation Status

| Phase   | Description                        | Status       |
| ------- | ---------------------------------- | ------------ |
| Phase 1 | Pre-commit hooks (Husky)           | ✅ Completed |
| Phase 2 | GitHub Actions - Lint & Type Check | ✅ Completed |
| Phase 3 | Testing infrastructure             | ✅ Completed |
| Phase 4 | Environment configuration          | ✅ Completed |
| Phase 5 | EAS Build setup                    | ✅ Completed |
| Phase 6 | Web deployment (Vercel)            | ⏳ Pending   |
| Phase 7 | Android deployment (Play Store)    | ⏳ Pending   |
| Phase 8 | iOS deployment (App Store)         | ⏳ Pending   |
| Phase 9 | Monitoring & analytics             | ⏳ Pending   |

> **Note**: For detailed testing implementation (Unit, Integration, E2E), see [TESTING-IMPLEMENTATION-PLAN.md](./TESTING-IMPLEMENTATION-PLAN.md)

---

## Executive Summary

### Recommended Stack

| Component          | Solution                    | Cost (Monthly)      | Rationale                                   |
| ------------------ | --------------------------- | ------------------- | ------------------------------------------- |
| **CI/CD**          | GitHub Actions              | Free (2000 min/mo)  | Native integration, generous free tier      |
| **Testing**        | Jest + Playwright + Maestro | Free                | Industry standard, cross-platform           |
| **Web Hosting**    | Vercel                      | Free → $20          | Best DX, auto-scaling, India edge nodes     |
| **Mobile Builds**  | EAS Build                   | Free (30/mo) → $99  | Managed iOS/Android builds, no Mac required |
| **Mobile Deploy**  | EAS Submit                  | Included with EAS   | Automated store submissions                 |
| **Secrets Mgmt**   | GitHub Secrets + Vercel     | Free                | Secure, encrypted, easy rotation            |
| **Error Tracking** | Sentry (optional)           | Free (5K events/mo) | Cross-platform error monitoring             |
| **Coverage**       | Codecov                     | Free                | Coverage tracking and PR comments           |

### Estimated Monthly Costs (5000 Users)

| Tier           | Monthly Cost | Includes                                        |
| -------------- | ------------ | ----------------------------------------------- |
| **MVP/Launch** | ~$0-20       | Free tiers, minimal builds                      |
| **Growth**     | ~$50-100     | Vercel Pro, EAS Production, basic monitoring    |
| **Scale**      | ~$150-250    | Increased builds, priority support, full Sentry |

### One-Time Costs

| Item                    | Cost    | Required |
| ----------------------- | ------- | -------- |
| Apple Developer Program | $99/yr  | Yes      |
| Google Play Console     | $25     | Yes      |
| Domain name (if needed) | ~$12/yr | Optional |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEVELOPMENT                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Developer Machine                                                           │
│  ├── Code changes                                                            │
│  ├── Pre-commit hooks (Husky + lint-staged)                                 │
│  │   ├── ESLint --fix                                                       │
│  │   ├── Prettier --write                                                   │
│  │   └── TypeScript check                                                   │
│  └── Push to GitHub                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTINUOUS INTEGRATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  GitHub Actions (on push/PR)                                                │
│  ├── Lint & Format Check                                                    │
│  ├── TypeScript Type Check                                                  │
│  ├── Unit Tests (Jest + RNTL)                                               │
│  ├── Integration Tests (Jest + MSW)                                         │
│  └── Build Verification                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌───────────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐
│     WEB (Vercel)      │ │ ANDROID (EAS)   │ │       iOS (EAS)             │
├───────────────────────┤ ├─────────────────┤ ├─────────────────────────────┤
│ Preview (PR)          │ │ Internal Build  │ │ Internal Build (TestFlight) │
│ Production (main)     │ │ Play Store      │ │ App Store                   │
│ Edge CDN (India)      │ │ Internal Track  │ │ TestFlight → Production     │
└───────────────────────┘ └─────────────────┘ └─────────────────────────────┘
```

---

## Testing Strategy

> **Full Details**: See [TESTING-IMPLEMENTATION-PLAN.md](./TESTING-IMPLEMENTATION-PLAN.md) for comprehensive testing implementation.

### Testing Pyramid

```
                    ┌─────────────┐
                   /   E2E Tests   \          Few, Slow, Expensive
                  /   (Playwright   \         - Critical user flows
                 /    + Maestro)     \        - Smoke tests
                ├─────────────────────┤
               /   Integration Tests   \      Medium, Moderate
              /   (Jest + MSW)          \     - API integration
             /                           \    - Component interactions
            ├─────────────────────────────┤
           /        Unit Tests             \  Many, Fast, Cheap
          /    (Jest + React Native        \  - Business logic
         /      Testing Library)            \ - Individual components
        └───────────────────────────────────┘
```

### Test Execution Strategy

| Trigger            | Unit Tests | Integration Tests | E2E Tests        |
| ------------------ | ---------- | ----------------- | ---------------- |
| PR Creation/Update | ✅ Run     | ✅ Run            | ❌ Skip          |
| Push to `main`     | ✅ Run     | ✅ Run            | ✅ Web only      |
| Tag push (`v*`)    | ✅ Run     | ✅ Run            | ✅ All platforms |
| Manual trigger     | ✅ Run     | ✅ Run            | ✅ All platforms |

### Testing Tools

| Test Type        | Framework      | Purpose                        |
| ---------------- | -------------- | ------------------------------ |
| **Unit**         | Jest + RNTL    | Components, hooks, utilities   |
| **Integration**  | Jest + MSW     | API integration, complex flows |
| **E2E (Web)**    | Playwright     | Browser-based user flows       |
| **E2E (Mobile)** | Maestro        | Native app user flows          |
| **Coverage**     | Jest + Codecov | Track and report coverage      |

### Quality Gates

| Check                   | Required for PR | Notes                      |
| ----------------------- | --------------- | -------------------------- |
| Unit tests pass         | ✅              | All unit tests must pass   |
| Integration tests pass  | ✅              | All integration tests pass |
| Coverage > 60%          | ✅              | Minimum coverage threshold |
| TypeScript check passes | ✅              | No type errors             |
| ESLint passes           | ✅              | No linting errors          |
| Prettier check passes   | ✅              | Consistent formatting      |

---

## Git Branching Strategy

### Recommended: GitHub Flow (Simple)

```
main (production)
  │
  ├── feature/user-auth ──────► PR ──────► merge to main
  │
  ├── feature/payment ────────► PR ──────► merge to main
  │
  └── fix/login-bug ──────────► PR ──────► merge to main
```

### Branch Naming Convention

| Type    | Pattern                 | Example                     |
| ------- | ----------------------- | --------------------------- |
| Feature | `feature/<description>` | `feature/user-profile`      |
| Bug fix | `fix/<description>`     | `fix/login-validation`      |
| Hotfix  | `hotfix/<description>`  | `hotfix/crash-on-startup`   |
| Chore   | `chore/<description>`   | `chore/update-dependencies` |
| Release | `release/<version>`     | `release/1.2.0`             |

### Branch Protection Rules (GitHub)

For `main` branch:

- ✅ Require pull request reviews (1 reviewer minimum)
- ✅ Require status checks to pass (lint, typecheck)
- ✅ Require branches to be up to date
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

---

## Phase 1: Pre-commit Hooks (Husky)

### Purpose

Catch issues before they reach CI, saving time and ensuring consistent code quality.

### Installation

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### Configuration

**File**: `package.json` (add to existing)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,json,md}": ["prettier --write"]
  }
}
```

**File**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### NPM Scripts to Add

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

### Expected Behavior

1. Developer stages files (`git add`)
2. Developer commits (`git commit`)
3. Husky intercepts, runs lint-staged
4. Only staged files are linted/formatted
5. If errors, commit is blocked
6. If success, commit proceeds

---

## Phase 2: GitHub Actions - CI Pipeline

### Workflow 1: Lint & Type Check

**File**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript check
        run: npm run typecheck

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --ci --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          flags: unit
          fail_ci_if_error: false

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    timeout-minutes: 20

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration -- --ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          flags: integration
          fail_ci_if_error: false
```

### Workflow 2: Build Verification (Web)

**File**: `.github/workflows/build-web.yml`

```yaml
name: Build Web

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-web:
    name: Build Web Bundle
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web
        run: npx expo export --platform web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/
          retention-days: 7
```

### Workflow 3: E2E Tests (Main Push)

**File**: `.github/workflows/e2e-main.yml`

```yaml
name: E2E Tests (Main)

on:
  push:
    branches: [main]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: false

jobs:
  e2e-web:
    name: E2E Web Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e:web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Workflow 4: E2E Tests (Release Tag)

**File**: `.github/workflows/e2e-release.yml`

```yaml
name: E2E Tests (Release)

on:
  push:
    tags:
      - 'v*'

jobs:
  e2e-web:
    name: E2E Web Tests (All Browsers)
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests (all browsers)
        run: npx playwright test --project=chromium --project=firefox --project=webkit
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  e2e-mobile:
    name: E2E Mobile Tests (Maestro)
    runs-on: macos-latest
    timeout-minutes: 60

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install Maestro
        run: |
          curl -Ls "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Build development client
        run: eas build --profile development --platform ios --local --output ./build.app

      - name: Start iOS Simulator
        run: |
          xcrun simctl boot "iPhone 15"
          xcrun simctl install booted ./build.app

      - name: Run Maestro tests
        run: maestro test e2e/mobile/flows/

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: maestro-results
          path: ~/.maestro/tests/
          retention-days: 30
```

---

## Phase 3: Testing Infrastructure

> **Full Implementation Details**: See [TESTING-IMPLEMENTATION-PLAN.md](./TESTING-IMPLEMENTATION-PLAN.md)

### Quick Setup

```bash
# Install testing dependencies
npm install --save-dev \
  jest \
  @types/jest \
  jest-expo \
  @testing-library/react-native \
  @testing-library/jest-native \
  msw \
  @playwright/test

# Install Playwright browsers
npx playwright install

# Install Maestro (macOS)
brew install maestro
```

### NPM Scripts for Testing

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathIgnorePatterns='integration'",
    "test:integration": "jest --config jest.integration.config.js",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e:web": "playwright test",
    "test:e2e:mobile": "maestro test e2e/mobile/flows/"
  }
}
```

---

## Phase 4: Environment Configuration

### Environment Strategy

| Environment | Branch/Trigger | Purpose               | Supabase Project |
| ----------- | -------------- | --------------------- | ---------------- |
| Development | Local          | Developer testing     | Development      |
| Preview     | Pull Requests  | PR review, QA testing | Staging          |
| Production  | `main` branch  | Live users            | Production       |

### Environment Variables Structure

**Local Development**: `.env` (gitignored)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx-dev.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...dev
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENV=development
```

**GitHub Secrets** (for CI/CD):

| Secret Name                     | Environment | Description             |
| ------------------------------- | ----------- | ----------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Production  | Production Supabase URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Production  | Production anon key     |
| `EXPO_TOKEN`                    | All         | EAS authentication      |
| `VERCEL_TOKEN`                  | All         | Vercel deployment       |
| `VERCEL_ORG_ID`                 | All         | Vercel organization     |
| `VERCEL_PROJECT_ID`             | All         | Vercel project          |
| `CODECOV_TOKEN`                 | All         | Coverage reporting      |

**Vercel Environment Variables**:

Configure in Vercel Dashboard → Project → Settings → Environment Variables:

- `EXPO_PUBLIC_SUPABASE_URL` (Production, Preview)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview)

### EAS Environment Configuration

**File**: `eas.json` (create at project root)

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "env": {
        "EXPO_PUBLIC_ENV": "preview"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## Phase 4: EAS Build Setup

### Prerequisites

1. Create Expo account at https://expo.dev
2. Install EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Configure project: `eas build:configure`

### Build Profiles

| Profile       | Purpose                        | Distribution | Auto-submit |
| ------------- | ------------------------------ | ------------ | ----------- |
| `development` | Local testing with dev client  | Internal     | No          |
| `preview`     | QA testing, stakeholder review | Internal     | No          |
| `production`  | App store release              | Store        | Optional    |

### Build Commands

```bash
# Development build (for simulators/local devices)
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build (app stores)
eas build --profile production --platform all

# Submit to stores after build
eas submit --platform all
```

### GitHub Actions: EAS Build (Manual Trigger)

**File**: `.github/workflows/eas-build.yml`

```yaml
name: EAS Build

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - ios
          - android
      profile:
        description: 'Build profile'
        required: true
        default: 'preview'
        type: choice
        options:
          - development
          - preview
          - production

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: eas build --platform ${{ inputs.platform }} --profile ${{ inputs.profile }} --non-interactive
```

### GitHub Actions: EAS Build on Release Tag

**File**: `.github/workflows/eas-release.yml`

```yaml
name: EAS Release Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-submit:
    name: Build & Submit to Stores
    runs-on: ubuntu-latest
    timeout-minutes: 90

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: eas build --platform all --profile production --non-interactive

      # Optional: Auto-submit to stores
      # - name: Submit to stores
      #   run: eas submit --platform all --non-interactive
```

---

## Phase 5: Web Deployment (Vercel)

### Why Vercel?

- Zero-config deployment for Expo web
- Automatic preview deployments for PRs
- Edge network with nodes in India (Mumbai)
- Generous free tier (100GB bandwidth/mo)
- Easy rollbacks

### Setup Steps

1. **Connect Repository**
   - Go to https://vercel.com
   - Import GitHub repository
   - Vercel auto-detects Expo

2. **Configure Build Settings**
   - Framework Preset: Other
   - Build Command: `npx expo export --platform web`
   - Output Directory: `dist`
   - Install Command: `npm ci`

3. **Environment Variables**
   - Add `EXPO_PUBLIC_SUPABASE_URL`
   - Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Vercel Configuration File

**File**: `vercel.json`

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/((?!_expo|assets|favicon.ico).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Deployment Behavior

| Trigger        | Environment | URL                          |
| -------------- | ----------- | ---------------------------- |
| Push to `main` | Production  | `bma-2026.vercel.app`        |
| Pull Request   | Preview     | `bma-2026-pr-123.vercel.app` |
| Custom domain  | Production  | `app.yourdomain.com`         |

### Performance Optimizations for India

1. **Enable Edge Caching**: Automatic with Vercel
2. **Image Optimization**: Use Vercel's Image Optimization API
3. **Compression**: Automatic gzip/brotli
4. **CDN**: Mumbai edge node automatically used for Indian users

---

## Phase 6: Android Deployment (Play Store)

### Prerequisites

1. **Google Play Console Account** ($25 one-time)
   - https://play.google.com/console

2. **Service Account for CI/CD**
   - Google Cloud Console → IAM → Service Accounts
   - Create service account with "Service Account User" role
   - Download JSON key file
   - In Play Console: Setup → API access → Link service account

### App Store Listing Requirements

| Requirement        | Details                         |
| ------------------ | ------------------------------- |
| App name           | BMA 2026                        |
| Short description  | ≤80 characters                  |
| Full description   | ≤4000 characters                |
| Screenshots        | Phone: 2-8, Tablet: up to 8     |
| Feature graphic    | 1024 x 500 px                   |
| App icon           | 512 x 512 px (provided by Expo) |
| Privacy policy URL | Required                        |
| Category           | Choose appropriate category     |
| Content rating     | Complete questionnaire          |
| Target audience    | Declare age group               |

### Release Tracks

| Track      | Purpose                    | User Access          |
| ---------- | -------------------------- | -------------------- |
| Internal   | Team testing (100 testers) | Invite by email      |
| Closed     | Beta testing               | Opt-in link          |
| Open       | Public beta                | Anyone can join      |
| Production | Live release               | All Play Store users |

### Recommended Release Flow

```
Internal Testing (QA) → Closed Testing (Beta) → Production (Staged Rollout)
        ↓                       ↓                         ↓
    1-2 days               3-7 days                  10% → 50% → 100%
```

### EAS Submit Configuration

Add to `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

### Manual Steps (First Release)

1. Build production APK/AAB: `eas build --platform android --profile production`
2. Download from EAS dashboard
3. Upload manually to Play Console (first time)
4. Complete store listing
5. Submit for review
6. After approval, subsequent releases can use `eas submit`

---

## Phase 7: iOS Deployment (App Store)

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - https://developer.apple.com

2. **App Store Connect**
   - Create app record
   - Configure app information

3. **Certificates & Provisioning**
   - EAS handles this automatically
   - Or manual setup via Apple Developer portal

### App Store Listing Requirements

| Requirement        | Details                           |
| ------------------ | --------------------------------- |
| App name           | BMA 2026 (≤30 characters)         |
| Subtitle           | ≤30 characters                    |
| Description        | ≤4000 characters                  |
| Keywords           | ≤100 characters, comma-separated  |
| Screenshots        | 6.7", 6.5", 5.5" (required sizes) |
| App icon           | 1024 x 1024 px (provided by Expo) |
| Privacy policy URL | Required                          |
| Support URL        | Required                          |
| Age rating         | Complete questionnaire            |

### TestFlight Distribution

| Group Type | Limit  | Review Required | Purpose      |
| ---------- | ------ | --------------- | ------------ |
| Internal   | 100    | No              | Team testing |
| External   | 10,000 | Yes (first)     | Beta testing |

### Recommended Release Flow

```
Internal TestFlight → External TestFlight → App Store Review → Release
         ↓                    ↓                    ↓              ↓
     Immediate            ~1 day              1-3 days       Manual/Auto
```

### EAS Submit Configuration

Add to `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

### App Store Connect API Key (Recommended for CI)

1. App Store Connect → Users and Access → Keys
2. Generate API Key with "App Manager" role
3. Download .p8 file
4. Configure in EAS:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascApiKeyPath": "./appstore-api-key.p8",
        "ascApiKeyIssuerId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "ascApiKeyId": "XXXXXXXXXX"
      }
    }
  }
}
```

---

## Phase 8: Monitoring & Analytics (Optional)

### Error Tracking: Sentry

**Installation**:

```bash
npx expo install @sentry/react-native
```

**Configuration**:

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: __DEV__,
});
```

**Cost**: Free tier includes 5,000 errors/month

### Analytics: Expo Insights (Built-in)

- Automatic with EAS
- Session tracking
- Update adoption
- Crash reports

### Performance Monitoring Options

| Tool               | Cost          | Features                         |
| ------------------ | ------------- | -------------------------------- |
| Expo Insights      | Free with EAS | Basic analytics                  |
| Sentry             | Free-$26/mo   | Error tracking, performance      |
| Firebase Analytics | Free          | Events, funnels, user properties |
| Mixpanel           | Free-$25/mo   | Product analytics                |

---

## Cost Breakdown for India Launch (~5000 Users)

### Monthly Operating Costs

| Service          | Free Tier       | Expected Usage   | Monthly Cost |
| ---------------- | --------------- | ---------------- | ------------ |
| GitHub Actions   | 2,000 min/mo    | ~500 min         | $0           |
| Vercel Hobby     | 100GB bandwidth | ~20GB            | $0           |
| EAS Build (Free) | 30 builds/mo    | ~10-15 builds    | $0           |
| Supabase (Free)  | 500MB, 2GB xfer | Depends on usage | $0           |
| Sentry (Free)    | 5K errors/mo    | ~1K errors       | $0           |
| **Total MVP**    |                 |                  | **$0/mo**    |

### Annual Fixed Costs

| Item                    | Cost      | Required |
| ----------------------- | --------- | -------- |
| Apple Developer Program | $99/year  | Yes      |
| Google Play Console     | $25 once  | Yes      |
| Domain (optional)       | ~$12/year | Optional |
| **Total First Year**    | **~$136** |          |

### Scaling Costs (if needed)

| Upgrade Path   | When to Upgrade         | Cost   |
| -------------- | ----------------------- | ------ |
| Vercel Pro     | >100GB bandwidth/mo     | $20/mo |
| EAS Production | Need faster builds      | $99/mo |
| Supabase Pro   | Need more storage/users | $25/mo |

---

## Implementation Checklist

### Pre-Implementation

- [ ] Create Expo account (https://expo.dev)
- [ ] Create Vercel account (https://vercel.com)
- [ ] Purchase Apple Developer membership ($99)
- [ ] Create Google Play Console account ($25)
- [ ] Set up Supabase projects (dev, staging, prod)

### Phase 1: Pre-commit Hooks

- [ ] Install husky and lint-staged
- [ ] Configure lint-staged in package.json
- [ ] Create .husky/pre-commit hook
- [ ] Test pre-commit workflow

### Phase 2: GitHub Actions (Lint & Type Check)

- [ ] Create .github/workflows/ci.yml
- [ ] Create .github/workflows/build-web.yml
- [ ] Add GitHub secrets for environment variables
- [ ] Configure branch protection rules
- [ ] Test CI pipeline

### Phase 3: Testing Infrastructure

- [ ] Install Jest and testing dependencies
- [ ] Create jest.config.js and jest.setup.js
- [ ] Install Playwright for E2E web tests
- [ ] Install Maestro CLI for E2E mobile tests
- [ ] Create **tests**/ directory structure
- [ ] Write initial unit tests (Button, Input, hooks)
- [ ] Create MSW handlers for API mocking
- [ ] Write initial integration tests
- [ ] Create e2e/ directory with Playwright and Maestro tests
- [ ] Create .github/workflows/e2e-main.yml
- [ ] Create .github/workflows/e2e-release.yml
- [ ] Set up Codecov account and add token to GitHub secrets
- [ ] Verify coverage reporting works

### Phase 4: Environment Configuration

- [ ] Create eas.json
- [ ] Set up environment variables in Vercel
- [ ] Set up GitHub secrets
- [ ] Create .env.example for documentation

### Phase 5: EAS Build

- [ ] Run `eas build:configure`
- [ ] Test development build
- [ ] Test preview build
- [ ] Create .github/workflows/eas-build.yml

### Phase 6: Web Deployment

- [ ] Connect repository to Vercel
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Create vercel.json
- [ ] Verify preview deployments
- [ ] Configure custom domain (optional)

### Phase 7: Android Deployment

- [ ] Create app in Google Play Console
- [ ] Set up service account for CI
- [ ] Complete store listing
- [ ] Upload first build manually
- [ ] Submit for review
- [ ] Configure internal testing track

### Phase 8: iOS Deployment

- [ ] Create app in App Store Connect
- [ ] Configure EAS for iOS builds
- [ ] Set up App Store Connect API key
- [ ] Complete app information
- [ ] Upload first build to TestFlight
- [ ] Submit for App Store review

### Phase 9: Monitoring (Optional)

- [ ] Set up Sentry
- [ ] Configure error boundaries
- [ ] Set up alerts

---

## Rollback Procedures

### Web (Vercel)

```bash
# Via Vercel Dashboard
# Deployments → Select previous deployment → Promote to Production

# Or via CLI
vercel rollback
```

### Mobile (EAS Update)

For JavaScript/asset changes (no native code changes):

```bash
# Publish update to previous version
eas update --branch production --message "Rollback to previous version"
```

For native code changes, requires new build and store submission.

### Emergency Contacts

| Issue Type       | Contact                   |
| ---------------- | ------------------------- |
| Vercel outage    | status.vercel.com         |
| EAS Build issues | expo.dev/support          |
| Play Store       | Play Console support      |
| App Store        | App Store Connect support |

---

## Security Considerations

### Secrets Management

1. **Never commit secrets** to repository
2. **Use GitHub Secrets** for CI/CD
3. **Rotate keys** periodically
4. **Least privilege** for service accounts

### Required GitHub Secrets

| Secret                          | Source                    |
| ------------------------------- | ------------------------- |
| `EXPO_TOKEN`                    | expo.dev → Access Tokens  |
| `EXPO_PUBLIC_SUPABASE_URL`      | Supabase Dashboard        |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard        |
| `VERCEL_TOKEN`                  | Vercel → Settings         |
| `VERCEL_ORG_ID`                 | Vercel → Settings         |
| `VERCEL_PROJECT_ID`             | Vercel → Project Settings |

### Files to Gitignore

Ensure `.gitignore` includes:

```
# Secrets
.env
.env.local
google-service-account.json
appstore-api-key.p8
*.p12
*.mobileprovision

# Builds
dist/
web-build/
android/
ios/
```

---

## Timeline Estimate

| Phase | Description               | Dependencies          |
| ----- | ------------------------- | --------------------- |
| 1     | Pre-commit hooks          | None                  |
| 2     | GitHub Actions CI         | None                  |
| 3     | Environment configuration | Supabase setup        |
| 4     | EAS Build setup           | Expo account          |
| 5     | Web deployment            | Vercel account        |
| 6     | Android deployment        | Play Console, Phase 4 |
| 7     | iOS deployment            | Apple Dev, Phase 4    |
| 8     | Monitoring                | All phases complete   |

---

## Related Documentation

### Internal Documentation

- [TESTING-IMPLEMENTATION-PLAN.md](./TESTING-IMPLEMENTATION-PLAN.md) - Comprehensive testing strategy
- [PRETTIER-ESLINT-IMPLEMENTATION.md](./PRETTIER-ESLINT-IMPLEMENTATION.md) - Code quality setup

### External Documentation

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Maestro Documentation](https://maestro.mobile.dev/docs)
- [Codecov Documentation](https://docs.codecov.com/)

---

## Appendix A: Complete Workflow Files

All workflow files are provided in the phases above. Copy them to:

```
.github/
└── workflows/
    ├── ci.yml           # Lint, Type Check, Unit & Integration Tests
    ├── build-web.yml    # Web build verification
    ├── e2e-main.yml     # E2E web tests (main push)
    ├── e2e-release.yml  # E2E all platforms (tag push)
    ├── eas-build.yml    # Manual EAS builds
    └── eas-release.yml  # Release builds on tags
```

---

## Appendix B: NPM Scripts Summary

After full implementation, `package.json` scripts should include:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run lint && npm run format:check",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathIgnorePatterns='integration'",
    "test:integration": "jest --config jest.integration.config.js",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e:web": "playwright test",
    "test:e2e:web:ui": "playwright test --ui",
    "test:e2e:mobile": "maestro test e2e/mobile/flows/",
    "test:e2e:mobile:smoke": "maestro test e2e/mobile/flows/smoke.yaml",
    "build:web": "expo export --platform web",
    "prepare": "husky"
  }
}
```
