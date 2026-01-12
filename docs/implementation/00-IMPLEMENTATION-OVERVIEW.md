# BMA 2026 Implementation Overview

## Executive Summary

This document outlines the complete implementation plan for the BMA (Bangalore Mizo Association) Digital Platform. The project spans approximately 67 days and transforms the community organization's digital presence with a bilingual (English + Mizo) mobile-first application.

**PRD Version:** 1.4 (LOCKED - No feature creep)

> **⚠️ Account & Release Strategy Note:**
> Development proceeds using individual/personal accounts (Google Cloud, Facebook Dev, etc.). See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md) for details on the App Store account blocker and phased release strategy:
>
> - **Web:** Launches on **March 21, 2026** (BMA Annual Day)
> - **Mobile Internal Testing:** APK + Expo Go + TestFlight (if personal Apple Dev available)
> - **Mobile Public Release:** Blocked until BMA org accounts ready (~2-3 months after PAN card)

## Quick Links

| Document                                                              | Description                         |
| --------------------------------------------------------------------- | ----------------------------------- |
| [Phase 0: Foundation](./01-PHASE-0-FOUNDATION.md)                     | Project setup, Supabase, CI/CD      |
| [Phase 1: Core Infrastructure](./02-PHASE-1-CORE-INFRASTRUCTURE.md)   | Auth, profiles, i18n, design system |
| [Phase 2: Public Features](./03-PHASE-2-PUBLIC-FEATURES.md)           | News, events, gallery, content      |
| [Phase 3: Membership & Payments](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md) | Razorpay, membership tiers          |
| [Phase 4: AI Chatbot](./05-PHASE-4-CHATBOT.md)                        | RAG, Gemini, escalation             |
| [Phase 5: Admin Dashboard](./06-PHASE-5-ADMIN-DASHBOARD.md)           | User/content management, analytics  |
| [Phase 6: Polish & Launch](./07-PHASE-6-POLISH-LAUNCH.md)             | Testing, optimization, deployment   |
| [GitHub Issues](./08-GITHUB-ISSUES-TEMPLATE.md)                       | Issue templates for tracking        |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPS                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Web App   │  │  iOS App    │  │ Android App │                  │
│  │  (Expo Web) │  │   (Expo)    │  │   (Expo)    │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
│         │                │                │                          │
│         └────────────────┼────────────────┘                          │
│                          │                                           │
│              ┌───────────▼───────────┐                              │
│              │   Expo Router (v6)    │                              │
│              │   React Navigation    │                              │
│              └───────────┬───────────┘                              │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────────┐
│                    SUPABASE BACKEND                                  │
│                          │                                           │
│  ┌───────────────────────▼───────────────────────────────────────┐  │
│  │                    Supabase Client                             │  │
│  │         (PostgREST + Realtime + Storage + Auth)               │  │
│  └───────────────────────┬───────────────────────────────────────┘  │
│                          │                                           │
│  ┌─────────┬─────────────┼─────────────┬─────────────────────────┐  │
│  │         │             │             │                         │  │
│  ▼         ▼             ▼             ▼                         ▼  │
│ ┌───┐   ┌─────┐     ┌─────────┐   ┌─────────┐             ┌───────┐│
│ │RLS│   │Auth │     │ Edge    │   │ Storage │             │Realtime││
│ │   │   │     │     │Functions│   │ (Media) │             │       ││
│ └─┬─┘   └──┬──┘     └────┬────┘   └────┬────┘             └───┬───┘│
│   │        │             │             │                       │    │
│   └────────┴─────────────┼─────────────┴───────────────────────┘    │
│                          │                                           │
│              ┌───────────▼───────────┐                              │
│              │   PostgreSQL + RLS    │                              │
│              │   pgvector (RAG)      │                              │
│              └───────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────────┐
│                   EXTERNAL SERVICES                                  │
│                          │                                           │
│  ┌──────────┬────────────┼────────────┬──────────────┐              │
│  │          │            │            │              │              │
│  ▼          ▼            ▼            ▼              ▼              │
│ ┌────┐   ┌──────┐   ┌─────────┐   ┌───────┐   ┌──────────┐         │
│ │Razr│   │Gemini│   │Gupshup  │   │Resend │   │  Sentry  │         │
│ │pay │   │ API  │   │WhatsApp │   │ Email │   │  (Logs)  │         │
│ └────┘   └──────┘   └─────────┘   └───────┘   └──────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer        | Technology     | Version | Purpose                  |
| ------------ | -------------- | ------- | ------------------------ |
| **Frontend** | Expo SDK       | 54      | Cross-platform framework |
|              | React          | 19.1    | UI library               |
|              | React Native   | 0.81    | Native runtime           |
|              | Expo Router    | 6       | File-based navigation    |
|              | TypeScript     | 5.9     | Type safety              |
| **Backend**  | Supabase       | Latest  | BaaS platform            |
|              | PostgreSQL     | 15+     | Primary database         |
|              | pgvector       | Latest  | Vector embeddings        |
|              | Edge Functions | Deno    | Serverless compute       |
| **External** | Google Gemini  | 1.5 Pro | AI/LLM (Mizo support)    |
|              | Razorpay       | Latest  | Payment gateway          |
|              | Gupshup        | Latest  | WhatsApp notifications   |
|              | Resend         | Latest  | Email notifications      |
| **DevOps**   | GitHub Actions | Latest  | CI/CD                    |
|              | EAS Build      | Latest  | Native builds            |
|              | Vercel         | Latest  | Web hosting              |

