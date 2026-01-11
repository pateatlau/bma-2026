# Phase 6: Polish & Launch (Days 61-67)

## Overview

Phase 6 is the final sprint focused on testing, performance optimization, accessibility, security hardening, and deployment to production across all three platforms (Web, iOS, Android).

**Duration:** 7 days
**Prerequisites:** Phases 0-5 completed (all features implemented)
**Deliverables:**

- Comprehensive test coverage (95%+ on critical paths)
- Performance optimization (< 3s load time)
- Accessibility compliance (WCAG 2.1 AA)
- Security audit completion
- Production deployment (Web + iOS + Android)
- Monitoring and alerting setup

---

## Launch Checklist Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LAUNCH READINESS CHECKLIST                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Testing                                                            │
│  □ Unit tests passing (80%+ coverage)                              │
│  □ Integration tests passing                                        │
│  □ E2E tests passing (Web + Mobile)                                │
│  □ 95%+ coverage on critical paths                                 │
│                                                                     │
│  Performance                                                        │
│  □ < 3 second initial page load                                    │
│  □ < 100ms interaction response                                    │
│  □ Images optimized and lazy loaded                                │
│  □ Bundle size optimized (code splitting)                          │
│                                                                     │
│  Accessibility                                                      │
│  □ Screen reader tested                                            │
│  □ Keyboard navigation works                                       │
│  □ Color contrast passes WCAG AA                                   │
│  □ Focus indicators visible                                        │
│                                                                     │
│  Security                                                           │
│  □ RLS policies verified                                           │
│  □ Auth flows secure                                               │
│  □ Webhook verification working                                    │
│  □ No sensitive data in client                                     │
│  □ Rate limiting enforced                                          │
│                                                                     │
│  Deployment                                                         │
│  □ Web deployed to Vercel (production)                             │
│  □ iOS submitted to App Store                                      │
│  □ Android submitted to Play Store                                 │
│  □ Environment variables set                                       │
│  □ SSL certificates valid                                          │
│                                                                     │
│  Monitoring                                                         │
│  □ Error tracking (Sentry)                                         │
│  □ Analytics (if applicable)                                       │
│  □ Uptime monitoring                                               │
│  □ Alerting configured                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Task Breakdown

### Task 6.1: Comprehensive Testing

**GitHub Issue:** #44 - Complete Test Coverage

#### 6.1.1: Unit Test Coverage

**Files:** `__tests__/unit/**/*.test.ts`

**Priority Test Areas:**

1. Authentication context and hooks
2. Payment processing logic
3. Chat rate limiting
4. Content filtering and pagination
5. Membership calculations
6. i18n translation hooks

```typescript
// Example: Auth context tests
// __tests__/unit/contexts/AuthContext.test.tsx

describe('AuthContext', () => {
  it('should initialize with loading state', () => {});
  it('should set user on successful login', () => {});
  it('should clear user on logout', () => {});
  it('should handle OAuth callbacks', () => {});
  it('should refresh session automatically', () => {});
});

// Example: Payment hook tests
// __tests__/unit/hooks/usePayment.test.ts

describe('usePayment', () => {
  it('should generate idempotency key', () => {});
  it('should poll for payment status', () => {});
  it('should timeout after max attempts', () => {});
  it('should handle payment errors', () => {});
});
```

**Run coverage:**

```bash
npm run test:coverage
# Target: 80% overall, 95% on critical paths
```

#### 6.1.2: Integration Tests

**Files:** `__tests__/integration/**/*.test.ts`

**Key Integration Flows:**

1. User registration → email verification → profile completion
2. Content creation → publication → comment → like
3. Payment order → Razorpay → webhook → membership activation
4. Chat start → message → RAG response → escalation

