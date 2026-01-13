# Analytics Implementation Guide - BMA 2026

> **Status**: Production-ready analytics strategy for BMA Digital Platform
> **Version**: 1.0
> **Last Updated**: 2026-01-13

## Executive Summary

This document provides a comprehensive analytics strategy for the BMA-2026 platform, covering business metrics, user behavior tracking, admin dashboard analytics, and data visualization for both frontend (web/mobile) and backend.

**Current State**: 35-40% production-ready (basic admin dashboard only)
**Target State**: 90% production-ready with full analytics stack
**Priority**: Must Have for production launch (business metrics) + Should Have (user behavior tracking)

---

## Table of Contents

1. [Analytics Architecture](#analytics-architecture)
2. [Admin Dashboard Analytics](#admin-dashboard-analytics)
3. [User Behavior Tracking](#user-behavior-tracking)
4. [Business Metrics](#business-metrics)
5. [Funnel Analysis](#funnel-analysis)
6. [Real-time Dashboards](#real-time-dashboards)
7. [Analytics Database Schema](#analytics-database-schema)
8. [Implementation Checklist](#implementation-checklist)
9. [Cost Analysis](#cost-analysis)

---

## Analytics Architecture

### The Four Pillars of Analytics

```
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYTICS STACK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   BUSINESS   │  │    USER      │  │   PRODUCT    │          │
│  │   METRICS    │  │  BEHAVIOR    │  │  ANALYTICS   │          │
│  │              │  │              │  │              │          │
│  │  • MRR       │  │  • Events    │  │  • Funnels   │          │
│  │  • ARPU      │  │  • Sessions  │  │  • Cohorts   │          │
│  │  • Churn     │  │  • Pageviews │  │  • Retention │          │
│  │  • LTV       │  │  • Clicks    │  │  • A/B Tests │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │              ADMIN DASHBOARD                      │           │
│  │  • Real-time metrics                             │           │
│  │  • Custom reports                                │           │
│  │  • Visualizations (charts, tables)               │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Component            | Tool                             | Purpose                              | Cost                                                    |
| -------------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------- |
| **User Events**      | Mixpanel or PostHog              | Track user actions, funnels, cohorts | $25/month (Mixpanel Growth) or $0 (PostHog self-hosted) |
| **Business Metrics** | Custom Edge Functions + Supabase | Calculate MRR, ARPU, churn           | $0 (included)                                           |
| **Admin Dashboard**  | React + Recharts                 | Visualize metrics for admins         | $0 (built-in)                                           |
| **Web Analytics**    | Vercel Analytics                 | Page views, Web Vitals               | $0 (Hobby) or $10/month (Pro)                           |
| **Data Storage**     | Supabase PostgreSQL              | Time-series metrics, aggregations    | $0 (included)                                           |

---

## Admin Dashboard Analytics

### 1. Enhanced Analytics Dashboard

#### 1.1 Dashboard Overview

**Files**: `app/(admin)/dashboard/analytics.tsx`, `supabase/functions/admin/analytics.ts`

The admin dashboard provides real-time and historical analytics across 5 key areas:

1. **User Analytics** - Signups, active users, growth trends
2. **Membership Analytics** - Conversions, tier breakdown, renewals
3. **Content Analytics** - Views, engagement, popular content
4. **Chatbot Analytics** - Usage, escalations, resolution rates
5. **Revenue Analytics** - MRR, ARPU, payment success rates

#### 1.2 User Analytics

**Metrics Tracked:**

```typescript
interface UserAnalytics {
  // Snapshot metrics (as of now)
  total_users: number;
  total_members: number; // Paid users
  active_users_24h: number;
  active_users_7d: number;
  active_users_30d: number;

  // Growth metrics (time-series)
  new_users_today: number;
  new_users_7d: number;
  new_users_30d: number;
  growth_rate_30d: number; // Percentage

  // User breakdown
  users_by_tier: {
    free: number;
    premium: number;
    lifetime: number;
  };

  // Platform split
  users_by_platform: {
    web: number;
    ios: number;
    android: number;
  };
}
```

**Edge Function**: `supabase/functions/admin/analytics.ts`

```typescript
// supabase/functions/admin/analytics.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // User Analytics
  const { data: userStats } = await supabase.rpc('get_user_analytics');

  // Membership Analytics
  const { data: membershipStats } = await supabase.rpc('get_membership_analytics');

  // Content Analytics
  const { data: contentStats } = await supabase.rpc('get_content_analytics');

  // Chatbot Analytics
  const { data: chatbotStats } = await supabase.rpc('get_chatbot_analytics');

  // Revenue Analytics
  const { data: revenueStats } = await supabase.rpc('get_revenue_analytics');

  return new Response(
    JSON.stringify({
      users: userStats,
      memberships: membershipStats,
      content: contentStats,
      chatbot: chatbotStats,
      revenue: revenueStats,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

**Database Functions**: `supabase/migrations/create_analytics_functions.sql`

```sql
-- Get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_members', (SELECT COUNT(*) FROM memberships WHERE status = 'active'),
    'active_users_24h', (SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE created_at > NOW() - INTERVAL '24 hours'),
    'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE created_at > NOW() - INTERVAL '7 days'),
    'active_users_30d', (SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE created_at > NOW() - INTERVAL '30 days'),
    'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at::date = CURRENT_DATE),
    'new_users_7d', (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days'),
    'new_users_30d', (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days'),
    'growth_rate_30d', (
      SELECT ROUND(
        ((SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days')::NUMERIC /
         NULLIF((SELECT COUNT(*) FROM profiles WHERE created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'), 0) - 1) * 100,
        2
      )
    ),
    'users_by_tier', (
      SELECT json_build_object(
        'free', (SELECT COUNT(*) FROM profiles WHERE id NOT IN (SELECT user_id FROM memberships WHERE status = 'active')),
        'premium', (SELECT COUNT(*) FROM memberships WHERE status = 'active' AND tier = 'premium'),
        'lifetime', (SELECT COUNT(*) FROM memberships WHERE status = 'active' AND tier = 'lifetime')
      )
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get membership analytics
CREATE OR REPLACE FUNCTION get_membership_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_members', (SELECT COUNT(*) FROM memberships WHERE status = 'active'),
    'conversion_rate', (
      SELECT ROUND(
        (SELECT COUNT(*) FROM memberships WHERE status = 'active')::NUMERIC /
        NULLIF((SELECT COUNT(*) FROM profiles), 0) * 100,
        2
      )
    ),
    'renewals_30d', (SELECT COUNT(*) FROM payments WHERE created_at > NOW() - INTERVAL '30 days' AND payment_type = 'renewal'),
    'churn_rate_30d', (
      SELECT ROUND(
        (SELECT COUNT(*) FROM memberships WHERE status = 'cancelled' AND updated_at > NOW() - INTERVAL '30 days')::NUMERIC /
        NULLIF((SELECT COUNT(*) FROM memberships WHERE status = 'active'), 0) * 100,
        2
      )
    ),
    'tier_breakdown', (
      SELECT json_build_object(
        'premium', (SELECT COUNT(*) FROM memberships WHERE status = 'active' AND tier = 'premium'),
        'lifetime', (SELECT COUNT(*) FROM memberships WHERE status = 'active' AND tier = 'lifetime')
      )
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get revenue analytics
CREATE OR REPLACE FUNCTION get_revenue_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'mrr', (
      -- Monthly Recurring Revenue (premium only, exclude lifetime)
      SELECT COALESCE(SUM(amount), 0)
      FROM payments
      WHERE status = 'success'
        AND payment_type = 'subscription'
        AND created_at > NOW() - INTERVAL '30 days'
    ),
    'arr', (
      -- Annual Recurring Revenue
      SELECT COALESCE(SUM(amount), 0) * 12
      FROM payments
      WHERE status = 'success'
        AND payment_type = 'subscription'
        AND created_at > NOW() - INTERVAL '30 days'
    ),
    'arpu', (
      -- Average Revenue Per User (last 30 days)
      SELECT ROUND(
        COALESCE(SUM(amount), 0)::NUMERIC /
        NULLIF((SELECT COUNT(*) FROM memberships WHERE status = 'active'), 0),
        2
      )
      FROM payments
      WHERE status = 'success'
        AND created_at > NOW() - INTERVAL '30 days'
    ),
    'ltv', (
      -- Lifetime Value (average total revenue per member)
      SELECT ROUND(
        COALESCE(AVG(total_revenue), 0),
        2
      )
      FROM (
        SELECT user_id, SUM(amount) as total_revenue
        FROM payments
        WHERE status = 'success'
        GROUP BY user_id
      ) AS user_revenues
    ),
    'revenue_30d', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success' AND created_at > NOW() - INTERVAL '30 days'),
    'payment_success_rate', (
      SELECT ROUND(
        (SELECT COUNT(*) FROM payments WHERE status = 'success' AND created_at > NOW() - INTERVAL '30 days')::NUMERIC /
        NULLIF((SELECT COUNT(*) FROM payments WHERE created_at > NOW() - INTERVAL '30 days'), 0) * 100,
        2
      )
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get content analytics
CREATE OR REPLACE FUNCTION get_content_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_content', (SELECT COUNT(*) FROM content WHERE status = 'published'),
    'total_views_30d', (SELECT COALESCE(SUM(view_count), 0) FROM content WHERE created_at > NOW() - INTERVAL '30 days'),
    'total_likes_30d', (SELECT COUNT(*) FROM likes WHERE created_at > NOW() - INTERVAL '30 days'),
    'total_comments_30d', (SELECT COUNT(*) FROM comments WHERE created_at > NOW() - INTERVAL '30 days'),
    'engagement_rate', (
      SELECT ROUND(
        ((SELECT COUNT(*) FROM likes WHERE created_at > NOW() - INTERVAL '30 days') +
         (SELECT COUNT(*) FROM comments WHERE created_at > NOW() - INTERVAL '30 days'))::NUMERIC /
        NULLIF((SELECT COALESCE(SUM(view_count), 0) FROM content WHERE created_at > NOW() - INTERVAL '30 days'), 0) * 100,
        2
      )
    ),
    'popular_content', (
      SELECT json_agg(json_build_object(
        'id', id,
        'title', title_en,
        'views', view_count,
        'likes', likes_count
      ))
      FROM (
        SELECT id, title_en, view_count, likes_count
        FROM content
        WHERE status = 'published'
        ORDER BY view_count DESC
        LIMIT 10
      ) AS top_content
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get chatbot analytics
CREATE OR REPLACE FUNCTION get_chatbot_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_conversations', (SELECT COUNT(*) FROM chat_conversations),
    'total_messages_30d', (SELECT COUNT(*) FROM chat_messages WHERE created_at > NOW() - INTERVAL '30 days'),
    'avg_messages_per_conversation', (
      SELECT ROUND(
        (SELECT COUNT(*) FROM chat_messages WHERE created_at > NOW() - INTERVAL '30 days')::NUMERIC /
        NULLIF((SELECT COUNT(*) FROM chat_conversations WHERE created_at > NOW() - INTERVAL '30 days'), 0),
        2
      )
    ),
    'escalations_30d', (SELECT COUNT(*) FROM escalations WHERE created_at > NOW() - INTERVAL '30 days'),
    'escalation_rate', (
      SELECT ROUND(
        (SELECT COUNT(*) FROM escalations WHERE created_at > NOW() - INTERVAL '30 days')::NUMERIC /
        NULLIF((SELECT COUNT(*) FROM chat_conversations WHERE created_at > NOW() - INTERVAL '30 days'), 0) * 100,
        2
      )
    ),
    'avg_resolution_time_hours', (
      SELECT ROUND(
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600),
        2
      )
      FROM escalations
      WHERE status = 'resolved'
        AND created_at > NOW() - INTERVAL '30 days'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.3 Dashboard UI with Charts

**Files**: `app/(admin)/dashboard/analytics.tsx`

**Install Chart Library:**

```bash
npm install recharts
```

**Dashboard Component:**

```typescript
// app/(admin)/dashboard/analytics.tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart, BarChart, PieChart, Line, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  users: any;
  memberships: any;
  content: any;
  chatbot: any;
  revenue: any;
}

export default function AnalyticsScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    const { data: analytics, error } = await supabase.functions.invoke('admin/analytics');
    if (!error && analytics) {
      setData(analytics);
    }
    setLoading(false);
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!data) {
    return <Text>Failed to load analytics</Text>;
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* Key Metrics Cards */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <MetricCard
          title="Total Users"
          value={data.users.total_users}
          change={`+${data.users.new_users_7d} this week`}
        />
        <MetricCard
          title="Total Members"
          value={data.users.total_members}
          change={`${data.memberships.conversion_rate}% conversion`}
        />
        <MetricCard
          title="MRR"
          value={`₹${data.revenue.mrr.toLocaleString()}`}
          change={`ARPU: ₹${data.revenue.arpu}`}
        />
        <MetricCard
          title="Active Users (30d)"
          value={data.users.active_users_30d}
          change={`${data.users.growth_rate_30d}% growth`}
        />
      </View>

      {/* User Growth Chart */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          User Growth (Last 30 Days)
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generateUserGrowthData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#DC2626" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </View>

      {/* Membership Tier Breakdown */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Membership Tier Breakdown
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Free', value: data.users.users_by_tier.free },
                { name: 'Premium', value: data.users.users_by_tier.premium },
                { name: 'Lifetime', value: data.users.users_by_tier.lifetime },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill="#9CA3AF" /> {/* Free - Gray */}
              <Cell fill="#DC2626" /> {/* Premium - Red */}
              <Cell fill="#0A0A0A" /> {/* Lifetime - Black */}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </View>

      {/* Revenue Chart */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Revenue (Last 6 Months)
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={generateRevenueData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#DC2626" />
          </BarChart>
        </ResponsiveContainer>
      </View>

      {/* Content Engagement */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Content Engagement (Last 30 Days)
        </Text>
        <View style={{ flexDirection: 'row', gap: 32 }}>
          <View>
            <Text>Views: {data.content.total_views_30d}</Text>
            <Text>Likes: {data.content.total_likes_30d}</Text>
            <Text>Comments: {data.content.total_comments_30d}</Text>
            <Text>Engagement Rate: {data.content.engagement_rate}%</Text>
          </View>
        </View>
      </View>

      {/* Popular Content */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Top 10 Popular Content
        </Text>
        {data.content.popular_content?.map((item: any, index: number) => (
          <View key={item.id} style={{ padding: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
            <Text style={{ fontWeight: 'bold' }}>
              {index + 1}. {item.title}
            </Text>
            <Text style={{ color: '#6B7280' }}>
              {item.views} views • {item.likes} likes
            </Text>
          </View>
        ))}
      </View>

      {/* Chatbot Analytics */}
      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Chatbot Performance
        </Text>
        <View>
          <Text>Total Conversations: {data.chatbot.total_conversations}</Text>
          <Text>Messages (30d): {data.chatbot.total_messages_30d}</Text>
          <Text>Avg Messages/Conversation: {data.chatbot.avg_messages_per_conversation}</Text>
          <Text>Escalations (30d): {data.chatbot.escalations_30d}</Text>
          <Text>Escalation Rate: {data.chatbot.escalation_rate}%</Text>
          <Text>Avg Resolution Time: {data.chatbot.avg_resolution_time_hours}h</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function MetricCard({ title, value, change }: { title: string; value: any; change: string }) {
  return (
    <View style={{ flex: 1, minWidth: 200, padding: 20, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 4 }}>{value}</Text>
      <Text style={{ fontSize: 12, color: '#10B981' }}>{change}</Text>
    </View>
  );
}

// Helper: Generate mock data for user growth chart
function generateUserGrowthData() {
  // In production, fetch actual time-series data from analytics_metrics table
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: Math.floor(Math.random() * 100) + 50, // Replace with actual data
    });
  }
  return data;
}

// Helper: Generate mock data for revenue chart
function generateRevenueData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 10000, // Replace with actual data
  }));
}
```

---

## User Behavior Tracking

### 2. Mixpanel Integration

#### 2.1 Setup Mixpanel

**Install SDK:**

```bash
npm install mixpanel-react-native
```

**Files**: `lib/analytics.ts`

```typescript
// lib/analytics.ts
import { Mixpanel } from 'mixpanel-react-native';

let mixpanel: Mixpanel | null = null;
let analyticsInitialized = false;

export async function initAnalytics() {
  if (analyticsInitialized) return;

  const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    console.warn('[Analytics] Mixpanel token not configured, skipping');
    return;
  }

  mixpanel = new Mixpanel(token, true /* track automatic events */);
  await mixpanel.init();
  analyticsInitialized = true;
}

// Track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!mixpanel || !analyticsInitialized) return;
  mixpanel.track(eventName, properties);
}

// Track page views
export function trackPageView(screenName: string, properties?: Record<string, any>) {
  trackEvent('Page View', { screen: screenName, ...properties });
}

// Identify user
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (!mixpanel || !analyticsInitialized) return;
  mixpanel.identify(userId);
  if (traits) {
    mixpanel.getPeople().set(traits);
  }
}

// Set user properties
export function setUserProperties(properties: Record<string, any>) {
  if (!mixpanel || !analyticsInitialized) return;
  mixpanel.getPeople().set(properties);
}

// Track revenue
export function trackRevenue(amount: number, properties?: Record<string, any>) {
  if (!mixpanel || !analyticsInitialized) return;
  mixpanel.getPeople().trackCharge(amount, properties);
}

// Increment user property
export function incrementUserProperty(property: string, by: number = 1) {
  if (!mixpanel || !analyticsInitialized) return;
  mixpanel.getPeople().increment(property, by);
}

// Reset (on logout)
export function resetAnalytics() {
  if (!mixpanel || !analyticsInitialized) return;
  mixpanel.reset();
}
```

#### 2.2 Event Taxonomy

**User Lifecycle Events:**

```typescript
// User Registration
trackEvent('User Signup', {
  method: 'email' | 'google' | 'facebook',
  source: 'web' | 'ios' | 'android',
  referrer:
    Platform.OS === 'web' && typeof document !== 'undefined'
      ? document.referrer || 'direct'
      : 'direct',
});

// User Login
trackEvent('User Login', {
  method: 'email' | 'google' | 'facebook',
  source: 'web' | 'ios' | 'android',
});

// User Logout
trackEvent('User Logout', {
  session_duration_minutes: 45,
});
```

**Membership Events:**

```typescript
// Membership Purchase Started
trackEvent('Membership Purchase Started', {
  tier: 'premium' | 'lifetime',
  amount: 500,
});

// Membership Purchase Success
trackEvent('Membership Purchase Success', {
  tier: 'premium' | 'lifetime',
  amount: 500,
  payment_method: 'razorpay',
  transaction_id: 'pay_xyz123',
});
trackRevenue(500, { tier: 'premium' });

// Membership Purchase Failed
trackEvent('Membership Purchase Failed', {
  tier: 'premium' | 'lifetime',
  amount: 500,
  error_code: 'insufficient_funds',
  error_message: 'Card declined',
});

// Membership Renewed
trackEvent('Membership Renewed', {
  tier: 'premium',
  amount: 500,
});

// Membership Cancelled
trackEvent('Membership Cancelled', {
  tier: 'premium',
  reason: 'too_expensive' | 'not_using' | 'other',
});
```

**Content Events:**

```typescript
// Content View
trackEvent('Content View', {
  content_type: 'news' | 'event' | 'announcement',
  content_id: 'article-123',
  content_title: 'Community Gathering 2026',
});

// Content Like
trackEvent('Content Like', {
  content_type: 'news',
  content_id: 'article-123',
});

// Content Comment
trackEvent('Content Comment', {
  content_type: 'news',
  content_id: 'article-123',
  comment_length: 150,
});

// Content Share
trackEvent('Content Share', {
  content_type: 'news',
  content_id: 'article-123',
  platform: 'whatsapp' | 'facebook' | 'twitter',
});
```

**Chatbot Events:**

```typescript
// Chatbot Conversation Started
trackEvent('Chatbot Conversation Started', {
  source: 'web' | 'ios' | 'android',
});

// Chatbot Message Sent
trackEvent('Chatbot Message Sent', {
  message_type: 'question' | 'feedback',
  message_length: 50,
  conversation_id: 'conv-123',
});

// Chatbot Escalation
trackEvent('Chatbot Escalation', {
  reason: 'unsupported_query' | 'user_request',
  conversation_id: 'conv-123',
  message_count: 5,
});
```

**Directory Events:**

```typescript
// Directory Search
trackEvent('Directory Search', {
  query: 'surname',
  results_count: 10,
});

// Directory Profile View
trackEvent('Directory Profile View', {
  profile_id: 'user-123',
});
```

#### 2.3 Auto-tracking with Navigation

**Files**: `app/_layout.tsx`

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { useSegments, usePathname } from 'expo-router';
import { initAnalytics, trackPageView } from '@/lib/analytics';

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return (
    // ... rest of layout
  );
}
```

---

## Business Metrics

### 3. Advanced Business Metrics

#### 3.1 Time-Series Metrics Table

**Files**: `supabase/migrations/create_analytics_metrics_table.sql`

```sql
-- Store pre-aggregated metrics for fast querying
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(metric_name, metric_date)
);

-- Index for fast queries
CREATE INDEX idx_analytics_metrics_name_date ON analytics_metrics(metric_name, metric_date DESC);

-- Enable RLS
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only access (matches pattern from Phase 0)
CREATE POLICY "Admin can view metrics" ON analytics_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

#### 3.2 Daily Metrics Aggregation

**Files**: `supabase/functions/cron/daily-metrics.ts`

```typescript
// supabase/functions/cron/daily-metrics.ts
// Called daily via Supabase cron job
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Calculate and store daily metrics
  const metrics = [
    // User metrics
    { name: 'total_users', value: await getTotalUsers(supabase) },
    { name: 'new_users', value: await getNewUsers(supabase) },
    { name: 'active_users', value: await getActiveUsers(supabase) },

    // Membership metrics
    { name: 'total_members', value: await getTotalMembers(supabase) },
    { name: 'new_members', value: await getNewMembers(supabase) },
    { name: 'churned_members', value: await getChurnedMembers(supabase) },

    // Revenue metrics
    { name: 'mrr', value: await getMRR(supabase) },
    { name: 'daily_revenue', value: await getDailyRevenue(supabase) },
    { name: 'arpu', value: await getARPU(supabase) },

    // Content metrics
    { name: 'content_views', value: await getContentViews(supabase) },
    { name: 'content_likes', value: await getContentLikes(supabase) },
    { name: 'content_comments', value: await getContentComments(supabase) },

    // Chatbot metrics
    { name: 'chatbot_conversations', value: await getChatbotConversations(supabase) },
    { name: 'chatbot_escalations', value: await getChatbotEscalations(supabase) },
  ];

  // Insert metrics
  for (const metric of metrics) {
    await supabase.from('analytics_metrics').upsert(
      {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_date: today,
      },
      { onConflict: 'metric_name,metric_date' }
    );
  }

  return new Response(JSON.stringify({ success: true, metrics_count: metrics.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Helper functions
async function getTotalUsers(supabase: any): Promise<number> {
  const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  return count || 0;
}

async function getNewUsers(supabase: any): Promise<number> {
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  return count || 0;
}

async function getActiveUsers(supabase: any): Promise<number> {
  const { data } = await supabase
    .from('audit_logs')
    .select('user_id')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  return new Set(data?.map((log: any) => log.user_id)).size;
}

async function getTotalMembers(supabase: any): Promise<number> {
  const { count } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  return count || 0;
}

async function getMRR(supabase: any): Promise<number> {
  // Monthly Recurring Revenue (premium subscriptions only)
  const { data } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'success')
    .eq('payment_type', 'subscription')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  return data?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
}

async function getARPU(supabase: any): Promise<number> {
  const mrr = await getMRR(supabase);
  const totalMembers = await getTotalMembers(supabase);
  return totalMembers > 0 ? mrr / totalMembers : 0;
}

// ... other helper functions
```

**Configure Supabase Cron Job:**

```sql
-- Schedule daily metrics aggregation (runs at 00:00 UTC daily)
SELECT cron.schedule(
  'daily-metrics-aggregation',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://[project-id].supabase.co/functions/v1/cron/daily-metrics',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) AS request_id;
  $$
);
```

---

## Funnel Analysis

### 4. User Funnels

#### 4.1 Signup → Payment Funnel

**Mixpanel Funnel Configuration:**

```typescript
// Define funnel steps
const signupToPaymentFunnel = [
  { event: 'User Signup', label: 'Signed Up' },
  { event: 'Profile Completed', label: 'Completed Profile' },
  { event: 'Membership Purchase Started', label: 'Started Purchase' },
  { event: 'Membership Purchase Success', label: 'Completed Purchase' },
];

// Track funnel in Mixpanel dashboard
// Funnel conversion rate = (Completed Purchase / Signed Up) * 100
```

**Database-based Funnel (Alternative):**

```sql
-- Calculate funnel conversion rates
CREATE OR REPLACE FUNCTION get_signup_funnel()
RETURNS TABLE(
  step TEXT,
  user_count BIGINT,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH funnel AS (
    SELECT
      COUNT(DISTINCT p.id) AS signed_up,
      COUNT(DISTINCT CASE WHEN p.full_name IS NOT NULL THEN p.id END) AS completed_profile,
      COUNT(DISTINCT CASE WHEN pay.status IN ('pending', 'success') THEN pay.user_id END) AS started_purchase,
      COUNT(DISTINCT CASE WHEN pay.status = 'success' THEN pay.user_id END) AS completed_purchase
    FROM profiles p
    LEFT JOIN payments pay ON p.id = pay.user_id
    WHERE p.created_at > NOW() - INTERVAL '30 days'
  )
  SELECT 'Signed Up'::TEXT, signed_up, 100.0
  FROM funnel
  UNION ALL
  SELECT 'Completed Profile', completed_profile, ROUND((completed_profile::NUMERIC / signed_up * 100), 2)
  FROM funnel
  UNION ALL
  SELECT 'Started Purchase', started_purchase, ROUND((started_purchase::NUMERIC / signed_up * 100), 2)
  FROM funnel
  UNION ALL
  SELECT 'Completed Purchase', completed_purchase, ROUND((completed_purchase::NUMERIC / signed_up * 100), 2)
  FROM funnel;
END;
$$ LANGUAGE plpgsql;
```

---

## Real-time Dashboards

### 5. Real-time Metrics (Optional - Phase 7)

**Use Supabase Realtime for live updates:**

```typescript
// Subscribe to real-time metric updates
const channel = supabase
  .channel('analytics-updates')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, (payload) => {
    console.log('New payment received:', payload.new);
    // Update dashboard in real-time
  })
  .subscribe();
```

---

## Analytics Database Schema

### 6. Complete Schema

```sql
-- analytics_metrics: Store daily aggregated metrics
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_name, metric_date)
);

-- analytics_events: Store custom events (if not using Mixpanel)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_metrics_name_date ON analytics_metrics(metric_name, metric_date DESC);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
```

---

## Implementation Checklist

### Phase 6 (Pre-Launch) - Must Have

**Admin Dashboard:**

- [ ] Install Recharts library (`npm install recharts`)
- [ ] Create analytics Edge Function (`/admin/analytics`)
- [ ] Create database functions (get_user_analytics, get_revenue_analytics, etc.)
- [ ] Build analytics dashboard UI with charts
- [ ] Add MRR, ARPU, churn rate calculations
- [ ] Create `analytics_metrics` table for time-series data
- [ ] Setup daily metrics aggregation cron job
- [ ] Test dashboard with real data

**User Behavior Tracking:**

- [ ] Install Mixpanel SDK (`npm install mixpanel-react-native`)
- [ ] Create analytics utility (`lib/analytics.ts`)
- [ ] Initialize Mixpanel in app layout
- [ ] Track key events (signup, login, purchase, content view)
- [ ] Setup user identification on login
- [ ] Track revenue for paid conversions
- [ ] Auto-track page views with navigation
- [ ] Test event tracking in Mixpanel dashboard

**Business Metrics:**

- [ ] Create daily metrics aggregation Edge Function
- [ ] Configure Supabase cron job (runs daily at 00:00 UTC)
- [ ] Implement MRR, ARPU, LTV calculations
- [ ] Store metrics in `analytics_metrics` table
- [ ] Test metrics accuracy with sample data

### Phase 7 (Post-Launch) - Nice to Have

**Advanced Analytics:**

- [ ] Create user cohorts in Mixpanel
- [ ] Define funnels (signup → payment, chatbot → escalation)
- [ ] Setup retention analysis
- [ ] Create custom reports for business metrics
- [ ] Add export functionality (CSV/PDF)
- [ ] Implement A/B testing framework

**Real-time Updates:**

- [ ] Subscribe to real-time payment events
- [ ] Update dashboard metrics in real-time
- [ ] Add WebSocket connection for live data

**Advanced Visualizations:**

- [ ] Add heatmap for content engagement
- [ ] Create geographic user distribution map
- [ ] Build custom chart types (sankey, treemap)

---

## Cost Analysis

### Free Tier (Phase 6)

| Service              | Plan        | Features                                   | Cost         |
| -------------------- | ----------- | ------------------------------------------ | ------------ |
| **Mixpanel**         | Free        | 100K MTU (tracked users), unlimited events | **$0/month** |
| **Supabase**         | Free        | PostgreSQL, Edge Functions, cron jobs      | **$0/month** |
| **Recharts**         | Open-source | Chart library                              | **$0**       |
| **Vercel Analytics** | Hobby       | Basic Web Vitals                           | **$0/month** |
| **Total**            |             |                                            | **$0/month** |

### Paid Tier (Phase 7)

| Service                   | Plan        | Features                                        | Cost                              |
| ------------------------- | ----------- | ----------------------------------------------- | --------------------------------- |
| **Mixpanel**              | Growth      | 100K MTU, unlimited events, funnels, cohorts    | **$25/month**                     |
| **PostHog** (Alternative) | Self-hosted | Unlimited events, session replay, feature flags | **$0/month** (hosting costs only) |
| **Vercel Analytics**      | Pro         | Advanced Web Vitals, custom events              | **$10/month**                     |
| **Total**                 |             |                                                 | **$35/month**                     |

### Enterprise Tier (Optional - Future)

| Service             | Plan        | Features                         | Cost                              |
| ------------------- | ----------- | -------------------------------- | --------------------------------- |
| **Mixpanel**        | Enterprise  | Unlimited MTU, dedicated support | **$833/month** (starting)         |
| **Amplitude**       | Growth      | Advanced analytics, predictions  | **$49/month**                     |
| **Looker/Metabase** | Self-hosted | Custom BI dashboards             | **$0/month** (hosting costs only) |

---

## Summary

This analytics strategy provides a **production-ready analytics solution** for BMA-2026:

**Phase 6 (Pre-Launch)**:

- ✅ Admin dashboard with key metrics (users, memberships, revenue, content, chatbot)
- ✅ Business metrics (MRR, ARPU, LTV, churn, conversion rates)
- ✅ User event tracking (Mixpanel)
- ✅ Charts and visualizations (Recharts)
- ✅ Daily metrics aggregation (Supabase cron)
- **Cost**: $0/month (free tier)

**Phase 7 (Post-Launch)**:

- ✅ User cohorts and retention analysis
- ✅ Funnel optimization (signup → payment)
- ✅ Real-time dashboard updates
- ✅ Advanced reporting and exports
- **Cost**: ~$35/month

**Key Metrics Tracked**:

- User growth (signups, active users, growth rate)
- Membership metrics (conversions, churn, tier breakdown)
- Revenue metrics (MRR, ARPU, LTV, payment success rate)
- Content engagement (views, likes, comments, engagement rate)
- Chatbot performance (messages, escalations, resolution time)
- Platform analytics (web vs mobile split)

This provides **end-to-end analytics** from user acquisition → engagement → monetization, enabling data-driven decision making and business growth optimization.
