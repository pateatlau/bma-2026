# Phase 6: Polish & Launch (Days 61-67)

## Overview

Phase 6 is the final sprint focused on testing, performance optimization, accessibility, security hardening, and deployment. Due to the App Store account blocker (see below), this phase follows a **phased release strategy**.

**Duration:** 7 days
**Prerequisites:** Phases 0-5 completed (all features implemented)
**Deliverables:**

- Site search feature (bilingual FTS) - P0 for launch, defer if time-constrained
- Comprehensive test coverage (95%+ on critical paths)
- Performance optimization (< 3s load time)
- Accessibility compliance (WCAG 2.1 AA)
- Security audit completion
- Web production deployment (Vercel) ✅
- Mobile internal testing builds (APK + TestFlight if available)
- Mobile public release preparation (pending BMA org App Store accounts)
- Monitoring and alerting setup

---

## ⚠️ Phased Release Strategy

> **Important:** See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md#60-blocker-app-store-account-prerequisites) for full details on the App Store account blocker.

Due to BMA lacking a PAN card (required for D-U-N-S Number → Apple/Google org accounts), the launch follows a phased approach:

| Platform    | March 21, 2026 Status                                           | Public Release                                                       |
| ----------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Web**     | ✅ Production on Vercel                                         | **March 21, 2026** (BMA Annual Day)                                  |
| **Android** | APK for internal testing                                        | When BMA has Google Play Console org account (~2-3 months after PAN) |
| **iOS**     | TestFlight (if personal Apple Dev available) OR Expo Go testing | When BMA has Apple Developer org account (~2-3 months after PAN)     |

### What This Means for Phase 6

1. **Web deployment proceeds as planned** - Full production release on **March 21, 2026** (BMA Annual Day)
2. **Mobile builds are created** - For internal testing, not public stores
3. **Store submission tasks are documented** - Ready to execute once BMA org accounts are available
4. **Mobile public release is not blocked** - Just delayed until org accounts ready

---

## Launch Checklist Overview

```text
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
│  □ Web deployed to Vercel (production) ✅                          │
│  □ iOS build for TestFlight/internal (store submission: pending)   │
│  □ Android APK for internal testing (store submission: pending)    │
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

**Files:** `lib/images.ts`, `components/OptimizedImage.tsx`, components using images

**Reference:** See [Phase 2 - Task 2.11](03-PHASE-2-PUBLIC-FEATURES.md#task-211-image-optimization) and [Prerequisites - Image Optimization Strategy](../implementation-requirements/00-PREREQUISITES.md#25-image-optimization-strategy).

**Verification Checklist:**

1. **Format Delivery:**
   - [ ] WebP/AVIF served to supporting browsers (check response headers)
   - [ ] JPEG fallback for older browsers
   - [ ] Cloudinary `f_auto` parameter working

2. **Responsive Images:**
   - [ ] Gallery thumbnails use `galleryThumb` preset (200x200)
   - [ ] Hero images use `hero` preset (1200x600)
   - [ ] Card images use `card` preset (400x300)
   - [ ] Fullscreen lightbox uses `fullscreen` preset (1920x1080)

3. **Loading Strategy:**
   - [ ] Above-fold images use `priority={true}`
   - [ ] Below-fold images lazy load (default)
   - [ ] Blurhash placeholders display during load

4. **CDN & Caching:**
   - [ ] Cloudinary CDN headers present (`x-cache: HIT`)
   - [ ] Cache-Control headers set appropriately
   - [ ] Images served from edge location (check response time)

**Size Targets:**

| Image Type         | Max Size | Verification      |
| ------------------ | -------- | ----------------- |
| Gallery thumbnails | < 50KB   | Check network tab |
| Card images        | < 100KB  | Check network tab |
| Hero images        | < 200KB  | Check network tab |
| Fullscreen         | < 500KB  | Check network tab |

**Testing Commands:**

```bash
# Check image sizes from Cloudinary
curl -sI "https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_200,h_200,c_fill,f_auto,q_80/bma/gallery/photo.jpg" | grep -i content-length

