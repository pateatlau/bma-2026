# Phase 5: Admin Dashboard (Days 51-60)

## Overview

Phase 5 implements the complete admin and editor dashboard within the main application. This includes user management, content management, membership overrides, escalation handling, knowledge base editing, and analytics.

**Duration:** 10 days
**Prerequisites:** Phase 4 completed (chatbot, escalation)
**Deliverables:**

- Admin dashboard with key metrics
- User management (view, role assignment, ban)
- Content management (CRUD, scheduling, bilingual)
- Membership override capabilities
- Escalation queue management
- Knowledge base editor
- Audit log viewer
- Basic analytics dashboard

---

## Role-Based Access

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ADMIN ROUTE ACCESS MATRIX                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Route                    │ Admin │ Editor │ Member │ User │ Guest │
│  ─────────────────────────┼───────┼────────┼────────┼──────┼───────│
│  /admin                   │   ✓   │   ✓    │   ✗    │  ✗   │   ✗   │
│  /admin/users             │   ✓   │   ✗    │   ✗    │  ✗   │   ✗   │
│  /admin/content           │   ✓   │   ✓    │   ✗    │  ✗   │   ✗   │
│  /admin/memberships       │   ✓   │   ✗    │   ✗    │  ✗   │   ✗   │
│  /admin/escalations       │   ✓   │   ✗    │   ✗    │  ✗   │   ✗   │
│  /admin/knowledge-base    │   ✓   │   ✗    │   ✗    │  ✗   │   ✗   │
│  /admin/audit-logs        │   ✓   │   ✗    │   ✗    │  ✗   │   ✗   │
│  /admin/analytics         │   ✓   │   ✓    │   ✗    │  ✗   │   ✗   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Task Breakdown

### Task 5.1: Admin Layout and Navigation

**GitHub Issue:** #35 - Implement Admin Layout

#### 5.1.1: Create Admin Layout

**Files:** `app/(admin)/_layout.tsx`

```typescript
import { Redirect, Stack, usePathname } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const { isWideScreen } = useMediaQuery();

  // Check admin/editor role
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!['admin', 'editor'].includes(user.role)) {
    return <Redirect href="/(app)/home" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isWideScreen && <AdminSidebar />}
      <View style={styles.main}>
        <AdminHeader />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flex: 1,
  },
});
```

#### 5.1.2: Create Admin Sidebar

**Files:** `components/admin/AdminSidebar.tsx`

```typescript
const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', icon: 'grid-outline', route: '/(admin)', roles: ['admin', 'editor'] },
  { label: 'Users', icon: 'people-outline', route: '/(admin)/users', roles: ['admin'] },
  { label: 'Content', icon: 'document-text-outline', route: '/(admin)/content', roles: ['admin', 'editor'] },
  { label: 'Memberships', icon: 'card-outline', route: '/(admin)/memberships', roles: ['admin'] },
  { label: 'Escalations', icon: 'alert-circle-outline', route: '/(admin)/escalations', roles: ['admin'] },
  { label: 'Knowledge Base', icon: 'book-outline', route: '/(admin)/knowledge-base', roles: ['admin'] },
  { label: 'Audit Logs', icon: 'list-outline', route: '/(admin)/audit-logs', roles: ['admin'] },
  { label: 'Analytics', icon: 'analytics-outline', route: '/(admin)/analytics', roles: ['admin', 'editor'] },
];

export function AdminSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { colors } = useTheme();

  const visibleItems = ADMIN_NAV_ITEMS.filter(item =>
    item.roles.includes(user?.role || '')
  );

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.surface }]}>
      {/* Logo */}
      <View style={styles.logo}>
        <Text variant="h3">BMA Admin</Text>
      </View>

      {/* Navigation */}
      <ScrollView style={styles.nav}>
        {visibleItems.map(item => (
          <NavItem
            key={item.route}
            {...item}
            isActive={pathname === item.route || pathname.startsWith(item.route + '/')}
          />
        ))}
      </ScrollView>

      {/* Back to App */}
      <Pressable style={styles.backLink} onPress={() => router.push('/(app)/home')}>
        <Icon name="arrow-back" />
        <Text>Back to App</Text>
      </Pressable>
    </View>
  );
}
```

#### 5.1.3: Create Admin Header

