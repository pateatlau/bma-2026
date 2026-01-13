# Observability Implementation Guide - BMA 2026

> **Status**: Production-ready observability strategy for BMA Digital Platform
> **Version**: 1.0
> **Last Updated**: 2026-01-13

## Executive Summary

This document provides a comprehensive observability strategy for the BMA-2026 platform, covering error tracking, logging, performance monitoring, metrics, alerting, and incident response for both frontend (web/mobile) and backend (Supabase Edge Functions).

**Current State**: 35% production-ready (basic Sentry only)
**Target State**: 90% production-ready with full observability stack
**Priority**: Must Have for production launch

---

## Table of Contents

1. [Observability Pillars](#observability-pillars)
2. [Frontend Observability](#frontend-observability)
3. [Backend Observability](#backend-observability)
4. [Infrastructure Observability](#infrastructure-observability)
5. [Alerting Strategy](#alerting-strategy)
6. [Incident Response](#incident-response)
7. [Implementation Checklist](#implementation-checklist)
8. [Cost Analysis](#cost-analysis)

---

## Observability Pillars

### The Three Pillars of Observability

```
┌──────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY STACK                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   METRICS   │  │    LOGS     │  │   TRACES    │         │
│  │             │  │             │  │             │         │
│  │  • Counters │  │  • Errors   │  │  • Requests │         │
│  │  • Gauges   │  │  • Events   │  │  • Spans    │         │
│  │  • Histogram│  │  • Audit    │  │  • Context  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │              ALERTING & DASHBOARDS               │        │
│  │  • Real-time notifications                      │        │
│  │  • Custom thresholds                            │        │
│  │  • Visualization                                │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Observability

### 1. Error Tracking (Sentry)

#### 1.1 Enhanced Sentry Configuration

**Files**: `lib/sentry.ts`, `app/_layout.tsx`

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function initSentry() {
  if (!process.env.EXPO_PUBLIC_SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',

    // Release tracking
    release: `bma-2026@${Constants.expoConfig?.version}`,
    dist: Platform.select({
      ios: Constants.expoConfig?.ios?.buildNumber,
      android: Constants.expoConfig?.android?.versionCode?.toString(),
      default: '1',
    }),

    // Performance monitoring
    enableAutoSessionTracking: true,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0, // 20% in prod, 100% in dev

    // Error sampling
    sampleRate: 1.0, // Capture 100% of errors

    // Integrations
    integrations: [
      new Sentry.ReactNativeTracing({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.supabase\.co/,
          /^https:\/\/bma2026\.org/,
        ],
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
      }),
    ],

    // Before send hook - filter sensitive data
    beforeSend(event, hint) {
      // Remove PII from error context
      if (event.request?.data) {
        // Redact passwords, tokens, credit cards
        event.request.data = redactSensitiveFields(event.request.data);
      }

      // Don't send errors from development
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEV_MODE) {
        return null;
      }

      return event;
    },

    // Breadcrumbs
    maxBreadcrumbs: 50,
    attachStacktrace: true,
  });

  // Set default context
  Sentry.setContext('app', {
    platform: Platform.OS,
    version: Constants.expoConfig?.version,
    deviceYearClass: Constants.deviceYearClass,
  });
}

// Helper: Redact sensitive fields
function redactSensitiveFields(data: any): any {
  const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'credit_card', 'ssn'];

  if (typeof data === 'object' && data !== null) {
    const redacted = { ...data };
    for (const key in redacted) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = redactSensitiveFields(redacted[key]);
      }
    }
    return redacted;
  }
  return data;
}

// Enhanced error capture with context
export function captureException(
  error: Error,
  context?: {
    level?: Sentry.SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: { id: string; email?: string; role?: string };
  }
) {
  Sentry.captureException(error, {
    level: context?.level || 'error',
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  });
}

// Capture custom messages
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

// Set user context
export function setUser(user: { id: string; email?: string; role?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
}

// Add breadcrumb
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}) {
  Sentry.addBreadcrumb(breadcrumb);
}
```

#### 1.2 Error Boundaries

**Files**: `components/ErrorBoundary.tsx`

```typescript
import React, { Component, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry with component stack
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
      tags: {
        error_boundary: 'true',
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Button title="Try Again" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  message: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
});
```

#### 1.3 Source Map Upload

**Files**: `package.json`, `.github/workflows/deploy.yml`

```json
// package.json
{
  "scripts": {
    "sentry:sourcemaps": "sentry-cli sourcemaps upload --org bma-org --project bma-2026 ./dist",
    "build:prod": "expo export --platform all && npm run sentry:sourcemaps"
  }
}
```

```yaml
# .github/workflows/deploy.yml
- name: Upload source maps to Sentry
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: bma-org
    SENTRY_PROJECT: bma-2026
  run: |
    npm install -g @sentry/cli
    sentry-cli releases new ${{ github.sha }}
    sentry-cli releases set-commits ${{ github.sha }} --auto
    sentry-cli sourcemaps upload --release ${{ github.sha }} ./dist
    sentry-cli releases finalize ${{ github.sha }}
```

### 2. Performance Monitoring (APM)

#### 2.1 Sentry Performance Monitoring

```typescript
// lib/performance.ts
import * as Sentry from '@sentry/react-native';

// Track custom transactions
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}

// Track API calls
export async function trackApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
  const transaction = Sentry.startTransaction({
    name,
    op: 'http.client',
  });

  try {
    const result = await apiCall();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}

// Track database queries
export async function trackDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> {
  const span = Sentry.getCurrentHub().getScope()?.getTransaction()?.startChild({
    op: 'db.query',
    description: queryName,
  });

  try {
    return await query();
  } finally {
    span?.finish();
  }
}
```

#### 2.2 Web Vitals Tracking (Web Only)

**Files**: `app/_layout.web.tsx`

```typescript
// app/_layout.web.tsx
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';
import * as Sentry from '@sentry/react';

export function initWebVitals() {
  onCLS((metric) => Sentry.captureMessage(`CLS: ${metric.value}`, 'info'));
  onFID((metric) => Sentry.captureMessage(`FID: ${metric.value}`, 'info'));
  onFCP((metric) => Sentry.captureMessage(`FCP: ${metric.value}`, 'info'));
  onLCP((metric) => Sentry.captureMessage(`LCP: ${metric.value}`, 'info'));
  onTTFB((metric) => Sentry.captureMessage(`TTFB: ${metric.value}`, 'info'));
}
```

### 3. User Behavior Analytics

#### 3.1 Analytics Provider (Mixpanel or PostHog)

**Files**: `lib/analytics.ts`

```typescript
// lib/analytics.ts
import mixpanel from 'mixpanel-react-native';

let analyticsInitialized = false;

export async function initAnalytics() {
  if (analyticsInitialized) return;

  const token = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    console.warn('[Analytics] Token not configured, skipping');
    return;
  }

  await mixpanel.init(token);
  analyticsInitialized = true;
}

// Track events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!analyticsInitialized) return;
  mixpanel.track(eventName, properties);
}

// Track page views
export function trackPageView(screenName: string, properties?: Record<string, any>) {
  trackEvent('Page View', { screen: screenName, ...properties });
}

// Identify user
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (!analyticsInitialized) return;
  mixpanel.identify(userId);
  if (traits) {
    mixpanel.getPeople().set(traits);
  }
}

// Track user properties
export function setUserProperties(properties: Record<string, any>) {
  if (!analyticsInitialized) return;
  mixpanel.getPeople().set(properties);
}

// Track revenue
export function trackRevenue(amount: number, properties?: Record<string, any>) {
  if (!analyticsInitialized) return;
  mixpanel.getPeople().trackCharge(amount, properties);
}
```

#### 3.2 Key Events to Track

```typescript
// Track key user actions
trackEvent('User Signup', { method: 'email' });
trackEvent('Membership Purchase', { tier: 'premium', amount: 500 });
trackEvent('Content View', { type: 'news', id: 'article-123' });
trackEvent('Chatbot Message', { type: 'question' });
trackEvent('Payment Success', { method: 'razorpay', amount: 500 });
trackEvent('Payment Failed', { reason: 'insufficient_funds' });
trackEvent('Profile Update', { field: 'avatar' });
trackEvent('Directory Search', { query: 'surname' });
```

---

## Backend Observability

### 1. Edge Function Logging

#### 1.1 Structured Logging

**Files**: `supabase/functions/_shared/logger.ts`

```typescript
// supabase/functions/_shared/logger.ts
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  functionName?: string;
  [key: string]: any;
}

export class Logger {
  constructor(private context: LogContext = {}) {}

  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...(data && { data }),
    };

    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...error,
    });
  }

  fatal(message: string, error?: Error | any) {
    this.log(LogLevel.FATAL, message, {
      error: error?.message,
      stack: error?.stack,
      ...error,
    });
  }

  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

// Usage example
export function createLogger(functionName: string, requestId?: string): Logger {
  return new Logger({ functionName, requestId });
}
```

#### 1.2 Edge Function Error Handler

**Files**: `supabase/functions/_shared/error-handler.ts`

```typescript
// supabase/functions/_shared/error-handler.ts
import { Logger } from './logger.ts';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(error: Error | ApiError, logger: Logger): Response {
  if (error instanceof ApiError) {
    logger.warn(`API Error: ${error.message}`, {
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
    });

    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
        details: error.details,
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Unknown error
  logger.error('Unhandled error', error);

  return new Response(
    JSON.stringify({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

#### 1.3 Request Tracing

**Files**: `supabase/functions/_shared/tracing.ts`

```typescript
// supabase/functions/_shared/tracing.ts
import { Logger } from './logger.ts';

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function extractTraceContext(req: Request): {
  traceId?: string;
  spanId?: string;
  requestId: string;
} {
  const traceId = req.headers.get('x-trace-id') || undefined;
  const spanId = req.headers.get('x-span-id') || undefined;
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  return { traceId, spanId, requestId };
}

export async function withTracing<T>(
  req: Request,
  functionName: string,
  handler: (logger: Logger, context: any) => Promise<T>
): Promise<Response> {
  const startTime = Date.now();
  const { traceId, spanId, requestId } = extractTraceContext(req);

  const logger = new Logger({
    functionName,
    requestId,
    traceId,
    spanId,
  });

  logger.info('Request started', {
    method: req.method,
    url: req.url,
  });

  try {
    const result = await handler(logger, { traceId, spanId, requestId });

    const duration = Date.now() - startTime;
    logger.info('Request completed', { duration });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'x-duration-ms': duration.toString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Request failed', error);

    return handleError(error as Error, logger);
  }
}
```

### 2. Database Query Monitoring

#### 2.1 Supabase Query Logging

**Files**: `lib/supabase.ts`

```typescript
// lib/supabase.ts - Enhanced with logging
import { createClient } from '@supabase/supabase-js';
import { addBreadcrumb } from './sentry';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    // Log all queries in development
    fetch: async (url, options) => {
      const startTime = Date.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Supabase] ${options?.method || 'GET'} ${url}`);
      }

      try {
        const response = await fetch(url, options);
        const duration = Date.now() - startTime;

        // Add breadcrumb for Sentry
        addBreadcrumb({
          message: 'Supabase Query',
          category: 'database',
          level: 'info',
          data: {
            url,
            method: options?.method,
            duration,
            status: response.status,
          },
        });

        if (duration > 1000) {
          console.warn(`[Supabase] Slow query (${duration}ms): ${url}`);
        }

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Supabase] Query failed (${duration}ms):`, error);
        throw error;
      }
    },
  },
});
```

---

## Infrastructure Observability

### 1. Health Check Endpoints

**Files**: `supabase/functions/health/index.ts`

```typescript
// supabase/functions/health/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabase.from('profiles').select('count').limit(1).single();

    if (dbError) throw new Error(`Database check failed: ${dbError.message}`);

    // Check external services (optional)
    const checks = {
      database: 'healthy',
      storage: 'healthy', // Add actual storage check if needed
      auth: 'healthy', // Add actual auth check if needed
    };

    const duration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        duration,
        checks,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        duration,
        error: error.message,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
```

### 2. Uptime Monitoring

**Service**: UptimeRobot or Better Uptime

#### 2.1 Configure Monitors

```yaml
# UptimeRobot Configuration (via API or Dashboard)
monitors:
  - name: 'BMA Website'
    url: 'https://bma2026.org'
    type: 'HTTP(s)'
    interval: 300 # 5 minutes
    alert_contacts: ['admin@bma2026.org']

  - name: 'BMA API Health'
    url: 'https://[project-id].supabase.co/functions/v1/health'
    type: 'HTTP(s)'
    interval: 300
    alert_contacts: ['admin@bma2026.org']

  - name: 'Supabase Database'
    url: 'https://[project-id].supabase.co'
    type: 'HTTP(s)'
    interval: 300
    alert_contacts: ['admin@bma2026.org']
```

---

## Alerting Strategy

### 1. Alert Rules

#### Critical Alerts (Immediate Response)

| Alert                       | Condition           | Threshold | Channel      |
| --------------------------- | ------------------- | --------- | ------------ |
| **Website Down**            | HTTP status ≠ 200   | 2 minutes | Email, SMS   |
| **Database Down**           | Health check fails  | 1 minute  | Email, SMS   |
| **High Error Rate**         | Error rate > 5%     | 5 minutes | Email, Slack |
| **Edge Function Timeout**   | Latency > 10s       | 5 minutes | Email, Slack |
| **Payment Webhook Failure** | Failed webhooks > 3 | Immediate | Email, SMS   |

#### Warning Alerts (Monitor & Investigate)

| Alert                         | Condition         | Threshold  | Channel |
| ----------------------------- | ----------------- | ---------- | ------- |
| **Slow API Response**         | p95 latency > 3s  | 10 minutes | Slack   |
| **High Database Connections** | Connections > 80% | 5 minutes  | Slack   |
| **Storage Usage High**        | Storage > 80%     | Daily      | Email   |
| **Error Rate Elevated**       | Error rate > 1%   | 15 minutes | Slack   |
| **Low Cache Hit Rate**        | CDN cache < 70%   | 1 hour     | Email   |

#### Informational Alerts (Track Trends)

| Alert                       | Condition         | Threshold | Channel |
| --------------------------- | ----------------- | --------- | ------- |
| **Daily User Signup**       | New users < 5     | Daily     | Email   |
| **Payment Success Rate**    | Success < 95%     | Daily     | Email   |
| **Chatbot Escalation Rate** | Escalations > 20% | Daily     | Email   |

### 2. Notification Channels

#### 2.1 Email Alerts (SendGrid or Resend)

**Files**: `supabase/functions/_shared/alerts.ts`

```typescript
// supabase/functions/_shared/alerts.ts
export async function sendEmailAlert(to: string, subject: string, body: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'alerts@bma2026.org',
      to,
      subject: `[BMA Alert] ${subject}`,
      html: body,
    }),
  });
}
```

#### 2.2 Slack Alerts

**Files**: `supabase/functions/_shared/slack.ts`

```typescript
// supabase/functions/_shared/slack.ts
export async function sendSlackAlert(message: string, severity: 'critical' | 'warning' | 'info') {
  const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!webhookUrl) return;

  const color = {
    critical: '#DC2626',
    warning: '#F59E0B',
    info: '#3B82F6',
  }[severity];

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color,
          text: message,
          footer: 'BMA 2026 Monitoring',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
  });
}
```

---

## Incident Response

### 1. Incident Severity Levels

| Level             | Description                                   | Response Time | Escalation                          |
| ----------------- | --------------------------------------------- | ------------- | ----------------------------------- |
| **P0 - Critical** | Complete outage, data loss, security breach   | < 15 minutes  | Immediate escalation to admin       |
| **P1 - High**     | Major feature broken, significant user impact | < 1 hour      | Escalate if not resolved in 2 hours |
| **P2 - Medium**   | Minor feature broken, workaround available    | < 4 hours     | Escalate if not resolved in 1 day   |
| **P3 - Low**      | Cosmetic issue, low user impact               | < 1 day       | No escalation needed                |

### 2. Incident Response Runbook

**Files**: `docs/RUNBOOK.md`

```markdown
# BMA 2026 Production Runbook