# Check WebP delivery
curl -sI -H "Accept: image/webp" "https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto/bma/gallery/photo.jpg" | grep -i content-type
```

**Component Usage:**

```typescript
// Ensure all images use OptimizedImage component
// Component is defined in Phase 2, Task 2.11.1
import { OptimizedImage } from '@/components/OptimizedImage';
import { ImageSizes } from '@/lib/images';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

// Gallery Photo Component - fetches blurhash from database
function GalleryPhoto({ photoId }: { photoId: string }) {
  const [photo, setPhoto] = useState<{ url: string; blurhash?: string; caption?: string } | null>(null);

  useEffect(() => {
    async function fetchPhoto() {
      const { data } = await supabase
        .from('media')
        .select('url, blurhash, caption')
        .eq('id', photoId)
        .single();
      setPhoto(data);
    }
    fetchPhoto();
  }, [photoId]);

  if (!photo) return null;

  return (
    <OptimizedImage
      src={photo.url}
      alt={photo.caption || 'Gallery photo'}
      size={ImageSizes.galleryThumb}
      blurhash={photo.blurhash}  // Pre-computed blurhash from DB
      placeholder="blur"
    />
  );
}

// Hero Image Component - simple wrapper without database fetch
function HeroImage({ heroUrl, title }: { heroUrl: string; title: string }) {
  return (
    <OptimizedImage
      src={heroUrl}
      alt={title}
      size={ImageSizes.hero}
      priority={true}
      placeholder="none"  // Or "blur" with blurhash prop if available
    />
  );
}
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
- [ ] Gallery thumbnails < 50KB each
- [ ] Hero images < 200KB
- [ ] WebP/AVIF format delivered (85%+ of image requests)
- [ ] Image CDN cache hit ratio > 90%

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

### Task 6.5: Site Search Implementation

**GitHub Issue:** #52 - Implement Site Search Feature

**Reference:** [SITE-SEARCH-SYSTEM-DESIGN.md](../design/SITE-SEARCH-SYSTEM-DESIGN.md)

> **⚠️ Priority Note:**
> This feature is P0 for launch (high user value) but can be deferred to post-launch Sprint 1 if schedule slips. If time constraints emerge in Phase 6, prioritize Tasks 6.1-6.4 and 6.6-6.8, and defer this task to Days 68-74.

**Duration:** 6 days (can run parallel to testing/deployment tasks)

#### 6.5.1: Database Setup (Day 1)

**Files:** `supabase/migrations/*_search.sql`

**Tasks:**

1. Add search vector columns to `content` table
2. Create GIN indexes for FTS
3. Create `search_content` RPC function
4. Create `search_content_count` RPC function
5. Create update trigger for search vectors
6. Backfill existing content

**Migration Script:**

```sql
-- Add search vector columns
ALTER TABLE content ADD COLUMN IF NOT EXISTS search_vector_en tsvector;
ALTER TABLE content ADD COLUMN IF NOT EXISTS search_vector_lus tsvector;

-- Create GIN indexes
CREATE INDEX IF NOT EXISTS idx_content_search_en
  ON content USING GIN (search_vector_en);

CREATE INDEX IF NOT EXISTS idx_content_search_lus
  ON content USING GIN (search_vector_lus);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_content_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector_en :=
    setweight(to_tsvector('english', COALESCE(NEW.title_en, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt_en, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_en, '')), 'C');

  NEW.search_vector_lus :=
    setweight(to_tsvector('simple', COALESCE(NEW.title_lus, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.excerpt_lus, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.body_lus, '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trg_content_search_vectors
  BEFORE INSERT OR UPDATE OF title_en, title_lus, body_en, body_lus, excerpt_en, excerpt_lus
  ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_content_search_vectors();

-- Backfill existing content
UPDATE content SET
  search_vector_en =
    setweight(to_tsvector('english', COALESCE(title_en, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(excerpt_en, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(body_en, '')), 'C'),
  search_vector_lus =
    setweight(to_tsvector('simple', COALESCE(title_lus, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(excerpt_lus, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(body_lus, '')), 'C')
WHERE search_vector_en IS NULL OR search_vector_lus IS NULL;
```