## Phase Timeline

```
Phase 0: Foundation        ████░░░░░░░░░░░░░░░░░░░░░░░░░░  Days 1-5
Phase 1: Core Infra        ░░░░████████░░░░░░░░░░░░░░░░░░  Days 6-15
Phase 2: Public Features   ░░░░░░░░░░░░████████████░░░░░░  Days 16-28
Phase 3: Membership        ░░░░░░░░░░░░░░░░░░░░░░░░████░░  Days 29-38
Phase 4: Chatbot           ░░░░░░░░░░░░░░░░░░░░░░░░░░████  Days 39-50
Phase 5: Admin             ░░░░░░░░░░░░░░░░░░░░░░░░░░░░██  Days 51-60
Phase 6: Polish & Launch   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  Days 61-67 → March 21, 2026
```

## Phase Summary

### Phase 0: Foundation (Days 1-5)

**Goal:** Project infrastructure and development environment

- Supabase project setup with database schema
- RLS policies implementation
- CI/CD pipeline (GitHub Actions + EAS)
- Development environment configuration
- Code quality tools (ESLint, Prettier, TypeScript)

**Key Deliverables:**

- Database with 13 tables + RLS
- CI/CD running on push
- Development environment documented

---

### Phase 1: Core Infrastructure (Days 6-15)

**Goal:** Authentication, profiles, and design system

- Complete auth flow (email, OAuth providers)
- Profile management with avatar upload
- Bilingual system (react-i18next + expo-localization)
- Design system components (Storybook)
- Navigation architecture (public/auth/app/admin routes)

**Key Deliverables:**

- Working auth with 4 providers
- Profile CRUD with image upload
- i18n with English + Mizo
- 19 design system components

---

### Phase 2: Public Features (Days 16-28)

**Goal:** Content management and public-facing features

- News system (CRUD + comments + likes)
- Events with date badges and calendar integration
- Articles and newsletter archive
- Photo gallery with lightbox
- Leadership and about pages
- SEO and meta tags

**Key Deliverables:**

- 6 content types working
- Comments and likes system
- Image optimization pipeline
- Public pages with SEO

---

### Phase 3: Membership & Payments (Days 29-38)

**Goal:** Paid membership tiers and payment processing

- Membership tiers (Free, Annual ₹500, Lifetime ₹5000)
- Razorpay integration (webhook-only verification)
- Payment history and receipts
- Member directory (paid members only)
- Membership status management
- WhatsApp/Email notifications

**Key Deliverables:**

- Complete payment flow
- Webhook verification secure
- Member directory searchable
- Notification system working

---

### Phase 4: AI Chatbot (Days 39-50)

**Goal:** RAG-powered bilingual chatbot with escalation

- Knowledge base management with embeddings
- pgvector similarity search
- Gemini API integration
- Rate limiting (5/day free, 30/day paid)
- Message classification (informational/guidance/urgent)
- Human escalation system
- Chat history persistence

**Key Deliverables:**

- RAG chatbot responding accurately
- Escalation queue working
- Rate limits enforced
- Bilingual responses

---

### Phase 5: Admin Dashboard (Days 51-60)

