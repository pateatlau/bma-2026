# Phase 0: Foundation (Days 1-5)

## Overview

Phase 0 establishes the foundational infrastructure for the BMA 2026 platform. This phase focuses on setting up Supabase, implementing the database schema with RLS policies, configuring CI/CD pipelines, and preparing the development environment.

**Duration:** 5 days
**Prerequisites:** None (starting phase)
**Deliverables:**

- Supabase project with complete schema
- RLS policies on all tables
- CI/CD pipeline running
- Development environment documented

---

## Task Breakdown

### Task 0.1: Supabase Project Setup

**GitHub Issue:** #1 - Setup Supabase Project

#### 0.1.1: Create Supabase Project

**Files:** N/A (Supabase Dashboard)

1. Create new Supabase project at https://supabase.com
2. Select region: `ap-south-1` (Mumbai) for India users
3. Generate strong database password
4. Wait for project provisioning (~2 minutes)
5. Save project credentials securely

**Acceptance Criteria:**

- [ ] Project created and accessible
- [ ] Dashboard shows healthy status
- [ ] Can connect via Supabase client

#### 0.1.2: Configure Authentication Providers

**Files:** N/A (Supabase Dashboard)

> **Note:** Individual/personal accounts can be used for all OAuth providers during development. See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md#using-individual-accounts-for-development) for details on account setup and transfer strategy.

1. Enable Email/Password authentication
   - Enable email confirmations
   - Set site URL for redirects
   - Configure email templates
2. Enable Google OAuth (✅ Individual account OK)
   - Create Google Cloud OAuth credentials (personal Google Cloud project)
   - Add authorized redirect URI
   - Configure in Supabase
3. Enable Facebook OAuth (✅ Individual account OK)
   - Create Facebook App (personal Facebook Developer account)
   - Configure OAuth settings
   - Add to Supabase
4. Enable Apple OAuth (⚠️ Requires decision - see note below)
   - **Option A:** Use personal Apple Developer account ($99/yr) - full functionality
   - **Option B:** Defer Apple Sign-In until BMA org account ready
   - **Option C:** Skip Apple Sign-In (Google + Facebook + Email only)

