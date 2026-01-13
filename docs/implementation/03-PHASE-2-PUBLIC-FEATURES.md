# Phase 2: Public Features (Days 16-28)

## Overview

Phase 2 implements all public-facing content features including news, events, articles, gallery, and about pages. This phase focuses on content display, user engagement (comments/likes), and SEO optimization.

**Duration:** 13 days
**Prerequisites:** Phase 1 completed (auth, profiles, i18n, design system)
**Deliverables:**

- 6 content types (news, articles, events, newsletter, gallery, leadership)
- Comments and likes system
- Image optimization pipeline
- SEO meta tags
- Offline-lite caching foundation

---

## Task Breakdown

### Task 2.1: Content Data Layer

**GitHub Issue:** #11 - Implement Content Data Layer

#### 2.1.1: Create Content Types

**Files:** `types/content.ts`

```typescript
import { Database } from '@/lib/database.types';

export type Content = Database['public']['Tables']['content']['Row'];
export type ContentInsert = Database['public']['Tables']['content']['Insert'];
export type ContentUpdate = Database['public']['Tables']['content']['Update'];

export type ContentType = 'news' | 'article' | 'event' | 'newsletter' | 'gallery' | 'leadership';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface ContentWithAuthor extends Content {
  author: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ContentListParams {
  type?: ContentType;
  status?: ContentStatus;
  authorId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'published_at' | 'created_at' | 'views_count' | 'likes_count';
  orderDirection?: 'asc' | 'desc';
}

export interface EventContent extends Content {
  type: 'event';
  event_start_at: string;
  event_end_at?: string;
  event_location?: string;
  event_location_lus?: string;
}

export interface LeadershipContent extends Content {
  type: 'leadership';
  leadership_position?: string;
  leadership_position_lus?: string;
  leadership_order?: number;
}
```

**Acceptance Criteria:**

- [ ] Types match database schema
- [ ] All content subtypes defined
- [ ] Query params typed

#### 2.1.2: Create Content Hooks

**Files:** `hooks/useContent.ts`

```typescript
// Fetch paginated content list
export function useContentList(params: ContentListParams) {
  // Returns: { data, isLoading, error, hasMore, loadMore, refetch }
}

// Fetch single content by slug
export function useContentBySlug(slug: string, type?: ContentType) {
  // Returns: { content, isLoading, error, refetch }
}

// Fetch featured/hero content
export function useFeaturedContent(type?: ContentType, limit?: number) {
  // Returns: { content, isLoading, error }
}

// Fetch related content
export function useRelatedContent(contentId: string, limit?: number) {
  // Returns: { content, isLoading, error }
}

// Increment view count
export function useIncrementViews() {
  // Returns: { increment, isLoading }
}
```

**Implementation Notes:**

- Use `react-query` or similar for caching
- Implement stale-while-revalidate
- Handle pagination with cursor
- Deduplicate requests

**Acceptance Criteria:**

- [ ] List pagination working
- [ ] Single content fetch by slug
- [ ] View count increments on view
- [ ] Caching reduces API calls

#### 2.1.3: Create Content API Client

**Files:** `lib/api/content.ts`

```typescript
export const contentApi = {
  // List content with filters
  list: async (params: ContentListParams): Promise<PaginatedResponse<Content>> => {
    let query = supabase
      .from('content')
      .select('*, author:profiles(id, full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null)
      .lte('published_at', new Date().toISOString());

    if (params.type) {
      query = query.eq('type', params.type);
    }
    // ... other filters

    return query;
  },

  // Get by slug
  getBySlug: async (slug: string): Promise<ContentWithAuthor | null> => {
    // ...
  },

  // Increment views
  incrementViews: async (id: string): Promise<void> => {
    await supabase.rpc('increment_content_views', { content_id: id });
  },
};
```

---

### Task 2.2: News Feature

**GitHub Issue:** #12 - Implement News Feature

#### 2.2.1: Create News List Screen

**Files:** `app/(public)/news/index.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  [← Back]      News            │
├────────────────────────────────┤
│  [Hero News Card - Featured]   │
│  ┌────────────────────────────┐│
│  │  Image                     ││
│  │  Title                     ││
│  │  Excerpt                   ││
│  │  Date • Author             ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  Latest News                   │
│  ┌──────┐  ┌──────┐           │
│  │ Card │  │ Card │           │
│  └──────┘  └──────┘           │
│  ┌──────┐  ┌──────┐           │
│  │ Card │  │ Card │           │
│  └──────┘  └──────┘           │
├────────────────────────────────┤
│  [Load More] or infinite scroll│
└────────────────────────────────┘
```