**Create RPC functions:** (See design doc for full SQL)

**Acceptance Criteria:**

- [ ] Migration runs successfully
- [ ] Indexes created
- [ ] RPC functions tested in Supabase dashboard
- [ ] Backfill completed

#### 6.5.2: Search API & Hooks (Day 2)

**Files:** `lib/search.ts`, `hooks/useSearch.ts`, `hooks/useRecentSearches.ts`, `hooks/useDebounce.ts`

**Tasks:**

1. Implement `searchContent` client function
2. Implement `useSearch` hook with debouncing
3. Implement `useRecentSearches` hook (AsyncStorage)
4. Add TypeScript types
5. Add error handling

**Search Client Function:**

```typescript
// lib/search.ts
import { supabase } from './supabase';

export type ContentType = 'news' | 'article' | 'event' | 'newsletter' | 'gallery' | 'leadership';

export interface SearchOptions {
  query: string;
  contentTypes?: ContentType[];
  preferredLanguage?: 'en' | 'lus';
  limit?: number;
  offset?: number;
}

export async function searchContent(options: SearchOptions) {
  const { query, contentTypes, preferredLanguage = 'en', limit = 20, offset = 0 } = options;

  if (query.trim().length < 2) {
    return { results: [], totalCount: 0, countsByType: {} };
  }

  const [resultsResponse, countsResponse] = await Promise.all([
    supabase.rpc('search_content', {
      query: query.trim(),
      content_types: contentTypes || null,
      preferred_language: preferredLanguage,
      page_limit: limit,
      page_offset: offset,
    }),
    supabase.rpc('search_content_count', {
      query: query.trim(),
      content_types: contentTypes || null,
    }),
  ]);

  if (resultsResponse.error) throw resultsResponse.error;
  if (countsResponse.error) throw countsResponse.error;

  const counts = countsResponse.data?.[0];

  return {
    results: resultsResponse.data || [],
    totalCount: counts?.total_count || 0,
    countsByType: counts?.counts_by_type || {},
  };
}
```

**Acceptance Criteria:**

- [ ] Search function works with test queries
- [ ] Hooks handle loading/error states
- [ ] Recent searches persist in AsyncStorage
- [ ] Debounce prevents excessive API calls

#### 6.5.3: Search UI Components (Days 3-4)

**Files:** `components/search/*.tsx`

**Components to Create:**

1. `SearchTrigger.tsx` - Header search icon/button
2. `SearchModal.tsx` - Full search UI modal
3. `SearchInput.tsx` - Input with clear button
4. `SearchResults.tsx` - Results list container
5. `SearchResultCard.tsx` - Individual result card
6. `SearchTypeFilter.tsx` - Content type filter chips
7. `RecentSearches.tsx` - Recent search history
8. `SearchEmptyState.tsx` - No results message

**SearchModal Component:**

```typescript
interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function SearchModal({ visible, onClose, initialQuery }: SearchModalProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    totalCount,
    countsByType,
    selectedTypes,
    setSelectedTypes,
    loadMore,
    hasMore,
    clearSearch,
  } = useSearch({ debounceMs: 300 });

  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();

  // Implementation...
}
```

**Acceptance Criteria:**

- [ ] All components implemented
- [ ] Consistent with design system
- [ ] Responsive (mobile + desktop)
- [ ] Dark mode support
- [ ] Accessibility labels

#### 6.5.4: Integration & Navigation (Day 5)

**Files:** `components/navigation/WebHeader.tsx`, `components/navigation/MobileHeader.tsx`

**Tasks:**