**Goal:** Complete admin and editor functionality

- Admin dashboard with stats
- User management (role assignment, ban)
- Content management (CRUD, scheduling)
- Membership overrides
- Escalation queue management
- Knowledge base editor
- Audit log viewer
- Analytics dashboard

**Key Deliverables:**

- Full admin CRUD working
- Role-based access enforced
- Audit trail complete
- Analytics dashboard live

---

### Phase 6: Polish & Launch (Days 61-67)

**Goal:** Testing, optimization, and deployment

- Comprehensive testing (unit, integration, E2E)
- Performance optimization
- Accessibility audit
- Security review
- Web production deployment
- Mobile internal testing builds (APK + TestFlight if available)
- App store submissions preparation (pending BMA org accounts)
- Launch monitoring

**Key Deliverables:**

- 95%+ test coverage on critical paths
- < 3s page load time
- Web deployed to production (Vercel)
- Mobile builds ready for internal testing
- Mobile public release: Pending BMA org App Store accounts
- Monitoring dashboards active

---

## User Roles & Access Matrix

| Feature             | Guest | User (Free) | Member (Paid) | Editor | Admin |
| ------------------- | ----- | ----------- | ------------- | ------ | ----- |
| View public content | ✅    | ✅          | ✅            | ✅     | ✅    |
| Create account      | ✅    | -           | -             | -      | -     |
| View profile        | -     | ✅          | ✅            | ✅     | ✅    |
| Edit profile        | -     | ✅          | ✅            | ✅     | ✅    |
| Chatbot (5/day)     | -     | ✅          | ✅            | ✅     | ✅    |
| Chatbot (30/day)    | -     | -           | ✅            | ✅     | ✅    |
| Member directory    | -     | -           | ✅            | ✅     | ✅    |
| Escalate to human   | -     | -           | ✅            | ✅     | ✅    |
| Comment on content  | -     | ✅          | ✅            | ✅     | ✅    |
| Like content        | -     | ✅          | ✅            | ✅     | ✅    |
| Create/edit content | -     | -           | -             | ✅     | ✅    |
| Manage users        | -     | -           | -             | -      | ✅    |
| View audit logs     | -     | -           | -             | -      | ✅    |
| Manage escalations  | -     | -           | -             | -      | ✅    |
| Override membership | -     | -           | -             | -      | ✅    |

## Database Schema Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │────<│ memberships │────<│  payments   │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   content   │────<│  comments   │     │    likes    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │ type:             │ self-ref
       │ news, article,    │ (replies)
       │ event, gallery,   │
       │ leadership        ▼
       │              ┌─────────────┐
       │              │  comments   │
       │              └─────────────┘
       │
┌─────────────────────────────────────────────────────┐
│                    AI/CHAT DOMAIN                    │
├─────────────┐     ┌─────────────┐     ┌─────────────┤
│knowledge_   │     │    chat_    │────<│    chat_    │
│    base     │     │conversations│     │  messages   │
└─────────────┘     └──────┬──────┘     └─────────────┘
       │                   │
       │ pgvector          │ 1:N
       │ (768-dim)         ▼
       │              ┌─────────────┐
       │              │ escalations │
       │              └─────────────┘
       │
┌─────────────────────────────────────────────────────┐
│                    SYSTEM DOMAIN                     │
├─────────────┐     ┌─────────────┐     ┌─────────────┤
│ audit_logs  │     │notification_│     │daily_message│
│             │     │    logs     │     │   _counts   │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Tables:** 13 total

- **Core:** profiles, memberships, payments
- **Content:** content, comments, likes
- **AI/Chat:** knowledge_base, chat_conversations, chat_messages, escalations
- **System:** audit_logs, notification_logs, daily_message_counts

## API Endpoints Summary

### Direct Database (PostgREST with RLS)

All CRUD operations on tables go through Supabase client with RLS enforcement.

### Edge Functions (12)