**Features:**

1. Featured/hero news at top
2. Grid layout (2 columns mobile, 3-4 web)
3. ContentCard for each item
4. Infinite scroll or load more button
5. Pull to refresh (mobile)
6. Empty state when no news

**Acceptance Criteria:**

- [ ] Featured news displays prominently
- [ ] Grid responsive across breakpoints
- [ ] Pagination/infinite scroll works
- [ ] Pull to refresh works
- [ ] Empty state shows correctly

#### 2.2.2: Create News Detail Screen

**Files:** `app/(public)/news/[slug].tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  [← Back]      News            │
├────────────────────────────────┤
│  ┌────────────────────────────┐│
│  │  Featured Image (full)     ││
│  └────────────────────────────┘│
│                                │
│  CATEGORY                      │
│  News Title Here               │
│                                │
│  👤 Author Name • 📅 Jan 10    │
│  👁 1.2K views                 │
├────────────────────────────────┤
│  [Like ❤️ 24] [Share 🔗]      │
├────────────────────────────────┤
│  Article body content here...  │
│  Supports markdown rendering.  │
│                                │
│  Multiple paragraphs with      │
│  images, headings, lists...    │
├────────────────────────────────┤
│  Tags: [Tag1] [Tag2] [Tag3]    │
├────────────────────────────────┤
│  Comments (12)                 │
│  ┌────────────────────────────┐│
│  │ Comment Thread Component   ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  Related News                  │
│  [Card] [Card] [Card]          │
└────────────────────────────────┘
```

**Features:**

1. Full-width featured image
2. Title with metadata (author, date, views)
3. Like button with count
4. Share functionality
5. Markdown body rendering
6. Tags as clickable chips
7. Comments section (authenticated only)
8. Related news carousel

**Acceptance Criteria:**

- [ ] Image loads with placeholder
- [ ] Markdown renders correctly
- [ ] Like updates count
- [ ] Share opens native share sheet
- [ ] Comments load and display
- [ ] Related news shows similar items

#### 2.2.3: Create Markdown Renderer

**Files:** `components/MarkdownRenderer.tsx`

**Dependencies:**

```bash
npm install react-native-markdown-display
```

**Features:**

1. Render headings, paragraphs, lists
2. Handle images with lazy loading
3. Syntax highlighting for code
4. Link handling (internal vs external)
5. Blockquotes styling
6. Bilingual content support

```typescript
interface MarkdownRendererProps {
  content: string;
  contentLus?: string; // Mizo version
  language?: 'en' | 'lus';
}
```

**Acceptance Criteria:**

- [ ] All markdown elements render
- [ ] Images lazy load
- [ ] Links open correctly
- [ ] Language toggle switches content

---

### Task 2.3: Events Feature

**GitHub Issue:** #13 - Implement Events Feature

#### 2.3.1: Create Events List Screen

**Files:** `app/(public)/events/index.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  [← Back]      Events          │
├────────────────────────────────┤
│  Filter: [Upcoming] [Past]     │
├────────────────────────────────┤
│  Upcoming Events               │
│  ┌────────────────────────────┐│
│  │ ┌───┐                      ││
│  │ │JAN│  Event Title         ││
│  │ │ 15│  Location            ││
│  │ └───┘  Time • Attendees    ││
│  └────────────────────────────┘│
│  ┌────────────────────────────┐│
│  │ ┌───┐                      ││
│  │ │FEB│  Event Title         ││
│  │ │ 28│  Location            ││
│  │ └───┘  Time • Attendees    ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  Past Events                   │
│  [Show more past events]       │
└────────────────────────────────┘
```

**Features:**

1. Filter tabs (Upcoming / Past)
2. EventCard with date badge
3. Chronological ordering
4. Location display
5. Add to calendar CTA

**Date Badge Component:**

```typescript
interface DateBadgeProps {
  date: Date;
  size?: 'sm' | 'md' | 'lg';
  isPast?: boolean;
}

// Displays:
// ┌─────┐
// │ JAN │  (month abbreviated)
// │  15 │  (day number)
// └─────┘
```

**Acceptance Criteria:**

- [ ] Upcoming/past filter works
- [ ] Date badges display correctly
- [ ] Events sorted by date
- [ ] Past events show differently (grayed)

#### 2.3.2: Create Event Detail Screen

**Files:** `app/(public)/events/[slug].tsx`

**Additional Features (vs news):**