```typescript
// Example: Payment integration test
// __tests__/integration/payment-flow.test.ts

describe('Payment Flow', () => {
  it('should create order and receive webhook', async () => {
    // 1. Create payment order
    const order = await createPaymentOrder('annual');
    expect(order.razorpay_order_id).toBeDefined();

    // 2. Simulate webhook
    await simulateWebhook('payment.captured', {
      order_id: order.razorpay_order_id,
      payment_id: 'pay_test_123',
    });

    // 3. Verify membership activated
    const membership = await getMembership(testUserId);
    expect(membership.status).toBe('active');
    expect(membership.tier).toBe('annual');
  });
});
```

#### 6.1.3: E2E Tests (Web)

**Files:** `e2e/web/**/*.spec.ts`

**Playwright Setup:**

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/web/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with email/password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/home');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpass');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});

// e2e/web/content.spec.ts
test.describe('Content', () => {
  test('should browse news articles', async ({ page }) => {
    await page.goto('/news');
    await expect(page.locator('[data-testid="news-list"]')).toBeVisible();
    await page.click('[data-testid="news-card"]:first-child');
    await expect(page.locator('[data-testid="news-detail"]')).toBeVisible();
  });
});
```

#### 6.1.4: E2E Tests (Mobile)

**Files:** `e2e/mobile/**/*.yaml`

**Maestro Setup:**

```bash
brew install maestro
maestro studio
```

```yaml
# e2e/mobile/auth.yaml
appId: com.bma.app2026
---
- launchApp
- tapOn: 'Sign In'
- tapOn:
    id: 'email-input'
- inputText: 'test@example.com'
- tapOn:
    id: 'password-input'
- inputText: 'password123'
- tapOn:
    id: 'login-button'
- assertVisible: 'Welcome'
```

**Acceptance Criteria:**

- [ ] Unit test coverage > 80%
- [ ] Critical path coverage > 95%
- [ ] Integration tests passing
- [ ] E2E tests passing on web
- [ ] E2E tests passing on mobile

---

### Task 6.2: Performance Optimization

**GitHub Issue:** #45 - Optimize Performance

#### 6.2.1: Bundle Size Optimization

**Files:** `metro.config.js`, `babel.config.js`

**Techniques:**

1. Tree shaking unused code
2. Code splitting by route
3. Lazy loading components
4. Remove unused dependencies

```javascript
// metro.config.js - Enable minification
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;
```

**Analyze bundle:**

```bash
npx expo export --platform web --analyze
```

#### 6.2.2: Image Optimization

**Files:** `lib/images.ts`, components using images

**Techniques:**

1. Use WebP format where supported
2. Implement responsive images
3. Lazy load below-fold images
4. Use blur placeholders

```typescript
// Ensure all images use OptimizedImage component
<OptimizedImage
  src={imageUrl}
  alt={title}
  width={400}
  height={300}
  priority={false} // Lazy load
  placeholder="blur"
/>
```

#### 6.2.3: Query Optimization

**Files:** `hooks/use*.ts`, API calls

**Techniques:**

1. Implement pagination (not loading all data)
2. Use select to fetch only needed columns
3. Add database indexes (already done in Phase 0)
4. Cache frequently accessed data

```typescript
// Before: Fetching all columns
const { data } = await supabase.from('content').select('*');

// After: Fetch only needed columns
const { data } = await supabase
  .from('content')
  .select('id, title_en, slug, featured_image_url, published_at, likes_count')
  .limit(20);
```

#### 6.2.4: Render Optimization

**Files:** React components

**Techniques:**

1. Use React.memo for pure components
2. Use useMemo for expensive calculations
3. Use useCallback for event handlers
4. Virtualize long lists

```typescript
// Virtualize long lists with FlashList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ContentCard {...item} />}
  estimatedItemSize={200}
/>
```

**Performance Targets:**

- [ ] Initial page load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] Interaction response < 100ms
- [ ] Bundle size < 1MB (gzipped)

---

### Task 6.3: Accessibility Audit

**GitHub Issue:** #46 - Complete Accessibility Audit

#### 6.3.1: Screen Reader Testing

**Files:** All components

**Add accessibility labels:**

```typescript
// Before
<Pressable onPress={handleLike}>
  <Icon name="heart" />
  <Text>{count}</Text>
