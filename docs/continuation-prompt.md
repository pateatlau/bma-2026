# Continuation Prompt for BMA-2026 Project - Phase 0 Implementation

## Project Context

This is a continuation of the **BMA-2026 project** (Bangalore Mizo Association Digital Platform). The project is a production-grade, bilingual (English + Mizo) community platform built with Expo/React Native targeting Web, iOS, and Android from a single codebase.

**Repository:** `/Users/patea/2026/projects/BMA-2026`
**Current Branch:** `main` (trunk-based development)
**Latest Commit:** See git log

---

## Project Approval Status

✅ **Executive Committee has approved the project** (Budget: ₹1,50,000 for Year 1)
✅ **Launch Date Confirmed:** March 21, 2026 (BMA Annual Day) - Web platform
✅ **All design documentation is complete and approved**

---

## Current Implementation Status

### Completed Work

- ✅ **PRD Locked** (v1.4) - No scope creep allowed
- ✅ **Executive Summary** finalized and approved
- ✅ **Design Documents Complete:**
  - Translation System Design (v1.1)
  - Chatbot System Design (v1.0)
  - Site Search System Design (v1.0)
- ✅ **Database Schema** fully designed (`docs/DATABASE-SCHEMA.md`)
- ✅ **Implementation Plan** defined for all 6 phases (`docs/implementation/`)
- ✅ **Basic Authentication** structure exists on develop branch (commit `052add7`)
- ✅ **Port Configuration** - Custom port 2026 configured (matches project name)
- ✅ **iOS Simulator** - iPhone 16 Pro configured as default
- ✅ **Development Environment** - Web, Android, iOS all working with `npm start`

### Phase 0 Completed

- ✅ **Supabase project setup** - Production project configured
- ✅ **Database migrations** - All 13 tables created with RLS policies
- ✅ **CI/CD pipeline** - GitHub Actions workflows configured
- ✅ **TypeScript types** - Generated from database schema
- ✅ **Development environment** - Scripts and documentation complete

---

## Immediate Next Step: Phase 0 - Foundation (Days 1-5)

We are now ready to begin **Phase 0: Foundation** as documented in `docs/implementation/01-PHASE-0-FOUNDATION.md`.

### Phase 0 Tasks Overview

**Task 0.1: Supabase Project Setup**

- Create Supabase project (production + staging)
- Configure environment variables
- Set up database connection
- Generate TypeScript types

**Task 0.2: Database Schema Implementation**

- Run all migrations from `docs/DATABASE-SCHEMA.md`
- Create tables: profiles, memberships, payments, content, etc.
- Set up Row Level Security (RLS) policies
- Create database functions and triggers

**Task 0.3: CI/CD Pipeline Setup**

- Configure GitHub Actions workflows
- Set up ESLint + Prettier (flat config) - already configured
- Configure Jest + React Native Testing Library - already configured
- Set up Playwright (web E2E) - already configured
- Configure pre-commit hooks (lint-staged + husky) - already configured

**Task 0.4: Project Structure & Configuration**

- Verify Expo SDK 54 configuration - already done
- Set up environment management (.env files) - already done
- Configure TypeScript strict mode - already done
- Set up path aliases

**Task 0.5: Development Workflow Documentation**

- Git workflow (branching strategy)
- Commit message conventions
- Code review checklist
- Deployment procedures

---

## Manual Prerequisites for Supabase Setup

Before starting Task 0.1, the user needs to complete these manual steps:

### 1. Create Supabase Account (if not already done)

- Go to https://supabase.com
- Sign up with GitHub account (recommended) or email
- Verify email address

### 2. Create Production Supabase Project

- Log in to Supabase Dashboard
- Click "New Project"
- Fill in project details:
  - **Name:** `BMA-2026-Production`
  - **Database Password:** Generate a strong password (save it securely)
  - **Region:** Choose closest to Bangalore (e.g., `ap-south-1` - Mumbai or `ap-southeast-1` - Singapore)
  - **Pricing Plan:** Free tier (can upgrade later)
- Click "Create new project"
- Wait 2-3 minutes for project to provision

### 3. Create Staging Supabase Project (Optional but Recommended)

- Repeat step 2 with:
  - **Name:** `BMA-2026-Staging`
  - Same region as production
  - Free tier

### 4. Get Supabase Credentials

For **Production** project:

- Go to Project Settings (gear icon) > API
- Copy and save:
  - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
  - **anon public** key (under "Project API keys")
  - **service_role** key (keep this SECRET - never commit to git)