> **Decision Required:** Apple Sign-In approach must be decided before Phase 0 starts. See [00-PREREQUISITES.md Section 6.0](../implementation-requirements/00-PREREQUISITES.md#60-blocker-app-store-account-prerequisites) for options.

**Acceptance Criteria:**

- [ ] Email/Password auth working
- [ ] Google OAuth configured
- [ ] Facebook OAuth configured
- [ ] Apple OAuth configured OR documented as deferred/skipped
- [ ] Email templates customized with BMA branding

#### 0.1.3: Configure Storage Buckets

**Files:** N/A (Supabase Dashboard)

1. Create `avatars` bucket
   - Public access: No
   - File size limit: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
2. Create `content-media` bucket
   - Public access: Yes (with RLS)
   - File size limit: 10MB
   - Allowed MIME types: image/_, video/_
3. Create `knowledge-base` bucket
   - Public access: No
   - File size limit: 20MB
   - Allowed MIME types: application/pdf, text/plain, text/markdown

**Acceptance Criteria:**

- [ ] All 3 buckets created
- [ ] Size limits configured
- [ ] MIME type restrictions active

---

### Task 0.2: Database Schema Implementation

**GitHub Issue:** #2 - Implement Database Schema

**Reference:** [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md)

#### 0.2.1: Create Enums

**Files:** `supabase/migrations/001_create_enums.sql`

```sql
-- Migration: 001_create_enums.sql
-- Description: Create all enum types for the BMA platform

-- App roles
CREATE TYPE app_role AS ENUM ('user', 'member', 'editor', 'admin');

-- Membership
CREATE TYPE membership_tier AS ENUM ('free', 'annual', 'lifetime');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Content
CREATE TYPE content_type AS ENUM ('news', 'article', 'event', 'newsletter', 'gallery', 'leadership');
CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- Chat
CREATE TYPE chat_classification AS ENUM ('informational', 'guidance', 'urgent');
CREATE TYPE escalation_status AS ENUM ('pending', 'acknowledged', 'resolved', 'dismissed');

-- Notifications
CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'push');

-- Languages
CREATE TYPE language_code AS ENUM ('en', 'lus');
```

**Acceptance Criteria:**

- [ ] All 9 enums created
- [ ] Migration runs without errors

#### 0.2.2: Create Core Tables

**Files:** `supabase/migrations/002_create_core_tables.sql`

Create tables in order:

1. `profiles` - User profiles extending auth.users
2. `memberships` - Membership records
3. `payments` - Payment transactions

```sql
-- Migration: 002_create_core_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  full_name_lus TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  bio_lus TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  role app_role DEFAULT 'user' NOT NULL,
  preferred_language language_code DEFAULT 'en' NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  is_directory_visible BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Memberships table
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier membership_tier NOT NULL,
  status membership_status DEFAULT 'pending' NOT NULL,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL, -- in paise
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  payment_method TEXT,
  receipt_url TEXT,
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
```

**Acceptance Criteria:**

- [ ] All 3 tables created with correct columns
- [ ] Foreign keys properly set up
- [ ] Indexes created for query performance

#### 0.2.3: Create Content Tables

**Files:** `supabase/migrations/003_create_content_tables.sql`

Create tables:

1. `content` - All content types (news, articles, events, etc.)
2. `comments` - User comments with replies
3. `likes` - User likes

```sql
-- Migration: 003_create_content_tables.sql

-- Content table (unified for all content types)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type content_type NOT NULL,
  status content_status DEFAULT 'draft' NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Bilingual content
  title_en TEXT NOT NULL,
  title_lus TEXT,
  slug TEXT UNIQUE NOT NULL,
  excerpt_en TEXT,
  excerpt_lus TEXT,
  body_en TEXT,
  body_lus TEXT,

  -- Media
  featured_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- Event-specific
  event_start_at TIMESTAMPTZ,
  event_end_at TIMESTAMPTZ,
  event_location TEXT,
  event_location_lus TEXT,

  -- Leadership-specific
  leadership_position TEXT,
  leadership_position_lus TEXT,
  leadership_order INTEGER,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- Timestamps
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Comments table (with self-referencing for replies)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(content_id, user_id)
);

-- Indexes
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_author_id ON content(author_id);
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_published_at ON content(published_at DESC);
CREATE INDEX idx_comments_content_id ON comments(content_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_likes_content_id ON likes(content_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

**Acceptance Criteria:**

- [ ] All 3 tables created
- [ ] Comment replies working (self-reference)
- [ ] Unique constraint on likes (one per user per content)
- [ ] Indexes created

#### 0.2.4: Create Chat/AI Tables

**Files:** `supabase/migrations/004_create_chat_tables.sql`

Create tables:

1. `knowledge_base` - RAG documents with embeddings
2. `chat_conversations` - Chat sessions
3. `chat_messages` - Individual messages
4. `escalations` - Human escalation requests
5. `daily_message_counts` - Rate limiting

```sql
-- Migration: 004_create_chat_tables.sql

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base table (RAG)
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_lus TEXT,
  content_en TEXT NOT NULL,
  content_lus TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding vector(768), -- Gemini embedding dimension
  source_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Chat conversations table
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  language language_code DEFAULT 'en' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  classification chat_classification,
  sources JSONB DEFAULT '[]', -- Referenced knowledge base items
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Escalations table
CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  status escalation_status DEFAULT 'pending' NOT NULL,
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  reason TEXT,
  resolution_notes TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Daily message counts (rate limiting)
CREATE TABLE daily_message_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_escalations_status ON escalations(status);
CREATE INDEX idx_escalations_user_id ON escalations(user_id);
CREATE INDEX idx_daily_message_counts_user_date ON daily_message_counts(user_id, date);
```

**Acceptance Criteria:**

- [ ] pgvector extension enabled
- [ ] All 5 tables created
- [ ] IVFFlat index on embeddings
- [ ] Rate limiting table working

#### 0.2.5: Create System Tables

**Files:** `supabase/migrations/005_create_system_tables.sql`

Create tables:

1. `audit_logs` - Comprehensive audit trail
2. `notification_logs` - Sent notifications

```sql
-- Migration: 005_create_system_tables.sql

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notification logs table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  template TEXT NOT NULL,
  recipient TEXT NOT NULL, -- email or phone
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  external_id TEXT, -- Provider's message ID
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);
CREATE INDEX idx_notification_logs_channel ON notification_logs(channel);
```

**Acceptance Criteria:**

- [ ] Both tables created
- [ ] Indexes for efficient querying
- [ ] Audit log captures all required fields

#### 0.2.6: Create Database Functions

**Files:** `supabase/migrations/006_create_functions.sql`

```sql
-- Migration: 006_create_functions.sql

-- Function: Match documents for RAG
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title_en TEXT,
  title_lus TEXT,
  content_en TEXT,
  content_lus TEXT,
  category TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title_en,
    kb.title_lus,
    kb.content_en,
    kb.content_lus,
    kb.category,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_active = TRUE
    AND kb.deleted_at IS NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Increment daily message count