1. Event date/time prominently displayed
2. Location with map link
3. "Add to Calendar" button
4. RSVP functionality (future)
5. Event countdown (if upcoming)

**Add to Calendar:**

```typescript
// lib/calendar.ts
import * as Calendar from 'expo-calendar';

export async function addEventToCalendar(event: EventContent) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return false;

  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendar = calendars.find((c) => c.isPrimary);

  await Calendar.createEventAsync(defaultCalendar.id, {
    title: event.title_en,
    startDate: new Date(event.event_start_at),
    endDate: event.event_end_at ? new Date(event.event_end_at) : undefined,
    location: event.event_location,
    notes: event.excerpt_en,
  });

  return true;
}
```

**Acceptance Criteria:**

- [ ] Event details display completely
- [ ] Add to calendar works (iOS/Android)
- [ ] Location links to maps
- [ ] Past events show "Event ended"

---

### Task 2.4: Articles Feature

**GitHub Issue:** #14 - Implement Articles Feature

#### 2.4.1: Create Articles List Screen

**Files:** `app/(public)/articles/index.tsx`

Similar to news but with different layout:

1. Magazine-style layout
2. Longer excerpts visible
3. Reading time indicator
4. Category/topic filtering

**UI Layout:**

```
┌────────────────────────────────┐
│  Articles                      │
├────────────────────────────────┤
│  Categories:                   │
│  [All] [Culture] [History]...  │
├────────────────────────────────┤
│  ┌────────────────────────────┐│
│  │  Image      │  Title       ││
│  │             │  Excerpt...  ││
│  │             │  📖 5 min    ││
│  └────────────────────────────┘│
│  ┌────────────────────────────┐│
│  │  Title                     ││
│  │  Excerpt preview text...   ││
│  │  Author • Date • 📖 8 min  ││
│  └────────────────────────────┘│
└────────────────────────────────┘
```

**Reading Time Calculator:**

```typescript
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
```

#### 2.4.2: Create Article Detail Screen

**Files:** `app/(public)/articles/[slug].tsx`

Same as news detail with:

1. Reading time at top
2. Progress indicator (scroll %)
3. Table of contents (optional)
4. "Continue reading" suggestions

---

### Task 2.5: Gallery Feature

**GitHub Issue:** #15 - Implement Photo Gallery

#### 2.5.1: Create Gallery Screen

**Files:** `app/(public)/gallery/index.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  Gallery                       │
├────────────────────────────────┤
│  Albums                        │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 2024 │ │ 2023 │ │Events│   │
│  │Annual│ │Annual│ │      │   │
│  └──────┘ └──────┘ └──────┘   │
├────────────────────────────────┤
│  Recent Photos                 │
│  ┌───┬───┬───┐                 │
│  │ □ │ □ │ □ │                 │
│  ├───┼───┼───┤                 │
│  │ □ │ □ │ □ │                 │
│  ├───┼───┼───┤                 │
│  │ □ │ □ │ □ │                 │
│  └───┴───┴───┘                 │
└────────────────────────────────┘
```

**Features:**

1. Album grouping (by event/year)
2. Masonry grid layout
3. Tap to open lightbox
4. Pinch to zoom
5. Swipe between photos
6. Download option
7. Share option

#### 2.5.2: Create Lightbox Component

**Files:** `components/Lightbox.tsx`

**Dependencies:**

```bash
npm install react-native-image-zoom-viewer
# or
npm install react-native-lightbox-v2
```

```typescript
interface LightboxProps {
  images: Array<{
    url: string;
    title?: string;
    description?: string;
  }>;
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}
```

**Features:**

1. Full-screen image viewing
2. Pinch-to-zoom
3. Swipe navigation
4. Image counter (1/24)
5. Caption overlay
6. Share/Download actions

**Acceptance Criteria:**

- [ ] Grid displays images correctly
- [ ] Lightbox opens on tap
- [ ] Swipe between images smooth
- [ ] Zoom works on all platforms
- [ ] Share functionality works

#### 2.5.3: Create Gallery Album Screen

**Files:** `app/(public)/gallery/[album].tsx`

Shows photos within a specific album:

1. Album title and description
2. Photo count
3. Grid of photos
4. Back to gallery navigation

---

### Task 2.6: About Pages

**GitHub Issue:** #16 - Implement About Pages

#### 2.6.1: Create About Page

**Files:** `app/(public)/about/index.tsx`

**Sections:**

1. Hero with BMA logo and tagline
2. Mission and vision
3. Brief history summary
4. Contact information
5. Social media links
6. Links to History and Leadership