**Files:** `components/admin/AdminHeader.tsx`

**Features:**

1. Breadcrumb navigation
2. Search bar (global)
3. Notifications bell
4. User menu

**Acceptance Criteria:**

- [ ] Sidebar shows role-appropriate items
- [ ] Active route highlighted
- [ ] Mobile shows hamburger menu
- [ ] Breadcrumbs work correctly

---

### Task 5.2: Admin Dashboard

**GitHub Issue:** #36 - Implement Admin Dashboard

#### 5.2.1: Create Dashboard Screen

**Files:** `app/(admin)/index.tsx`

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard                                        Jan 10, 2026 │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Total   │ │  Paid    │ │ Active   │ │ Pending  │          │
│  │  Users   │ │ Members  │ │ Chats    │ │Escalation│          │
│  │  1,234   │ │    456   │ │     89   │ │      5   │          │
│  │  +12%    │ │   +8%    │ │   +15%   │ │    -2    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────────────────┤
│  Quick Actions                                                 │
│  [+ New Content] [View Escalations] [Manage KB]               │
├────────────────────────────────────────────────────────────────┤
│  Pending Actions                          │  Recent Activity   │
│  ┌────────────────────────────┐           │  ┌───────────────┐ │
│  │ 🔴 5 pending escalations   │           │  │ User signed up│ │
│  │ 🟡 3 scheduled posts       │           │  │ 2 min ago     │ │
│  │ 🟢 12 new comments         │           │  ├───────────────┤ │
│  └────────────────────────────┘           │  │ Payment recv. │ │
│                                           │  │ 15 min ago    │ │
│                                           │  └───────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  User Growth (30 days)                    │  Revenue (30 days) │
│  [Chart - line graph]                     │  [Chart - bar]     │
└────────────────────────────────────────────────────────────────┘
```

#### 5.2.2: Create Admin Stats Edge Function

**Files:** `supabase/functions/admin/stats/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Verify admin role
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403 });
  }

  const adminSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Aggregate stats
  const [
    usersCount,
    paidMembersCount,
    activeChatsCount,
    pendingEscalationsCount,
    recentPayments,
    userGrowth,
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .in('tier', ['annual', 'lifetime']),
    adminSupabase
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    adminSupabase
      .from('escalations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminSupabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'captured')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Calculate revenue
  const totalRevenue =
    (recentPayments.data || []).reduce((sum, p) => sum + (p.amount || 0), 0) / 100; // Convert paise to rupees

  return new Response(
    JSON.stringify({
      total_users: usersCount.count,
      paid_members: paidMembersCount.count,
      active_chats_24h: activeChatsCount.count,
      pending_escalations: pendingEscalationsCount.count,
      revenue_30d: totalRevenue,
      new_users_30d: userGrowth.data?.length || 0,
    }),
    { status: 200 }
  );
});
```

#### 5.2.3: Create Dashboard Hooks

**Files:** `hooks/useAdminStats.ts`

```typescript
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin/stats');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
```

**Acceptance Criteria:**

- [ ] Stats cards display correctly
- [ ] Quick actions work
- [ ] Pending items show counts
- [ ] Activity feed updates

---

### Task 5.3: User Management

**GitHub Issue:** #37 - Implement User Management

#### 5.3.1: Create Users List Screen

**Files:** `app/(admin)/users/index.tsx`

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  Users                                      [+ Invite User]    │
├────────────────────────────────────────────────────────────────┤
│  🔍 [Search users...]   Role: [All ▼]   Status: [All ▼]       │
├────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Name          │ Email           │ Role   │ Status │ Action ││
│  ├───────────────┼─────────────────┼────────┼────────┼────────┤│
│  │ John Doe      │ john@test.com   │ Member │ Active │ [Edit] ││
│  │ Jane Smith    │ jane@test.com   │ Admin  │ Active │ [Edit] ││
│  │ Bob Wilson    │ bob@test.com    │ User   │ Active │ [Edit] ││
│  └────────────────────────────────────────────────────────────┘│
├────────────────────────────────────────────────────────────────┤
│  Showing 1-20 of 1,234         [< Prev] [1] [2] [3] [Next >]  │
└────────────────────────────────────────────────────────────────┘
```

**Features:**

