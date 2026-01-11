# BMA Database Schema Documentation

## Overview

This document describes the complete database schema for the BMA Digital Platform. The database uses PostgreSQL via Supabase with Row Level Security (RLS) for access control.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BMA DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │  auth.users  │
                         │  (Supabase)  │
                         └──────┬───────┘
                                │ 1:1
                                ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ memberships  │──────▶│   profiles   │◀──────│   payments   │
│              │  N:1  │              │  1:N  │              │
└──────┬───────┘       └──────────────┘       └──────┬───────┘
       │                      │                      │
       │ 1:1                  │                      │
       └──────────────────────┼──────────────────────┘
                              │ (user_id FK)
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
    ▼                         ▼                         ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   content    │       │    chat_     │       │    likes     │
│              │       │conversations │       │              │
└──────┬───────┘       └──────┬───────┘       └──────────────┘
       │                      │
       │ 1:N                  │ 1:N
       ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   comments   │       │    chat_     │       │  escalations │
│              │       │   messages   │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
       │
       │ (self-ref for replies)
       ▼

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ knowledge_   │       │  audit_logs  │       │ notification │
│    base      │       │              │       │    _logs     │
└──────────────┘       └──────────────┘       └──────────────┘

                       ┌──────────────┐
                       │daily_message │
                       │   _counts    │
                       └──────────────┘