**UI Layout:**

```
┌────────────────────────────────┐
│  About BMA                     │
├────────────────────────────────┤
│  ┌────────────────────────────┐│
│  │  BMA Logo                  ││
│  │  "Uniting Mizos in         ││
│  │   Bangalore since 1985"    ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  Our Mission                   │
│  [Mission text in bilingual]   │
├────────────────────────────────┤
│  Our Vision                    │
│  [Vision text in bilingual]    │
├────────────────────────────────┤
│  [📜 Our History]              │
│  [👥 Leadership Team]          │
├────────────────────────────────┤
│  Contact Us                    │
│  📧 info@bma.org.in           │
│  📱 +91 98765 43210           │
│  📍 Bangalore, Karnataka       │
├────────────────────────────────┤
│  Follow Us                     │
│  [FB] [Insta] [Twitter]        │
└────────────────────────────────┘
```

#### 2.6.2: Create History Page

**Files:** `app/(public)/about/history.tsx`

**Features:**

1. Timeline visualization
2. Key milestones
3. Historical photos
4. Bilingual content

**Timeline Component:**

```typescript
interface TimelineItem {
  year: number;
  title_en: string;
  title_lus?: string;
  description_en: string;
  description_lus?: string;
  image_url?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}
```

#### 2.6.3: Create Leadership Page

**Files:** `app/(public)/about/leadership.tsx`

**Features:**

1. Current leadership team
2. Position and name
3. Photo
4. Brief bio
5. Contact/email (optional)
6. Order by leadership hierarchy

**UI Layout:**