1. DataTable with sorting
2. Search by name/email
3. Filter by role
4. Filter by membership status
5. Pagination
6. Quick actions per row

#### 5.3.2: Create User Detail Screen

**Files:** `app/(admin)/users/[id].tsx`

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  [← Back]   User Details                         [🗑️ Delete]  │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  John Doe                                        │
│  │  Avatar │  john@test.com                                   │
│  └─────────┘  Joined: Jan 1, 2025                             │
├────────────────────────────────────────────────────────────────┤
│  Role: [User ▼]  [Update Role]                                │
├────────────────────────────────────────────────────────────────┤
│  Membership                                                    │
│  Status: Active (Annual)                                       │
│  Expires: Jan 1, 2026                                          │
│  [Override Membership ▼]                                       │
├────────────────────────────────────────────────────────────────┤
│  Profile Information                                           │
│  Phone: +91 98765 43210                                        │
│  City: Bangalore                                               │
│  ... more fields                                               │
├────────────────────────────────────────────────────────────────┤
│  Activity                                                      │
│  Last login: Jan 10, 2026                                      │
│  Chat messages: 45                                             │
│  Comments: 12                                                  │
├────────────────────────────────────────────────────────────────┤
│  Audit History                                                 │
│  [List of user-related audit entries]                          │
└────────────────────────────────────────────────────────────────┘
```

#### 5.3.3: Create Role Update Edge Function

**Files:** `supabase/functions/admin/users/role/index.ts`

```typescript
serve(async (req) => {
  // Verify admin role
  // ... auth check

  const { user_id, new_role } = await req.json();

  // Validate role
  if (!['user', 'member', 'editor', 'admin'].includes(new_role)) {
    return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
  }

  // Prevent self-demotion
  if (user_id === currentUser.id && new_role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Cannot demote yourself' }), { status: 400 });
  }

  // Update role
  const { data, error } = await adminSupabase
    .from('profiles')
    .update({ role: new_role })
    .eq('id', user_id)
    .select()
    .single();

  if (error) throw error;

  // Audit log
  await adminSupabase.from('audit_logs').insert({
    actor_id: currentUser.id,
    action: 'user.role_changed',
    table_name: 'profiles',
    record_id: user_id,
    old_data: { role: oldRole },
    new_data: { role: new_role },
  });

  return new Response(JSON.stringify(data), { status: 200 });
});
```

**Acceptance Criteria:**

- [ ] User list loads with pagination
- [ ] Search and filters work
- [ ] Role update works
- [ ] Cannot demote self
- [ ] Audit trail created

---

### Task 5.4: Content Management

**GitHub Issue:** #38 - Implement Content Management

#### 5.4.1: Create Content List Screen

**Files:** `app/(admin)/content/index.tsx`

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  Content                                       [+ New Content] │
├────────────────────────────────────────────────────────────────┤
│  Type: [All ▼]   Status: [All ▼]   Author: [All ▼]            │
├────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Title            │ Type   │ Status    │ Date      │ Action ││
│  ├──────────────────┼────────┼───────────┼───────────┼────────┤│
│  │ Annual Event...  │ Event  │ Published │ Jan 10    │ [Edit] ││
│  │ New Year Greet...│ News   │ Draft     │ Jan 8     │ [Edit] ││
│  │ Community Guide  │ Article│ Scheduled │ Jan 15    │ [Edit] ││
│  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

#### 5.4.2: Create Content Editor Screen

**Files:** `app/(admin)/content/[id]/edit.tsx`, `app/(admin)/content/new.tsx`

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  [← Back]   Edit Content                    [Save] [Publish]   │
├────────────────────────────────────────────────────────────────┤
│  Type: [News ▼]              Status: [Draft ▼]                │
├────────────────────────────────────────────────────────────────┤
│  Title (English) *                                             │
│  [_________________________________________________]          │
│                                                                │
│  Title (Mizo)                                                  │
│  [_________________________________________________]          │
├────────────────────────────────────────────────────────────────┤
│  Slug *                                                        │
│  [annual-event-2026___________________________] [Auto-gen]     │
├────────────────────────────────────────────────────────────────┤
│  Featured Image                                                │
│  [📷 Upload Image]  or drag & drop                            │
├────────────────────────────────────────────────────────────────┤
│  Content (English) *                        [EN] [Mizo]        │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ [B] [I] [U] [H1] [H2] [📷] [🔗] [</>]                      ││
│  │                                                            ││
│  │ Rich text editor...                                        ││
│  │                                                            ││
│  └────────────────────────────────────────────────────────────┘│
├────────────────────────────────────────────────────────────────┤
│  Tags                                                          │
│  [community] [event] [+Add tag]                               │
├────────────────────────────────────────────────────────────────┤
│  Publishing Options                                            │
│  ○ Save as Draft                                               │
│  ○ Schedule for: [Jan 15, 2026] [10:00 AM]                    │
│  ○ Publish Now                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Event-specific fields:**

```
├────────────────────────────────────────────────────────────────┤
│  Event Details (only for type=event)                          │
│  Start: [Jan 20, 2026] [6:00 PM]                              │
│  End:   [Jan 20, 2026] [9:00 PM]                              │
│  Location: [Community Hall, Bangalore]                         │
│  Location (Mizo): [_____________________________]              │
└────────────────────────────────────────────────────────────────┘
```

#### 5.4.3: Create Rich Text Editor Component

**Files:** `components/admin/RichTextEditor.tsx`

**Dependencies:**

```bash
npm install @10play/tentap-editor
```

```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: 'en' | 'lus';
}