CREATE OR REPLACE FUNCTION increment_daily_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO daily_message_counts (user_id, date, count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = daily_message_counts.count + 1
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

-- Function: Get user's daily message count
CREATE OR REPLACE FUNCTION get_daily_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT count INTO v_count
  FROM daily_message_counts
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Function: Update content counts (likes, comments)
CREATE OR REPLACE FUNCTION update_content_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE content SET likes_count = likes_count + 1 WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE content SET likes_count = likes_count - 1 WHERE id = OLD.content_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE content SET comments_count = comments_count - 1 WHERE id = OLD.content_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers for content counts
CREATE TRIGGER trigger_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_content_counts();

CREATE TRIGGER trigger_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_content_counts();

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_escalations_updated_at
  BEFORE UPDATE ON escalations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function: Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger: Create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Acceptance Criteria:**

- [ ] match_documents function returns similar docs
- [ ] Rate limiting functions work
- [ ] Content count triggers fire correctly
- [ ] Profile auto-created on signup
- [ ] updated_at auto-updates

---

### Task 0.3: RLS Policies Implementation

**GitHub Issue:** #3 - Implement RLS Policies

**Reference:** [DATABASE-SCHEMA.md - RLS Policies Section](../DATABASE-SCHEMA.md#rls-policies)

#### 0.3.1: Profiles RLS

**Files:** `supabase/migrations/007_rls_profiles.sql`

```sql
-- Migration: 007_rls_profiles.sql
-- RLS policies for profiles table

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view profiles in directory (if directory visible and paid member viewing)
CREATE POLICY "Members can view directory profiles"
  ON profiles FOR SELECT
  USING (
    is_directory_visible = TRUE
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid()
      AND m.tier IN ('annual', 'lifetime')
      AND m.status = 'active'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (role = (SELECT role FROM profiles WHERE id = auth.uid())) -- Can't change own role
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update any profile (including role)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

**Acceptance Criteria:**

- [ ] Users can only see/edit own profile
- [ ] Paid members can view directory
- [ ] Admins have full access
- [ ] Users cannot change their own role

#### 0.3.2: Memberships RLS

**Files:** `supabase/migrations/008_rls_memberships.sql`

```sql
-- Migration: 008_rls_memberships.sql

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert memberships (via Edge Function)
CREATE POLICY "Service role can insert memberships"
  ON memberships FOR INSERT
  WITH CHECK (TRUE);

-- Admins can view all memberships
CREATE POLICY "Admins can view all memberships"
  ON memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update any membership
CREATE POLICY "Admins can update memberships"
  ON memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

#### 0.3.3: Payments RLS

**Files:** `supabase/migrations/009_rls_payments.sql`

```sql
-- Migration: 009_rls_payments.sql

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update payments (webhook)
CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

#### 0.3.4: Content RLS

**Files:** `supabase/migrations/010_rls_content.sql`

```sql
-- Migration: 010_rls_content.sql

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Anyone can view published content
CREATE POLICY "Anyone can view published content"
  ON content FOR SELECT
  USING (
    status = 'published'
    AND deleted_at IS NULL
    AND (published_at IS NULL OR published_at <= NOW())
  );

-- Authors can view their own content (any status)
CREATE POLICY "Authors can view own content"
  ON content FOR SELECT
  USING (auth.uid() = author_id);

-- Editors can view all content
CREATE POLICY "Editors can view all content"
  ON content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('editor', 'admin')
    )
  );

-- Editors can create content
CREATE POLICY "Editors can create content"
  ON content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('editor', 'admin')
    )
  );

-- Editors can update their own content
CREATE POLICY "Editors can update own content"
  ON content FOR UPDATE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('editor', 'admin')
    )
  );

-- Admins can update any content
CREATE POLICY "Admins can update any content"
  ON content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Soft delete (update deleted_at)
CREATE POLICY "Authors can soft delete own content"
  ON content FOR UPDATE
  USING (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('editor', 'admin')
    )
  )
  WITH CHECK (deleted_at IS NOT NULL);
```

#### 0.3.5: Comments & Likes RLS

**Files:** `supabase/migrations/011_rls_engagement.sql`

```sql
-- Migration: 011_rls_engagement.sql

-- Comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on published content
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_id
      AND c.status = 'published'
      AND c.deleted_at IS NULL
    )
  );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_id
      AND c.status = 'published'
      AND c.deleted_at IS NULL
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can soft delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (deleted_at IS NOT NULL);

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments"
  ON comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Likes RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes count (via content table)
CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT
  USING (TRUE);

-- Authenticated users can like content
CREATE POLICY "Authenticated users can like"
  ON likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_id
      AND c.status = 'published'
    )
  );