```
┌────────────────────────────────┐
│  Leadership                    │
├────────────────────────────────┤
│  Executive Committee           │
│  ┌────────────────────────────┐│
│  │  ┌─────┐  President        ││
│  │  │Photo│  Name             ││
│  │  └─────┘  Brief bio...     ││
│  └────────────────────────────┘│
│  ┌───────────┬───────────┐    │
│  │ ┌─────┐   │ ┌─────┐   │    │
│  │ │Photo│   │ │Photo│   │    │
│  │ └─────┘   │ └─────┘   │    │
│  │ V.Pres    │ Secretary │    │
│  │ Name      │ Name      │    │
│  └───────────┴───────────┘    │
├────────────────────────────────┤
│  Committee Members             │
│  [Grid of member cards]        │
└────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Leadership ordered correctly
- [ ] Photos display
- [ ] Bilingual names/positions
- [ ] Responsive grid

---

### Task 2.7: Newsletter Archive

**GitHub Issue:** #17 - Implement Newsletter Archive

#### 2.7.1: Create Newsletter List

**Files:** `app/(public)/newsletter/index.tsx`

**Features:**

1. List of past newsletters
2. Issue number and date
3. PDF download link
4. Preview image/thumbnail

**UI Layout:**

```
┌────────────────────────────────┐
│  Newsletter Archive            │
├────────────────────────────────┤
│  Subscribe for updates         │
│  [Email input] [Subscribe]     │
├────────────────────────────────┤
│  Past Issues                   │
│  ┌────────────────────────────┐│
│  │ Jan 2026 - Issue #45       ││
│  │ [Thumbnail] [📥 Download]  ││
│  └────────────────────────────┘│
│  ┌────────────────────────────┐│
│  │ Dec 2025 - Issue #44       ││
│  │ [Thumbnail] [📥 Download]  ││
│  └────────────────────────────┘│
└────────────────────────────────┘
```

---

### Task 2.8: Comments & Likes System

**GitHub Issue:** #18 - Implement Comments and Likes

#### 2.8.1: Create Comment Types and Hooks

**Files:** `types/comment.ts`, `hooks/useComments.ts`

```typescript
// types/comment.ts
export interface Comment {
  id: string;
  content_id: string;
  user_id: string;
  parent_id?: string;
  body: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

// hooks/useComments.ts
export function useComments(contentId: string) {
  // Returns: { comments, isLoading, error, refetch }
}

export function useAddComment() {
  // Returns: { addComment, isLoading, error }
}

export function useEditComment() {
  // Returns: { editComment, isLoading, error }
}

export function useDeleteComment() {
  // Returns: { deleteComment, isLoading, error }
}
```

#### 2.8.2: Create Comments Section Component

**Files:** `components/CommentsSection.tsx`

**Features:**

1. Display total comment count
2. Add comment form (authenticated)
3. List of comments with replies
4. Reply functionality
5. Edit/delete own comments
6. Load more for long threads

```typescript
interface CommentsSectionProps {
  contentId: string;
  contentType: ContentType;
}
```

**Acceptance Criteria:**

- [ ] Comments load and display
- [ ] Authenticated users can add comments
- [ ] Reply nesting (1 level)
- [ ] Edit/delete own comments
- [ ] Optimistic updates

#### 2.8.3: Create Like System

**Files:** `hooks/useLikes.ts`, `components/LikeButton.tsx`

```typescript
// hooks/useLikes.ts
export function useLike(contentId: string) {
  // Returns: { isLiked, likesCount, toggleLike, isLoading }
}

// components/LikeButton.tsx
interface LikeButtonProps {
  contentId: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: 'sm' | 'md' | 'lg';
}
```

**Features:**

1. Heart icon (filled when liked)
2. Like count display
3. Toggle on press
4. Optimistic update
5. Requires authentication

**Acceptance Criteria:**

- [ ] Like toggles on press
- [ ] Count updates immediately
- [ ] Persists to database
- [ ] Works without auth prompt (redirects)

---

### Task 2.9: Home Page

**GitHub Issue:** #19 - Implement Home Page

#### 2.9.1: Create Public Home Page

**Files:** `app/(public)/index.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  [Header with Nav]             │
├────────────────────────────────┤
│  ┌────────────────────────────┐│
│  │  Hero Section              ││
│  │  "Welcome to BMA"          ││
│  │  [Join Us] [Learn More]    ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  Latest News                   │
│  [Card] [Card] [Card]          │
│  [View All News →]             │
├────────────────────────────────┤
│  Upcoming Events               │
│  [EventCard] [EventCard]       │
│  [View All Events →]           │
├────────────────────────────────┤
│  Featured Articles             │
│  [ArticleCard]                 │
│  [View All Articles →]         │
├────────────────────────────────┤
│  Photo Gallery                 │
│  [Grid of recent photos]       │
│  [View Gallery →]              │
├────────────────────────────────┤
│  About BMA                     │
│  [Brief description]           │
│  [Learn More →]                │
├────────────────────────────────┤
│  [Footer]                      │
└────────────────────────────────┘
```

**Sections:**

1. Hero with CTAs
2. Latest News (3-4 items)
3. Upcoming Events (2-3 items)
4. Featured Articles (1-2 items)
5. Photo Gallery preview
6. About BMA summary
7. Footer with links

**Acceptance Criteria:**

- [ ] All sections load
- [ ] Responsive layout
- [ ] Links navigate correctly
- [ ] Bilingual content displays

---

### Task 2.10: SEO & Meta Tags

**GitHub Issue:** #20 - Implement SEO and Meta Tags

#### 2.10.1: Create SEO Component

**Files:** `components/SEO.tsx`, `lib/seo.ts`

**Web Only (expo-router Head):**

```typescript
import Head from 'expo-router/head';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
}

export function SEO({ title, description, image, url, type, publishedTime, author }: SEOProps) {
  const fullTitle = `${title} | BMA 2026`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type || 'website'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}
    </Head>
  );
}
```

#### 2.10.2: Add SEO to All Public Pages

**Files:** All `app/(public)/*.tsx` files

Example usage:

```typescript
// app/(public)/news/[slug].tsx
export default function NewsDetail() {
  const { content } = useContentBySlug(slug);

  return (
    <>
      <SEO
        title={content?.title_en || 'News'}
        description={content?.excerpt_en}
        image={content?.featured_image_url}
        type="article"
        publishedTime={content?.published_at}
        author={content?.author?.full_name}
      />
      {/* Page content */}
    </>
  );
}
```

**Acceptance Criteria:**

- [ ] All public pages have meta tags
- [ ] Open Graph tags render
- [ ] Twitter cards work
- [ ] Dynamic content has correct meta

---

### Task 2.11: Image Optimization

**GitHub Issue:** #21 - Implement Image Optimization

> **Strategy Note:** See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md#image-optimization-strategy) for the full image optimization strategy and service options.

#### Image Optimization Strategy Overview

| Requirement         | Solution                                        | Notes                                |
| ------------------- | ----------------------------------------------- | ------------------------------------ |
| **Storage**         | Supabase Storage                                | Already integrated                   |
| **Transformations** | Cloudinary (recommended) OR Supabase Transforms | On-the-fly resize, format conversion |
| **Format Delivery** | WebP/AVIF with fallback                         | Automatic via Cloudinary or manual   |
| **Placeholders**    | Blurhash                                        | Built into expo-image                |
| **Lazy Loading**    | expo-image                                      | Native support                       |
| **CDN**             | Cloudinary CDN OR Vercel Edge                   | Global distribution                  |

#### Option A: Cloudinary (Recommended for Photo Gallery)

**Pros:**

- Free tier: 25GB storage, 25GB bandwidth/month
- On-the-fly transformations (resize, crop, format)
- Automatic WebP/AVIF delivery
- Built-in CDN
- Advanced features (face detection, smart cropping)

**Cons:**

- Additional service to manage
- May need paid tier for high traffic

#### Option B: Supabase Storage Transforms

**Pros:**

- Already integrated with existing stack
- Simpler architecture
- Included in Supabase plan

**Cons:**

- Requires Supabase Pro plan ($25/month) for transforms
- Fewer transformation options than Cloudinary
- No automatic format optimization

**Recommendation:** Start with **Cloudinary free tier** for photo gallery and high-traffic images. Use Supabase Storage directly for low-traffic images (avatars, admin uploads).

#### 2.11.1: Create Optimized Image Component

**Files:** `components/OptimizedImage.tsx`

```typescript
import { Image } from 'expo-image';
import { getOptimizedImageUrl, ImageSize } from '@/lib/images';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: ImageSize;
  width?: number;
  height?: number;
  aspectRatio?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'none';
  blurhash?: string; // Pre-computed blurhash from database (generated during upload)
  contentFit?: 'cover' | 'contain' | 'fill';
}

