-- ============================================================================
-- BMA Digital Platform - Initial Database Schema
-- Version: 1.0
-- Date: January 2026
-- Description: Complete schema for BMA app including auth, memberships,
--              content, chatbot, and admin features
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector for RAG embeddings

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User roles within the application
CREATE TYPE app_role AS ENUM ('user', 'member', 'editor', 'admin');

-- Membership tiers
CREATE TYPE membership_tier AS ENUM ('free', 'annual', 'lifetime');

-- Membership status
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'success', 'failed', 'refunded');

-- Content types
CREATE TYPE content_type AS ENUM ('news', 'article', 'event', 'newsletter', 'gallery', 'leadership');

-- Content status
CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- Chat message role
CREATE TYPE chat_role AS ENUM ('user', 'assistant', 'system');

-- Chat message classification
CREATE TYPE chat_classification AS ENUM ('informational', 'guidance', 'urgent');

-- Escalation status
CREATE TYPE escalation_status AS ENUM ('pending', 'acknowledged', 'resolved', 'dismissed');

-- Notification channel
CREATE TYPE notification_channel AS ENUM ('whatsapp', 'email', 'both');

-- Language codes
CREATE TYPE language_code AS ENUM ('en', 'lus');

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Extends Supabase auth.users with application-specific data

-- Occupation types for members
CREATE TYPE occupation_type AS ENUM (
  'student',
  'govt_employee',
  'private_employee',
  'doctor',
  'engineer',
  'teacher',
  'business_owner',
  'self_employed',
  'homemaker',
  'retired',
  'other'
);

-- Emergency contact relationship types
CREATE TYPE relationship_type AS ENUM (
  'spouse',
  'father',
  'mother',
  'brother',
  'sister',
  'son',
  'daughter',
  'friend',
  'relative',
  'other'
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  full_name TEXT,
  phone TEXT,
  photo_url TEXT,

  -- Application role and preferences
  app_role app_role NOT NULL DEFAULT 'user',
  language_preference language_code NOT NULL DEFAULT 'en',

  -- Member-specific fields (required for paid members)
  bangalore_address TEXT,
  permanent_address TEXT,
  occupation occupation_type,
  occupation_other TEXT,  -- If occupation is 'other'

  -- Emergency contact (required for paid members)
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation relationship_type,
  emergency_contact_relation_other TEXT,  -- If relation is 'other'

  -- Directory visibility (for member directory)
  is_directory_visible BOOLEAN NOT NULL DEFAULT true,

  -- Notification preferences
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_channel notification_channel NOT NULL DEFAULT 'both',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_app_role ON profiles(app_role);

-- ============================================================================
-- MEMBERSHIPS TABLE
-- ============================================================================
-- Tracks user membership status and history

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Membership details
  tier membership_tier NOT NULL DEFAULT 'free',
  status membership_status NOT NULL DEFAULT 'active',

  -- Validity period
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- For renewal tracking
  renewed_from_id UUID REFERENCES memberships(id),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (expires_at IS NULL OR expires_at > starts_at)
);

-- Indexes
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_expires_at ON memberships(expires_at);

-- ============================================================================
-- PAYMENTS TABLE
-- ============================================================================
-- Records all payment transactions

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,

  -- Razorpay integration
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,

  -- Payment details
  amount_paise INTEGER NOT NULL,  -- Amount in paise (INR * 100)
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'pending',

  -- Idempotency
  idempotency_key TEXT UNIQUE,

  -- For audit
  ip_address INET,
  user_agent TEXT,

  -- Status history (JSONB array of {status, timestamp, reason})
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- ============================================================================
-- CONTENT TABLE
-- ============================================================================
-- Unified content table for news, articles, events, etc.

CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content type
  type content_type NOT NULL,

  -- Bilingual content
  title_en TEXT,
  title_lus TEXT,
  body_en TEXT,
  body_lus TEXT,
  excerpt_en TEXT,      -- Short summary
  excerpt_lus TEXT,

  -- Media
  featured_image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb,  -- Array of image URLs

  -- Event-specific fields (NULL for non-events)
  event_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  event_location TEXT,
  event_location_url TEXT,  -- Google Maps link

  -- Leadership-specific fields
  leadership_position TEXT,
  leadership_order INTEGER,

  -- Publishing
  status content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Engagement settings
  comments_enabled BOOLEAN NOT NULL DEFAULT true,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,

  -- Author (nullable to allow ON DELETE SET NULL when author profile is deleted)
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT has_title CHECK (title_en IS NOT NULL OR title_lus IS NOT NULL),
  CONSTRAINT valid_event_dates CHECK (
    type != 'event' OR event_date IS NOT NULL
  )
);