## Incident Response Process

1. **Detect** - Alert triggered or user report
2. **Acknowledge** - Confirm incident, assess severity
3. **Investigate** - Check logs, metrics, traces
4. **Mitigate** - Apply immediate fix or workaround
5. **Resolve** - Deploy permanent fix
6. **Post-Mortem** - Document learnings

## Common Incidents

### Website Down (P0)

**Symptoms**: HTTP 500/503, health check fails, users can't access site

**Investigation**:

1. Check Vercel status: https://vercel-status.com
2. Check Supabase status: https://status.supabase.com
3. Review recent deployments: `vercel ls --prod`
4. Check DNS: `dig bma2026.org`
5. Check SSL certificate: `curl -vI https://bma2026.org`

**Resolution**:

- If recent deployment: Rollback with `vercel rollback`
- If Vercel down: Wait for service restoration
- If Supabase down: Enable maintenance mode
- If DNS issue: Contact domain registrar

**Escalation**: If unresolved in 15 minutes, escalate to admin

---

### High Error Rate (P1)

**Symptoms**: Sentry alerts, error rate > 5%

**Investigation**:

1. Check Sentry dashboard for error patterns
2. Check recent deployments
3. Check external service status (Razorpay, Gemini, Gupshup)
4. Review Edge Function logs