export function OptimizedImage({
  src,
  alt,
  size,
  width,
  height,
  aspectRatio,
  priority = false,
  placeholder = 'blur',
  blurhash, // Should be passed from parent (stored in DB during upload)
  contentFit = 'cover',
}: OptimizedImageProps) {
  // Generate optimized URL (Cloudinary or Supabase transform)
  const optimizedSrc = getOptimizedImageUrl(src, { size, width, height });

  return (
    <Image
      source={{ uri: optimizedSrc }}
      alt={alt}
      style={{ width: width ?? size?.width, height: height ?? size?.height, aspectRatio }}
      contentFit={contentFit}
      placeholder={
        placeholder === 'blur' && blurhash
          ? { blurhash }
          : undefined
      }
      transition={200}
      priority={priority}
      cachePolicy="memory-disk"
    />
  );
}

// Usage example: Pass blurhash from database
// const { data: photo } = await supabase
//   .from('media')
//   .select('url, blurhash')
//   .eq('id', photoId)
//   .single();
//
// <OptimizedImage
//   src={photo.url}
//   alt="Gallery photo"
//   size={ImageSizes.galleryThumb}
//   blurhash={photo.blurhash}  // Pre-computed from DB
//   placeholder="blur"
// />
```

#### 2.11.2: Configure Image Transformation Service

**Files:** `lib/images.ts`

```typescript
// Image size presets
export const ImageSizes = {
  thumbnail: { width: 150, height: 150 },
  card: { width: 400, height: 300 },
  hero: { width: 1200, height: 600 },
  gallery: { width: 800, height: 800 },
  galleryThumb: { width: 200, height: 200 },
  avatar: { width: 200, height: 200 },
  fullscreen: { width: 1920, height: 1080 },
} as const;

export type ImageSize = (typeof ImageSizes)[keyof typeof ImageSizes];

interface ImageTransformOptions {
  size?: ImageSize;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

// Cloudinary configuration (recommended)
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function getOptimizedImageUrl(url: string, options: ImageTransformOptions): string {
  if (!url) return '';

  const width = options.width ?? options.size?.width;
  const height = options.height ?? options.size?.height;
  const quality = options.quality ?? 80;
  const format = options.format ?? 'auto';

  // Option A: Cloudinary transforms (recommended)
  if (CLOUDINARY_CLOUD_NAME && url.includes('cloudinary')) {
    return getCloudinaryUrl(url, { width, height, quality, format });
  }

  // Option B: Supabase transforms (fallback)
  if (url.includes('supabase')) {
    return getSupabaseTransformUrl(url, { width, height, quality });
  }

  // External URLs - return as-is
  return url;
}

// Cloudinary URL builder
function getCloudinaryUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number; format?: string }
): string {
  const transforms = [
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    'c_fill', // Smart crop
    'g_auto', // Auto gravity (face detection)
    `q_${options.quality ?? 'auto'}`,
    `f_${options.format ?? 'auto'}`, // Auto format (WebP/AVIF)
  ]
    .filter(Boolean)
    .join(',');

  // Insert transforms into Cloudinary URL
  return url.replace('/upload/', `/upload/${transforms}/`);
}