-- Indexes
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published_at ON content(published_at DESC);
CREATE INDEX idx_content_author_id ON content(author_id);
CREATE INDEX idx_content_event_date ON content(event_date) WHERE type = 'event';
CREATE INDEX idx_content_deleted_at ON content(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
-- User comments on content

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- For nested replies (1 level deep max)
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  -- Comment content
  body TEXT NOT NULL,

  -- Moderation
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  hidden_by UUID REFERENCES profiles(id),
  hidden_at TIMESTAMPTZ,
  hidden_reason TEXT,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- Note: Deep nesting prevention is enforced via trigger (see comments_prevent_deep_nesting)
);

-- Indexes
CREATE INDEX idx_comments_content_id ON comments(content_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- ============================================================================
-- LIKES TABLE
-- ============================================================================
-- User likes on content

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One like per user per content
  CONSTRAINT uq_likes_user_content UNIQUE (content_id, user_id)
);

-- Indexes
CREATE INDEX idx_likes_content_id ON likes(content_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- ============================================================================
-- KNOWLEDGE BASE TABLE (for RAG)
-- ============================================================================
-- Stores BMA documents for chatbot retrieval

CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document info
  title TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'constitution', 'faq', 'procedures', 'events', 'history'

  -- Bilingual content
  content_en TEXT,
  content_lus TEXT,

  -- Vector embeddings for similarity search
  embedding_en vector(768),   -- Gemini embedding dimension
  embedding_lus vector(768),

  -- Source reference
  source_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT has_content CHECK (content_en IS NOT NULL OR content_lus IS NOT NULL)
);

-- Vector similarity indexes (IVFFlat for approximate nearest neighbor)
CREATE INDEX idx_knowledge_base_embedding_en ON knowledge_base
  USING ivfflat (embedding_en vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_knowledge_base_embedding_lus ON knowledge_base
  USING ivfflat (embedding_lus vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);

-- ============================================================================
-- CHAT CONVERSATIONS TABLE
-- ============================================================================
-- Tracks chatbot conversation sessions

CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Conversation metadata
  language language_code NOT NULL DEFAULT 'en',
  message_count INTEGER NOT NULL DEFAULT 0,

  -- For rate limiting
  last_message_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_created_at ON chat_conversations(created_at DESC);

-- ============================================================================
-- CHAT MESSAGES TABLE
-- ============================================================================
-- Individual messages in conversations

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,

  -- Message content
  role chat_role NOT NULL,
  content TEXT NOT NULL,

  -- AI classification (for escalation logic)
  classification chat_classification,
  confidence_score DECIMAL(3,2),  -- 0.00 to 1.00

  -- For context retrieval
  retrieved_doc_ids UUID[],  -- IDs of knowledge_base docs used

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================================================
-- ESCALATIONS TABLE
-- ============================================================================
-- Tracks help desk escalations to admins

CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Escalation details
  trigger_message_id UUID REFERENCES chat_messages(id),
  summary TEXT,  -- AI-generated summary of the issue

  -- Status tracking
  status escalation_status NOT NULL DEFAULT 'pending',

  -- Resolution
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Notification tracking
  whatsapp_sent_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_escalations_status ON escalations(status);
CREATE INDEX idx_escalations_user_id ON escalations(user_id);
CREATE INDEX idx_escalations_created_at ON escalations(created_at DESC);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
-- Comprehensive audit trail for admin actions

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who did it
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,  -- Stored separately in case user is deleted

  -- What was done
  action TEXT NOT NULL,  -- 'create', 'update', 'delete', 'login', 'logout', etc.
  resource_type TEXT NOT NULL,  -- 'user', 'content', 'membership', 'payment', etc.
  resource_id UUID,

  -- Change details
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Partition by month for performance (optional, for high-volume)
-- Can be added later if needed

-- ============================================================================
-- NOTIFICATIONS LOG TABLE
-- ============================================================================
-- Tracks sent notifications for debugging and analytics

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_phone TEXT,
  recipient_email TEXT,

  -- Notification details
  channel notification_channel NOT NULL,
  template_name TEXT NOT NULL,
  template_params JSONB,

  -- Status
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- External references
  external_id TEXT,  -- Gupshup message ID, etc.

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at DESC);