export function RichTextEditor({ value, onChange, placeholder, language }: RichTextEditorProps) {
  // Use TenTap editor for cross-platform rich text
  // Support: bold, italic, headings, lists, images, links, code blocks
}
```

#### 5.4.4: Create Content Hooks

**Files:** `hooks/useAdminContent.ts`

```typescript
export function useAdminContentList(params: ContentListParams) {
  // Fetch all content (not just published)
}

export function useCreateContent() {
  // Mutation to create content
}

export function useUpdateContent() {
  // Mutation to update content
}

export function useDeleteContent() {
  // Soft delete content
}

export function usePublishContent() {
  // Mutation to publish/schedule
}
```

**Acceptance Criteria:**

- [ ] Content list shows all statuses
- [ ] Editor loads existing content
- [ ] Bilingual editing works
- [ ] Rich text formatting works
- [ ] Image upload works
- [ ] Scheduling works
- [ ] Slug auto-generates

---

### Task 5.5: Membership Management

**GitHub Issue:** #39 - Implement Membership Management

#### 5.5.1: Create Membership Override Screen

**Files:** `app/(admin)/memberships/index.tsx`

**Features:**

1. List all memberships
2. Filter by tier/status
3. Override membership manually
4. Extend expiry date
5. Cancel membership

#### 5.5.2: Create Override Edge Function

**Files:** `supabase/functions/admin/users/membership/index.ts`

```typescript
serve(async (req) => {
  // Verify admin role

  const { user_id, action, tier, expires_at, reason } = await req.json();

  switch (action) {
    case 'activate':
      // Activate membership without payment
      const { data: membership } = await adminSupabase
        .from('memberships')
        .upsert({
          user_id,
          tier,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: tier === 'lifetime' ? null : expires_at,
        })
        .select()
        .single();

      // Update user role
      await adminSupabase.from('profiles').update({ role: 'member' }).eq('id', user_id);

      // Audit log
      await adminSupabase.from('audit_logs').insert({
        actor_id: currentUser.id,
        action: 'membership.manual_override',
        table_name: 'memberships',
        record_id: membership.id,
        new_data: { tier, reason },
      });

      break;

    case 'extend':
      // Extend existing membership
      break;

    case 'cancel':
      // Cancel membership
      break;
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

**Acceptance Criteria:**

- [ ] Manual activation works
- [ ] Extension works
- [ ] Cancellation works
- [ ] Audit trail created
- [ ] User notified of changes

---

### Task 5.6: Escalation Management

**GitHub Issue:** #40 - Implement Escalation Management

#### 5.6.1: Create Escalation Queue Screen

**Files:** `app/(admin)/escalations/index.tsx`

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  Escalations                               5 pending           │
├────────────────────────────────────────────────────────────────┤
│  Filter: [Pending ▼]   Priority: [All ▼]   Sort: [Newest ▼]   │
├────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🔴 #123 • User: John Doe                                   ││
│  │    "Need help with payment issue"                          ││
│  │    Created: 2 hours ago                                    ││
│  │    [View Conversation] [Acknowledge] [Resolve]             ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🟡 #122 • User: Jane Smith                                 ││
│  │    "Account verification question"                         ││
│  │    Created: 5 hours ago • Acknowledged by Admin            ││
│  │    [View Conversation] [Resolve]                           ││
│  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

#### 5.6.2: Create Escalation Detail Modal

**Files:** `components/admin/EscalationModal.tsx`

**Features:**

1. View full conversation history
2. User profile summary
3. Acknowledge button
4. Resolution notes input
5. Resolve/Dismiss actions

#### 5.6.3: Create Resolve Escalation Edge Function

**Files:** `supabase/functions/admin/escalations/resolve/index.ts`

```typescript
serve(async (req) => {
  // Verify admin role

  const { escalation_id, status, resolution_notes } = await req.json();

  if (!['resolved', 'dismissed'].includes(status)) {
    return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
  }

  const { data: escalation, error } = await adminSupabase
    .from('escalations')
    .update({
      status,
      resolution_notes,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', escalation_id)
    .select()
    .single();

  if (error) throw error;

  // Add system message to conversation
  await adminSupabase.from('chat_messages').insert({
    conversation_id: escalation.conversation_id,
    role: 'system',
    content: `This escalation has been ${status}. ${resolution_notes || ''}`,
  });

  // Notify user
  await adminSupabase.functions.invoke('send-notification', {
    body: {
      user_id: escalation.user_id,
      template: 'escalation_resolved',
      channels: ['email'],
      data: { status, notes: resolution_notes },
    },
  });

  // Audit log
  await adminSupabase.from('audit_logs').insert({
    actor_id: currentUser.id,
    action: 'escalation.resolved',
    table_name: 'escalations',
    record_id: escalation_id,
    new_data: { status, resolution_notes },
  });

  return new Response(JSON.stringify(escalation), { status: 200 });
});
```

**Acceptance Criteria:**

- [ ] Escalation list shows with status
- [ ] Conversation viewable
- [ ] Acknowledge updates status
- [ ] Resolution saves notes
- [ ] User notified
- [ ] Audit trail created

---

### Task 5.7: Knowledge Base Management

**GitHub Issue:** #41 - Implement KB Management UI

#### 5.7.1: Create KB List Screen

**Files:** `app/(admin)/knowledge-base/index.tsx`

**Features:**

1. List all KB items
2. Filter by category
3. Search by title/content
4. Create/Edit/Delete actions

#### 5.7.2: Create KB Editor Screen

**Files:** `app/(admin)/knowledge-base/[id].tsx`

**Form Fields:**

1. Title (EN + Mizo)
2. Content (EN + Mizo) with rich text
3. Category dropdown
4. Tags
5. Active toggle

**Acceptance Criteria:**

- [ ] KB list displays
- [ ] Editor loads item
- [ ] Bilingual editing
- [ ] Save regenerates embedding
- [ ] Delete soft-deletes

---

### Task 5.8: Audit Log Viewer

**GitHub Issue:** #42 - Implement Audit Log Viewer

#### 5.8.1: Create Audit Log Screen

**Files:** `app/(admin)/audit-logs/index.tsx`

**UI Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│  Audit Logs                                                    │
├────────────────────────────────────────────────────────────────┤
│  Date Range: [Jan 1] to [Jan 10]  Actor: [All ▼]              │
│  Action: [All ▼]   Table: [All ▼]                             │
├────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Jan 10, 10:30 AM                                           ││
│  │ user.role_changed • profiles • Admin User                  ││
│  │ Changed role from 'user' to 'editor' for user #123         ││
│  │ [View Details]                                             ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Jan 10, 10:15 AM                                           ││
│  │ membership.manual_override • memberships • Admin User      ││
│  │ Activated annual membership for user #456                  ││
│  │ [View Details]                                             ││
│  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

**Features:**

1. Filterable by date range
2. Filterable by actor
3. Filterable by action type
4. Filterable by table
5. Expandable details (old/new data diff)

**Acceptance Criteria:**

- [ ] Logs load with pagination
- [ ] Filters work correctly
- [ ] Details show diff
- [ ] Export to CSV (optional)

---

### Task 5.9: Analytics Dashboard

**GitHub Issue:** #43 - Implement Analytics Dashboard

#### 5.9.1: Create Analytics Screen

**Files:** `app/(admin)/analytics/index.tsx`

**Metrics to Display:**

1. User growth over time (line chart)
2. Revenue by month (bar chart)
3. Membership tier breakdown (pie chart)
4. Content engagement (views, likes, comments)
5. Chatbot usage (messages per day)
6. Escalation resolution time

**Charts Library:**

```bash
npm install victory-native react-native-svg
```

#### 5.9.2: Create Analytics Hooks

**Files:** `hooks/useAnalytics.ts`

```typescript
export function useUserGrowthAnalytics(days = 30) {
  return useQuery({
    queryKey: ['analytics', 'user-growth', days],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', getDateNDaysAgo(days));

      // Group by date
      return groupByDate(data, 'created_at');
    },
  });
}

export function useRevenueAnalytics(months = 6) {
  // ...
}

export function useEngagementAnalytics() {
  // ...
}
```

**Acceptance Criteria:**

- [ ] Charts render correctly
- [ ] Data accurate
- [ ] Date range selectable
- [ ] Responsive on all screens

---

## Testing Requirements

### Unit Tests

- [ ] Role-based route guards
- [ ] Admin stats calculations
- [ ] Content CRUD operations
- [ ] Escalation status transitions

### Integration Tests

- [ ] Admin dashboard loads stats
- [ ] User role update flow
- [ ] Content publish flow
- [ ] Escalation resolve flow

### E2E Tests

- [ ] Admin login → dashboard
- [ ] Create and publish content
- [ ] Manage user role
- [ ] Resolve escalation

### Security Tests

- [ ] Non-admin cannot access admin routes
- [ ] Editor cannot access admin-only routes
- [ ] Audit logs created for all actions

---

## Files Created/Modified Summary

### New Files

| Category       | Files                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout         | `app/(admin)/_layout.tsx`                                                                                                                                                                                                                                                                                                                                                                                                 |
| Components     | `components/admin/AdminSidebar.tsx`, `components/admin/AdminHeader.tsx`, `components/admin/RichTextEditor.tsx`, `components/admin/EscalationModal.tsx`, `components/admin/DataTable.tsx`                                                                                                                                                                                                                                  |
| Screens        | `app/(admin)/index.tsx`, `app/(admin)/users/index.tsx`, `app/(admin)/users/[id].tsx`, `app/(admin)/content/index.tsx`, `app/(admin)/content/new.tsx`, `app/(admin)/content/[id]/edit.tsx`, `app/(admin)/memberships/index.tsx`, `app/(admin)/escalations/index.tsx`, `app/(admin)/knowledge-base/index.tsx`, `app/(admin)/knowledge-base/[id].tsx`, `app/(admin)/audit-logs/index.tsx`, `app/(admin)/analytics/index.tsx` |
| Hooks          | `hooks/useAdminStats.ts`, `hooks/useAdminContent.ts`, `hooks/useAdminUsers.ts`, `hooks/useAnalytics.ts`                                                                                                                                                                                                                                                                                                                   |
| Edge Functions | `supabase/functions/admin/stats/index.ts`, `supabase/functions/admin/users/role/index.ts`, `supabase/functions/admin/users/membership/index.ts`, `supabase/functions/admin/escalations/resolve/index.ts`                                                                                                                                                                                                                  |

---

## Dependencies

### NPM Packages

```bash
# Rich text editor
npm install @10play/tentap-editor

# Charts
npm install victory-native react-native-svg
```

---

## Definition of Done

- [ ] Admin layout with sidebar navigation
- [ ] Dashboard displays live stats
- [ ] User list with search/filter
- [ ] User role update working
- [ ] Content CRUD working
- [ ] Bilingual content editor
- [ ] Content scheduling working
- [ ] Membership override working
- [ ] Escalation queue working
- [ ] Escalation resolution working
- [ ] Knowledge base editor working
- [ ] Audit logs viewable
- [ ] Analytics charts rendering
- [ ] All tests passing
- [ ] All GitHub Issues for Phase 5 closed

---

## Next Phase

Continue to [Phase 6: Polish & Launch](./07-PHASE-6-POLISH-LAUNCH.md)