// Supabase transform URL builder
function getSupabaseTransformUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number }
): string {
  const params = new URLSearchParams();
  if (options.width) params.set('width', String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.quality) params.set('quality', String(options.quality));

  return params.toString() ? `${url}?${params.toString()}` : url;
}

// Blurhash generation (server-side during upload)
// NOTE: This function should NOT be called during render.
// Blurhash should be:
// 1. Generated server-side when image is uploaded (using blurhash library)
// 2. Stored in database alongside image URL
// 3. Passed as a prop to OptimizedImage component
//
// Example database schema:
// CREATE TABLE media (
//   id UUID PRIMARY KEY,
//   url TEXT NOT NULL,
//   blurhash TEXT,  -- Store pre-computed blurhash here
//   ...
// );
export function generateBlurhashOnUpload(imageBuffer: Buffer): string {
  // Server-side implementation using 'blurhash' library
  // const blurhash = encode(pixels, width, height, componentX, componentY);
  // return blurhash;
  throw new Error('generateBlurhashOnUpload should only be called server-side during image upload');
}
```

#### 2.11.3: Upload with Cloudinary Integration

**Files:** `lib/upload.ts`

**Prerequisites:**

- Create an unsigned upload preset named `bma_unsigned` in your Cloudinary account (Settings → Upload → Upload presets)
- Set `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` environment variable in `.env`

```typescript
import * as ImagePicker from 'expo-image-picker';

// Import Cloudinary cloud name from environment config
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface UploadOptions {
  folder: string;
}

// For gallery/high-traffic images - upload to Cloudinary
// NOTE: Blurhash generation should happen server-side via Edge Function
// after upload completes, then stored in database alongside the image URL.
// See generateBlurhashOnUpload() documentation above for the correct workflow.
export async function uploadToCloudinary(uri: string, options: UploadOptions): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is not set');
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  formData.append('upload_preset', 'bma_unsigned'); // Must be configured in Cloudinary
  formData.append('folder', options.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url;
}

// For low-traffic images - upload to Supabase Storage
export async function uploadToSupabase(uri: string, bucket: string, path: string): Promise<string> {
  // Existing Supabase upload logic
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, await fetch(uri).then((r) => r.blob()));

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
```

#### 2.11.4: Gallery-Specific Optimizations

**Files:** `app/(public)/gallery/[album].tsx`

```typescript
// Use responsive image sizes based on screen width
import { useWindowDimensions } from 'react-native';

function GalleryGrid({ photos }: { photos: Photo[] }) {
  const { width } = useWindowDimensions();
  const columns = width > 768 ? 4 : width > 480 ? 3 : 2;
  const thumbSize = Math.floor(width / columns);

  return (
    <FlashList
      data={photos}
      numColumns={columns}
      estimatedItemSize={thumbSize}
      renderItem={({ item }) => (
        <Pressable onPress={() => openLightbox(item)}>
          <OptimizedImage
            src={item.url}
            alt={item.caption}
            size={ImageSizes.galleryThumb}
            width={thumbSize}
            height={thumbSize}
            placeholder="blur"
          />
        </Pressable>
      )}
    />
  );
}

// Lightbox uses full-size image
function Lightbox({ photo }: { photo: Photo }) {
  return (
    <OptimizedImage
      src={photo.url}
      alt={photo.caption}
      size={ImageSizes.fullscreen}
      priority // Load immediately
      placeholder="blur"
      contentFit="contain"
    />
  );
}
```

**Acceptance Criteria:**

- [ ] Images load with correct sizes for each context
- [ ] Blur placeholder displays while loading
- [ ] WebP/AVIF format delivered when browser supports
- [ ] Lazy loading for off-screen images (gallery grid)
- [ ] Priority loading for above-fold images (hero, lightbox)
- [ ] CDN caching working (check response headers)
- [ ] Gallery thumbnails < 50KB each
- [ ] Hero images < 200KB

---

### Task 2.12: Offline-Lite Foundation

**GitHub Issue:** #22 - Implement Offline-Lite Caching

#### 2.12.1: Setup Query Client with Caching

**Files:** `lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Persist to AsyncStorage
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'BMA_QUERY_CACHE',
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});
```

#### 2.12.2: Create Network Status Context

**Files:** `contexts/NetworkContext.tsx`

```typescript
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isOnline: boolean;
  isOffline: boolean;
  connectionType: string | null;
}