-- Users can remove their own likes
CREATE POLICY "Users can unlike"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);
```

#### 0.3.6: Chat/AI RLS

**Files:** `supabase/migrations/012_rls_chat.sql`

```sql
-- Migration: 012_rls_chat.sql

-- Knowledge base RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Service role only (for RAG queries)
CREATE POLICY "Service role can access knowledge base"
  ON knowledge_base FOR SELECT
  USING (is_active = TRUE AND deleted_at IS NULL);

-- Admins can manage knowledge base
CREATE POLICY "Admins can manage knowledge base"
  ON knowledge_base FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Chat conversations RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can create conversations
CREATE POLICY "Authenticated users can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Chat messages RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = conversation_id
      AND c.user_id = auth.uid()
    )
  );

-- Service role can insert messages (via Edge Function)
CREATE POLICY "Service role can insert messages"
  ON chat_messages FOR INSERT
  WITH CHECK (TRUE);

-- Escalations RLS
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;

-- Users can view their own escalations
CREATE POLICY "Users can view own escalations"
  ON escalations FOR SELECT
  USING (auth.uid() = user_id);

-- Paid members can create escalations
CREATE POLICY "Paid members can create escalations"
  ON escalations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = auth.uid()
      AND m.tier IN ('annual', 'lifetime')
      AND m.status = 'active'
    )
  );

-- Admins can manage all escalations
CREATE POLICY "Admins can manage escalations"
  ON escalations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Daily message counts RLS
ALTER TABLE daily_message_counts ENABLE ROW LEVEL SECURITY;

-- Users can view their own counts
CREATE POLICY "Users can view own message counts"
  ON daily_message_counts FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage counts
CREATE POLICY "Service role can manage counts"
  ON daily_message_counts FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
```

#### 0.3.7: System Tables RLS

**Files:** `supabase/migrations/013_rls_system.sql`

```sql
-- Migration: 013_rls_system.sql

-- Audit logs RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- Notification logs RLS
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage notifications
CREATE POLICY "Service role can manage notifications"
  ON notification_logs FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

**Acceptance Criteria:**

- [ ] RLS enabled on all 13 tables
- [ ] Policies tested for each role
- [ ] No data leakage across users
- [ ] Admins have appropriate access

---

### Task 0.4: CI/CD Pipeline Setup

**GitHub Issue:** #4 - Setup CI/CD Pipeline

**Reference:** [CI-CD-IMPLEMENTATION-PLAN.md](../CI-CD-IMPLEMENTATION-PLAN.md)

#### 0.4.1: GitHub Actions - PR Checks

**Files:** `.github/workflows/pr-checks.yml`

```yaml
name: PR Checks

on:
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run typecheck

      - name: Check formatting
        run: npm run format:check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  build:
    name: Build Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Export web build
        run: npx expo export --platform web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
```

#### 0.4.2: GitHub Actions - Deploy Web

**Files:** `.github/workflows/deploy-web.yml`

```yaml
name: Deploy Web

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Vercel
        run: |
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### 0.4.3: GitHub Actions - EAS Build

**Files:** `.github/workflows/eas-build.yml`

```yaml
name: EAS Build

on:
  push:
    branches: [main]
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'package.json'
      - 'app.json'
      - 'eas.json'
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

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

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

      - name: Build iOS
        if: github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'all' || github.event.inputs.platform == ''
        run: eas build --platform ios --non-interactive --profile production

      - name: Build Android
        if: github.event.inputs.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == ''
        run: eas build --platform android --non-interactive --profile production
```

#### 0.4.4: EAS Configuration

**Files:** `eas.json`

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_ASC_APP_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

**Acceptance Criteria:**

- [ ] PR checks run on every PR
- [ ] Lint, typecheck, and tests pass
- [ ] Web deploys to Vercel on main push
- [ ] EAS builds trigger correctly
- [ ] Build artifacts accessible

---

### Task 0.5: Development Environment Setup

**GitHub Issue:** #5 - Setup Development Environment

#### 0.5.1: Environment Variables

**Files:** `.env.example`, `.env.required`

**`.env.example`:**

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Razorpay
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your-secret

# Google Gemini
GEMINI_API_KEY=your-gemini-key

# Gupshup (WhatsApp)
GUPSHUP_API_KEY=your-gupshup-key
GUPSHUP_APP_NAME=your-app-name

# Resend (Email)
RESEND_API_KEY=re_xxx

# Sentry (Optional)
SENTRY_DSN=https://xxx@sentry.io/xxx

# App Config
EXPO_PUBLIC_APP_ENV=development
```