1. Add search trigger to headers
2. Wire up navigation to content detail pages
3. Add offline detection
4. Test across platforms
5. Add loading skeletons

**Header Integration:**

```typescript
// components/navigation/WebHeader.tsx
import { SearchTrigger } from '@/components/search/SearchTrigger';
import { SearchModal } from '@/components/search/SearchModal';

export function WebHeader() {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <View style={styles.header}>
        {/* Logo, nav items */}
        <SearchTrigger onPress={() => setSearchVisible(true)} />
        {/* User menu */}
      </View>

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </>
  );
}
```

**Acceptance Criteria:**

- [ ] Search accessible from all pages
- [ ] Navigation to content works
- [ ] Offline banner shows when offline
- [ ] Works on web, iOS, Android

#### 6.5.5: Testing & Polish (Day 6)

**Files:** `__tests__/unit/search/*.test.ts`, `__tests__/integration/search.test.ts`, `e2e/web/search.spec.ts`

**Tasks:**

1. Unit tests for hooks
2. Integration test for search flow
3. E2E test for search UI
4. Bilingual testing (EN + Mizo queries)
5. Performance testing
6. Edge case handling

**Test Coverage:**

```typescript
// __tests__/unit/hooks/useSearch.test.ts
describe('useSearch', () => {
  it('should debounce query input', () => {});
  it('should return empty results for short queries', () => {});
  it('should fetch results from API', () => {});
  it('should handle API errors', () => {});
  it('should support pagination', () => {});
});

// e2e/web/search.spec.ts
test('should search for content', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="search-trigger"]');
  await page.fill('[data-testid="search-input"]', 'membership');
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  await page.click('[data-testid="search-result"]:first-child');
  await expect(page).toHaveURL(/\/(news|article|event)\//);
});
```

**Acceptance Criteria:**

- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] E2E test passing
- [ ] Bilingual queries work correctly
- [ ] Performance < 500ms p95

#### 6.5.6: Documentation

**Files:** `docs/features/SEARCH.md` (optional)

**Tasks:**

1. Document search functionality
2. Add search to user guide
3. Update README with search feature

**Acceptance Criteria:**

- [ ] Feature documented
- [ ] User-facing documentation updated

---

### Task 6.6: Web Deployment

**GitHub Issue:** #48 - Deploy Web to Production

#### 6.6.1: Vercel Configuration

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

#### 6.6.2: Environment Variables (Vercel)

```bash
# Set via Vercel CLI or dashboard
vercel env add EXPO_PUBLIC_SUPABASE_URL production
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY production
vercel env add EXPO_PUBLIC_RAZORPAY_KEY_ID production
vercel env add EXPO_PUBLIC_APP_ENV production
```

#### 6.6.3: Domain Configuration

1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Enable SSL (automatic)
4. Update Supabase redirect URLs

#### 6.6.4: Deploy

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

### Task 6.7: iOS Deployment

**GitHub Issue:** #49 - Deploy iOS to App Store

**Reference:** [IOS-DEPLOYMENT.md](../IOS-DEPLOYMENT.md)

> **⚠️ Phased Release Note:**
> App Store submission is blocked until BMA has an Apple Developer org account. For March 21, 2026 launch:
>
> - **If personal Apple Dev account available:** Build for TestFlight internal testing
> - **If no Apple Dev account:** Use Expo Go for testing, document submission steps for later
>
> See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md#60-blocker-app-store-account-prerequisites).

#### 6.7.1: App Store Connect Setup (Pending BMA Org Account)

> These steps should be documented now but executed when BMA org account is available.

1. Create App Store Connect app record
2. Configure app metadata (name, description, keywords)
3. Add screenshots for all device sizes
4. Write bilingual description (EN + Mizo)
5. Set pricing (Free with IAP for membership)

#### 6.7.2: EAS Build Configuration

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

#### 6.8.3: Build and Submit

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

#### 6.7.4: App Review Preparation