| Function                        | Method | Purpose                 |
| ------------------------------- | ------ | ----------------------- |
| `create-payment-order`          | POST   | Create Razorpay order   |
| `razorpay-webhook`              | POST   | Verify payment (HMAC)   |
| `chat/start`                    | POST   | Initialize conversation |
| `chat/message`                  | POST   | Send message (RAG)      |
| `chat/rate-limit`               | GET    | Check daily quota       |
| `send-notification`             | POST   | WhatsApp/Email          |
| `admin/stats`                   | GET    | Dashboard metrics       |
| `admin/users/:id/role`          | PATCH  | Update user role        |
| `admin/users/:id/membership`    | POST   | Override membership     |
| `admin/escalations/:id/resolve` | PATCH  | Resolve escalation      |
| `admin/knowledge-base`          | POST   | Add KB with embeddings  |
| `translate-strings`             | POST   | CI-only translation     |
| `cron/membership-expiry`        | POST   | Expiry reminders        |

## Testing Strategy

| Type         | Tool        | Coverage Target |
| ------------ | ----------- | --------------- |
| Unit         | Jest + RNTL | 80%             |
| Integration  | Jest + MSW  | Key flows       |
| E2E (Web)    | Playwright  | Critical paths  |
| E2E (Mobile) | Maestro     | Happy paths     |
| Visual       | Storybook   | All components  |

**Critical Paths (95%+ coverage required):**

- Authentication flow
- Payment processing
- Chatbot interaction
- Admin user management

## Success Criteria

### Technical

- [ ] < 3 second page load time
- [ ] 95%+ test coverage on critical paths
- [ ] Zero P0/P1 bugs at launch
- [ ] RLS policies enforced on all tables
- [ ] WCAG 2.1 AA accessibility compliance

### Business

- [ ] Web platform live (March 21, 2026 - BMA Annual Day)
- [ ] Mobile internal testing builds available (APK + TestFlight)
- [ ] Mobile public release ready (pending BMA org App Store accounts)
- [ ] Bilingual fully functional (EN + Mizo)
- [ ] Paid membership flow complete
- [ ] Chatbot answering accurately
- [ ] Admin dashboard operational

### Security

- [ ] Webhook HMAC verification working
- [ ] No client-side payment trust
- [ ] Secure auth with proper session handling
- [ ] Rate limiting enforced
- [ ] Audit logging active

## Risk Mitigation

| Risk                           | Impact   | Mitigation                                                         |
| ------------------------------ | -------- | ------------------------------------------------------------------ |
| Mizo translation quality       | High     | Human review for cultural terms                                    |
| Razorpay webhook failures      | Critical | Idempotency keys, retry logic                                      |
| RAG accuracy                   | High     | Comprehensive knowledge base                                       |
| App store rejection            | Medium   | Pre-submission checklist                                           |
| Performance on low-end devices | Medium   | Lazy loading, image optimization                                   |
| BMA org account delays         | Medium   | Web launches on time; mobile internal testing via APK + TestFlight |
| Apple Sign-In without org      | Low      | Use personal Apple Dev account or defer Apple Sign-In feature      |

## Team Structure

- **Senior Developer (1):** Architecture, core features, code review
- **Junior Developer (1):** UI implementation, testing, documentation
- **Claude AI:** Pair programming, code generation, debugging

## Document References

| Document         | Location                               | Purpose                       |
| ---------------- | -------------------------------------- | ----------------------------- |
| PRD              | `docs/PRD-BMA-2026.md`                 | Product requirements (LOCKED) |
| Database Schema  | `docs/DATABASE-SCHEMA.md`              | Table definitions, RLS        |
| API Design       | `docs/API-DESIGN.md`                   | Edge Functions, endpoints     |
| UI/UX Wireframes | `docs/UI-UX-WIREFRAMES.md`             | Screens, components           |
| Design System    | `docs/DESIGN-SYSTEM-IMPLEMENTATION.md` | Tokens, components            |
| Testing Plan     | `docs/TESTING-IMPLEMENTATION-PLAN.md`  | Test strategy                 |
| CI/CD Plan       | `docs/CI-CD-IMPLEMENTATION-PLAN.md`    | Pipeline setup                |
| Scaffolding      | `docs/PROJECT-SCAFFOLDING-STEPS.md`    | Initial setup guide           |

---

## Next Steps

1. **Start with Phase 0:** [01-PHASE-0-FOUNDATION.md](./01-PHASE-0-FOUNDATION.md)
2. **Track progress:** Use GitHub Issues from [08-GITHUB-ISSUES-TEMPLATE.md](./08-GITHUB-ISSUES-TEMPLATE.md)
3. **Reference specs:** Keep PRD, Database Schema, and API Design open during development

---

_Last Updated: January 2026_
_PRD Version: 1.4 (LOCKED)_