For **Staging** project (if created):

- Repeat the same steps

### 5. Update Local Environment Variables

Once you have the credentials, you (the AI assistant) will help update:

- `.env` (for local development)
- `.env.production` (for production builds)
- `.env.preview` (for staging/preview builds)

**Important:** Never commit `.env` files with real credentials to git. Only `.env.example` should be committed.

---

## Key Technical Information

### Tech Stack

- **Frontend:** Expo SDK 54, React 19.1, React Native 0.81, Expo Router
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI:** Google Gemini 1.5 Pro (translations, chatbot)
- **Payments:** Razorpay (webhook verification only)
- **Notifications:** Gupshup (WhatsApp), Resend (Email)
- **Testing:** Jest, React Native Testing Library, Playwright (web), Maestro (mobile)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry

### Development Server Configuration

- **Port:** `2026` (custom port matching project name)
- **Commands:**
  - `npm start` - Start dev server (then press `w` for web, `a` for Android, `i` for iOS)
  - `npm run web` - Web only at http://localhost:2026
  - `npm run android` - Android only
  - `npm run ios` - iOS only (uses iPhone 16 Pro simulator)

### Project Structure

```
/(public)/     # No auth required (Home, News, Events, About)
/(auth)/       # Auth screens (Login, Signup, Reset)
/(app)/        # Authenticated users (Profile, Membership, Chat)
/(admin)/      # Admin/Editor only (Dashboard, Users, Content)
```

### User Roles

- **Guest:** Public content only
- **User (Free):** + Auth, profile, limited chatbot (5/day)
- **Member (Paid):** + Full chatbot (30/day), directory, escalation
- **Editor:** + Content management
- **Admin:** + User management, system settings, audit logs

---

## Important Documentation References

- **PRD:** `docs/PRD-BMA-2026.md` (v1.4 - LOCKED)
- **Database Schema:** `docs/DATABASE-SCHEMA.md`
- **API Design:** `docs/API-DESIGN.md`
- **Phase 0 Implementation:** `docs/implementation/01-PHASE-0-FOUNDATION.md`
- **Project Rules:** `CLAUDE.md` (must follow strictly)

---

## Project Constraints & Rules

1. **No feature creep** - PRD v1.4 is locked
2. **Web-first launch** - Mobile app store release deferred to April-June
3. **Never trust client-side payment callbacks** - Use webhooks only
4. **RLS as primary authorization** - Database-level security
5. **Bilingual everything** - English (`en`) + Mizo (`lus`)
6. **No web-only libraries** - Must work on native platforms
7. **Run `npm run check`** before committing (typecheck + lint + format:check)
8. **Port 2026** - All development uses port 2026 (configured in metro.config.js and package.json)
9. **iPhone 16 Pro** - Default iOS simulator (configured via EXPO_IOS_SIMULATOR_DEVICE_NAME)

---

## Environment Configuration

### Current .env Structure

```bash
# Environment type
EXPO_PUBLIC_ENV=development

# iOS Simulator (iPhone 16 Pro)
EXPO_IOS_SIMULATOR_DEVICE_NAME=iPhone 16 Pro

# Supabase (Production credentials)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Files to Create/Update

- `.env` - Local development (already exists, needs Supabase credentials)
- `.env.production` - Production builds (needs to be created)
- `.env.preview` - Staging builds (needs to be created)

---

## Git Status

```
Current branch: develop
Recent commits:
  6e870f0 chore: Document iPhone 16 Pro simulator configuration
  4a99abf chore: Configure custom port 2026 for development server
  186fc95 docs: Add Mizo language version of Executive Summary
  8fd0ea8 docs: Replace 'highly profitable' with non-profit appropriate language
```

---

## Starting Point for Phase 0

**IMPORTANT:** Before starting Task 0.1, please inform the user about the manual prerequisites listed in the "Manual Prerequisites for Supabase Setup" section above. The user needs to:

1. Create a Supabase account
2. Create Production and Staging projects
3. Obtain the Project URL and API keys
4. Provide those credentials so you can update the environment files

Once the user confirms they have the Supabase credentials, proceed with:

1. Updating `.env`, `.env.production`, and `.env.preview` with Supabase credentials
2. Setting up database connection
3. Generating TypeScript types from database schema
4. Running database migrations

All design decisions are finalized. We are now in **implementation mode**. Please follow the Phase 0 implementation plan strictly and work through each task sequentially.

**Let's build this platform! 🚀**