-- ============================================================================
-- DAILY MESSAGE COUNTS TABLE (for rate limiting)
-- ============================================================================
-- Tracks daily message counts per user for chatbot rate limiting

CREATE TABLE daily_message_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT uq_daily_message_counts_user_date UNIQUE (user_id, date)
);

-- Index
CREATE INDEX idx_daily_message_counts_user_date ON daily_message_counts(user_id, date);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment likes_count on content
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content SET likes_count = likes_count + 1 WHERE id = NEW.content_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes_count on content
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.content_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments_count on content
-- Handles INSERT, DELETE, and soft-delete/undelete via UPDATE
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only count if not already soft-deleted on insert
    IF NEW.deleted_at IS NULL THEN
      UPDATE content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Only decrement if wasn't soft-deleted
    IF OLD.deleted_at IS NULL THEN
      UPDATE content SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.content_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft-delete: deleted_at changes from NULL to NOT NULL
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      UPDATE content SET comments_count = GREATEST(0, comments_count - 1) WHERE id = NEW.content_id;
    -- Handle undelete: deleted_at changes from NOT NULL to NULL
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      UPDATE content SET comments_count = comments_count + 1 WHERE id = NEW.content_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update message count in conversation
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to prevent deep nesting in comments (max 1 level of replies)
CREATE OR REPLACE FUNCTION comments_prevent_deep_nesting()
RETURNS TRIGGER AS $$
DECLARE
  parent_has_parent BOOLEAN;
BEGIN
  -- If no parent_id, this is a top-level comment - allow it
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if the parent comment itself has a parent
  SELECT (parent_id IS NOT NULL) INTO parent_has_parent
  FROM comments
  WHERE id = NEW.parent_id;

  -- If parent has a parent, this would create deep nesting - reject it
  IF parent_has_parent THEN
    RAISE EXCEPTION 'Comments can only be nested one level deep. Cannot reply to a reply.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to enforce soft-delete only changes deleted_at field
-- Prevents users from modifying other fields during soft-delete
CREATE OR REPLACE FUNCTION comments_soft_delete_only()
RETURNS TRIGGER AS $$
BEGIN
  -- Only apply when transitioning from non-deleted to deleted (soft-delete)
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    -- Ensure no other fields are changed during soft-delete
    IF NEW.content_id IS DISTINCT FROM OLD.content_id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.parent_id IS DISTINCT FROM OLD.parent_id
       OR NEW.body IS DISTINCT FROM OLD.body
       OR NEW.is_hidden IS DISTINCT FROM OLD.is_hidden
       OR NEW.hidden_by IS DISTINCT FROM OLD.hidden_by
       OR NEW.hidden_at IS DISTINCT FROM OLD.hidden_at
       OR NEW.hidden_reason IS DISTINCT FROM OLD.hidden_reason THEN
      RAISE EXCEPTION 'Soft-delete operation can only set deleted_at. No other fields may be changed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalations_updated_at BEFORE UPDATE ON escalations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Likes count management
CREATE TRIGGER on_like_insert AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION increment_likes_count();

CREATE TRIGGER on_like_delete AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION decrement_likes_count();

-- Comments count management (includes UPDATE for soft-delete/undelete)
CREATE TRIGGER on_comment_change AFTER INSERT OR DELETE OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- Prevent deep nesting in comments (max 1 level of replies)
CREATE TRIGGER trg_comments_no_deep_nesting BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION comments_prevent_deep_nesting();

-- Enforce soft-delete only changes deleted_at field
CREATE TRIGGER trg_comments_soft_delete_only BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION comments_soft_delete_only();

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update conversation message count
CREATE TRIGGER on_chat_message_insert AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
