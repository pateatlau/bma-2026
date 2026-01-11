# API Design Document

## BMA Digital Platform

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Design Phase

---

## Table of Contents

1. [Overview](#1-overview)
2. [API Architecture](#2-api-architecture)
3. [Authentication](#3-authentication)
4. [API Endpoints](#4-api-endpoints)
   - [Auth](#41-auth-endpoints)
   - [Profiles](#42-profile-endpoints)
   - [Memberships](#43-membership-endpoints)
   - [Payments](#44-payment-endpoints)
   - [Content](#45-content-endpoints)
   - [Comments & Likes](#46-comments--likes-endpoints)
   - [Chatbot](#47-chatbot-endpoints)
   - [Admin](#48-admin-endpoints)
   - [Notifications](#49-notification-endpoints)
5. [Edge Functions](#5-edge-functions)
6. [Error Handling](#6-error-handling)
7. [Rate Limiting](#7-rate-limiting)
8. [Webhooks](#8-webhooks)

---

## 1. Overview

### 1.1 API Strategy

The BMA platform uses a **hybrid API approach**:

| Layer               | Technology                     | Use Case                         |
| ------------------- | ------------------------------ | -------------------------------- |
| **Direct Database** | Supabase Client (PostgREST)    | CRUD operations with RLS         |
| **Edge Functions**  | Supabase Edge Functions (Deno) | Complex logic, external APIs     |
| **Webhooks**        | Edge Functions                 | Payment callbacks, notifications |

### 1.2 Design Principles

1. **RLS-First**: Database operations use Row Level Security as primary authorization
2. **Edge Functions for Complexity**: External integrations, multi-step transactions
3. **Type Safety**: All endpoints return typed responses matching database schema
4. **Idempotency**: Payment and state-changing operations support idempotency keys
5. **Bilingual**: Content APIs support English (`en`) and Mizo (`lus`)

### 1.3 Base URLs

| Environment    | URL                                              |
| -------------- | ------------------------------------------------ |
| Production     | `https://<project-ref>.supabase.co`              |
| Edge Functions | `https://<project-ref>.supabase.co/functions/v1` |

---

## 2. API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPS                               │
│                  (Web, iOS, Android)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT                             │
│              (Auth, Database, Storage, Functions)                │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  PostgREST  │      │    Auth     │      │   Edge      │
│  (RLS)      │      │   (JWT)     │      │  Functions  │
└─────────────┘      └─────────────┘      └─────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL                                  │
│            (RLS Policies, Triggers, Functions)                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Direct Database Access (via Supabase Client)

Used for standard CRUD operations where RLS provides sufficient authorization:

```typescript
// Example: Fetch published content
const { data, error } = await supabase
  .from('content')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false });
```

### 2.2 Edge Functions

Used when operations require:

- External API calls (Razorpay, Gemini, Gupshup)
- Multi-step transactions
- Complex business logic
- Webhook handling

---

## 3. Authentication

### 3.1 Auth Methods

| Method         | Provider      | Platform |
| -------------- | ------------- | -------- |
| Email/Password | Supabase Auth | All      |
| Google OAuth   | Supabase Auth | All      |
| Facebook OAuth | Supabase Auth | All      |
| Apple Sign-In  | Supabase Auth | iOS only |

### 3.2 JWT Token Structure

```typescript
interface JWTPayload {
  sub: string; // User ID (UUID)
  email: string;
  app_metadata: {
    provider: string;
  };
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  role: string; // 'authenticated'
  aal: string; // Auth assurance level
  exp: number; // Expiration timestamp
}
```

### 3.3 Session Management

```typescript
// Get current session
const {
  data: { session },
} = await supabase.auth.getSession();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle sign in, sign out, token refresh
});
```

---

## 4. API Endpoints

### 4.1 Auth Endpoints

#### Sign Up with Email

```typescript
// POST: supabase.auth.signUp()
interface SignUpRequest {
  email: string;
  password: string;
  options?: {
    data?: {
      full_name?: string;
    };
  };
}

interface SignUpResponse {
  user: User | null;
  session: Session | null;
}
```

#### Sign In with Email

```typescript
// POST: supabase.auth.signInWithPassword()
interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  user: User;
  session: Session;
}
```

#### OAuth Sign In

```typescript
// POST: supabase.auth.signInWithOAuth()
interface OAuthRequest {
  provider: 'google' | 'facebook' | 'apple';
  options?: {
    redirectTo?: string;
  };
}
```

#### Password Reset

```typescript
// POST: supabase.auth.resetPasswordForEmail()
interface ResetPasswordRequest {
  email: string;
  options?: {
    redirectTo?: string;
  };
}
```

#### Update Password

```typescript
// POST: supabase.auth.updateUser()
interface UpdatePasswordRequest {
  password: string;
}
```

#### Sign Out

```typescript
// POST: supabase.auth.signOut()
// Clears session, optionally from all devices
interface SignOutOptions {
  scope?: 'local' | 'global';
}
```

---

### 4.2 Profile Endpoints

#### Get Current User Profile

```typescript
// GET: supabase.from('profiles').select().eq('id', userId).single()
interface ProfileResponse {
  id: string;
  full_name: string | null;
  phone: string | null;
  photo_url: string | null;
  app_role: 'user' | 'member' | 'editor' | 'admin';
  language_preference: 'en' | 'lus';
  bangalore_address: string | null;
  permanent_address: string | null;
  occupation: OccupationType | null;
  occupation_other: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: RelationshipType | null;
  emergency_contact_relation_other: string | null;
  is_directory_visible: boolean;
  notifications_enabled: boolean;
  notification_channel: 'whatsapp' | 'email' | 'both';
  created_at: string;
  updated_at: string;
}
```

#### Update Profile

```typescript
// PATCH: supabase.from('profiles').update().eq('id', userId)
interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  photo_url?: string;
  language_preference?: 'en' | 'lus';
  bangalore_address?: string;
  permanent_address?: string;
  occupation?: OccupationType;
  occupation_other?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: RelationshipType;
  emergency_contact_relation_other?: string;
  is_directory_visible?: boolean;
  notifications_enabled?: boolean;
  notification_channel?: 'whatsapp' | 'email' | 'both';
}
```

#### Upload Profile Photo

```typescript
// POST: supabase.storage.from('avatars').upload()
// Returns public URL for photo_url field
interface UploadPhotoResponse {
  path: string;
  publicUrl: string;
}
```

#### Get Member Directory (Paid Members Only)

```typescript
// GET: supabase.from('profiles').select().eq('is_directory_visible', true)
// RLS restricts to paid members only
interface DirectoryMember {
  id: string;
  full_name: string;
  photo_url: string | null;
  created_at: string;
}

interface DirectoryResponse {
  members: DirectoryMember[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

### 4.3 Membership Endpoints

#### Get Current Membership

```typescript
// GET: supabase.from('memberships').select().eq('user_id', userId).order('created_at', { ascending: false }).limit(1)
interface MembershipResponse {
  id: string;
  user_id: string;
  tier: 'free' | 'annual' | 'lifetime';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}
```

#### Get Membership History

```typescript
// GET: supabase.from('memberships').select().eq('user_id', userId).order('created_at', { ascending: false })
interface MembershipHistoryResponse {
  memberships: MembershipResponse[];
}
```

---

### 4.4 Payment Endpoints

#### Create Payment Order (Edge Function)

```typescript
// POST: /functions/v1/create-payment-order
interface CreateOrderRequest {
  tier: 'annual' | 'lifetime';
  idempotency_key?: string;
}

interface CreateOrderResponse {
  order_id: string; // Internal order ID
  razorpay_order_id: string; // Razorpay order ID
  amount: number; // Amount in paise
  currency: string; // 'INR'
  key_id: string; // Razorpay key (public)
}
```

#### Get Payment Status

```typescript
// GET: supabase.from('payments').select().eq('id', paymentId).single()
interface PaymentResponse {
  id: string;
  user_id: string;
  membership_id: string | null;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount_paise: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  created_at: string;
}
```

#### Get Payment History

```typescript
// GET: supabase.from('payments').select().eq('user_id', userId).order('created_at', { ascending: false })
interface PaymentHistoryResponse {
  payments: PaymentResponse[];
}
```

---

### 4.5 Content Endpoints

#### List Content

```typescript
// GET: supabase.from('content').select()
interface ContentListParams {
  type?: 'news' | 'article' | 'event' | 'newsletter' | 'gallery' | 'leadership';
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  limit?: number; // Default: 20, Max: 50
  offset?: number;
  order_by?: 'published_at' | 'created_at' | 'event_date';
  order?: 'asc' | 'desc';
  lang?: 'en' | 'lus'; // Filter by language availability
}

interface ContentListItem {
  id: string;
  type: ContentType;
  title_en: string | null;
  title_lus: string | null;
  excerpt_en: string | null;
  excerpt_lus: string | null;
  featured_image_url: string | null;
  event_date: string | null;
  published_at: string | null;
  likes_count: number;
  comments_count: number;
  comments_enabled: boolean;
}

interface ContentListResponse {
  items: ContentListItem[];
  total: number;
  hasMore: boolean;
}
```

#### Get Content Detail

```typescript
// GET: supabase.from('content').select().eq('id', contentId).single()
interface ContentDetailResponse {
  id: string;
  type: ContentType;
  title_en: string | null;
  title_lus: string | null;
  body_en: string | null;
  body_lus: string | null;
  excerpt_en: string | null;
  excerpt_lus: string | null;
  featured_image_url: string | null;
  gallery_urls: string[];
  event_date: string | null;
  event_end_date: string | null;
  event_location: string | null;
  event_location_url: string | null;
  leadership_position: string | null;
  leadership_order: number | null;
  status: ContentStatus;
  published_at: string | null;
  comments_enabled: boolean;
  likes_count: number;
  comments_count: number;
  author: {
    id: string;
    full_name: string;
    photo_url: string | null;
  };
  created_at: string;
  updated_at: string;
  // User-specific
  is_liked?: boolean; // If authenticated
}
```

#### Create Content (Editor/Admin Only)

```typescript
// POST: supabase.from('content').insert()
interface CreateContentRequest {
  type: ContentType;
  title_en?: string;
  title_lus?: string;
  body_en?: string;
  body_lus?: string;
  excerpt_en?: string;
  excerpt_lus?: string;
  featured_image_url?: string;
  gallery_urls?: string[];
  event_date?: string;
  event_end_date?: string;
  event_location?: string;
  event_location_url?: string;
  leadership_position?: string;
  leadership_order?: number;
  status?: 'draft' | 'scheduled' | 'published';
  scheduled_for?: string;
  comments_enabled?: boolean;
}
```

#### Update Content (Editor/Admin Only)

```typescript
// PATCH: supabase.from('content').update().eq('id', contentId)
interface UpdateContentRequest extends Partial<CreateContentRequest> {}
```

#### Delete Content (Soft Delete - Editor/Admin Only)

```typescript
// PATCH: supabase.from('content').update({ deleted_at: new Date() }).eq('id', contentId)
```

#### Get Upcoming Events

```typescript
// GET: supabase.from('content').select().eq('type', 'event').gte('event_date', now())
interface UpcomingEventsResponse {
  events: ContentListItem[];
}
```

---

### 4.6 Comments & Likes Endpoints

#### Get Comments for Content

```typescript
// GET: supabase.from('comments').select().eq('content_id', contentId)
interface CommentListParams {
  limit?: number; // Default: 20, Max: 50
  offset?: number;
  include_replies?: boolean; // Default: true
}

interface CommentResponse {
  id: string;
  content_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    photo_url: string | null;
  };
  replies?: CommentResponse[]; // Only for parent comments
}

interface CommentListResponse {
  comments: CommentResponse[];
  total: number;
  hasMore: boolean;
}
```

#### Create Comment (Authenticated Only)

```typescript
// POST: supabase.from('comments').insert()
interface CreateCommentRequest {
  content_id: string;
  parent_id?: string; // For replies
  body: string;
}
```

#### Update Comment (Own Comment, Within 15 Minutes)

```typescript
// PATCH: supabase.from('comments').update().eq('id', commentId)
// RLS enforces ownership and time limit
interface UpdateCommentRequest {
  body: string;
}
```

#### Delete Comment (Own Comment or Admin/Editor)

```typescript
// PATCH: supabase.from('comments').update({ deleted_at: new Date() }).eq('id', commentId)
```

#### Hide/Unhide Comment (Admin/Editor Only)

```typescript
// PATCH: supabase.from('comments').update().eq('id', commentId)
interface ModerateCommentRequest {
  is_hidden: boolean;
  hidden_reason?: string;
}
```

#### Toggle Like

```typescript
// POST/DELETE: Like or unlike content
// POST: supabase.from('likes').insert({ content_id, user_id })
// DELETE: supabase.from('likes').delete().eq('content_id', contentId).eq('user_id', userId)

interface ToggleLikeResponse {
  liked: boolean;
  likes_count: number;
}
```

#### Check Like Status

```typescript
// GET: supabase.from('likes').select('id').eq('content_id', contentId).eq('user_id', userId).single()
interface LikeStatusResponse {
  is_liked: boolean;
}
```

---

### 4.7 Chatbot Endpoints

#### Start Conversation (Edge Function)

```typescript
// POST: /functions/v1/chat/start
interface StartConversationRequest {
  language?: 'en' | 'lus';
}

interface StartConversationResponse {
  conversation_id: string;
  greeting: string;
  language: 'en' | 'lus';
}
```

#### Send Message (Edge Function)

```typescript
// POST: /functions/v1/chat/message
interface SendMessageRequest {
  conversation_id: string;
  message: string;
}

interface SendMessageResponse {
  message_id: string;
  response: string;
  classification: 'informational' | 'guidance' | 'urgent';
  escalation_triggered?: boolean;
  remaining_messages?: number; // For rate limiting
}
```

#### Get Conversation History

```typescript
// GET: supabase.from('chat_messages').select().eq('conversation_id', conversationId).order('created_at')
interface ConversationHistoryResponse {
  conversation_id: string;
  language: 'en' | 'lus';
  messages: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
  }[];
}
```

#### Get User's Conversations

```typescript
// GET: supabase.from('chat_conversations').select().eq('user_id', userId).order('created_at', { ascending: false })
interface ConversationListResponse {
  conversations: {
    id: string;
    language: 'en' | 'lus';
    message_count: number;
    last_message_at: string | null;
    created_at: string;
  }[];
}
```

#### Check Rate Limit

```typescript
// GET: /functions/v1/chat/rate-limit
interface RateLimitResponse {
  daily_limit: number;
  messages_used: number;
  messages_remaining: number;
  resets_at: string; // ISO timestamp
}
```

---

### 4.8 Admin Endpoints

#### Dashboard Stats (Admin Only)

```typescript
// GET: /functions/v1/admin/stats
interface DashboardStatsResponse {
  users: {
    total: number;
    new_this_month: number;
    active_this_week: number;
  };
  memberships: {
    total_paid: number;
    new_this_month: number;
    expiring_soon: number; // Within 30 days
    revenue_this_month: number;
  };
  content: {
    total_published: number;
    new_this_week: number;
    total_comments: number;
    total_likes: number;
  };
  chatbot: {
    conversations_today: number;
    messages_today: number;
    escalations_pending: number;
  };
}
```

#### User Management (Admin Only)

```typescript
// GET: supabase.from('profiles').select()
interface UserListParams {
  search?: string; // Search by name, email, phone
  role?: AppRole;
  limit?: number;
  offset?: number;
  order_by?: 'created_at' | 'full_name';
  order?: 'asc' | 'desc';
}

interface UserListResponse {
  users: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    photo_url: string | null;
    app_role: AppRole;
    created_at: string;
    membership?: {
      tier: MembershipTier;
      status: MembershipStatus;
      expires_at: string | null;
    };
  }[];
  total: number;
  hasMore: boolean;
}
```

#### Update User Role (Admin Only)

```typescript
// PATCH: /functions/v1/admin/users/:userId/role
interface UpdateUserRoleRequest {
  role: 'user' | 'member' | 'editor' | 'admin';
}
```

#### Override Membership (Admin Only)

```typescript
// POST: /functions/v1/admin/users/:userId/membership
interface OverrideMembershipRequest {
  tier: 'annual' | 'lifetime';
  status: 'active' | 'expired' | 'cancelled';
  expires_at?: string;
  reason: string; // For audit
}
```

#### Escalations Management (Admin Only)

```typescript
// GET: supabase.from('escalations').select()
interface EscalationListParams {
  status?: EscalationStatus;
  limit?: number;
  offset?: number;
}

interface EscalationListResponse {
  escalations: {
    id: string;
    user: {
      id: string;
      full_name: string;
      phone: string | null;
    };
    summary: string | null;
    status: EscalationStatus;
    created_at: string;
    conversation_id: string;
  }[];
  total: number;
}
```

#### Resolve Escalation (Admin Only)

```typescript
// PATCH: /functions/v1/admin/escalations/:escalationId/resolve
interface ResolveEscalationRequest {
  status: 'resolved' | 'dismissed';
  resolution_notes: string;
}
```

#### Audit Logs (Admin Only)

```typescript
// GET: supabase.from('audit_logs').select()
interface AuditLogParams {
  actor_id?: string;
  resource_type?: string;
  action?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

interface AuditLogResponse {
  logs: {
    id: string;
    actor_id: string | null;
    actor_email: string | null;
    action: string;
    resource_type: string;
    resource_id: string | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    created_at: string;
  }[];
  total: number;
}
```

#### Knowledge Base Management (Admin Only)

```typescript
// GET/POST/PATCH/DELETE: supabase.from('knowledge_base')
interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  content_en: string | null;
  content_lus: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

// POST: /functions/v1/admin/knowledge-base (with embedding generation)
interface CreateKnowledgeBaseRequest {
  title: string;
  category: string;
  content_en?: string;
  content_lus?: string;
  source_url?: string;
}
```

---

### 4.9 Notification Endpoints

#### Get Notification Preferences

```typescript
// GET: supabase.from('profiles').select('notifications_enabled, notification_channel')
interface NotificationPreferences {
  notifications_enabled: boolean;
  notification_channel: 'whatsapp' | 'email' | 'both';
}
```

#### Update Notification Preferences

```typescript
// PATCH: supabase.from('profiles').update()
interface UpdateNotificationPreferences {
  notifications_enabled?: boolean;
  notification_channel?: 'whatsapp' | 'email' | 'both';
}
```

---

## 5. Edge Functions

### 5.1 Edge Function List

| Function                    | Route                                               | Purpose                        |
| --------------------------- | --------------------------------------------------- | ------------------------------ |
| `create-payment-order`      | POST `/functions/v1/create-payment-order`           | Create Razorpay order          |
| `razorpay-webhook`          | POST `/functions/v1/razorpay-webhook`               | Handle Razorpay callbacks      |
| `chat-start`                | POST `/functions/v1/chat/start`                     | Start chatbot conversation     |
| `chat-message`              | POST `/functions/v1/chat/message`                   | Process chatbot message (RAG)  |
| `chat-rate-limit`           | GET `/functions/v1/chat/rate-limit`                 | Check message quota            |
| `send-notification`         | POST `/functions/v1/send-notification`              | Send WhatsApp/Email (internal) |
| `admin-stats`               | GET `/functions/v1/admin/stats`                     | Dashboard statistics           |
| `admin-update-role`         | PATCH `/functions/v1/admin/users/:id/role`          | Change user role               |
| `admin-override-membership` | POST `/functions/v1/admin/users/:id/membership`     | Manual membership              |
| `admin-resolve-escalation`  | PATCH `/functions/v1/admin/escalations/:id/resolve` | Resolve escalation             |
| `admin-knowledge-base`      | POST `/functions/v1/admin/knowledge-base`           | Create KB with embeddings      |
| `translate-strings`         | POST `/functions/v1/translate-strings`              | AI translation (CI only)       |
| `membership-cron`           | POST `/functions/v1/cron/membership-expiry`         | Check expiring memberships     |

### 5.2 Edge Function Structure

```
/supabase/functions/
├── _shared/
│   ├── cors.ts           # CORS headers
│   ├── auth.ts           # JWT verification helpers
│   ├── razorpay.ts       # Razorpay client
│   ├── gemini.ts         # Gemini API client
│   ├── gupshup.ts        # WhatsApp client
│   └── resend.ts         # Email client
├── create-payment-order/
│   └── index.ts
├── razorpay-webhook/
│   └── index.ts
├── chat-start/
│   └── index.ts
├── chat-message/
│   └── index.ts
├── chat-rate-limit/
│   └── index.ts
├── send-notification/
│   └── index.ts
├── admin-stats/
│   └── index.ts
├── admin-update-role/
│   └── index.ts
├── admin-override-membership/
│   └── index.ts
├── admin-resolve-escalation/
│   └── index.ts
├── admin-knowledge-base/
│   └── index.ts
├── translate-strings/
│   └── index.ts
└── cron/
    └── membership-expiry/
        └── index.ts
```

### 5.3 Edge Function Example: Chat Message

```typescript
// /supabase/functions/chat-message/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { verifyAuth } from '../_shared/auth.ts';
import { generateEmbedding, generateChatResponse } from '../_shared/gemini.ts';

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify authentication
    const { user, error: authError } = await verifyAuth(req);
    if (authError) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse request body
    const { conversation_id, message } = await req.json();

    // 3. Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 4. Check rate limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('app_role')
      .eq('id', user.id)
      .single();

    const dailyLimit = profile?.app_role === 'member' ? 30 : 5;

    const { data: messageCount } = await supabase
      .from('daily_message_counts')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if ((messageCount?.count || 0) >= dailyLimit) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          remaining_messages: 0,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Get conversation and detect language
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('user_id', user.id)
      .single();

    if (!conversation) {
      return new Response(JSON.stringify({ error: 'Conversation not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Generate query embedding
    const queryEmbedding = await generateEmbedding(message);

    // 7. Vector similarity search
    const embeddingColumn = conversation.language === 'lus' ? 'embedding_lus' : 'embedding_en';

    const { data: relevantDocs } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 3,
      embedding_column: embeddingColumn,
    });

    // 8. Get conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // 9. Generate AI response with RAG context
    const { response, classification, confidence } = await generateChatResponse({
      message,
      language: conversation.language,
      context: relevantDocs,
      history: history?.reverse() || [],
      userRole: profile?.app_role,
    });

    // 10. Store user message
    await supabase.from('chat_messages').insert({
      conversation_id,
      role: 'user',
      content: message,
    });

    // 11. Store assistant response
    const { data: assistantMessage } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id,
        role: 'assistant',
        content: response,
        classification,
        confidence_score: confidence,
        retrieved_doc_ids: relevantDocs?.map((d: any) => d.id) || [],
      })
      .select()
      .single();

    // 12. Update message count
    await supabase.rpc('increment_daily_message_count', { p_user_id: user.id });

    // 13. Handle escalation if urgent and paid member
    let escalationTriggered = false;
    if (classification === 'urgent' && profile?.app_role === 'member') {
      await supabase.from('escalations').insert({
        conversation_id,
        user_id: user.id,
        trigger_message_id: assistantMessage.id,
        status: 'pending',
      });
      escalationTriggered = true;

      // Trigger notification (async, don't await)
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'escalation',
          user_id: user.id,
          conversation_id,
        }),
      });
    }

    // 14. Return response
    return new Response(
      JSON.stringify({
        message_id: assistantMessage.id,
        response,
        classification,
        escalation_triggered: escalationTriggered,
        remaining_messages: dailyLimit - (messageCount?.count || 0) - 1,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat message error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## 6. Error Handling

### 6.1 Error Response Format

```typescript
interface ErrorResponse {
  error: string; // Human-readable message
  code?: string; // Machine-readable code
  details?: any; // Additional context
  request_id?: string; // For debugging
}
```

### 6.2 HTTP Status Codes

| Code | Meaning               | Use Case                 |
| ---- | --------------------- | ------------------------ |
| 200  | OK                    | Successful request       |
| 201  | Created               | Resource created         |
| 400  | Bad Request           | Invalid input            |
| 401  | Unauthorized          | Missing/invalid auth     |
| 403  | Forbidden             | Insufficient permissions |
| 404  | Not Found             | Resource doesn't exist   |
| 409  | Conflict              | Duplicate/conflict       |
| 422  | Unprocessable Entity  | Validation error         |
| 429  | Too Many Requests     | Rate limit exceeded      |
| 500  | Internal Server Error | Server error             |

### 6.3 Error Codes

| Code                  | Description                |
| --------------------- | -------------------------- |
| `AUTH_REQUIRED`       | Authentication required    |
| `INVALID_TOKEN`       | Token expired or invalid   |
| `FORBIDDEN`           | User lacks permission      |
| `NOT_FOUND`           | Resource not found         |
| `VALIDATION_ERROR`    | Input validation failed    |
| `RATE_LIMITED`        | Rate limit exceeded        |
| `PAYMENT_FAILED`      | Payment processing failed  |
| `DUPLICATE_ENTRY`     | Unique constraint violated |
| `MEMBERSHIP_REQUIRED` | Paid membership required   |

---

## 7. Rate Limiting

### 7.1 Rate Limits by Endpoint

| Endpoint         | Limit   | Window   | Notes        |
| ---------------- | ------- | -------- | ------------ |
| Auth endpoints   | 10      | 1 minute | Per IP       |
| Profile updates  | 30      | 1 minute | Per user     |
| Content list     | 100     | 1 minute | Per user     |
| Comments create  | 20      | 1 minute | Per user     |
| Likes toggle     | 60      | 1 minute | Per user     |
| Chatbot messages | 5 or 30 | 24 hours | Free vs Paid |
| Admin endpoints  | 100     | 1 minute | Per user     |

### 7.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

### 7.3 Rate Limit Response

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "details": {
    "limit": 5,
    "remaining": 0,
    "reset_at": "2026-01-13T00:00:00Z"
  }
}
```

---

## 8. Webhooks

### 8.1 Razorpay Webhook

**Endpoint:** `POST /functions/v1/razorpay-webhook`

#### Verification

```typescript
// Web Crypto API implementation for Supabase Edge Functions (Deno)

async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();

  // Import the secret key for HMAC-SHA256
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Compute the HMAC signature
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));

  // Convert to hex string
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}
```

#### Supported Events

| Event              | Action                |
| ------------------ | --------------------- |
| `payment.captured` | Activate membership   |
| `payment.failed`   | Mark payment failed   |
| `refund.created`   | Mark payment refunded |

#### Webhook Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Razorpay   │────▶│  Verify      │────▶│  Check          │
│  Webhook    │     │  Signature   │     │  Idempotency    │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                │
                          ┌─────────────────────┘
                          ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Send       │◀────│  Update      │◀────│  Begin          │
│  Notification│     │  Membership  │     │  Transaction    │
└─────────────┘     └──────────────┘     └─────────────────┘
                          │
                          ▼
                    ┌──────────────┐
                    │  Create      │
                    │  Audit Log   │
                    └──────────────┘
```

### 8.2 Webhook Response Requirements

- Must respond within 5 seconds
- Must return 2xx status for success
- Razorpay retries on non-2xx (up to 3 times)
- Idempotency prevents duplicate processing

---

## Appendix A: Type Definitions

### Enums

```typescript
type AppRole = 'user' | 'member' | 'editor' | 'admin';
type MembershipTier = 'free' | 'annual' | 'lifetime';
type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';
type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
type ContentType = 'news' | 'article' | 'event' | 'newsletter' | 'gallery' | 'leadership';
type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';
type ChatRole = 'user' | 'assistant' | 'system';
type ChatClassification = 'informational' | 'guidance' | 'urgent';
type EscalationStatus = 'pending' | 'acknowledged' | 'resolved' | 'dismissed';
type NotificationChannel = 'whatsapp' | 'email' | 'both';
type LanguageCode = 'en' | 'lus';
type OccupationType =
  | 'student'
  | 'govt_employee'
  | 'private_employee'
  | 'doctor'
  | 'engineer'
  | 'teacher'
  | 'business_owner'
  | 'self_employed'
  | 'homemaker'
  | 'retired'
  | 'other';
type RelationshipType =
  | 'spouse'
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'friend'
  | 'relative'
  | 'other';
```

---

## Appendix B: Database Functions (RPCs)

### match_documents (Vector Search)

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  embedding_column text DEFAULT 'embedding_en'
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF embedding_column = 'embedding_lus' THEN
    RETURN QUERY
    SELECT
      knowledge_base.id,
      knowledge_base.title,
      knowledge_base.content_lus as content,
      1 - (knowledge_base.embedding_lus <=> query_embedding) as similarity
    FROM knowledge_base
    WHERE 1 - (knowledge_base.embedding_lus <=> query_embedding) > match_threshold
    ORDER BY knowledge_base.embedding_lus <=> query_embedding
    LIMIT match_count;
  ELSE
    RETURN QUERY
    SELECT
      knowledge_base.id,
      knowledge_base.title,
      knowledge_base.content_en as content,
      1 - (knowledge_base.embedding_en <=> query_embedding) as similarity
    FROM knowledge_base
    WHERE 1 - (knowledge_base.embedding_en <=> query_embedding) > match_threshold
    ORDER BY knowledge_base.embedding_en <=> query_embedding
    LIMIT match_count;
  END IF;
END;
$$;
```

### increment_daily_message_count

```sql
CREATE OR REPLACE FUNCTION increment_daily_message_count(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO daily_message_counts (user_id, date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = daily_message_counts.count + 1;
END;
$$;
```

---

_End of API Design Document_