</Pressable>

// After
<Pressable
  onPress={handleLike}
  accessibilityRole="button"
  accessibilityLabel={`Like, ${count} likes`}
  accessibilityState={{ selected: isLiked }}
>
  <Icon name="heart" />
  <Text>{count}</Text>
</Pressable>
```

#### 6.3.2: Keyboard Navigation (Web)

**Files:** Interactive components

**Ensure focusable:**

```typescript
// Add focus styles
const styles = StyleSheet.create({
  button: {
    // ... base styles
  },
  buttonFocused: {
    outlineWidth: 2,
    outlineColor: colors.primary,
    outlineOffset: 2,
  },
});
```

#### 6.3.3: Color Contrast Check

**Files:** `constants/tokens/colors.ts`

**Verify WCAG AA contrast ratios:**

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

**Tool:** Use Chrome DevTools Lighthouse or axe-core

#### 6.3.4: Focus Management

**Files:** Modal, navigation components

```typescript
// Auto-focus first input in modals
useEffect(() => {
  if (visible) {
    inputRef.current?.focus();
  }
}, [visible]);

// Return focus on close
const previousFocusRef = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (visible) {
    previousFocusRef.current = document.activeElement as HTMLElement;
  } else {
    previousFocusRef.current?.focus();
  }
}, [visible]);
```

**Accessibility Checklist:**

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Color is not only indicator
- [ ] Focus order is logical
- [ ] Skip links present
- [ ] Error messages accessible

---

### Task 6.4: Security Hardening

**GitHub Issue:** #47 - Security Review and Hardening

#### 6.4.1: RLS Policy Verification

**Files:** `supabase/migrations/*_rls_*.sql`

**Verification Script:**

```sql
-- Verify RLS enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Test policies with different roles
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-id-here", "role": "user"}';

-- Attempt unauthorized access
SELECT * FROM profiles WHERE id != 'user-id-here';
-- Should return 0 rows (blocked by RLS)
```

#### 6.4.2: Auth Security Checklist

**Files:** Auth implementation

- [ ] Passwords hashed (handled by Supabase)
- [ ] Session tokens expire appropriately
- [ ] Password reset tokens are one-time use
- [ ] OAuth state parameter validated
- [ ] PKCE flow used for OAuth

#### 6.4.3: Input Validation

**Files:** All form components, API handlers

```typescript
// Server-side validation in Edge Functions
import { z } from 'zod';

const PaymentOrderSchema = z.object({
  tier: z.enum(['annual', 'lifetime']),
  idempotency_key: z.string().min(10).max(100),
});

// Validate input
const parsed = PaymentOrderSchema.safeParse(body);
if (!parsed.success) {
  return new Response(JSON.stringify({ error: parsed.error }), { status: 400 });
}
```

#### 6.4.4: Sensitive Data Protection

**Files:** Client-side code

- [ ] No API secrets in client code
- [ ] Use EXPO*PUBLIC* prefix only for public keys
- [ ] Payment details not stored in state
- [ ] Audit logs don't contain passwords

#### 6.4.5: Rate Limiting Verification

**Files:** Edge Functions

```typescript
// Verify rate limiting is enforced
// Test: Send more requests than limit allows
// Expected: 429 Too Many Requests after limit
```

---

### Task 6.5: Web Deployment

**GitHub Issue:** #48 - Deploy Web to Production

#### 6.5.1: Vercel Configuration

**Files:** `vercel.json`

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

#### 6.5.2: Environment Variables (Vercel)

```bash
# Set via Vercel CLI or dashboard
vercel env add EXPO_PUBLIC_SUPABASE_URL production
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production
vercel env add EXPO_PUBLIC_RAZORPAY_KEY_ID production
vercel env add EXPO_PUBLIC_APP_ENV production
```

#### 6.5.3: Domain Configuration

1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Enable SSL (automatic)
4. Update Supabase redirect URLs

#### 6.5.4: Deploy

```bash
# Deploy to production
vercel --prod

# Or via GitHub Actions (auto-deploy on push to main)
```

**Acceptance Criteria:**

- [ ] Web app accessible at production URL
- [ ] SSL certificate valid
- [ ] All features working
- [ ] Analytics tracking (if applicable)

---

### Task 6.6: iOS Deployment

**GitHub Issue:** #49 - Deploy iOS to App Store

**Reference:** [IOS-DEPLOYMENT.md](../IOS-DEPLOYMENT.md)

#### 6.6.1: App Store Connect Setup

1. Create App Store Connect app record
2. Configure app metadata (name, description, keywords)
3. Add screenshots for all device sizes
4. Write bilingual description (EN + Mizo)
5. Set pricing (Free with IAP for membership)

#### 6.6.2: EAS Build Configuration

**Files:** `eas.json`, `app.json`

```json
// eas.json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

#### 6.6.3: Build and Submit

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

#### 6.6.4: App Review Preparation

1. Prepare demo account credentials
2. Document in-app purchase testing
3. Respond to privacy questionnaire
4. Provide contact information

**Acceptance Criteria:**

- [ ] Build successful
- [ ] App submitted to App Store
- [ ] Review approved
- [ ] App published

---

### Task 6.7: Android Deployment

**GitHub Issue:** #50 - Deploy Android to Play Store

**Reference:** [ANDROID-DEPLOYMENT.md](../ANDROID-DEPLOYMENT.md)

#### 6.7.1: Play Console Setup

1. Create app in Play Console
2. Complete app details
3. Add screenshots and graphics
4. Write bilingual listing
5. Set up content rating

#### 6.7.2: Signing Configuration

**Files:** `eas.json`, credentials

```bash
# Generate upload key (if not using EAS managed)
eas credentials --platform android

# Or configure existing keystore
```

#### 6.7.3: Build and Submit

```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

#### 6.7.4: Internal Testing Track

1. Upload to internal testing track first
2. Test with internal testers
3. Promote to production track

**Acceptance Criteria:**

- [ ] Build successful (AAB format)
- [ ] App submitted to Play Console
- [ ] Review approved
- [ ] App published to production

---

### Task 6.8: Monitoring Setup

**GitHub Issue:** #51 - Setup Production Monitoring

#### 6.8.1: Error Tracking (Sentry)

**Files:** `lib/sentry.ts`, `app/_layout.tsx`

```bash
npm install @sentry/react-native
```

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react-native';

export function initSentry() {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.EXPO_PUBLIC_APP_ENV,
    enableAutoSessionTracking: true,
    tracesSampleRate: 0.2, // 20% of transactions
  });
}

// Wrap error boundaries
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context });
}
```

#### 6.8.2: Uptime Monitoring

**Services:** Vercel Analytics, UptimeRobot, Better Uptime

**Configure alerts for:**

- Website down
- API response time > 3s
- Error rate > 1%

#### 6.8.3: Supabase Monitoring

1. Enable Supabase Logs
2. Set up database alerts
3. Monitor Edge Function invocations
4. Track storage usage

#### 6.8.4: Create Runbook

**Files:** `docs/RUNBOOK.md`

```markdown
# BMA 2026 Production Runbook

## Incident Response

### Website Down

1. Check Vercel status
2. Check Supabase status
3. Review recent deployments
4. Check DNS configuration
5. Escalate if unresolved in 15 minutes

### High Error Rate

1. Check Sentry for error patterns
2. Review recent code changes
3. Check external service status (Razorpay, Gemini)
4. Rollback if necessary

### Database Issues

1. Check Supabase dashboard
2. Review slow query logs
3. Check connection pool usage
4. Contact Supabase support if needed

## Contacts

- On-call: [phone number]
- Supabase Support: support@supabase.io
- Vercel Support: support@vercel.com
```

**Acceptance Criteria:**

- [ ] Sentry configured and receiving errors
- [ ] Uptime monitoring active
- [ ] Alerts configured
- [ ] Runbook documented

---

## Launch Day Checklist

```
Day 61-62: Final Testing
□ Run full test suite
□ Fix any failing tests
□ Manual testing on all platforms
□ Accessibility audit

Day 63-64: Performance & Security
□ Run Lighthouse audit
□ Fix performance issues
□ Security review
□ Penetration testing (basic)

Day 65: Web Deployment
□ Deploy to Vercel production
□ Verify all features
□ Test payment flow (live mode)
□ Monitor for errors

Day 66: Mobile Submission
□ Build iOS production
□ Submit to App Store
□ Build Android production
□ Submit to Play Store

Day 67: Launch & Monitoring
□ App Store approval (monitor)
□ Play Store approval (monitor)
□ Announce launch
□ Monitor dashboards
□ Respond to user feedback
```

---

## Post-Launch Tasks

### Immediate (Day 68-70)

- [ ] Monitor error rates
- [ ] Respond to user feedback
- [ ] Fix critical bugs
- [ ] Review analytics

### Week 1

- [ ] Gather user feedback
- [ ] Plan minor improvements
- [ ] Document known issues
- [ ] Team retrospective

### Month 1

- [ ] Analyze usage patterns
- [ ] Plan Phase 2 features
- [ ] Performance tuning
- [ ] Content review

---

## Testing Requirements

### Pre-Launch Testing

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests passing (Web + iOS + Android)
- [ ] Manual testing complete
- [ ] Accessibility audit passed

### Performance Testing

- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Load testing passed (100+ concurrent users)

### Security Testing

- [ ] RLS policies verified
- [ ] Auth flows tested
- [ ] Payment security verified
- [ ] No sensitive data leaks

---

## Files Created/Modified Summary

### New Files

| Category   | Files                                                                             |
| ---------- | --------------------------------------------------------------------------------- |
| Tests      | `e2e/web/**/*.spec.ts`, `e2e/mobile/**/*.yaml`, additional unit/integration tests |
| Config     | `vercel.json`, `playwright.config.ts`                                             |
| Monitoring | `lib/sentry.ts`                                                                   |
| Docs       | `docs/RUNBOOK.md`                                                                 |

### Modified Files

| File              | Changes                   |
| ----------------- | ------------------------- |
| `app/_layout.tsx` | Add Sentry initialization |
| `eas.json`        | Production submit config  |
| `app.json`        | Production settings       |
| `package.json`    | Add testing dependencies  |

---

## Dependencies

### NPM Packages

```bash
# Testing
npm install -D @playwright/test jest-coverage

# Monitoring
npm install @sentry/react-native

# Performance
npm install @shopify/flash-list
```

### External Services

- [ ] Sentry account and project
- [ ] App Store Connect account
- [ ] Google Play Console account
- [ ] Vercel team/pro account (for production)

---

## Definition of Done

- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance targets met (< 3s load, Lighthouse > 90)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Security review completed
- [ ] Web deployed to production (Vercel)
- [ ] iOS submitted and approved
- [ ] Android submitted and approved
- [ ] Monitoring and alerting active
- [ ] Runbook documented
- [ ] All GitHub Issues for Phase 6 closed

---

## Project Complete

Congratulations! The BMA 2026 Digital Platform is now live.

**Post-Launch Resources:**

- [GitHub Issues](./08-GITHUB-ISSUES-TEMPLATE.md) - For tracking ongoing work
- [RUNBOOK.md](../RUNBOOK.md) - For incident response
- [PRD-BMA-2026.md](../PRD-BMA-2026.md) - For future feature planning
