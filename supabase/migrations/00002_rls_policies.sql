-- ============================================================================
-- BMA Digital Platform - Row Level Security (RLS) Policies
-- Version: 1.0
-- Date: January 2026
-- Description: Comprehensive RLS policies for all tables
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role AS $$
  SELECT app_role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND app_role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is editor or admin
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND app_role IN ('editor', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is a paid member
CREATE OR REPLACE FUNCTION is_paid_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND app_role IN ('member', 'editor', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has active membership
CREATE OR REPLACE FUNCTION has_active_membership()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_message_counts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Paid members can read other members in directory (if visible)
CREATE POLICY "Members can read directory"
  ON profiles FOR SELECT
  USING (
    is_paid_member()
    AND is_directory_visible = true
    AND app_role IN ('member', 'editor', 'admin')
  );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Prevent users from changing their own role
    AND app_role = (SELECT app_role FROM profiles WHERE id = auth.uid())
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Profiles are created by trigger, no direct insert
-- But allow service role for admin operations
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- MEMBERSHIPS POLICIES
-- ============================================================================

-- Users can read their own memberships
CREATE POLICY "Users can read own memberships"
  ON memberships FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all memberships
CREATE POLICY "Admins can read all memberships"
  ON memberships FOR SELECT
  USING (is_admin());

-- Only service role (webhooks) can insert/update memberships
-- Users cannot directly modify memberships
CREATE POLICY "Admins can insert memberships"
  ON memberships FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update memberships"
  ON memberships FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Users can read their own payments
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all payments
CREATE POLICY "Admins can read all payments"
  ON payments FOR SELECT
  USING (is_admin());

-- Only service role can insert/update payments (via webhooks)
-- No direct user access to modify payments

-- ============================================================================
-- CONTENT POLICIES
-- ============================================================================

-- Everyone can read published content
CREATE POLICY "Anyone can read published content"
  ON content FOR SELECT
  USING (
    status = 'published'
    AND deleted_at IS NULL
    AND (published_at IS NULL OR published_at <= now())
  );

-- Editors and admins can read all content (including drafts)
CREATE POLICY "Editors can read all content"
  ON content FOR SELECT
  USING (is_editor_or_admin());

-- Editors and admins can create content
CREATE POLICY "Editors can create content"
  ON content FOR INSERT
  WITH CHECK (is_editor_or_admin());

-- Editors and admins can update content
CREATE POLICY "Editors can update content"
  ON content FOR UPDATE
  USING (is_editor_or_admin());

-- Only admins can delete content
CREATE POLICY "Admins can delete content"
  ON content FOR DELETE
  USING (is_admin());

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Anyone can read non-hidden comments on published content
CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT
  USING (
    is_hidden = false
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_id
        AND c.status = 'published'
        AND c.deleted_at IS NULL
        AND c.comments_enabled = true
    )
  );

-- Admins can read all comments (including hidden)
CREATE POLICY "Admins can read all comments"
  ON comments FOR SELECT
  USING (is_admin());

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM content c
      WHERE c.id = content_id
        AND c.status = 'published'
        AND c.deleted_at IS NULL
        AND c.comments_enabled = true
    )
  );

-- Users can update their own comments (within 15 minutes)
CREATE POLICY "Users can update own recent comments"
  ON comments FOR UPDATE
  USING (
    user_id = auth.uid()
    AND created_at > now() - interval '15 minutes'
    AND deleted_at IS NULL
  );

-- Editors and admins can update any comment (for moderation)
CREATE POLICY "Editors can moderate comments"
  ON comments FOR UPDATE
  USING (is_editor_or_admin());

-- Users can soft-delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (deleted_at IS NOT NULL);  -- Only allow setting deleted_at

-- ============================================================================
-- LIKES POLICIES
-- ============================================================================

-- Anyone can read likes (for counts)
CREATE POLICY "Anyone can read likes"
  ON likes FOR SELECT
  USING (true);

-- Authenticated users can create likes
CREATE POLICY "Authenticated users can like"
  ON likes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Users can delete their own likes (unlike)
CREATE POLICY "Users can unlike"
  ON likes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- KNOWLEDGE BASE POLICIES
-- ============================================================================

-- Everyone can read knowledge base (for chatbot)
CREATE POLICY "Anyone can read knowledge base"
  ON knowledge_base FOR SELECT
  USING (true);

-- Only admins can manage knowledge base
CREATE POLICY "Admins can manage knowledge base"
  ON knowledge_base FOR ALL
  USING (is_admin());

-- ============================================================================
-- CHAT CONVERSATIONS POLICIES
-- ============================================================================

-- Users can read their own conversations
CREATE POLICY "Users can read own conversations"
  ON chat_conversations FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all conversations
CREATE POLICY "Admins can read all conversations"
  ON chat_conversations FOR SELECT
  USING (is_admin());

-- Authenticated users can create conversations
CREATE POLICY "Users can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- CHAT MESSAGES POLICIES
-- ============================================================================

-- Users can read messages in their own conversations
CREATE POLICY "Users can read own messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- Admins can read all messages
CREATE POLICY "Admins can read all messages"
  ON chat_messages FOR SELECT
  USING (is_admin());

-- Users can create messages in their own conversations
CREATE POLICY "Users can create messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ESCALATIONS POLICIES
-- ============================================================================

-- Users can read their own escalations
CREATE POLICY "Users can read own escalations"
  ON escalations FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all escalations
CREATE POLICY "Admins can read all escalations"
  ON escalations FOR SELECT
  USING (is_admin());

-- Only service role can create escalations (via chatbot function)
-- Admins can update escalations (for resolution)
CREATE POLICY "Admins can update escalations"
  ON escalations FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin());

-- Editors can read their own audit logs
CREATE POLICY "Editors can read own audit logs"
  ON audit_logs FOR SELECT
  USING (
    is_editor_or_admin()
    AND actor_id = auth.uid()
  );

-- Only service role can insert audit logs
-- No direct user access

-- ============================================================================
-- NOTIFICATION LOGS POLICIES
-- ============================================================================

-- Users can read their own notification logs
CREATE POLICY "Users can read own notifications"
  ON notification_logs FOR SELECT
  USING (user_id = auth.uid());

-- Admins can read all notification logs
CREATE POLICY "Admins can read all notifications"
  ON notification_logs FOR SELECT
  USING (is_admin());

-- ============================================================================
-- DAILY MESSAGE COUNTS POLICIES
-- ============================================================================

-- Users can read their own message counts
CREATE POLICY "Users can read own message counts"
  ON daily_message_counts FOR SELECT
  USING (user_id = auth.uid());

-- Service role manages message counts (via chatbot function)

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