1. Prepare demo account credentials
2. Document in-app purchase testing
3. Respond to privacy questionnaire
4. Provide contact information

**Acceptance Criteria (March 21, 2026 - Internal Testing):**

- [ ] iOS build successful
- [ ] TestFlight distribution working (if personal Apple Dev available)
- [ ] OR: Expo Go testing documented

**Acceptance Criteria (Post-BMA Org Account):**

- [ ] App submitted to App Store
- [ ] Review approved
- [ ] App published

---

### Task 6.8: Android Deployment

**GitHub Issue:** #50 - Deploy Android to Play Store

**Reference:** [ANDROID-DEPLOYMENT.md](../ANDROID-DEPLOYMENT.md)

> **⚠️ Phased Release Note:**
> Play Store submission is blocked until BMA has a Google Play Console org account. For March 21, 2026 launch:
>
> - Build APK for internal testing and direct distribution
> - Document store submission steps for later
>
> See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md#60-blocker-app-store-account-prerequisites).

#### 6.8.1: Play Console Setup (Pending BMA Org Account)

> These steps should be documented now but executed when BMA org account is available.

1. Create app in Play Console
2. Complete app details
3. Add screenshots and graphics
4. Write bilingual listing
5. Set up content rating

#### 6.8.2: Signing Configuration

**Files:** `eas.json`, credentials

```bash
# Generate upload key (if not using EAS managed)
eas credentials --platform android

# Or configure existing keystore
```

#### 6.8.3: Build and Submit

```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

#### 6.8.4: Internal Testing (March 21, 2026)

1. Build APK for internal distribution
2. Distribute to internal testers via direct download or EAS internal distribution
3. Document Play Store submission steps for later

**Acceptance Criteria (March 21, 2026 - Internal Testing):**

- [ ] Android APK build successful
- [ ] APK distributed to internal testers
- [ ] Store submission steps documented

**Acceptance Criteria (Post-BMA Org Account):**

- [ ] Build AAB format for Play Store
- [ ] App submitted to Play Console
- [ ] Review approved
- [ ] App published to production

---

### Task 6.9: Monitoring & Observability Setup

**GitHub Issue:** #51 - Setup Production Monitoring

> **📋 Complete Implementation Guide**: See [OBSERVABILITY-IMPLEMENTATION.md](../OBSERVABILITY-IMPLEMENTATION.md) for full observability strategy, code examples, and runbooks.

This task establishes production-ready observability for frontend, backend, and infrastructure monitoring.

#### 6.9.1: Error Tracking (Sentry) - Enhanced

**Files:** `lib/sentry.ts`, `components/ErrorBoundary.tsx`, `app/_layout.tsx`

```bash
npm install @sentry/react-native web-vitals
```

**Core Features**:

- ✅ Error capture with context (user ID, session, request)
- ✅ Performance monitoring (20% transaction sampling)
- ✅ Source map uploads for stack traces
- ✅ Error boundaries for graceful failures
- ✅ PII redaction (passwords, tokens, credit cards)
- ✅ Release tracking (git commits tied to errors)
- ✅ Web Vitals tracking (CLS, FID, FCP, LCP, TTFB)

**Implementation**: See `OBSERVABILITY-IMPLEMENTATION.md` §2.1-2.2 for complete Sentry setup with:

- Enhanced configuration (release tracking, PII filtering)
- Error boundary component
- Source map upload to CI/CD
- Performance monitoring
- Custom error capture helpers

#### 6.9.2: Backend Logging & Tracing

**Files:** `supabase/functions/_shared/logger.ts`, `supabase/functions/_shared/error-handler.ts`, `supabase/functions/_shared/tracing.ts`

**Core Features**:

- ✅ Structured JSON logging (debug, info, warn, error, fatal)
- ✅ Request tracing (trace ID, span ID, request ID)
- ✅ Error handling with context
- ✅ Query performance tracking
- ✅ Edge Function timeout monitoring

**Implementation**: See `OBSERVABILITY-IMPLEMENTATION.md` §3.1-3.2 for:

- Logger utility class
- Error handler wrapper
- Request tracing middleware
- Database query logging

#### 6.9.3: Health Checks & Uptime Monitoring

**Files:** `supabase/functions/health/index.ts`

**Health Check Endpoint**: `https://[project-id].supabase.co/functions/v1/health`