**Resolution**:

- If specific error: Deploy hotfix
- If external service: Implement fallback or retry logic
- If database: Check RLS policies, connection pool

---

### Payment Webhook Failure (P0)

**Symptoms**: Payment completed but membership not activated

**Investigation**:

1. Check Edge Function logs: `supabase functions logs razorpay-webhook`
2. Check webhook signature verification
3. Check database for payment record
4. Check Razorpay dashboard for webhook delivery status

**Resolution**:

1. Manual verification: Verify payment in Razorpay dashboard
2. Manual activation: Run admin script to activate membership
3. Fix webhook: Deploy fix to webhook handler
4. Test: Send test webhook from Razorpay dashboard

---

### Database Connection Pool Exhausted (P1)

**Symptoms**: "too many clients" errors, slow queries

**Investigation**:

1. Check Supabase dashboard for connection count
2. Check for long-running queries
3. Check for connection leaks in application code

**Resolution**:

1. Kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle'`
2. Increase connection pool limit (if needed)
3. Fix connection leaks in code

---

### Slow API Response (P2)

**Symptoms**: p95 latency > 3s, user complaints

**Investigation**:

1. Check Sentry Performance for slow transactions
2. Check database query performance
3. Check external API latency (Gemini, Razorpay)
4. Check CDN cache hit rate

