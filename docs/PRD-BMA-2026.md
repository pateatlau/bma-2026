# Product Requirements Document (PRD)

## Universal Digital Platform for Bangalore Mizo Association (BMA)

**Version:** 1.4
**Last Updated:** January 2026
**Phase:** Phase-1 (Production Launch)
**Audience:** Architecture & Engineering

---

## Table of Contents

1. [Purpose & Goals](#1-purpose--goals)
2. [Platforms & Applications](#2-platforms--applications)
3. [Internationalization (i18n)](#3-internationalization-i18n)
4. [User Roles & Access Control](#4-user-roles--access-control)
5. [Main App - Functional Requirements](#5-main-app---functional-requirements)
6. [Membership & Payment Flow](#6-membership--payment-flow)
7. [Help Desk Chatbot](#7-help-desk-chatbot)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Editor Dashboard](#9-editor-dashboard)
10. [Notifications](#10-notifications)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Technical Decisions](#12-technical-decisions)
13. [Out of Scope (Phase-1)](#13-out-of-scope-phase-1)
14. [Success Criteria](#14-success-criteria)
15. [Architecture Expectations](#15-architecture-expectations)

---

## 1. Purpose & Goals

Build a unified digital platform for Bangalore Mizo Association (BMA) that serves as the primary communication, membership, and support channel for the Mizo community in Bangalore.

### Primary Goals

- **Accessibility**: Single codebase serving Web, Android, and iOS
- **Bilingual**: Full English and Mizo language support throughout
- **Low Cost**: India-first, optimized for non-profit budget
- **Secure**: Role-based access with data-layer enforcement
- **Scalable**: Support 100k+ users without architectural changes
- **Maintainable**: Operable by 1-2 developers

### Target Scale

| Milestone | Users    | Timeline   |
| --------- | -------- | ---------- |
| Launch    | 5,000    | Day 1      |
| Growth    | 30,000   | 3-6 months |
| Mature    | 100,000+ | 12 months  |

---

## 2. Platforms & Applications

### 2.1 Main App (User-Facing)

Single shared codebase deployed to:

- **Web**: Expo Web (Vercel hosting)
- **Android**: Expo (Google Play Store)
- **iOS**: Expo (Apple App Store)

**Target Users**: General public, free users, paid members

### 2.2 Admin & Editor Dashboard (Integrated)

Admin and Editor dashboards are **integrated within the main app** as role-protected routes.

- **Platform**: Same Expo app (Web, Android, iOS)
- **Hosting**: Same Vercel deployment
- **Access**: Role-based route protection (Admin, Editor)

**Route Structure**:

```text
/app
  /(public)          # Public pages (no auth)
  /(auth)            # Auth screens
  /(app)             # Logged-in user screens
  /(admin)           # Admin-only routes (lazy loaded)
    /dashboard       # Admin home with metrics
    /users           # User management
    /content         # Content management (shared with Editor)
    /memberships     # Membership management
    /chatbot         # Chatbot & escalation management
    /audit           # Audit trail
    /analytics       # Analytics dashboard
    /settings        # System settings
```

**Rationale for Integration**:

- Single codebase reduces maintenance overhead for small team (2 developers)
- Faster development timeline (no separate app setup)
- Shared authentication and session management
- Route-based code splitting keeps bundle lean for regular users
- Admin routes lazy-loaded only when accessed by admin/editor users

**Editor Access**:

- Editors access `/(admin)/content` and limited `/(admin)/dashboard`
- Other admin routes return 403 or redirect for Editor role

---

## 3. Internationalization (i18n)

### 3.1 Supported Languages

| Language | Code  | Priority | Notes                            |
| -------- | ----- | -------- | -------------------------------- |
| English  | `en`  | Primary  | Default language                 |
| Mizo     | `lus` | Primary  | Low-resource language, ISO 639-3 |

### 3.2 Implementation Requirements

#### User Interface

- All UI text, labels, buttons, and messages must be translatable
- Language toggle accessible from header/settings on all screens
- User language preference persisted (local storage + user profile)
- Default to device language if supported, else English

#### Content

- All CMS content (News, Events, Articles, Newsletter) supports dual-language entries
- Content can have English-only, Mizo-only, or both versions
- Display logic: Show user's preferred language, fallback to available language
- Content creation UI must support both language inputs

#### Help Desk Chatbot

- Chatbot must understand and respond in both English and Mizo
- Language detection on user input
- Response in same language as user query
- Knowledge base indexed in both languages
- Escalation notifications include original language context

#### Technical Approach

```text
/locales
  /en
    common.json      # Shared UI strings
    auth.json        # Authentication screens
    membership.json  # Membership & payment
    chatbot.json     # Chatbot UI & messages
  /lus
    common.json
    auth.json
    membership.json
    chatbot.json
```

- Use `i18next` or `expo-localization` with `react-i18next`
- Lazy load language files
- RTL not required (Mizo uses Latin script)

### 3.3 Mizo Language Considerations

Mizo is a low-resource language with limited NLP tooling:

- **Chatbot AI**: Google Gemini selected for better Mizo language support; may require few-shot prompting
- **Translation**: Professional human translation required (no reliable MT)
- **Spell Check**: Not available - accept user input as-is
- **Search**: Simple keyword matching; advanced NLP limited

### 3.4 Translation Workflow (AI-First, Human-Verified)

Given BMA's limited resources, Gemini handles the bulk of translation work with human review for cultural accuracy.

```text
┌─────────────────────────────────────────────────────────────┐
│              AI-FIRST TRANSLATION WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

Developer adds/updates      Gemini auto-translates      BMA reviews flagged
English strings (en.json) ─▶ to Mizo (lus.json)     ─▶  items only
                               │                           │
                               ▼                           ▼
                          ┌─────────┐              ┌─────────────┐
                          │ Simple  │──────────────▶│ Auto-commit │
                          │ strings │              └─────────────┘
                          └─────────┘
                               │
                          ┌─────────┐              ┌─────────────┐
                          │ Complex │──────────────▶│ Flag for    │
                          │ strings │              │ BMA review  │
                          └─────────┘              └─────────────┘
```

**Process**:

1. Developer adds/updates keys in `en.json`
2. CI script auto-translates to Mizo using Gemini API
3. Gemini classifies each translation:
   - **High confidence** (greetings, buttons, simple labels): Auto-commit to `lus.json`
   - **Needs review** (cultural terms, idioms, sensitive content): Flag for BMA
4. BMA reviews only flagged items (~20% of translations)
5. Both files stay in sync via CI check

**Gemini Translation Prompt Strategy**:

```text
System: You are a Mizo language translator for the Bangalore Mizo Association.
Translate UI strings from English to Mizo. Follow these rules:
- Use formal, respectful tone appropriate for community app
- Preserve placeholders like {name}, {count}, etc.
- For cultural/religious terms, provide literal translation + flag for review
- For ambiguous terms, provide 2 options and flag for review
- Output JSON with: { translation, confidence: "high"|"needs_review", notes }
```

**Review Categories** (flagged for BMA):

| Category          | Example              | Why Review Needed                |
| ----------------- | -------------------- | -------------------------------- |
| Cultural terms    | "Community elder"    | May have specific Mizo term      |
| Religious content | "Prayer meeting"     | Cultural sensitivity             |
| Idioms            | "Get started"        | Direct translation may sound odd |
| Legal/formal      | "Terms of service"   | Must be accurate                 |
| Emotional         | "We're here for you" | Tone matters                     |

**Benefits**:

- ~80% of translations fully automated
- BMA reviews only culturally-sensitive content
- Faster iteration on UI changes
- Consistent terminology via Gemini's context window
- Human oversight where it matters most

---

## 4. User Roles & Access Control

### 4.1 Role Definitions

| Role              | Description                 | App Access                     |
| ----------------- | --------------------------- | ------------------------------ |
| **Super Admin**   | System owner, full access   | Main App + Admin Dashboard     |
| **Admin**         | Organization administrators | Main App + Admin Dashboard     |
| **Editor**        | Content managers            | Main App + Editor Dashboard    |
| **Member (Paid)** | Paying members              | Main App (full features)       |
| **User (Free)**   | Registered free users       | Main App (limited features)    |
| **Guest**         | Unauthenticated visitors    | Main App (public content only) |

### 4.2 Permission Matrix

| Feature            | Guest | Free User    | Paid Member | Editor | Admin |
| ------------------ | ----- | ------------ | ----------- | ------ | ----- |
| Public content     | ✅    | ✅           | ✅          | ✅     | ✅    |
| Authentication     | ❌    | ✅           | ✅          | ✅     | ✅    |
| User profile       | ❌    | ✅           | ✅          | ✅     | ✅    |
| Comment on content | ❌    | ✅           | ✅          | ✅     | ✅    |
| Like content       | ❌    | ✅           | ✅          | ✅     | ✅    |
| Chatbot access     | ❌    | ✅ (limited) | ✅ (full)   | ✅     | ✅    |
| Chatbot escalation | ❌    | ❌           | ✅          | ✅     | ✅    |
| Member directory   | ❌    | ❌           | ✅          | ❌     | ✅    |
| Content management | ❌    | ❌           | ❌          | ✅     | ✅    |
| User management    | ❌    | ❌           | ❌          | ❌     | ✅    |
| System settings    | ❌    | ❌           | ❌          | ❌     | ✅    |
| Audit logs         | ❌    | ❌           | ❌          | ❌     | ✅    |
| Analytics          | ❌    | ❌           | ❌          | ❌     | ✅    |

### 4.3 Authorization Enforcement

Authorization is enforced at **three layers** with the database as the primary security boundary:

#### Data Layer (Primary - RLS)

PostgreSQL Row Level Security (RLS) policies enforce access control at the database level.

```sql
-- Example: profiles table with app_role
CREATE TYPE app_role AS ENUM ('user', 'member', 'editor', 'admin');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  app_role app_role DEFAULT 'user',
  membership_status TEXT,
  -- other fields
);

-- RLS Policy: Users can only read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND app_role = 'admin'
    )
  );
```

**Key RLS Principles**:

- Every table has RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- No table relies solely on application-level checks
- Sensitive tables (audit_logs, payments) restricted to admin role
- Member directory visible only to paid members and admins

#### API Layer (Secondary)

- Supabase Auth JWT verification on all Edge Functions
- Role extracted from JWT claims or profiles table
- Additional business logic validation

#### UI Layer (Defense in Depth)

- Conditional rendering based on user role
- Route guards for admin/editor sections
- **Not a security boundary** - UI checks are for UX only

---

## 5. Main App - Functional Requirements

### 5.1 Public Pages (No Auth Required)

| Page          | Description                  | Content Type     |
| ------------- | ---------------------------- | ---------------- |
| Home          | Landing page with highlights | Static + Dynamic |
| About         | Organization information     | CMS              |
| History       | Historical timeline          | CMS              |
| Leadership    | Current leadership profiles  | CMS              |
| Photo Gallery | Image collections            | Media + CMS      |
| News          | News articles list & detail  | CMS              |
| Events        | Upcoming & past events       | CMS              |
| Articles      | Long-form content            | CMS              |
| Newsletter    | Newsletter archive           | CMS              |

### 5.2 Authentication

#### Supported Methods

- Email/password registration & login
- Google OAuth
- Facebook OAuth
- Apple Sign-In (iOS only)

#### Requirements

- Secure session handling (Supabase Auth)
- Email verification required for email/password
- Password reset flow
- Session persistence across app restarts
- Automatic token refresh
- Logout from all devices option

### 5.3 User Profile

- View and edit personal information
- Profile photo upload (with image optimization)
- Membership status display
- Payment history (paid members)
- Language preference setting
- Notification preferences

### 5.4 Member Directory (Paid Members Only)

- Searchable list of paid members
- Basic profile information (name, photo, join date)
- Pagination required (50 per page)
- Privacy controls (members can opt-out of directory)

### 5.5 Comments & Likes (Logged-in Users)

Logged-in users (Free, Member, Editor, Admin) can engage with content.

#### Supported Content Types

| Content Type  | Comments | Likes |
| ------------- | -------- | ----- |
| News          | ✅       | ✅    |
| Articles      | ✅       | ✅    |
| Events        | ✅       | ✅    |
| Newsletter    | ❌       | ✅    |
| Photo Gallery | ❌       | ✅    |

#### Comment Features

- Text-only comments (no media attachments in Phase-1)
- Bilingual support (users comment in their preferred language)
- Nested replies (1 level deep maximum)
- Edit own comments (within 15 minutes)
- Delete own comments
- Admin/Editor can delete any comment (moderation)
- Soft delete with audit trail
- Pagination (20 comments per page, newest first)

#### Like Features

- One like per user per content item
- Toggle like/unlike
- Like count displayed on content
- No anonymous likes (must be logged in)

#### Moderation

- Admins can disable comments on specific content
- Admins can hide/unhide individual comments
- Reported comments queue (Phase-2, out of scope for now)

### 5.6 Offline-Lite Mode

Given the target audience extends to rural areas in Mizoram, Karnataka, and other regions with limited connectivity, the app supports **read-only offline access** for previously viewed content.

#### Target Users

| Location        | Connectivity | Offline Need |
| --------------- | ------------ | ------------ |
| Bangalore urban | Good         | Low          |
| Rural Karnataka | Variable     | Medium       |
| Rural Mizoram   | Often poor   | High         |
| Other NE states | Variable     | Medium       |
| Outside India   | Variable     | Medium       |

#### Offline Capabilities

| Feature                    | Offline | Notes                      |
| -------------------------- | ------- | -------------------------- |
| Home page                  | ✅      | Cached app shell           |
| About, History, Leadership | ✅      | Static content cached      |
| News/Articles (viewed)     | ✅      | Last 20 viewed items       |
| Events (upcoming)          | ✅      | Next 30 days               |
| User profile               | ✅      | Own profile data           |
| Membership status          | ✅      | Critical for access checks |
| **Chatbot**                | ❌      | Requires API               |
| **Payments**               | ❌      | Requires online            |
| **Member directory**       | ❌      | Privacy + size concerns    |
| **Comments/Likes**         | ❌      | Write operations need sync |
| **Admin dashboard**        | ❌      | Not needed offline         |

#### Technical Approach (Stale-While-Revalidate)

```text
┌─────────────────────────────────────────────────────────────┐
│                    OFFLINE-LITE ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Supabase   │◀───▶│  TanStack    │◀───▶│   UI Layer   │
│   (Remote)   │     │  Query Cache │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │              ┌─────▼─────┐
       │              │  AsyncStorage │
       │              │  (Persist)    │
       │              └───────────────┘
       │
  [Online]  ──▶  Fetch fresh data, update cache
  [Offline] ──▶  Serve from cache, show "offline" banner
```

#### Implementation

- **TanStack Query** with persistence plugin (`@tanstack/query-async-storage-persister`)
- **Stale-while-revalidate**: Show cached data immediately, refresh in background when online
- **NetInfo listener**: Detect connectivity changes, show offline banner
- **Cache TTL**: 24 hours for content, 7 days for static pages
- **No write operations offline**: Forms disabled with "You're offline" message

#### User Experience

| State                  | Behavior                                       |
| ---------------------- | ---------------------------------------------- |
| **Online**             | Normal operation, fresh data                   |
| **Offline (cached)**   | Show cached content + "You're offline" banner  |
| **Offline (no cache)** | Show "Content unavailable offline" placeholder |
| **Reconnecting**       | Auto-refresh stale data in background          |

#### Estimated Effort

| Task                                 | Days         |
| ------------------------------------ | ------------ |
| TanStack Query persistence setup     | 1-2          |
| NetInfo integration + offline banner | 1            |
| Stale-while-revalidate patterns      | 2            |
| Disable write operations offline     | 1            |
| Testing network transitions          | 1-2          |
| **Total**                            | **5-7 days** |

---

## 6. Membership & Payment Flow

### 6.1 Membership Tiers

| Tier            | Price    | Duration  | Benefits                           |
| --------------- | -------- | --------- | ---------------------------------- |
| Free            | ₹0       | Unlimited | Public content, limited chatbot    |
| Annual Member   | ₹300-350 | 12 months | Full access, directory, escalation |
| Lifetime Member | TBD      | Lifetime  | All annual benefits, permanent     |

> Note: Annual membership ₹300-350 (exact price to be finalized). Lifetime membership pricing TBD.

### 6.2 Payment Flow - User Journey

```text
┌─────────────────────────────────────────────────────────────────┐
│                    MEMBERSHIP PAYMENT FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. USER INITIATES
   ┌──────────┐    ┌──────────────┐    ┌─────────────┐
   │  User    │───▶│  Select      │───▶│  Review     │
   │  Profile │    │  Membership  │    │  Order      │
   └──────────┘    │  Tier        │    │  Summary    │
                   └──────────────┘    └─────────────┘
                                              │
2. PAYMENT PROCESSING                         ▼
   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
   │  Razorpay   │◀───│  Create      │◀───│  Initiate   │
   │  Checkout   │    │  Order       │    │  Payment    │
   │  (UPI/Card) │    │  (Server)    │    │             │
   └─────────────┘    └──────────────┘    └─────────────┘
         │
         ▼
3. VERIFICATION & ACTIVATION
   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
   │  Payment    │───▶│  Webhook     │───▶│  Verify     │
   │  Complete   │    │  Received    │    │  Signature  │
   └─────────────┘    └──────────────┘    └─────────────┘
                                                │
                                                ▼
   ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
   │  Send       │◀───│  Activate    │◀───│  Update     │
   │  Receipt    │    │  Membership  │    │  User Role  │
   └─────────────┘    └──────────────┘    └─────────────┘
```

### 6.3 Payment Technical Requirements

#### Async-First Design Principle

**Critical**: Client-side payment confirmation is **never trusted**. Membership activation happens **only** via server-side webhook verification.

```text
┌─────────────────────────────────────────────────────────────┐
│  CLIENT SIDE                     │  SERVER SIDE (TRUSTED)   │
├──────────────────────────────────┼──────────────────────────┤
│  1. Create order (API call)      │  → Create pending order  │
│  2. Open Razorpay checkout       │                          │
│  3. User completes payment       │                          │
│  4. Show "Processing..." UI      │                          │
│  5. Poll for status (optional)   │  ← Webhook received      │
│                                  │  ← Verify signature      │
│                                  │  ← Activate membership   │
│  6. Show success (after confirm) │  ← Update order status   │
└──────────────────────────────────┴──────────────────────────┘
```

#### Razorpay Integration

- **Primary**: UPI (most common in India)
- **Secondary**: Credit/Debit cards, Net Banking, Wallets
- Server-side order creation (never expose API keys)
- Client-side checkout using Razorpay SDK
- **Never activate membership on client callback** - wait for webhook

#### Webhook Handling (Supabase Edge Function)

```typescript
// POST /functions/v1/razorpay-webhook

1. Verify webhook signature (HMAC SHA256 with Razorpay secret)
2. Parse event type (payment.captured, payment.failed, etc.)
3. Check idempotency (payment_id already processed?)
4. Validate order exists and amount matches
5. Update membership status in transaction:
   - Set membership.status = 'active'
   - Set membership.starts_at = now()
   - Set membership.expires_at = now() + 1 year
   - Update user.app_role = 'member' (if upgrading from 'user')
6. Create audit log entry
7. Trigger confirmation notification (WhatsApp + Email)
8. Return 200 OK immediately (webhook must respond fast)
```

#### Idempotency Requirements

- Store `razorpay_payment_id` with processing status
- Use database transaction to prevent race conditions
- Prevent duplicate membership activation
- Handle webhook retries gracefully (Razorpay retries on non-200)

#### Audit Trail

Every payment must log:

- User ID
- Order ID
- Payment ID
- Amount
- Status transitions
- Timestamps
- IP address (for fraud detection)

### 6.4 Membership Lifecycle

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Free    │───▶│  Pending │───▶│  Active  │───▶│  Expired │
│  User    │    │  Payment │    │  Member  │    │  Member  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                │               │
                     │                │               │
                     ▼                ▼               ▼
                ┌──────────┐    ┌──────────┐    ┌──────────┐
                │  Failed  │    │  Renewed │    │  Renewal │
                │  Payment │    │          │    │  Prompt  │
                └──────────┘    └──────────┘    └──────────┘
```

### 6.5 Renewal Flow

- Send reminder 30 days before expiry
- Send reminder 7 days before expiry
- Send expiry notice on expiry date
- Grace period: 7 days (maintain access)
- After grace period: Downgrade to free user

---

## 7. Help Desk Chatbot

### 7.1 Purpose

Provide a conversational interface for:

1. Answering questions about BMA (knowledge base)
2. Offering guidance and support
3. Escalating urgent requests to Admins (paid members only)

**Not** an emergency service or professional support system.

### 7.2 Access Rules

| User Type   | Access | Message Limit | Escalation |
| ----------- | ------ | ------------- | ---------- |
| Guest       | ❌ No  | —             | —          |
| Free User   | ✅ Yes | 5/day         | ❌ No      |
| Paid Member | ✅ Yes | 30/day        | ✅ Yes     |

### 7.3 Bilingual Requirements

- Detect input language (English or Mizo)
- Respond in same language as query
- Knowledge base searchable in both languages
- Maintain conversation context across language switches
- Escalation messages preserve original language

### 7.4 Capabilities

#### Knowledge Queries

- Answer questions from curated knowledge base
- Topics: Organization info, events, membership, procedures
- Response: "I don't have information about that" if unknown

#### Assistance Queries

- General guidance and emotional support
- Direction to appropriate resources
- Empathetic, bounded responses

#### Escalation (Paid Members Only)

AI classifies queries into:

| Category             | Action                      |
| -------------------- | --------------------------- |
| Informational        | Answer from knowledge base  |
| Needs Guidance       | Provide supportive response |
| Urgent Help Required | Trigger admin escalation    |

Escalation triggers admin notification via WhatsApp (primary) and email (fallback).

### 7.5 Safeguards

- Clear disclaimers displayed before first use
- No emergency guarantees
- No medical, legal, or professional advice
- Rate limiting enforced
- Conservative escalation thresholds
- Free users never trigger admin notifications
- Explicit consent before escalation

### 7.6 Technical Architecture (RAG-Based)

The chatbot uses **Retrieval-Augmented Generation (RAG)** to ground responses in official BMA documents. This is critical for Mizo language accuracy.

#### Why RAG (Not Simple Prompt Injection)

| Approach         | Problem                                             |
| ---------------- | --------------------------------------------------- |
| Prompt Injection | Token limits, stale data, hallucinations            |
| **RAG**          | Retrieves relevant docs, grounds responses in facts |

#### RAG Pipeline

```text
┌─────────────────────────────────────────────────────────────┐
│                    RAG CHATBOT ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────────┐    ┌─────────────────────┐
│  User    │───▶│  Chat UI     │───▶│  Language           │
│  Input   │    │  Component   │    │  Detection          │
└──────────┘    └──────────────┘    └─────────────────────┘
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTION                 │
├──────────────────────────────────────────────────────────┤
│  1. Rate Limit Check                                      │
│  2. User Context (role, membership status)                │
│  3. Conversation History                                  │
│  4. Generate Query Embedding (Gemini Embedding API)       │
│  5. Vector Similarity Search (pgvector)                   │
│  6. Retrieve Top-K Relevant Documents                     │
│  7. Construct Prompt with Retrieved Context               │
│  8. Google Gemini API Call (with grounded context)        │
│  9. Response Classification                               │
│  10. Escalation Logic (if applicable)                     │
└──────────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────┐    ┌──────────────┐    ┌─────────────────────┐
│  Store   │    │  Return      │    │  Escalation         │
│  Message │    │  Response    │    │  (if triggered)     │
└──────────┘    └──────────────┘    └─────────────────────┘
```

#### Knowledge Base Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base documents table
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_en TEXT,           -- English content
  content_lus TEXT,          -- Mizo content
  embedding_en vector(768),  -- English embedding
  embedding_lus vector(768), -- Mizo embedding
  category TEXT,             -- e.g., 'constitution', 'faq', 'procedures'
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast similarity search
CREATE INDEX ON knowledge_base
  USING ivfflat (embedding_en vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX ON knowledge_base
  USING ivfflat (embedding_lus vector_cosine_ops)
  WITH (lists = 100);
```

#### RAG Query Flow

1. **User asks**: "BMA-in membership fee eng nge?" (What is BMA membership fee?)
2. **Detect language**: Mizo (`lus`)
3. **Generate embedding**: Convert query to vector using Gemini Embedding API
4. **Similarity search**: Find top-3 matching documents in `embedding_lus`
5. **Construct prompt**: Include retrieved documents as context
6. **Generate response**: Gemini responds in Mizo, grounded in official docs
7. **Store & return**: Save conversation, return response

#### Knowledge Base Content (Provided by BMA)

| Category     | Examples                              |
| ------------ | ------------------------------------- |
| Constitution | BMA bylaws, membership rules          |
| FAQs         | Common questions and answers          |
| Procedures   | How to join, pay fees, contact admins |
| Events       | Recurring events, traditions          |
| History      | Organization founding, milestones     |

---

## 8. Admin Dashboard

### 8.1 Overview

Integrated within the main app as role-protected routes under `/(admin)`.

**Access**: Admin role only (Editors have limited access - see Section 9)
**Authentication**: Same Supabase Auth (role-verified)
**UI**: Optimized for desktop but functional on mobile

### 8.2 Features

#### 8.2.1 Dashboard Home

- Key metrics overview
- Recent activity feed
- Pending actions (new members, escalations)
- Quick links to common tasks

#### 8.2.2 User Management

| Feature             | Description                                  |
| ------------------- | -------------------------------------------- |
| User List           | Paginated, searchable, filterable            |
| User Detail         | View full profile, membership history        |
| Role Assignment     | Promote/demote users (Admin, Editor, Member) |
| Membership Override | Manual activation/deactivation               |
| User Search         | By name, email, phone, membership ID         |
| Bulk Actions        | Export, bulk email, bulk status change       |
| User Suspension     | Temporarily disable account                  |

#### 8.2.3 Content Management

| Content Type  | Actions                                 |
| ------------- | --------------------------------------- |
| News          | Create, Edit, Delete, Publish/Unpublish |
| Events        | Create, Edit, Delete, Manage RSVPs      |
| Articles      | Create, Edit, Delete, Publish/Unpublish |
| Newsletter    | Create, Edit, Delete, Send              |
| Photo Gallery | Upload, Organize, Delete                |
| Leadership    | Add, Edit, Remove, Reorder              |

All content supports:

- Draft/Published states
- Scheduled publishing
- Bilingual content (English + Mizo)
- Soft delete with recovery option
- Version history
- Enable/disable comments per content item
- View and moderate comments (hide/delete)

#### 8.2.4 Membership Management

- View all memberships (active, expired, pending)
- Payment history per member
- Manual membership activation
- Membership reports (new, renewed, expired by period)
- Revenue reports

#### 8.2.5 Chatbot Management

- View all conversations
- Escalation queue
- Escalation history with resolution status
- Knowledge base management
- Chatbot analytics (usage, common queries, escalation rate)

#### 8.2.6 Audit Trail

| Logged Events              |
| -------------------------- |
| User role changes          |
| Content create/edit/delete |
| Membership status changes  |
| Payment events             |
| Admin actions              |
| Login/logout events        |
| Failed login attempts      |
| Settings changes           |

Audit log features:

- Searchable by date, user, action type
- Exportable (CSV)
- Retention: 2 years minimum

#### 8.2.7 Analytics Dashboard

| Metric Category | Examples                                             |
| --------------- | ---------------------------------------------------- |
| Users           | Total, new signups, active users, churn              |
| Membership      | Conversion rate, renewal rate, revenue               |
| Content         | Page views, popular content, engagement              |
| Chatbot         | Messages/day, escalation rate, response satisfaction |
| Platform        | Web vs mobile split, device types                    |

#### 8.2.8 Settings

- Organization profile
- Membership pricing
- Notification templates
- Admin user management
- System configuration

### 8.3 UI/UX Requirements

- Responsive but optimized for desktop
- Data tables with sorting, filtering, pagination
- Bulk action support
- Export functionality (CSV, PDF)
- Real-time updates for critical data
- Consistent with main app branding

---

## 9. Editor Dashboard

### 9.1 Overview

Subset of Admin Dashboard accessible to Editor role. Editors access the same `/(admin)` routes but with restricted views.

**Access**: Role-restricted views within `/(admin)` routes
**Authentication**: Same Supabase Auth (editor role verified)
**Accessible Routes**: `/(admin)/dashboard`, `/(admin)/content`

### 9.2 Features (Editor-Only Scope)

| Feature                | Editor Access               |
| ---------------------- | --------------------------- |
| Dashboard Home         | ✅ (content metrics only)   |
| User Management        | ❌                          |
| **Content Management** | ✅ Full access              |
| Membership Management  | ❌                          |
| Chatbot Management     | ❌                          |
| Audit Trail            | ✅ (own actions only)       |
| Analytics              | ✅ (content analytics only) |
| Settings               | ❌                          |

### 9.3 Content Workflow

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Draft   │───▶│  Review  │───▶│ Published│───▶│ Archived │
│          │    │ (optional)│    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
      │                               │
      │                               │
      ▼                               ▼
┌──────────┐                    ┌──────────┐
│ Scheduled│                    │  Deleted │
│          │                    │ (soft)   │
└──────────┘                    └──────────┘
```

---

## 10. Notifications

### 10.1 Channels

| Channel  | Provider                        | Use Case              |
| -------- | ------------------------------- | --------------------- |
| WhatsApp | Gupshup (WhatsApp Business API) | Primary transactional |
| Email    | Supabase/Resend                 | Fallback, receipts    |

### 10.2 Notification Types

| Event                      | WhatsApp | Email         |
| -------------------------- | -------- | ------------- |
| Welcome (new signup)       | ✅       | ✅            |
| Payment successful         | ✅       | ✅ (receipt)  |
| Payment failed             | ✅       | ✅            |
| Membership expiry reminder | ✅       | ✅            |
| Membership expired         | ✅       | ✅            |
| Escalation to admin        | ✅       | ✅ (fallback) |
| Password reset             | ❌       | ✅            |

### 10.3 WhatsApp Template Messages

All WhatsApp messages must use pre-approved templates:

- `welcome_message`
- `payment_success`
- `payment_failed`
- `membership_reminder`
- `membership_expired`
- `escalation_alert`

Templates must support both English and Mizo.

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metric            | Target        |
| ----------------- | ------------- |
| Initial page load | < 3 seconds   |
| API response time | < 500ms (p95) |
| Chatbot response  | < 3 seconds   |
| Image load time   | < 2 seconds   |

### 11.2 Scalability

- Horizontal scaling via Supabase
- CDN for static assets
- Image optimization and lazy loading
- Pagination on all list views (max 50 items)
- Database indexing on query-heavy columns

### 11.3 Security

| Requirement            | Implementation                          |
| ---------------------- | --------------------------------------- |
| No secrets in frontend | Environment variables, server-side only |
| Authentication         | Supabase Auth with JWT                  |
| Authorization          | RLS policies on all tables              |
| Webhook verification   | HMAC signature validation               |
| Input validation       | Server-side validation required         |
| XSS prevention         | Content sanitization                    |
| CSRF protection        | Built into Supabase                     |
| Rate limiting          | Per-user, per-endpoint limits           |
| Audit logging          | All sensitive operations                |

### 11.4 Reliability

- 99.5% uptime target
- Automated backups (daily)
- Error monitoring (Sentry)
- Health check endpoints
- Graceful degradation

### 11.5 Compliance

- Clear privacy policy
- Terms of service
- Chatbot disclaimers
- Explicit consent for data collection
- Data minimization principle
- GDPR-ready (if needed for future)

---

## 12. Technical Decisions

### 12.1 Stack Overview

| Layer            | Technology                                           |
| ---------------- | ---------------------------------------------------- |
| Frontend         | Expo (React Native) - Web, iOS, Android              |
| Admin/Editor UI  | Integrated in main app (role-protected routes)       |
| Backend          | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Payments         | Razorpay                                             |
| AI/Chatbot       | Google Gemini API (better Mizo language support)     |
| Notifications    | Gupshup (WhatsApp), Resend (Email)                   |
| Monitoring       | Sentry                                               |
| Hosting (Web)    | Vercel                                               |
| Hosting (Mobile) | Google Play, Apple App Store                         |
| CI/CD            | GitHub Actions                                       |
| Repository       | Single Expo app (npm)                                |
| Type Safety      | Supabase CLI generated types                         |

### 12.2 Type Safety Strategy

Database types are auto-generated from Supabase schema to ensure type safety across the app:

```bash
# Generate TypeScript types from Supabase schema
# Project ID can be found in Supabase Dashboard > Project Settings > General
# Or use: npx supabase projects list
npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > lib/database.types.ts
```

**Usage**:

```typescript
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MembershipInsert = Database['public']['Tables']['memberships']['Insert'];
```

**CI Integration**:

- Types regenerated on every schema migration
- CI fails if types are out of sync with database
- Prevents runtime errors from schema drift

### 12.3 Project Structure

```text
/bma-2026
├── /app                   # Expo Router app directory
│   ├── /(public)          # Public pages
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

### 12.3 Database Schema (High-Level)

```text
users
├── id (uuid, PK)
├── email
├── role (enum: admin, editor, member, user)
├── language_preference (en, lus)
├── created_at
└── updated_at

profiles
├── user_id (FK)
├── full_name
├── phone
├── photo_url
├── is_directory_visible
└── ...

memberships
├── id (uuid, PK)
├── user_id (FK)
├── tier (enum: free, annual, lifetime)
├── status (enum: active, expired, cancelled)
├── starts_at
├── expires_at
└── ...

payments
├── id (uuid, PK)
├── user_id (FK)
├── membership_id (FK)
├── razorpay_order_id
├── razorpay_payment_id
├── amount
├── status (enum: pending, success, failed)
├── idempotency_key
└── ...

content (news, events, articles, newsletter)
├── id (uuid, PK)
├── type (enum)
├── title_en, title_lus
├── body_en, body_lus
├── status (enum: draft, published, archived)
├── comments_enabled (boolean, default true)
├── published_at
├── author_id (FK)
└── ...

comments
├── id (uuid, PK)
├── content_id (FK)
├── user_id (FK)
├── parent_id (FK, nullable for replies)
├── body
├── is_hidden (boolean, for moderation)
├── created_at
├── updated_at
└── deleted_at (soft delete)

likes
├── id (uuid, PK)
├── content_id (FK)
├── user_id (FK)
├── created_at
└── UNIQUE(content_id, user_id)

chat_conversations
├── id (uuid, PK)
├── user_id (FK)
├── language
├── created_at
└── ...

chat_messages
├── id (uuid, PK)
├── conversation_id (FK)
├── role (enum: user, assistant)
├── content
├── classification
├── created_at
└── ...

escalations
├── id (uuid, PK)
├── conversation_id (FK)
├── user_id (FK)
├── status (enum: pending, resolved, dismissed)
├── resolved_by
├── resolved_at
└── ...

audit_logs
├── id (uuid, PK)
├── actor_id (FK)
├── action
├── resource_type
├── resource_id
├── metadata (jsonb)
├── ip_address
├── created_at
└── ...
```

---

## 13. Out of Scope (Phase-1)

| Feature                       | Reason                                             |
| ----------------------------- | -------------------------------------------------- |
| Push notifications            | Complexity, can add later                          |
| Full offline mode (with sync) | Offline-Lite sufficient; full sync adds complexity |
| Offline write operations      | Sync conflicts too complex for Phase-1             |
| Live human chat takeover      | Phase-2 feature                                    |
| Advanced analytics            | Basic analytics sufficient for launch              |
| Multi-organization support    | Single org for now                                 |
| SMS notifications             | WhatsApp preferred in India                        |
| Payment refunds (automated)   | Manual process via Razorpay dashboard              |
| Comment reporting system      | Phase-2 feature                                    |
| Media attachments in comments | Phase-2 feature                                    |

---

## 14. Success Criteria

### 14.1 Launch Criteria

- [ ] All three platforms live (Web, Android, iOS)
- [ ] Bilingual UI functional (English + Mizo)
- [ ] Authentication working (all providers)
- [ ] Paid membership flow complete
- [ ] Chatbot functional with escalation
- [ ] Admin dashboard operational
- [ ] Editor dashboard operational
- [ ] Notifications working (WhatsApp + Email)
- [ ] RLS policies enforced on all tables
- [ ] Monitoring and alerting active
- [ ] Offline-Lite mode functional (cached content viewable offline)

### 14.2 Quality Criteria

- [ ] Zero critical security vulnerabilities
- [ ] < 1% payment failure rate (excluding user abandonment)
- [ ] < 3 second page load time
- [ ] 80%+ test coverage on critical paths (auth, payments, membership)
- [ ] All accessibility guidelines met (WCAG 2.1 AA)

### 14.3 Operational Criteria

- [ ] Runbook documentation complete
- [ ] Backup and recovery tested
- [ ] On-call process defined
- [ ] Cost within budget

---

## 15. Architecture Expectations

For the engineering team (Claude Code):

1. **System Architecture**: Propose detailed system design
2. **Data Models**: Complete schema with relationships
3. **RLS Policies**: Define all row-level security policies
4. **API Design**: Edge function specifications
5. **i18n Architecture**: Translation loading and fallback strategy
6. **Chatbot Design**: RAG pipeline, prompt engineering approach
7. **Payment Integration**: Detailed Razorpay integration design
8. **CI/CD Pipeline**: Build, test, deploy workflow
9. **Monitoring Strategy**: Logging, alerting, dashboards
10. **Risk Assessment**: Identify risks and mitigations

**Guiding Principles**:

- Prefer simplicity over novelty
- Design for maintainability by small team
- Optimize for read-heavy workload
- Security at every layer
- Cost-conscious decisions

---

## Appendix A: Glossary

| Term          | Definition                                            |
| ------------- | ----------------------------------------------------- |
| BMA           | Bangalore Mizo Association                            |
| Mizo          | Ethnic group from Mizoram, India; also their language |
| RLS           | Row Level Security (PostgreSQL feature)               |
| UPI           | Unified Payments Interface (India payment system)     |
| Edge Function | Serverless function running close to users            |
| RAG           | Retrieval-Augmented Generation (AI technique)         |

---

## Appendix B: Decisions & Clarifications

### Business Decisions

| Question                   | Answer                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| **Membership Pricing**     | Annual: ₹300-350 (to be finalized). Lifetime: TBD                 |
| **Knowledge Base Content** | BMA will provide the initial content for the chatbot              |
| **Mizo Translations**      | BMA will handle professional translation work                     |
| **Admin Users**            | 8-10 Admins, 3-5 Editors at launch                                |
| **Launch Timeline**        | ~65-67 days (1 experienced + 1 junior developer with Claude Opus) |

> Timeline includes +5-7 days for Offline-Lite implementation.

### Architectural Decisions

| Decision                 | Choice                   | Rationale                                                                      |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------ |
| **AI Provider**          | Google Gemini API        | Better Mizo language support than OpenAI                                       |
| **Admin Dashboard**      | Integrated in main app   | Faster development, single codebase for 2-person team                          |
| **Chatbot Architecture** | RAG with pgvector        | Grounds responses in official BMA docs, critical for Mizo accuracy             |
| **Payment Verification** | Async webhook-only       | Never trust client-side; server-side webhook is source of truth                |
| **Authorization**        | RLS as primary           | Database-level security; UI is defense-in-depth only                           |
| **Type Safety**          | Supabase CLI types       | Auto-generated from schema; no monorepo overhead needed                        |
| **i18n Workflow**        | AI-first, human-verified | Gemini auto-translates ~80%; BMA reviews only flagged cultural/sensitive items |
| **Offline Support**      | Offline-Lite (read-only) | Stale-while-revalidate caching; no complex sync logic                          |

### Rejected Alternatives

| Rejected Option         | Reason                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| Turborepo monorepo      | Overkill for single app; adds complexity for 2-person team       |
| Separate admin app      | Slower development; integrated approach sufficient               |
| OpenAI GPT              | Lower Mizo language quality compared to Gemini                   |
| Simple prompt injection | Token limits, hallucinations; RAG preferred                      |
| Full offline mode       | Sync complexity too high; Offline-Lite sufficient for user needs |

### Remaining Open Questions

1. **Lifetime Membership Price**: Final pricing to be determined by BMA
2. **Annual Membership Exact Price**: ₹300 or ₹350 (or in between)

---

## End of PRD