**`.env.required`:**

```bash
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

#### 0.5.2: Package.json Scripts

**Files:** `package.json` (update scripts section)

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:web": "expo export --platform web",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "tsc --noEmit",
    "check": "npm run typecheck && npm run lint && npm run format:check",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "supabase:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts",
    "supabase:push": "supabase db push",
    "supabase:functions": "supabase functions deploy"
  }
}
```

#### 0.5.3: TypeScript Database Types

**Files:** `lib/database.types.ts`

Generate with: `npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts`

This generates type-safe interfaces for all tables.

#### 0.5.4: Supabase Local Setup

**Files:** `supabase/config.toml`

```toml
[api]
enabled = true
port = 54321
schemas = ["public"]

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enabled = true
site_url = "http://localhost:8081"
additional_redirect_urls = ["bma2026://", "http://localhost:8081"]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[storage]
enabled = true
file_size_limit = "50MiB"
```

**Acceptance Criteria:**

- [ ] Environment template documented
- [ ] All scripts working
- [ ] TypeScript types generated
- [ ] Local Supabase running (optional)

---

## Testing Requirements

### Unit Tests

- [ ] Database functions work correctly
- [ ] RLS policies prevent unauthorized access
- [ ] Triggers fire on events

### Integration Tests

- [ ] Migration scripts run in order
- [ ] Foreign key constraints enforced
- [ ] Indexes improve query performance

### Manual Testing Checklist

- [ ] Create test user via Supabase Auth
- [ ] Verify profile auto-created
- [ ] Test RLS with different roles
- [ ] Verify CI pipeline runs

---

## Files Created/Modified

| File                                                | Action   | Purpose            |
| --------------------------------------------------- | -------- | ------------------ |
| `supabase/migrations/001_create_enums.sql`          | Create   | Enum types         |
| `supabase/migrations/002_create_core_tables.sql`    | Create   | Core tables        |
| `supabase/migrations/003_create_content_tables.sql` | Create   | Content tables     |
| `supabase/migrations/004_create_chat_tables.sql`    | Create   | Chat/AI tables     |
| `supabase/migrations/005_create_system_tables.sql`  | Create   | System tables      |
| `supabase/migrations/006_create_functions.sql`      | Create   | DB functions       |
| `supabase/migrations/007_rls_profiles.sql`          | Create   | Profiles RLS       |
| `supabase/migrations/008_rls_memberships.sql`       | Create   | Memberships RLS    |
| `supabase/migrations/009_rls_payments.sql`          | Create   | Payments RLS       |
| `supabase/migrations/010_rls_content.sql`           | Create   | Content RLS        |
| `supabase/migrations/011_rls_engagement.sql`        | Create   | Comments/Likes RLS |
| `supabase/migrations/012_rls_chat.sql`              | Create   | Chat RLS           |
| `supabase/migrations/013_rls_system.sql`            | Create   | System RLS         |
| `.github/workflows/pr-checks.yml`                   | Create   | PR CI              |
| `.github/workflows/deploy-web.yml`                  | Create   | Web deployment     |
| `.github/workflows/eas-build.yml`                   | Create   | Mobile builds      |
| `eas.json`                                          | Create   | EAS config         |
| `.env.example`                                      | Update   | Env template       |
| `package.json`                                      | Update   | Scripts            |
| `lib/database.types.ts`                             | Generate | TS types           |
| `supabase/config.toml`                              | Create   | Local config       |

---

## Dependencies

### External Services to Configure

> **Note:** Individual/personal accounts can be used during development. See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md) for account transfer strategy when BMA org accounts become available.

- [ ] Supabase project created (Free tier)
- [ ] Google Cloud OAuth credentials (Individual account OK)
- [ ] Facebook Developer App (Individual account OK)
- [ ] Apple Developer account (Individual OR deferred - decision required)
- [ ] GitHub repository with secrets
- [ ] Vercel project linked (Free Hobby plan)
- [ ] EAS account configured (Free tier)

### Secrets Required

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
EXPO_TOKEN
CODECOV_TOKEN (optional)
```

---

## Definition of Done

- [ ] All 13 database tables created with correct schema
- [ ] RLS policies enabled and tested on all tables
- [ ] Database functions and triggers working
- [ ] CI/CD pipeline running on every PR
- [ ] Web deployment automated to Vercel
- [ ] EAS build configuration ready
- [ ] Environment variables documented
- [ ] TypeScript types generated from database
- [ ] All GitHub Issues for Phase 0 closed

---

## Next Phase

Continue to [Phase 1: Core Infrastructure](./02-PHASE-1-CORE-INFRASTRUCTURE.md)