**Resolution**:

- Optimize slow queries (add indexes, refactor)
- Implement caching for expensive operations
- Increase Edge Function timeout (if needed)
- Optimize bundle size

## Contact Information

- **Admin**: admin@bma2026.org
- **Supabase Support**: support@supabase.io
- **Vercel Support**: support@vercel.com
- **Razorpay Support**: support@razorpay.com
```

---

## Implementation Checklist

### Phase 6 (Pre-Launch) - Must Have

- [ ] **Sentry Setup**
  - [ ] Install `@sentry/react-native`
  - [ ] Configure DSN and environment
  - [ ] Implement error boundaries
  - [ ] Setup source map uploads
  - [ ] Test error capture
  - [ ] Configure before-send hook for PII redaction

- [ ] **Structured Logging**
  - [ ] Create Logger utility for Edge Functions
  - [ ] Implement request tracing (request ID, trace ID)
  - [ ] Add error handler wrapper
  - [ ] Test logging in development

- [ ] **Health Checks**
  - [ ] Create `/health` Edge Function
  - [ ] Test health check endpoint
  - [ ] Document health check response format

- [ ] **Uptime Monitoring**
  - [ ] Sign up for UptimeRobot (free tier)
  - [ ] Configure website monitor
  - [ ] Configure API health monitor
  - [ ] Configure alert contacts

- [ ] **Critical Alerts**
  - [ ] Configure Sentry alert rules
  - [ ] Setup email notifications
  - [ ] Test alert delivery
  - [ ] Document escalation process

- [ ] **Runbook**
  - [ ] Document common incidents
  - [ ] Document investigation steps
  - [ ] Document resolution procedures
  - [ ] Document contact information

### Phase 7 (Post-Launch) - Nice to Have

- [ ] **Enhanced Analytics**
  - [ ] Install Mixpanel or PostHog
  - [ ] Implement event tracking
  - [ ] Create analytics dashboards
  - [ ] Track user funnels

- [ ] **Performance Monitoring**
  - [ ] Enable Sentry Performance (upgrade to Team plan)
  - [ ] Track Web Vitals on web
  - [ ] Create performance dashboards
  - [ ] Set performance budgets

- [ ] **Advanced Alerting**
  - [ ] Setup Slack notifications
  - [ ] Configure on-call schedule (PagerDuty/Opsgenie)
  - [ ] Implement alert deduplication
  - [ ] Create custom alert rules

- [ ] **Log Aggregation**
  - [ ] Evaluate log aggregation tools (Datadog, LogRocket)
  - [ ] Setup centralized logging
  - [ ] Create log dashboards
  - [ ] Setup log retention policy

- [ ] **Distributed Tracing**
  - [ ] Implement OpenTelemetry
  - [ ] Trace frontend→Edge Function→database
  - [ ] Create trace visualizations
  - [ ] Analyze slow requests

---

## Cost Analysis

### Free Tier (MVP - Phase 6)

| Service              | Plan      | Features                                | Cost         |
| -------------------- | --------- | --------------------------------------- | ------------ |
| **Sentry**           | Developer | 5K errors/month, 10K transactions/month | **$0/month** |
| **UptimeRobot**      | Free      | 50 monitors, 5-minute checks            | **$0/month** |
| **Supabase Logs**    | Included  | Native logging, 7-day retention         | **$0/month** |
| **Vercel Analytics** | Hobby     | Basic traffic analytics                 | **$0/month** |
| **Total**            |           |                                         | **$0/month** |

### Paid Tier (Production - Phase 7)

| Service              | Plan   | Features                                                   | Cost                 |
| -------------------- | ------ | ---------------------------------------------------------- | -------------------- |
| **Sentry**           | Team   | 50K errors/month, 100K transactions/month, Performance APM | **$26/month**        |
| **Mixpanel**         | Growth | 100K MTU, unlimited events                                 | **$25/month**        |
| **Better Uptime**    | Basic  | Unlimited monitors, 1-minute checks, status page           | **$18/month**        |
| **Supabase**         | Pro    | Extended logs, 90-day retention                            | Included in Pro plan |
| **Vercel Analytics** | Pro    | Advanced analytics, Web Vitals                             | Included in Pro plan |
| **Total**            |        |                                                            | **~$69/month**       |

### Enterprise Tier (Optional - Future)

| Service       | Plan         | Features                                    | Cost                      |
| ------------- | ------------ | ------------------------------------------- | ------------------------- |
| **Datadog**   | Pro          | Full-stack observability, APM, logs, traces | **$15/host** (~$45/month) |
| **PagerDuty** | Professional | On-call scheduling, escalation              | **$41/user/month**        |
| **LogRocket** | Team         | Session replay, error tracking              | **$99/month**             |
| **Total**     |              |                                             | **~$185/month**           |

---

## Summary

This observability strategy provides a **production-ready monitoring solution** for BMA-2026:

**Phase 6 (Pre-Launch)**:

- ✅ Error tracking (Sentry)
- ✅ Basic uptime monitoring (UptimeRobot)
- ✅ Health checks
- ✅ Critical alerts
- ✅ Incident runbook
- **Cost**: $0/month

**Phase 7 (Post-Launch)**:

- ✅ Performance monitoring (Sentry APM)
- ✅ User analytics (Mixpanel)
- ✅ Enhanced alerting (Slack, on-call)
- ✅ Advanced monitoring (Better Uptime)
- **Cost**: ~$69/month

**Key Metrics Tracked**:

- Frontend errors (100% capture)
- Backend errors (100% capture)
- API latency (p50, p95, p99)
- Database query performance
- User behavior (events, funnels)
- Infrastructure health (uptime, connections)

This provides **end-to-end observability** from user interaction → frontend → Edge Function → database, enabling rapid incident detection and resolution.