```

### Relationships Summary

| Parent             | Child              | Relationship | Description                                  |
| ------------------ | ------------------ | ------------ | -------------------------------------------- |
| auth.users         | profiles           | 1:1          | Each auth user has one profile               |
| profiles           | memberships        | 1:N          | User can have multiple memberships (history) |
| profiles           | payments           | 1:N          | User can have multiple payments              |
| memberships        | payments           | 1:1          | Each membership linked to one payment        |
| profiles           | content            | 1:N          | Author creates multiple content              |
| content            | comments           | 1:N          | Content has multiple comments                |
| content            | likes              | 1:N          | Content has multiple likes                   |
| comments           | comments           | 1:N          | Comments can have replies (1 level)          |
| profiles           | chat_conversations | 1:N          | User has multiple conversations              |
| chat_conversations | chat_messages      | 1:N          | Conversation has multiple messages           |
| chat_conversations | escalations        | 1:N          | Conversation can have escalations            |

## Tables

### Core Tables

#### `profiles`

Extends Supabase auth.users with application-specific data.

| Column                | Type                 | Nullable | Default | Description              |
| --------------------- | -------------------- | -------- | ------- | ------------------------ |
| id                    | UUID                 | NO       | -       | PK, FK to auth.users     |
| full_name             | TEXT                 | YES      | -       | Display name             |
| phone                 | TEXT                 | YES      | -       | Phone number             |
| photo_url             | TEXT                 | YES      | -       | Profile photo URL        |
| app_role              | app_role             | NO       | 'user'  | User role in app         |
| language_preference   | language_code        | NO       | 'en'    | Preferred language       |
| is_directory_visible  | BOOLEAN              | NO       | true    | Show in member directory |
| notifications_enabled | BOOLEAN              | NO       | true    | Receive notifications    |
| notification_channel  | notification_channel | NO       | 'both'  | Preferred channel        |
| created_at            | TIMESTAMPTZ          | NO       | now()   | -                        |
| updated_at            | TIMESTAMPTZ          | NO       | now()   | -                        |

**Indexes**: `app_role`

---

#### `memberships`

Tracks user membership status and history.

| Column          | Type              | Nullable | Default           | Description         |
| --------------- | ----------------- | -------- | ----------------- | ------------------- |
| id              | UUID              | NO       | gen_random_uuid() | PK                  |
| user_id         | UUID              | NO       | -                 | FK to profiles      |
| tier            | membership_tier   | NO       | 'free'            | Membership tier     |
| status          | membership_status | NO       | 'active'          | Current status      |
| starts_at       | TIMESTAMPTZ       | YES      | -                 | Start date          |
| expires_at      | TIMESTAMPTZ       | YES      | -                 | Expiry date         |
| renewed_from_id | UUID              | YES      | -                 | Previous membership |
| created_at      | TIMESTAMPTZ       | NO       | now()             | -                   |
| updated_at      | TIMESTAMPTZ       | NO       | now()             | -                   |

**Indexes**: `user_id`, `status`, `expires_at`

---

#### `payments`

Records all payment transactions.

| Column              | Type           | Nullable | Default           | Description              |
| ------------------- | -------------- | -------- | ----------------- | ------------------------ |
| id                  | UUID           | NO       | gen_random_uuid() | PK                       |
| user_id             | UUID           | NO       | -                 | FK to profiles           |
| membership_id       | UUID           | YES      | -                 | FK to memberships        |
| razorpay_order_id   | TEXT           | NO       | -                 | Razorpay order ID        |
| razorpay_payment_id | TEXT           | YES      | -                 | Razorpay payment ID      |
| razorpay_signature  | TEXT           | YES      | -                 | Webhook signature        |
| amount_paise        | INTEGER        | NO       | -                 | Amount in paise          |
| currency            | TEXT           | NO       | 'INR'             | Currency code            |
| status              | payment_status | NO       | 'pending'         | Payment status           |
| idempotency_key     | TEXT           | YES      | -                 | For duplicate prevention |
| ip_address          | INET           | YES      | -                 | Client IP                |
| user_agent          | TEXT           | YES      | -                 | Client user agent        |
| status_history      | JSONB          | NO       | '[]'              | Status change history    |
| created_at          | TIMESTAMPTZ    | NO       | now()             | -                        |
| updated_at          | TIMESTAMPTZ    | NO       | now()             | -                        |

**Indexes**: `user_id`, `status`, `razorpay_order_id`, `razorpay_payment_id`

---

### Content Tables

#### `content`

Unified content table for all content types.

| Column              | Type           | Nullable | Default           | Description               |
| ------------------- | -------------- | -------- | ----------------- | ------------------------- |
| id                  | UUID           | NO       | gen_random_uuid() | PK                        |
| type                | content_type   | NO       | -                 | Content type              |
| title_en            | TEXT           | YES      | -                 | English title             |
| title_lus           | TEXT           | YES      | -                 | Mizo title                |
| body_en             | TEXT           | YES      | -                 | English body              |
| body_lus            | TEXT           | YES      | -                 | Mizo body                 |
| excerpt_en          | TEXT           | YES      | -                 | English excerpt           |
| excerpt_lus         | TEXT           | YES      | -                 | Mizo excerpt              |
| featured_image_url  | TEXT           | YES      | -                 | Main image                |
| gallery_urls        | JSONB          | YES      | '[]'              | Additional images         |
| event_date          | TIMESTAMPTZ    | YES      | -                 | Event start (events only) |
| event_end_date      | TIMESTAMPTZ    | YES      | -                 | Event end                 |
| event_location      | TEXT           | YES      | -                 | Event venue               |
| event_location_url  | TEXT           | YES      | -                 | Maps link                 |
| leadership_position | TEXT           | YES      | -                 | Position title            |
| leadership_order    | INTEGER        | YES      | -                 | Display order             |
| status              | content_status | NO       | 'draft'           | Publish status            |
| published_at        | TIMESTAMPTZ    | YES      | -                 | Publish date              |
| scheduled_for       | TIMESTAMPTZ    | YES      | -                 | Scheduled publish         |
| comments_enabled    | BOOLEAN        | NO       | true              | Allow comments            |
| likes_count         | INTEGER        | NO       | 0                 | Cached like count         |
| comments_count      | INTEGER        | NO       | 0                 | Cached comment count      |
| author_id           | UUID           | NO       | -                 | FK to profiles            |
| deleted_at          | TIMESTAMPTZ    | YES      | -                 | Soft delete               |
| created_at          | TIMESTAMPTZ    | NO       | now()             | -                         |
| updated_at          | TIMESTAMPTZ    | NO       | now()             | -                         |

**Indexes**: `type`, `status`, `published_at`, `author_id`, `event_date`, `deleted_at`

---

#### `comments`

User comments on content.

| Column        | Type        | Nullable | Default           | Description            |
| ------------- | ----------- | -------- | ----------------- | ---------------------- |
| id            | UUID        | NO       | gen_random_uuid() | PK                     |
| content_id    | UUID        | NO       | -                 | FK to content          |
| user_id       | UUID        | NO       | -                 | FK to profiles         |
| parent_id     | UUID        | YES      | -                 | FK to comments (reply) |
| body          | TEXT        | NO       | -                 | Comment text           |
| is_hidden     | BOOLEAN     | NO       | false             | Hidden by moderator    |
| hidden_by     | UUID        | YES      | -                 | Moderator who hid      |
| hidden_at     | TIMESTAMPTZ | YES      | -                 | When hidden            |
| hidden_reason | TEXT        | YES      | -                 | Reason for hiding      |
| deleted_at    | TIMESTAMPTZ | YES      | -                 | Soft delete            |
| created_at    | TIMESTAMPTZ | NO       | now()             | -                      |
| updated_at    | TIMESTAMPTZ | NO       | now()             | -                      |

**Indexes**: `content_id`, `user_id`, `parent_id`, `created_at`

**Constraint**: No deep nesting (parent cannot have a parent)

---

#### `likes`

User likes on content.

| Column     | Type        | Nullable | Default           | Description    |
| ---------- | ----------- | -------- | ----------------- | -------------- |
| id         | UUID        | NO       | gen_random_uuid() | PK             |
| content_id | UUID        | NO       | -                 | FK to content  |
| user_id    | UUID        | NO       | -                 | FK to profiles |
| created_at | TIMESTAMPTZ | NO       | now()             | -              |

**Indexes**: `content_id`, `user_id`

**Constraint**: Unique (content_id, user_id)

---

### Chatbot Tables

#### `knowledge_base`

Documents for RAG-based chatbot.

| Column        | Type        | Nullable | Default           | Description          |
| ------------- | ----------- | -------- | ----------------- | -------------------- |
| id            | UUID        | NO       | gen_random_uuid() | PK                   |
| title         | TEXT        | NO       | -                 | Document title       |
| category      | TEXT        | NO       | -                 | Category (faq, etc.) |
| content_en    | TEXT        | YES      | -                 | English content      |
| content_lus   | TEXT        | YES      | -                 | Mizo content         |
| embedding_en  | vector(768) | YES      | -                 | English embedding    |
| embedding_lus | vector(768) | YES      | -                 | Mizo embedding       |
| source_url    | TEXT        | YES      | -                 | Source reference     |
| created_at    | TIMESTAMPTZ | NO       | now()             | -                    |
| updated_at    | TIMESTAMPTZ | NO       | now()             | -                    |

**Indexes**: `embedding_en` (ivfflat), `embedding_lus` (ivfflat), `category`

---

#### `chat_conversations`

Chatbot conversation sessions.

| Column          | Type          | Nullable | Default           | Description           |
| --------------- | ------------- | -------- | ----------------- | --------------------- |
| id              | UUID          | NO       | gen_random_uuid() | PK                    |
| user_id         | UUID          | NO       | -                 | FK to profiles        |
| language        | language_code | NO       | 'en'              | Conversation language |
| message_count   | INTEGER       | NO       | 0                 | Total messages        |
| last_message_at | TIMESTAMPTZ   | YES      | -                 | Last activity         |
| created_at      | TIMESTAMPTZ   | NO       | now()             | -                     |
| updated_at      | TIMESTAMPTZ   | NO       | now()             | -                     |

**Indexes**: `user_id`, `created_at`

---

#### `chat_messages`

Individual chat messages.

| Column            | Type                | Nullable | Default           | Description               |
| ----------------- | ------------------- | -------- | ----------------- | ------------------------- |
| id                | UUID                | NO       | gen_random_uuid() | PK                        |
| conversation_id   | UUID                | NO       | -                 | FK to conversations       |
| role              | chat_role           | NO       | -                 | user/assistant/system     |
| content           | TEXT                | NO       | -                 | Message text              |
| classification    | chat_classification | YES      | -                 | AI classification         |
| confidence_score  | DECIMAL(3,2)        | YES      | -                 | Classification confidence |
| retrieved_doc_ids | UUID[]              | YES      | -                 | RAG doc references        |
| created_at        | TIMESTAMPTZ         | NO       | now()             | -                         |

**Indexes**: `conversation_id`, `created_at`

---

#### `escalations`

Help desk escalations to admins.

| Column             | Type              | Nullable | Default           | Description            |
| ------------------ | ----------------- | -------- | ----------------- | ---------------------- |
| id                 | UUID              | NO       | gen_random_uuid() | PK                     |
| conversation_id    | UUID              | NO       | -                 | FK to conversations    |
| user_id            | UUID              | NO       | -                 | FK to profiles         |
| trigger_message_id | UUID              | YES      | -                 | Message that triggered |
| summary            | TEXT              | YES      | -                 | AI summary             |
| status             | escalation_status | NO       | 'pending'         | Current status         |
| resolved_by        | UUID              | YES      | -                 | Admin who resolved     |
| resolved_at        | TIMESTAMPTZ       | YES      | -                 | Resolution time        |
| resolution_notes   | TEXT              | YES      | -                 | Admin notes            |
| whatsapp_sent_at   | TIMESTAMPTZ       | YES      | -                 | WhatsApp notification  |
| email_sent_at      | TIMESTAMPTZ       | YES      | -                 | Email notification     |
| created_at         | TIMESTAMPTZ       | NO       | now()             | -                      |
| updated_at         | TIMESTAMPTZ       | NO       | now()             | -                      |

**Indexes**: `status`, `user_id`, `created_at`

---

### Admin Tables

#### `audit_logs`

Comprehensive audit trail.

| Column        | Type        | Nullable | Default           | Description       |
| ------------- | ----------- | -------- | ----------------- | ----------------- |
| id            | UUID        | NO       | gen_random_uuid() | PK                |
| actor_id      | UUID        | YES      | -                 | FK to profiles    |
| actor_email   | TEXT        | YES      | -                 | Email (preserved) |
| action        | TEXT        | NO       | -                 | Action type       |
| resource_type | TEXT        | NO       | -                 | Resource affected |
| resource_id   | UUID        | YES      | -                 | Resource ID       |
| old_values    | JSONB       | YES      | -                 | Previous state    |
| new_values    | JSONB       | YES      | -                 | New state         |
| ip_address    | INET        | YES      | -                 | Client IP         |
| user_agent    | TEXT        | YES      | -                 | Client UA         |
| created_at    | TIMESTAMPTZ | NO       | now()             | -                 |

**Indexes**: `actor_id`, `resource_type`, `resource_id`, `action`, `created_at`

---

#### `notification_logs`

Sent notification tracking.

| Column          | Type                 | Nullable | Default           | Description        |
| --------------- | -------------------- | -------- | ----------------- | ------------------ |
| id              | UUID                 | NO       | gen_random_uuid() | PK                 |
| user_id         | UUID                 | YES      | -                 | FK to profiles     |
| recipient_phone | TEXT                 | YES      | -                 | Phone number       |
| recipient_email | TEXT                 | YES      | -                 | Email address      |
| channel         | notification_channel | NO       | -                 | Delivery channel   |
| template_name   | TEXT                 | NO       | -                 | Template used      |
| template_params | JSONB                | YES      | -                 | Template variables |
| sent_at         | TIMESTAMPTZ          | YES      | -                 | Send time          |
| delivered_at    | TIMESTAMPTZ          | YES      | -                 | Delivery time      |
| failed_at       | TIMESTAMPTZ          | YES      | -                 | Failure time       |
| failure_reason  | TEXT                 | YES      | -                 | Error message      |
| external_id     | TEXT                 | YES      | -                 | Provider ID        |
| created_at      | TIMESTAMPTZ          | NO       | now()             | -                  |

**Indexes**: `user_id`, `created_at`

---

#### `daily_message_counts`

Rate limiting for chatbot.

| Column  | Type    | Nullable | Default           | Description    |
| ------- | ------- | -------- | ----------------- | -------------- |
| id      | UUID    | NO       | gen_random_uuid() | PK             |
| user_id | UUID    | NO       | -                 | FK to profiles |
| date    | DATE    | NO       | CURRENT_DATE      | Date           |
| count   | INTEGER | NO       | 0                 | Message count  |

**Indexes**: `(user_id, date)` unique

---

## Enums

| Enum                 | Values                                                |
| -------------------- | ----------------------------------------------------- |
| app_role             | user, member, editor, admin                           |
| membership_tier      | free, annual, lifetime                                |
| membership_status    | active, expired, cancelled, pending                   |
| payment_status       | pending, processing, success, failed, refunded        |
| content_type         | news, article, event, newsletter, gallery, leadership |
| content_status       | draft, scheduled, published, archived                 |
| chat_role            | user, assistant, system                               |
| chat_classification  | informational, guidance, urgent                       |
| escalation_status    | pending, acknowledged, resolved, dismissed            |
| notification_channel | whatsapp, email, both                                 |
| language_code        | en, lus                                               |

---

## Key RLS Policies

### Profiles

- Users can read/update their own profile
- Admins can read/update all profiles
- Paid members can read directory-visible member profiles

### Content

- Everyone can read published content
- Editors/Admins can read all content
- Editors/Admins can create/update content
- Only Admins can delete content

### Comments

- Everyone can read non-hidden comments
- Authenticated users can create comments
- Users can edit their own comments (15 min window)
- Editors/Admins can moderate (hide/delete)

### Payments & Memberships

- Users can read their own
- Admins can read all
- Only service role can modify (via webhooks)

### Audit Logs

- Only Admins can read all logs
- Editors can read their own actions

---

## Triggers

| Trigger                | Table         | Event         | Function                       |
| ---------------------- | ------------- | ------------- | ------------------------------ |
| update\_\*\_updated_at | Most tables   | UPDATE        | Sets updated_at to now()       |
| on_like_insert         | likes         | INSERT        | Increments content.likes_count |
| on_like_delete         | likes         | DELETE        | Decrements content.likes_count |
| on_comment_change      | comments      | INSERT/DELETE | Updates content.comments_count |
| on_auth_user_created   | auth.users    | INSERT        | Creates profile record         |
| on_chat_message_insert | chat_messages | INSERT        | Updates conversation counts    |

---

## Extensions

- `uuid-ossp`: UUID generation
- `pgcrypto`: Encryption functions
- `vector`: pgvector for RAG embeddings (768 dimensions for Gemini)

---

## Migration Files

1. `00001_initial_schema.sql` - Tables, enums, functions, triggers
2. `00002_rls_policies.sql` - Row Level Security policies

## Usage

```bash
# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts

# Seed data (development only)
psql -f supabase/seed/seed.sql
```