**Response Format**:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-13T10:00:00Z",
  "duration": 45,
  "checks": {
    "database": "healthy",
    "storage": "healthy",
    "auth": "healthy"
  }
}
```

**Uptime Monitoring** (UptimeRobot - Free Tier):

- Website: `https://bma2026.org` (5-minute checks)
- API Health: `https://[project-id].supabase.co/functions/v1/health` (5-minute checks)
- Supabase: `https://[project-id].supabase.co` (5-minute checks)

**Alert Contacts**: [admin@bma2026.org](mailto:admin@bma2026.org)

**Implementation**: See `OBSERVABILITY-IMPLEMENTATION.md` §4.1-4.2 for health check code and UptimeRobot configuration.

#### 6.9.4: Alerting Strategy

**Critical Alerts** (Immediate Response - Email + SMS):

- Website down (HTTP ≠ 200 for 2 minutes)
- Database down (health check fails for 1 minute)
- High error rate (> 5% for 5 minutes)
- Edge Function timeout (latency > 10s for 5 minutes)
- Payment webhook failure (> 3 failed webhooks)

**Warning Alerts** (Monitor - Slack):

- Slow API response (p95 > 3s for 10 minutes)
- High database connections (> 80% for 5 minutes)
- Storage usage high (> 80% daily check)
- Error rate elevated (> 1% for 15 minutes)

**Implementation**: See `OBSERVABILITY-IMPLEMENTATION.md` §5 for complete alert rules and notification channels (Email via Resend, Slack webhooks).

#### 6.9.5: User Behavior Analytics (Optional - Phase 7)

**Service**: Mixpanel or PostHog

**Key Events**:

- User signup, login, logout
- Membership purchase, renewal
- Content view, like, comment
- Chatbot message, escalation
- Payment success, failure
- Profile update
- Directory search

**Implementation**: See `OBSERVABILITY-IMPLEMENTATION.md` §2.3 for analytics setup.

#### 6.9.6: Production Runbook

**Files:** `docs/RUNBOOK.md`

**Incident Response Process**:

1. **Detect** - Alert triggered or user report
2. **Acknowledge** - Confirm incident, assess severity
3. **Investigate** - Check logs, metrics, traces
4. **Mitigate** - Apply immediate fix or workaround
5. **Resolve** - Deploy permanent fix
6. **Post-Mortem** - Document learnings

**Incident Severity**:

- **P0 - Critical**: Complete outage, data loss, security breach (< 15 min response)
- **P1 - High**: Major feature broken, significant impact (< 1 hour response)
- **P2 - Medium**: Minor feature broken, workaround available (< 4 hours)
- **P3 - Low**: Cosmetic issue, low impact (< 1 day)

**Common Incident Runbooks**:

- Website Down (P0)
- High Error Rate (P1)
- Payment Webhook Failure (P0)
- Database Connection Pool Exhausted (P1)
- Slow API Response (P2)

**Implementation**: See `OBSERVABILITY-IMPLEMENTATION.md` §6 for complete runbook with investigation steps, resolution procedures, and contact information.

#### 6.9.7: Cost Analysis

**Free Tier (Phase 6 - MVP)**:

- Sentry Developer: 5K errors/month, 10K transactions/month - **$0/month**
- UptimeRobot Free: 50 monitors, 5-minute checks - **$0/month**
- Supabase Logs: Native logging, 7-day retention - **$0/month** (included)
- Vercel Analytics Hobby: Basic traffic - **$0/month** (included)
- **Total: $0/month**

**Paid Tier (Phase 7 - Production)**:

