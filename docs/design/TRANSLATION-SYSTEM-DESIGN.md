# Translation System Design Document

**Status:** Draft - Design Decisions Resolved, Awaiting Final Review
**Version:** 1.1
**Last Updated:** 2026-01-14

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Edge Function Design](#edge-function-design)
6. [i18n Infrastructure](#i18n-infrastructure)
7. [Admin UI Design](#admin-ui-design)
8. [CMS Integration](#cms-integration)
9. [Gemini API Integration](#gemini-api-integration)
10. [Open Questions](#open-questions)

---

## Overview

The BMA-2026 app requires a comprehensive translation system supporting bilingual content in English (`en`) and Mizo (`lus`, ISO 639-3). This document outlines the design for:

1. **Static UI strings**: i18n framework for app interface text
2. **CMS content translation**: AI-powered translation with human review
3. **Admin translation review**: Queue-based workflow for quality control
4. **Bidirectional support**: Both English→Mizo and Mizo→English

### Design Principles

- **AI-first, human-verified**: Leverage Gemini for translation, humans for quality
- **Confidence-based routing**: Auto-approve high-confidence translations, queue others for review
- **Cultural sensitivity**: Flag and review terms with cultural/religious significance
- **Audit trail**: Track all translation decisions for accountability

---

## Requirements

### Functional Requirements

| ID    | Requirement                                             | Priority |
| ----- | ------------------------------------------------------- | -------- |
| TR-01 | Support English and Mizo (lus) languages                | P0       |
| TR-02 | Auto-translate CMS content using Gemini API             | P0       |
| TR-03 | Support bidirectional translation (EN↔LUS)              | P0       |
| TR-04 | Track translation confidence scores                     | P0       |
| TR-05 | Auto-approve translations with confidence ≥ 0.85        | P0       |
| TR-06 | Queue low-confidence translations for human review      | P0       |
| TR-07 | Admin UI for reviewing/approving/rejecting translations | P0       |
| TR-08 | Flag cultural/religious terms for mandatory review      | P1       |
| TR-09 | Support editing translations before approval            | P1       |
| TR-10 | Track translation history and reviewer attribution      | P2       |

### Non-Functional Requirements

| ID     | Requirement                             | Target             |
| ------ | --------------------------------------- | ------------------ |
| NFR-01 | Translation response time               | < 5 seconds        |
| NFR-02 | Gemini API rate limiting                | Respect API quotas |
| NFR-03 | Translation accuracy (human evaluation) | > 90% acceptable   |
| NFR-04 | Admin UI accessibility                  | WCAG 2.1 AA        |

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TRANSLATION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Editor creates/edits content                                           │
│       │                                                                 │
│       ▼                                                                 │
│  ┌─────────────────┐                                                    │
│  │ Select source   │    English OR Mizo                                 │
│  │ language        │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Click "Auto-    │───▶│ Edge Function:  │                            │
│  │ Translate"      │    │ translate-content│                           │
│  └─────────────────┘    └────────┬────────┘                            │
│                                  │                                      │
│                                  ▼                                      │
│                         ┌─────────────────┐    ┌─────────────────┐     │
│                         │ Call Gemini API │───▶│ Generate        │     │
│                         │                 │    │ Translation +   │     │
│                         │                 │    │ Confidence      │     │
│                         └────────┬────────┘    └─────────────────┘     │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                       │
│                    │                           │                        │
│                    ▼                           ▼                        │
│           Confidence ≥ 0.85           Confidence < 0.85                │
│                    │                           │                        │
│                    ▼                           ▼                        │
│           ┌───────────────┐           ┌───────────────┐                │
│           │ Auto-approve  │           │ Create pending│                │
│           │ Update content│           │ review record │                │
│           └───────────────┘           └───────┬───────┘                │
│                                               │                        │
│                                               ▼                        │
│                                       ┌───────────────┐                │
│                                       │ Admin reviews │                │
│                                       │ in queue UI   │                │
│                                       └───────┬───────┘                │
│                                               │                        │
│                              ┌────────────────┼────────────────┐       │
│                              ▼                ▼                ▼       │
│                         Approve         Edit+Approve        Reject    │
│                              │                │                │       │
│                              ▼                ▼                ▼       │
│                         Update           Update           Request     │
│                         content          content          re-translate│
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Expo)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ LanguageToggle  │  │ Content Editor  │  │ Admin:          │         │
│  │ Component       │  │ (with translate │  │ Translation     │         │
│  │                 │  │  button)        │  │ Review Queue    │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           ▼                    ▼                    ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      React Hooks Layer                           │   │
│  │  useAppTranslation  │  useContentTranslation  │  useTranslationReviews │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE BACKEND                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Edge Function:  │  │ Database:       │  │ External:       │         │
│  │ translate-      │  │ translation_    │  │ Google Gemini   │         │
│  │ content         │  │ reviews table   │  │ API             │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┴────────────────────┘                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Table: `translation_reviews`

Tracks all translation requests and their review status.

```sql
-- Enums
CREATE TYPE translation_status AS ENUM (
  'pending',        -- Awaiting human review
  'approved',       -- Human approved as-is
  'rejected',       -- Human rejected, needs re-translation
  'auto_approved'   -- System approved (high confidence)
);

CREATE TYPE translation_direction AS ENUM (
  'en_to_lus',      -- English to Mizo
  'lus_to_en'       -- Mizo to English
);

CREATE TYPE translation_source AS ENUM (
  'cms_content',    -- Content table translations
  'ui_strings'      -- Static UI string translations (future)
);

-- Main table
CREATE TABLE translation_reviews (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source identification
  source_type translation_source NOT NULL,
  source_id UUID,                         -- FK to content.id (nullable for UI strings)
  source_field TEXT NOT NULL,             -- 'title', 'body', 'excerpt' or i18n key path

  -- Translation data
  direction translation_direction NOT NULL,
  source_text TEXT NOT NULL,              -- Original text
  translated_text TEXT NOT NULL,          -- AI-generated translation

  -- AI metadata
  confidence_score DECIMAL(3,2),          -- 0.00 to 1.00
  gemini_model TEXT DEFAULT 'gemini-1.5-pro',
  flagged_terms JSONB DEFAULT '[]',       -- Array of flagged terms with reasons
  translation_notes TEXT,                 -- AI notes about translation choices

  -- Review workflow
  status translation_status NOT NULL DEFAULT 'pending',
  review_category TEXT,                   -- 'cultural', 'religious', 'idiom', 'legal', 'emotional'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,                    -- Human reviewer comments
  edited_text TEXT,                       -- If reviewer made edits (null if approved as-is)

  -- Audit timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Indexes for common queries
CREATE INDEX idx_tr_status ON translation_reviews(status);
CREATE INDEX idx_tr_source ON translation_reviews(source_type, source_id);
CREATE INDEX idx_tr_pending ON translation_reviews(created_at DESC) WHERE status = 'pending';
CREATE INDEX idx_tr_reviewer ON translation_reviews(reviewed_by) WHERE reviewed_by IS NOT NULL;
```

### RLS Policies

```sql
ALTER TABLE translation_reviews ENABLE ROW LEVEL SECURITY;

-- Editors and Admins can read all translation reviews
CREATE POLICY "Editors/admins can read translation reviews"
  ON translation_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND app_role IN ('editor', 'admin')
    )
  );

-- Editors and Admins can update translation reviews (for approving/rejecting)
CREATE POLICY "Editors/admins can update translation reviews"
  ON translation_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND app_role IN ('editor', 'admin')
    )
  );

-- Only service role can insert (translations created by Edge Functions)
-- No INSERT policy for authenticated users
```

### Flagged Terms JSON Structure

```json
{
  "flagged_terms": [
    {
      "original": "fellowship",
      "translated": "inlaichinna",
      "reason": "Religious term - may have specific Mizo church usage",
      "category": "religious",
      "alternatives": ["inlaichinna", "inkawmna", "fellowship"]
    },
    {
      "original": "community elder",
      "translated": "khuapi upa",
      "reason": "Cultural term - verify local usage",
      "category": "cultural",
      "alternatives": ["khuapi upa", "upa", "kohhran upa"]
    }
  ]
}
```

---

## Edge Function Design

### Function: `translate-content`

**Endpoint:** `POST /functions/v1/translate-content`

**Authentication:** Requires authenticated user with `editor` or `admin` role.

#### Request Schema

```typescript
interface TranslateContentRequest {
  content_id: string; // UUID of content to translate
  fields: ('title' | 'body' | 'excerpt')[]; // Which fields to translate
  direction: 'en_to_lus' | 'lus_to_en'; // Translation direction
}
```

#### Response Schema

```typescript
interface TranslateContentResponse {
  success: boolean;
  translations: Array<{
    field: 'title' | 'body' | 'excerpt';
    source_text: string;
    translated_text: string;
    confidence: number; // 0.00 to 1.00
    status: 'auto_approved' | 'pending';
    review_id?: string; // If pending, the review record ID
    flagged_terms?: Array<{
      original: string;
      translated: string;
      reason: string;
      category: string;
      alternatives: string[];
    }>;
  }>;
  auto_approved_count: number;
  pending_review_count: number;
}
```

#### Error Responses

| Status | Error                | Description                    |
| ------ | -------------------- | ------------------------------ |
| 401    | `unauthorized`       | Missing or invalid auth token  |
| 403    | `forbidden`          | User is not editor/admin       |
| 404    | `content_not_found`  | Content ID doesn't exist       |
| 400    | `invalid_direction`  | Source language field is empty |
| 429    | `rate_limited`       | Gemini API rate limit hit      |
| 500    | `translation_failed` | Gemini API error               |

#### Processing Logic

```
1. Authenticate request
   └─ Verify JWT, check user role in profiles table

2. Validate input
   └─ Check content_id exists
   └─ Check requested fields have source text
   └─ Validate direction matches available content

3. For each field:
   a. Build translation prompt with context
   b. Call Gemini API
   c. Parse structured response
   d. Evaluate confidence score

   If confidence >= 0.85:
      └─ Update content table directly
      └─ Create auto_approved review record

   If confidence < 0.85:
      └─ Create pending review record
      └─ Do NOT update content table yet

4. Return response with all results
```

---

## i18n Infrastructure

### Package Dependencies

```json
{
  "dependencies": {
    "i18next": "^23.x",
    "react-i18next": "^14.x",
    "expo-localization": "~15.x"
  }
}
```

### Namespace Structure

```
/locales/
├── en/
│   ├── common.json       # Nav, actions, errors, general UI
│   ├── auth.json         # Login, signup, verification screens
│   ├── content.json      # News, events, articles
│   ├── membership.json   # Payment, tiers, directory
│   ├── chat.json         # Chatbot UI
│   └── admin.json        # Admin dashboard
└── lus/
    ├── common.json
    ├── auth.json
    ├── content.json
    ├── membership.json
    ├── chat.json
    └── admin.json
```

### Language Detection Priority

1. User profile `language_preference` (if authenticated)
2. AsyncStorage cached preference (if previously set)
3. Device locale via `expo-localization`
4. Fallback to English

### Hook API

```typescript
interface UseAppTranslationReturn {
  t: TFunction; // Translation function
  i18n: i18n; // i18next instance
  currentLanguage: 'en' | 'lus'; // Current active language
  changeLanguage: (lang: 'en' | 'lus') => Promise<void>; // Switch language
  isEnglish: boolean; // Helper
  isMizo: boolean; // Helper
}

function useAppTranslation(namespace?: string | string[]): UseAppTranslationReturn;
```

---

## Admin UI Design

### Routes

```
/(admin)/translations/
├── index.tsx           # Translation review queue
├── [id].tsx            # Single translation detail/edit
└── history.tsx         # Completed translations (audit)
```

### Queue Screen Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Admin]    Translation Review Queue              [History →]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Filters:                                                     │   │
│  │ [All Types ▼] [All Directions ▼] [All Categories ▼]         │   │
│  │ Sort by: [Date ▼] [Confidence ▼]                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Pending Reviews (12)                    [✓ Bulk Approve Selected] │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ☐ 📄 Article: "Annual General Meeting 2026"                 │   │
│  │ Field: title │ EN → LUS │ 78% confidence                    │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ EN: "Annual General Meeting 2026"                           │   │
│  │ LUS: "Kum Tin General Meeting 2026"                         │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ ⚠️ Flagged: "Annual" (cultural)                             │   │
│  │                                          [Review →]         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ☐ 📄 News: "Community Prayer Meeting"                       │   │
│  │ Field: body │ EN → LUS │ 62% confidence                     │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ EN: "Join us for the monthly prayer meeting..."             │   │
│  │ LUS: "Thla tin tawngtaina inkhawmna ah lo kal ve rawh..."   │   │
│  │ ─────────────────────────────────────────────────────────── │   │
│  │ ⚠️ Flagged: "prayer meeting" (religious)                    │   │
│  │                                          [Review →]         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Load More]                                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Review Detail Screen Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]           Review Translation                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Content: "Annual General Meeting 2026" (Article)                  │
│  Field: title │ Direction: English → Mizo │ Created: Jan 14, 2026  │
│                                                                     │
│  ┌────────────────────────┬────────────────────────┐               │
│  │      SOURCE (EN)       │    TRANSLATION (LUS)   │               │
│  ├────────────────────────┼────────────────────────┤               │
│  │                        │                        │               │
│  │ Annual General         │ ┌────────────────────┐ │               │
│  │ Meeting 2026           │ │ Kum Tin General    │ │               │
│  │                        │ │ Meeting 2026       │ │               │
│  │                        │ └────────────────────┘ │               │
│  │                        │        (editable)      │               │
│  │                        │                        │               │
│  └────────────────────────┴────────────────────────┘               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ⚠️ Flagged Terms                                            │   │
│  │                                                             │   │
│  │ "Annual" → "Kum Tin"                                        │   │
│  │ Reason: Cultural term - verify local usage                  │   │
│  │ Alternatives: [Kum Tin] [Annual] [Kumkhat]                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Confidence Score: 78%  │  Category: cultural                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Reviewer Notes (optional)                                   │   │
│  │ ┌─────────────────────────────────────────────────────────┐ │   │
│  │ │                                                         │ │   │
│  │ └─────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────┐            │
│  │   Reject    │  │ Edit & Approve  │  │   Approve   │            │
│  └─────────────┘  └─────────────────┘  └─────────────┘            │
│                                                                     │
│  (After Reject, show these options:)                               │
│  ┌─────────────────┐  ┌─────────────────┐                         │
│  │ 🔄 Re-translate │  │ ✏️ Edit Manually │                         │
│  └─────────────────┘  └─────────────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Action Behaviors

| Action             | Effect                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Approve**        | Update `content` table with `translated_text`, set review status to `approved`                  |
| **Edit & Approve** | Update `content` table with `edited_text`, set review status to `approved`, store `edited_text` |
| **Reject**         | Set review status to `rejected`, show options: "Re-translate" or "Edit Manually"                |
| **Re-translate**   | (After reject) Trigger new Gemini API call, create new pending review                           |
| **Bulk Approve**   | (From queue) Approve multiple selected items at once                                            |

---

## CMS Integration

### Content Editor Translation Button

When editing content, show a translation action button:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Edit Article                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Title (English) *                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Annual General Meeting 2026                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Title (Mizo)                              [🔄 Auto-Translate]      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ (empty or existing translation)                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Status: ⚠️ Pending Review                                         │
│                                                                     │
│  Body (English) *                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ (rich text editor)                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Body (Mizo)                               [🔄 Auto-Translate]      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ (rich text editor)                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Status: ✅ Auto-Approved                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Translation Status Indicators

| Status        | Badge             | Meaning                                    |
| ------------- | ----------------- | ------------------------------------------ |
| Original      | 🔵 Original       | This is the source language                |
| Auto-Approved | ✅ Auto-Approved  | AI translation accepted (confidence ≥ 85%) |
| Pending       | ⚠️ Pending Review | Awaiting human review                      |
| Approved      | ✅ Approved       | Human reviewed and approved                |
| Rejected      | ❌ Rejected       | Needs re-translation                       |
| Empty         | ⬜ Not Translated | No translation exists                      |

---

## Gemini API Integration

### Model Selection

- **Translation:** `gemini-1.5-pro` (best quality for nuanced translation)
- **Embedding:** `embedding-001` (for future RAG integration)

### Translation Prompt Template

```typescript
const TRANSLATION_SYSTEM_PROMPT = `You are a professional Mizo language translator for the Bangalore Mizo Association (BMA), a community organization for Mizo people living in Bangalore, India.

TRANSLATION GUIDELINES:
1. Use formal, respectful tone appropriate for a community organization
2. Preserve ALL placeholders exactly: {name}, {count}, {{variable}}, %s, etc.
3. Preserve HTML/Markdown formatting tags
4. For cultural or religious terms specific to Mizo tradition, provide the most culturally appropriate translation
5. For idioms and colloquialisms, translate the meaning, not word-for-word

CONFIDENCE SCORING (be honest and accurate):
- 0.90-1.00: Simple, clear translation with no ambiguity
- 0.80-0.89: Standard translation, minor stylistic choices made
- 0.70-0.79: Translation requires some interpretation
- 0.60-0.69: Cultural/contextual elements need human verification
- Below 0.60: Significant uncertainty, definitely needs review

FLAG FOR HUMAN REVIEW when you encounter:
- Cultural terms specific to Mizo tradition (kohhran, sakhua, etc.)
- Religious content (prayers, blessings, scripture references)
- Legal or formal language (terms of service, contracts)
- Emotionally sensitive content
- Idioms or colloquialisms without clear equivalents
- Proper nouns or organization-specific terminology

OUTPUT FORMAT (strict JSON):
{
  "translation": "translated text here",
  "confidence": 0.85,
  "needs_review": false,
  "review_category": null,
  "flagged_terms": [
    {
      "original": "term in source language",
      "translated": "term in translation",
      "reason": "brief explanation why flagged",
      "category": "cultural|religious|idiom|legal|emotional",
      "alternatives": ["option1", "option2"]
    }
  ],
  "notes": "any translator notes about choices made"
}`;

const buildUserPrompt = (
  sourceText: string,
  direction: 'en_to_lus' | 'lus_to_en',
  contentType: string,
  fieldName: string
) => `
TRANSLATION DIRECTION: ${direction === 'en_to_lus' ? 'English to Mizo (Lushai)' : 'Mizo (Lushai) to English'}
CONTENT TYPE: ${contentType}
FIELD: ${fieldName}

SOURCE TEXT:
${sourceText}

Translate the above text following all guidelines. Return ONLY valid JSON.
`;
```

### Rate Limiting Strategy

- **Per-request:** Max 3 translation calls (title, body, excerpt)
- **Batch where possible:** Combine short fields into single API call
- **Retry logic:** Exponential backoff on 429 errors
- **Fallback:** Queue for manual translation if API unavailable

---

## Design Decisions (Resolved)

The following decisions have been confirmed:

### 1. Confidence Threshold

**Decision:** 0.85 (85%)

- Translations with confidence ≥ 85% are auto-approved
- Translations with confidence < 85% go to review queue

### 2. Bulk Operations

**Decision:** Support both bulk and individual operations

- Admin queue UI will include checkboxes for multi-select
- Bulk "Approve Selected" action for high-confidence items
- Individual review remains primary workflow for flagged items

### 3. Re-translation on Reject

**Decision:** Provide both options

- **Manual Re-translate Button**: Triggers new Gemini API call with same content
- **Manual Editing**: Allow reviewer to edit translation directly
- Reviewer can choose either approach based on the rejection reason

### 4. Translation History

**Decision:** Keep only the latest translation

- Previous translations are replaced, not archived
- Simplifies schema and reduces storage
- Audit trail maintained via `reviewed_by`, `reviewed_at` fields

### 5. Notifications on Pending

**Decision:** WhatsApp (primary) or Email (fallback) - No push notifications

- Use existing Gupshup integration for WhatsApp
- Use existing Resend integration for Email fallback
- Notify admins/editors when new translations are pending review
- No in-app push notifications for now

### 6. Offline Handling

**Decision:** Show error and allow manual entry

- Display user-friendly error message if Gemini API unavailable
- Allow editor to manually enter translation in both language fields
- No background queuing for later translation

---

## Appendix: Sample Locale Files

### `/locales/en/common.json` (excerpt)

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
    "settings": "Settings",
    "admin": "Admin"
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
    "loading": "Loading...",
    "translate": "Auto-Translate"
  },
  "language": {
    "english": "English",
    "mizo": "Mizo",
    "switchTo": "Switch to {{language}}"
  }
}
```

### `/locales/lus/common.json` (excerpt)

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
    "settings": "Settings",
    "admin": "Admin"
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
    "loading": "A load mek...",
    "translate": "Auto-Translate"
  },
  "language": {
    "english": "English",
    "mizo": "Mizo",
    "switchTo": "{{language}} ah sawn rawh"
  }
}
```