export function NetworkProvider({ children }) {
  const [networkState, setNetworkState] = useState<NetworkContextType>({
    isOnline: true,
    isOffline: false,
    connectionType: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isOnline: state.isConnected ?? false,
        isOffline: !state.isConnected,
        connectionType: state.type,
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
}
```

#### 2.12.3: Create Offline Banner

**Files:** `components/OfflineBanner.tsx`

```typescript
export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const { t } = useAppTranslation();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Icon name="cloud-offline" />
      <Text>{t('common.offline_mode')}</Text>
    </View>
  );
}
```

**Acceptance Criteria:**

- [ ] Cache persists across app restarts
- [ ] Offline banner shows when disconnected
- [ ] Cached content accessible offline
- [ ] Stale data shows with indicator

---

## Testing Requirements

### Unit Tests

- [ ] Content hooks return correct data
- [ ] Pagination works correctly
- [ ] Comments CRUD operations
- [ ] Like toggle logic
- [ ] Image URL transformation

### Integration Tests

- [ ] Content list loads and paginates
- [ ] Content detail with comments
- [ ] Like updates count
- [ ] Offline caching works

### E2E Tests

- [ ] Browse news flow
- [ ] Browse events flow
- [ ] Add comment flow
- [ ] Like content flow

### Accessibility Tests

- [ ] Screen reader navigation
- [ ] Image alt texts
- [ ] Focus management
- [ ] Color contrast

---

## Files Created/Modified Summary

### New Files

| Category   | Files                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types      | `types/content.ts`, `types/comment.ts`                                                                                                                                                                                                                                                                                                                                                                                    |
| Hooks      | `hooks/useContent.ts`, `hooks/useComments.ts`, `hooks/useLikes.ts`                                                                                                                                                                                                                                                                                                                                                        |
| API        | `lib/api/content.ts`                                                                                                                                                                                                                                                                                                                                                                                                      |
| Components | `components/MarkdownRenderer.tsx`, `components/Lightbox.tsx`, `components/CommentsSection.tsx`, `components/LikeButton.tsx`, `components/SEO.tsx`, `components/OptimizedImage.tsx`, `components/OfflineBanner.tsx`, `components/Timeline.tsx`                                                                                                                                                                             |
| Screens    | `app/(public)/news/index.tsx`, `app/(public)/news/[slug].tsx`, `app/(public)/events/index.tsx`, `app/(public)/events/[slug].tsx`, `app/(public)/articles/index.tsx`, `app/(public)/articles/[slug].tsx`, `app/(public)/gallery/index.tsx`, `app/(public)/gallery/[album].tsx`, `app/(public)/about/index.tsx`, `app/(public)/about/history.tsx`, `app/(public)/about/leadership.tsx`, `app/(public)/newsletter/index.tsx` |
| Lib        | `lib/calendar.ts`, `lib/images.ts`, `lib/queryClient.ts`, `lib/seo.ts`                                                                                                                                                                                                                                                                                                                                                    |
| Context    | `contexts/NetworkContext.tsx`                                                                                                                                                                                                                                                                                                                                                                                             |

### Modified Files

| File                       | Changes                          |
| -------------------------- | -------------------------------- |
| `app/_layout.tsx`          | Add QueryClient, NetworkProvider |
| `app/(public)/_layout.tsx` | Add header, footer               |
| `package.json`             | Add new dependencies             |

---

## Dependencies

### NPM Packages to Install

```bash
# Query/caching
npm install @tanstack/react-query @tanstack/query-async-storage-persister @tanstack/react-query-persist-client

# Markdown
npm install react-native-markdown-display

# Image viewing
npm install react-native-image-zoom-viewer expo-image

# Calendar
npm install expo-calendar

# Network
npm install @react-native-community/netinfo
```

---

## Definition of Done

- [ ] All 6 content types displaying correctly
- [ ] News, events, articles with detail views
- [ ] Photo gallery with lightbox
- [ ] About, history, leadership pages
- [ ] Newsletter archive
- [ ] Comments system working
- [ ] Likes system working
- [ ] Home page with all sections
- [ ] SEO meta tags on all pages
- [ ] Image optimization working
- [ ] Offline caching foundation
- [ ] All unit tests passing
- [ ] All GitHub Issues for Phase 2 closed

---

## Next Phase

Continue to [Phase 3: Membership & Payments](./04-PHASE-3-MEMBERSHIP-PAYMENTS.md)