- Sentry Team: 50K errors/month, 100K transactions, APM - **$26/month**
- Mixpanel Growth: 100K MTU, unlimited events - **$25/month**
- Better Uptime Basic: Unlimited monitors, 1-min checks - **$18/month**
- **Total: ~$69/month**

**Acceptance Criteria:**

- [ ] Sentry configured with enhanced error context
- [ ] Error boundaries implemented
- [ ] Source map uploads working
- [ ] Structured logging in Edge Functions
- [ ] Request tracing implemented
- [ ] Health check endpoint created and tested
- [ ] UptimeRobot monitors configured
- [ ] Critical alerts configured (website down, high error rate)
- [ ] Email and Slack notification channels setup
- [ ] Production runbook documented
- [ ] Test alert delivery (Sentry, UptimeRobot)
- [ ] Verify logs in Supabase dashboard
- [ ] Document escalation procedures

---

## Launch Day Checklist

> **Note:** This checklist reflects the phased release strategy. Mobile public release is pending BMA org accounts.

```text
Day 61-62: Site Search Implementation (parallel with testing)
□ Implement search database setup
□ Build search API and hooks
□ Create search UI components
□ Or: Document for post-launch if time-constrained

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

Day 65: Web Deployment ✅
□ Deploy to Vercel production
□ Verify all features (including search if implemented)
□ Test payment flow (Razorpay - test mode if no BMA account yet)
□ Monitor for errors

Day 66: Mobile Internal Testing Builds & Search (if time permits)
□ Build iOS (TestFlight if available, or Expo Go testing)
□ Build Android APK for internal distribution
□ Distribute to internal testers
□ Document store submission steps for later

March 21, 2026: Launch Day (BMA Annual Day)
□ Web app live - announce web launch
□ Mobile internal testing ongoing
□ Monitor dashboards
□ Respond to user feedback
□ Track BMA org account progress (PAN → D-U-N-S → Store accounts)

Post-Launch (When BMA Org Accounts Ready):
□ Submit iOS to App Store
□ Submit Android to Play Store
□ Monitor approvals
□ Announce mobile public release
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

> **Note:** App Store accounts are blocked until BMA org accounts are ready. See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md).

- [ ] Sentry account and project
- [ ] App Store Connect account (Pending BMA org - use personal if available for TestFlight)
- [ ] Google Play Console account (Pending BMA org - APK internal testing OK)
- [ ] Vercel team/pro account (for production) - Hobby plan OK initially

---

## Definition of Done

### March 21, 2026 Definition of Done (Phased Release)

- [ ] Site search feature implemented (or documented for post-launch if deferred)
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance targets met (< 3s load, Lighthouse > 90)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Security review completed
- [ ] Web deployed to production (Vercel) ✅
- [ ] iOS internal testing build ready (TestFlight or Expo Go)
- [ ] Android APK available for internal testing
- [ ] Mobile store submission steps documented
- [ ] Monitoring and alerting active
- [ ] Runbook documented
- [ ] All March 21, 2026 GitHub Issues for Phase 6 closed

### Post-BMA Org Account Definition of Done

- [ ] iOS submitted and approved on App Store
- [ ] Android submitted and approved on Play Store
- [ ] All platforms publicly available

---

## Project Complete

Congratulations! The BMA 2026 Digital Platform web version is now live.

> **Phased Release Reminder:**
>
> - **Web:** Live on **March 21, 2026** (BMA Annual Day) ✅
> - **Mobile:** Internal testing available; public release pending BMA org App Store accounts (~2-3 months after PAN card)

**Post-Launch Resources:**

- [GitHub Issues](./08-GITHUB-ISSUES-TEMPLATE.md) - For tracking ongoing work
- [RUNBOOK.md](../RUNBOOK.md) - For incident response
- [PRD-BMA-2026.md](../PRD-BMA-2026.md) - For future feature planning
- [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md) - Track BMA org account progress
