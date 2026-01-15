# Site Search System Design Document

**Status:** Draft - Awaiting Review
**Version:** 1.0
**Last Updated:** 2026-01-15
**Implementation Phase:** Phase 6 (Polish & Launch) - Days 61-67
**Priority:** P0 (Launch target) - Can defer to post-launch if time constraints

---

## Implementation Timing

**Planned Phase:** Phase 6 (Polish & Launch)
**Estimated Duration:** 6 days
**Target Launch:** March 21, 2026 (BMA Annual Day)

### Rationale for Phase 6

1. **Content Dependency**: Search requires content types from Phase 2 to be implemented first
2. **UX Enhancement**: Search is a valuable quality-of-life feature that enhances discoverability
3. **Not Blocking**: Users can navigate via direct routes (News, Events, etc.) without search
4. **Time Fit**: 6-day estimate fits within Phase 6's polish window
5. **Fallback Option**: If schedule slips, can defer to post-launch (Week 2-3) without blocking March 21 launch

### Launch Priority

- **Target**: Include in March 21, 2026 web launch
- **Fallback**: If behind schedule, defer to post-launch Sprint 1 (Days 68-74)
- **User Value**: High - significantly improves content discoverability and user experience

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Search API Design](#search-api-design)
6. [Bilingual Search Strategy](#bilingual-search-strategy)
7. [Search UI Design](#search-ui-design)
8. [Performance Considerations](#performance-considerations)
9. [Offline Considerations](#offline-considerations)
10. [Design Decisions](#design-decisions)
11. [Implementation Plan](#implementation-plan)

---

## Overview

The BMA Site Search feature provides a unified, bilingual search experience across all public content in the app. Users can quickly find News, Events, Articles, Newsletters, Gallery items, and Leadership profiles from a single search interface.

### Key Features

- **Unified Global Search**: Single search bar accessible from the app header
- **Bilingual Support**: Searches both English and Mizo content simultaneously
- **PostgreSQL Full-Text Search**: Fast, proven keyword-based search
- **Content Type Filtering**: Filter results by content type
- **Responsive UI**: Full-screen modal on mobile, inline on desktop
- **Recent Searches**: Locally cached search history for convenience

### Design Principles

- **Speed**: Sub-500ms search results for optimal UX
- **Simplicity**: FTS over vector search - good enough for keyword matching
- **Bilingual-first**: Both languages treated equally in search ranking
- **Progressive disclosure**: Show type filters only when results are present
- **Graceful degradation**: Cached recent results available offline

---

## Requirements

### Functional Requirements

| ID    | Requirement                                       | Priority |
| ----- | ------------------------------------------------- | -------- |
| SR-01 | Search across all public content types            | P0       |
| SR-02 | Support English and Mizo query terms              | P0       |
| SR-03 | Return results in user's preferred language first | P0       |
| SR-04 | Filter results by content type                    | P0       |
| SR-05 | Display search results with title, excerpt, type  | P0       |
| SR-06 | Navigate to content detail on result tap          | P0       |
| SR-07 | Show loading state during search                  | P0       |
| SR-08 | Show empty state when no results found            | P0       |
| SR-09 | Debounce search input (300ms)                     | P1       |
| SR-10 | Persist recent searches locally (last 10)         | P1       |
| SR-11 | Clear individual or all recent searches           | P2       |
| SR-12 | Highlight matching terms in results               | P2       |

### Non-Functional Requirements

| ID     | Requirement                 | Target                    |
| ------ | --------------------------- | ------------------------- |
| NFR-01 | Search response time        | < 500ms (p95)             |
| NFR-02 | Minimum query length        | 2 characters              |
| NFR-03 | Maximum results per request | 50 items (paginated)      |
| NFR-04 | Search index freshness      | Real-time (trigger-based) |
| NFR-05 | Recent searches storage     | AsyncStorage (local)      |

---

## Architecture

### High-Level Search Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SEARCH FLOW                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  User types in search input                                             │
│       │                                                                 │
│       ▼                                                                 │
│  ┌─────────────────┐                                                    │
│  │ Debounce        │    Wait 300ms after last keystroke                 │
│  │ (300ms)         │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Query too short?│YES │ Clear results   │                            │
│  │ (< 2 chars)     │───▶│ Show recent     │                            │
│  └────────┬────────┘    │ searches        │                            │
│           │ NO          └─────────────────┘                            │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ Build FTS query │    Normalize query for both languages              │
│  │                 │    Apply content type filter (if set)              │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Call Supabase   │───▶│ PostgreSQL      │                            │
│  │ RPC: search_    │    │ Full-Text       │                            │
│  │ content         │    │ Search          │                            │
│  └────────┬────────┘    └─────────────────┘                            │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ Process results │    - Rank by relevance + recency                   │
│  │                 │    - Group by content type                         │
│  │                 │    - Format for display                            │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ Render results  │    - Show grouped results                          │
│  │                 │    - Enable type filtering                         │
│  │                 │    - Save to recent searches                       │
│  └─────────────────┘                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Expo)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ SearchTrigger   │  │ SearchModal     │  │ SearchResults   │         │
│  │ (header icon)   │  │ (full UI)       │  │ (result list)   │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           ▼                    ▼                    ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Search Components                           │   │
│  │  SearchInput │ SearchResultCard │ RecentSearches │ TypeFilter   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Hooks Layer                              │   │
│  │  useSearch │ useRecentSearches │ useDebounce                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE BACKEND                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ RPC Function:   │  │ Database:       │  │ Indexes:        │         │
│  │ search_content  │  │ content table   │  │ search_vector_  │         │
│  │                 │  │ (with tsvector) │  │ en, _lus (GIN)  │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Existing `content` Table Extensions

Add tsvector columns for full-text search:

```sql
-- Add search vector columns to existing content table
ALTER TABLE content ADD COLUMN IF NOT EXISTS search_vector_en tsvector;
ALTER TABLE content ADD COLUMN IF NOT EXISTS search_vector_lus tsvector;

-- Create GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS idx_content_search_en
  ON content USING GIN (search_vector_en);

CREATE INDEX IF NOT EXISTS idx_content_search_lus
  ON content USING GIN (search_vector_lus);

-- Composite index for filtering by type + status
CREATE INDEX IF NOT EXISTS idx_content_type_status_published
  ON content (type, status, published_at DESC)
  WHERE deleted_at IS NULL;
```

### Search Vector Update Function

```sql
-- Function to update search vectors when content changes
CREATE OR REPLACE FUNCTION update_content_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  -- English search vector: title + body + excerpt (weighted)
  NEW.search_vector_en :=
    setweight(to_tsvector('english', COALESCE(NEW.title_en, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt_en, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_en, '')), 'C');

  -- Mizo search vector: title + body + excerpt (weighted)
  -- Note: Using 'simple' config since Mizo doesn't have a dedicated config
  NEW.search_vector_lus :=
    setweight(to_tsvector('simple', COALESCE(NEW.title_lus, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.excerpt_lus, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.body_lus, '')), 'C');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vectors
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

### Search RPC Function

```sql
-- Main search function
CREATE OR REPLACE FUNCTION search_content(
  query TEXT,
  content_types TEXT[] DEFAULT NULL,  -- Filter by types: ['news', 'event', 'article']
  preferred_language TEXT DEFAULT 'en',
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title_en TEXT,
  title_lus TEXT,
  excerpt_en TEXT,
  excerpt_lus TEXT,
  featured_image_url TEXT,
  published_at TIMESTAMPTZ,
  author_name TEXT,
  likes_count INT,
  comments_count INT,
  rank_en FLOAT,
  rank_lus FLOAT,
  combined_rank FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_en tsquery;
  query_lus tsquery;
BEGIN
  -- Convert query to tsquery for both languages
  -- Using plainto_tsquery for simple space-separated term matching
  query_en := plainto_tsquery('english', query);
  query_lus := plainto_tsquery('simple', query);

  RETURN QUERY
  SELECT
    c.id,
    c.type::TEXT,
    c.title_en,
    c.title_lus,
    c.excerpt_en,
    c.excerpt_lus,
    c.featured_image_url,
    c.published_at,
    p.full_name AS author_name,
    c.likes_count,
    c.comments_count,
    -- English relevance score
    COALESCE(ts_rank_cd(c.search_vector_en, query_en), 0)::FLOAT AS rank_en,
    -- Mizo relevance score
    COALESCE(ts_rank_cd(c.search_vector_lus, query_lus), 0)::FLOAT AS rank_lus,
    -- Combined rank: prioritize user's preferred language
    CASE
      WHEN preferred_language = 'lus' THEN
        (COALESCE(ts_rank_cd(c.search_vector_lus, query_lus), 0) * 1.5) +
        COALESCE(ts_rank_cd(c.search_vector_en, query_en), 0)
      ELSE
        (COALESCE(ts_rank_cd(c.search_vector_en, query_en), 0) * 1.5) +
        COALESCE(ts_rank_cd(c.search_vector_lus, query_lus), 0)
    END::FLOAT AS combined_rank
  FROM content c
  LEFT JOIN profiles p ON c.author_id = p.id
  WHERE
    -- Only published content
    c.status = 'published'
    AND c.deleted_at IS NULL
    -- Match in either language
    AND (
      c.search_vector_en @@ query_en
      OR c.search_vector_lus @@ query_lus
    )
    -- Optional type filter
    AND (content_types IS NULL OR c.type::TEXT = ANY(content_types))
  ORDER BY
    combined_rank DESC,
    c.published_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$;
```

### Search Count Function (for pagination)

```sql
-- Count matching results
CREATE OR REPLACE FUNCTION search_content_count(
  query TEXT,
  content_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  total_count BIGINT,
  counts_by_type JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_en tsquery;
  query_lus tsquery;
BEGIN
  query_en := plainto_tsquery('english', query);
  query_lus := plainto_tsquery('simple', query);

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_count,
    jsonb_object_agg(type, type_count) AS counts_by_type
  FROM (
    SELECT
      c.type::TEXT,
      COUNT(*)::BIGINT AS type_count
    FROM content c
    WHERE
      c.status = 'published'
      AND c.deleted_at IS NULL
      AND (
        c.search_vector_en @@ query_en
        OR c.search_vector_lus @@ query_lus
      )
      AND (content_types IS NULL OR c.type::TEXT = ANY(content_types))
    GROUP BY c.type
  ) sub;
END;
$$;
```

### RLS Policies

```sql
-- Search functions use SECURITY DEFINER, but underlying content table has RLS
-- Ensure search only returns publicly accessible content

-- Already have: Published content is public
-- RLS on content table ensures only published content is returned
```

---

## Search API Design

### Supabase Client Usage

The search will be called directly via Supabase RPC:

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

export interface SearchResult {
  id: string;
  type: ContentType;
  title_en: string | null;
  title_lus: string | null;
  excerpt_en: string | null;
  excerpt_lus: string | null;
  featured_image_url: string | null;
  published_at: string;
  author_name: string | null;
  likes_count: number;
  comments_count: number;
  rank_en: number;
  rank_lus: number;
  combined_rank: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  countsByType: Record<ContentType, number>;
}

export async function searchContent(options: SearchOptions): Promise<SearchResponse> {
  const { query, contentTypes, preferredLanguage = 'en', limit = 20, offset = 0 } = options;

  // Validate minimum query length
  if (query.trim().length < 2) {
    return { results: [], totalCount: 0, countsByType: {} as Record<ContentType, number> };
  }

  // Fetch results and counts in parallel
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

### Hook Implementation

```typescript
// hooks/useSearch.ts

import { useState, useEffect, useCallback } from 'react';
import { searchContent, SearchOptions, SearchResult, ContentType } from '@/lib/search';
import { useDebounce } from './useDebounce';

interface UseSearchOptions {
  debounceMs?: number;
  initialContentTypes?: ContentType[];
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  countsByType: Record<ContentType, number>;
  selectedTypes: ContentType[];
  setSelectedTypes: (types: ContentType[]) => void;
  loadMore: () => void;
  hasMore: boolean;
  clearSearch: () => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { debounceMs = 300, initialContentTypes } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [countsByType, setCountsByType] = useState<Record<ContentType, number>>(
    {} as Record<ContentType, number>
  );
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>(initialContentTypes || []);
  const [offset, setOffset] = useState(0);

  const debouncedQuery = useDebounce(query, debounceMs);

  const performSearch = useCallback(
    async (searchQuery: string, searchOffset: number, append: boolean) => {
      if (searchQuery.trim().length < 2) {
        if (!append) {
          setResults([]);
          setTotalCount(0);
          setCountsByType({} as Record<ContentType, number>);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchContent({
          query: searchQuery,
          contentTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
          offset: searchOffset,
          limit: 20,
        });

        if (append) {
          setResults((prev) => [...prev, ...response.results]);
        } else {
          setResults(response.results);
        }
        setTotalCount(response.totalCount);
        setCountsByType(response.countsByType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTypes]
  );

  // Initial search when query changes
  useEffect(() => {
    setOffset(0);
    performSearch(debouncedQuery, 0, false);
  }, [debouncedQuery, performSearch]);

  // Re-search when filters change
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setOffset(0);
      performSearch(debouncedQuery, 0, false);
    }
  }, [selectedTypes]);

  const loadMore = useCallback(() => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    performSearch(debouncedQuery, newOffset, true);
  }, [debouncedQuery, offset, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalCount(0);
    setOffset(0);
    setError(null);
  }, []);

  return {
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
    hasMore: results.length < totalCount,
    clearSearch,
  };
}
```

---

## Bilingual Search Strategy

### Language Detection

The search system does **not** attempt to detect the query language. Instead:

1. **Search both languages simultaneously**: Every query searches both `search_vector_en` and `search_vector_lus`
2. **Rank by user preference**: Results matching the user's preferred language rank higher
3. **Display appropriate content**: Show title/excerpt in user's language, fallback to other if empty

### Text Configuration

| Language | PostgreSQL Config | Rationale                                       |
| -------- | ----------------- | ----------------------------------------------- |
| English  | `english`         | Full stemming, stop word removal                |
| Mizo     | `simple`          | No stemming (not available), basic tokenization |

### Mizo Search Considerations

Since Mizo doesn't have a dedicated PostgreSQL text search configuration:

1. **Simple tokenization**: Words are split by whitespace/punctuation
2. **No stemming**: "thla" won't match "thlate" (plural)
3. **No stop words**: Common words like "a", "an", "chu" are included
4. **Case insensitive**: PostgreSQL FTS is case-insensitive by default

**Mitigation strategies:**

- Use `plainto_tsquery` for forgiving query parsing
- Weight title matches higher than body matches
- Consider fuzzy matching (trigram) for future enhancement

### Query Normalization

```sql
-- Example query handling
-- Input: "BMA membership"
-- English: plainto_tsquery('english', 'BMA membership') → 'bma' & 'membership'
-- Mizo: plainto_tsquery('simple', 'BMA membership') → 'bma' & 'membership'

-- Input: "thla tin inkhawm" (monthly meeting in Mizo)
-- English: plainto_tsquery('english', 'thla tin inkhawm') → 'thla' & 'tin' & 'inkhawm'
-- Mizo: plainto_tsquery('simple', 'thla tin inkhawm') → 'thla' & 'tin' & 'inkhawm'
```

### Result Display Logic

```typescript
// Determine which language content to display
function getDisplayContent(result: SearchResult, preferredLanguage: 'en' | 'lus') {
  const title =
    preferredLanguage === 'lus'
      ? result.title_lus || result.title_en
      : result.title_en || result.title_lus;

  const excerpt =
    preferredLanguage === 'lus'
      ? result.excerpt_lus || result.excerpt_en
      : result.excerpt_en || result.excerpt_lus;

  return { title, excerpt };
}
```

---

## Search UI Design

### Component Structure

```
components/
  search/
    ├── SearchTrigger.tsx      # Header search icon button
    ├── SearchModal.tsx        # Full search UI modal
    ├── SearchInput.tsx        # Input with clear button
    ├── SearchResults.tsx      # Results list container
    ├── SearchResultCard.tsx   # Individual result card
    ├── SearchTypeFilter.tsx   # Content type filter chips
    ├── RecentSearches.tsx     # Recent search history
    └── SearchEmptyState.tsx   # No results message
```

### Search Modal Wireframe (Mobile)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐  [Cancel]  │
│  │ 🔍  Search BMA...                              [✕] │            │
│  └─────────────────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Recent Searches                                    [Clear All]     │
│  ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐  │
│  │ 🕐 membership     │ │ 🕐 annual event   │ │ 🕐 BMA history   │  │
│  └───────────────────┘ └───────────────────┘ └──────────────────┘  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Popular Topics                                                     │
│  ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐  │
│  │ 📰 Membership     │ │ 📅 Events         │ │ 📖 About BMA     │  │
│  └───────────────────┘ └───────────────────┘ └──────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Search Results Wireframe (Mobile)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐  [Cancel]  │
│  │ 🔍  membership                                 [✕] │            │
│  └─────────────────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Type: [All ●] [News] [Events] [Articles] [Gallery]                │
│                                                                     │
│  12 results for "membership"                                        │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📰 News                                                     │   │
│  │ ──────────────────────────────────────────────────────────  │   │
│  │ How to Become a BMA Member                                  │   │
│  │ Step-by-step guide to joining the Bangalore Mizo...         │   │
│  │ Jan 10, 2026 • 45 likes                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 Article                                                  │   │
│  │ ──────────────────────────────────────────────────────────  │   │
│  │ Membership Benefits Explained                               │   │
│  │ Discover all the exclusive benefits available to paid...    │   │
│  │ Dec 15, 2025 • 32 likes                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📅 Event                                                    │   │
│  │ ──────────────────────────────────────────────────────────  │   │
│  │ New Member Orientation                                      │   │
│  │ Welcome session for all new BMA members. Learn about...     │   │
│  │ Feb 20, 2026 • Upcoming                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Load More Results]                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Empty State Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐  [Cancel]  │
│  │ 🔍  xyzabc123                                  [✕] │            │
│  └─────────────────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                         🔍                                          │
│                                                                     │
│                  No results found                                   │
│                                                                     │
│         We couldn't find anything matching                          │
│                    "xyzabc123"                                      │
│                                                                     │
│         Try searching with different keywords                       │
│         or check your spelling.                                     │
│                                                                     │
│                                                                     │
│  Suggestions:                                                       │
│  • Search for "membership" to learn about joining                   │
│  • Search for "events" to see upcoming activities                   │
│  • Search for "contact" to reach BMA team                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Search on Desktop (Web)

On desktop, search can be inline in the header rather than a full modal:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]    Home   News   Events   Articles   About    [🔍 Search...]  [👤]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Search Results                                              [✕]     │   │
│  │                                                                     │   │
│  │ Type: [All ●] [News] [Events] [Articles]                           │   │
│  │                                                                     │   │
│  │ ┌─────────────────────────────────────────────────────────────┐   │   │
│  │ │ 📰 How to Become a BMA Member                                │   │   │
│  │ │ Step-by-step guide to joining...  • Jan 10, 2026            │   │   │
│  │ └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ ┌─────────────────────────────────────────────────────────────┐   │   │
│  │ │ 📄 Membership Benefits Explained                             │   │   │
│  │ │ Discover all the exclusive benefits...  • Dec 15, 2025      │   │   │
│  │ └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │ 12 total results                                  [View All →]     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### UI Components Specification

#### SearchInput

Extends the existing `Input` component:

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```

Features:

- Search icon on left
- Clear button (X) on right when value is non-empty
- Debounced onChange (handled by hook, not component)
- Submit on Enter key (web)

#### SearchTypeFilter

Horizontal scrollable chip list:

```typescript
interface SearchTypeFilterProps {
  selectedTypes: ContentType[];
  onTypesChange: (types: ContentType[]) => void;
  countsByType: Record<ContentType, number>;
}
```

Features:

- "All" option that clears selection
- Shows count badge on each type
- Horizontal scroll on mobile
- Multi-select or single-select (single recommended for simplicity)

#### SearchResultCard

Uses the existing `Card` component pattern:

```typescript
interface SearchResultCardProps {
  result: SearchResult;
  preferredLanguage: 'en' | 'lus';
  onPress: () => void;
  highlightTerms?: string[]; // For future term highlighting
}
```

Features:

- Content type icon and label
- Title (in preferred language)
- Excerpt snippet (truncated)
- Metadata: date, likes count
- Press handler for navigation

---

## Performance Considerations

### Query Optimization

1. **GIN Indexes**: Essential for FTS performance
2. **Composite Index**: Type + status + published_at for filtered queries
3. **Limit Results**: Default 20, max 50 per request
4. **Parallel Queries**: Fetch results and counts simultaneously

### Debouncing

- **300ms debounce**: Prevents excessive API calls while typing
- **Minimum 2 characters**: Avoids overly broad searches
- **Cancel pending requests**: When new query is entered

### Caching Strategy

```typescript
// TanStack Query configuration for search
const searchQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 1,
};
```

### Expected Performance

| Metric                    | Target  | Notes                   |
| ------------------------- | ------- | ----------------------- |
| Cold search (first query) | < 500ms | Index scan + join       |
| Warm search (cached)      | < 100ms | TanStack Query cache    |
| Type filter change        | < 300ms | Filtered index scan     |
| Load more (pagination)    | < 400ms | Offset-based pagination |

---

## Offline Considerations

### Offline-Lite Strategy

Consistent with the app's Offline-Lite approach:

1. **Recent searches**: Stored in AsyncStorage, available offline
2. **Search functionality**: **Disabled** when offline
3. **Cached results**: Previously viewed search results **not** cached (too dynamic)
4. **Offline message**: Show "Search requires an internet connection" banner

### Implementation

```typescript
// hooks/useSearch.ts - offline handling
import { useNetInfo } from '@react-native-community/netinfo';

export function useSearch() {
  const { isConnected } = useNetInfo();

  // If offline, return early with disabled state
  if (!isConnected) {
    return {
      ...defaultState,
      isOffline: true,
      error: 'Search requires an internet connection',
    };
  }

  // Normal search logic...
}
```

### Offline UI

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐  [Cancel]  │
│  │ 🔍  Search BMA...                          [disabled]│            │
│  └─────────────────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              ┌─────────────────────────────────────┐                │
│              │ 📶 You're Offline                   │                │
│              │                                     │                │
│              │ Search requires an internet         │                │
│              │ connection. Please check your       │                │
│              │ connection and try again.           │                │
│              └─────────────────────────────────────┘                │
│                                                                     │
│  Recent Searches (from history)                                     │
│  ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐  │
│  │ 🕐 membership     │ │ 🕐 annual event   │ │ 🕐 BMA history   │  │
│  └───────────────────┘ └───────────────────┘ └──────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### 1. Search Technology

**Decision:** PostgreSQL Full-Text Search (FTS)

- **Rationale**:
  - Simpler to implement than vector search
  - Sufficient for keyword-based queries
  - No additional infrastructure (pgvector already for chatbot)
  - Better performance for exact matches
  - Lower operational complexity

- **Trade-offs**:
  - Less "smart" than semantic search
  - No typo tolerance (can add pg_trgm later)
  - Limited Mizo language support (no stemming)

### 2. Search Scope

**Decision:** All public content types

- News, Events, Articles, Newsletter, Gallery, Leadership
- **Excluded**: Member directory (paid members only, separate feature)
- **Excluded**: Knowledge base (chatbot-specific, not user-facing)

### 3. User Interface

**Decision:** Unified global search with modal

- Single search trigger in header (icon on mobile, input on desktop)
- Full-screen modal on mobile
- Dropdown/overlay on desktop
- Type filtering within results (not upfront)

### 4. Language Handling

**Decision:** Search both languages simultaneously

- Don't detect query language
- Search both EN and LUS vectors
- Rank by user's preferred language
- Display content in preferred language with fallback

### 5. Offline Behavior

**Decision:** Disable search when offline

- Show recent searches (from local storage)
- Display clear "offline" message
- No result caching (too dynamic, storage concerns)

### 6. Result Ranking

**Decision:** Combined relevance + recency

- Primary: FTS relevance score (weighted by field)
- Secondary: User's preferred language boost (1.5x)
- Tertiary: Publication date (newer first)

### 7. Recent Searches

**Decision:** Local storage, last 10 searches

- Store query strings only (not results)
- AsyncStorage on native, localStorage on web
- User can clear individual or all
- Persists across sessions

---

## Implementation Plan

### Phase 1: Database Setup (Day 1)

- [ ] Add migration for search vector columns
- [ ] Create update trigger function
- [ ] Create GIN indexes
- [ ] Create `search_content` RPC function
- [ ] Create `search_content_count` RPC function
- [ ] Backfill existing content
- [ ] Test queries in Supabase dashboard

### Phase 2: API & Hooks (Day 2)

- [ ] Implement `searchContent` client function
- [ ] Implement `useSearch` hook
- [ ] Implement `useDebounce` hook (if not exists)
- [ ] Implement `useRecentSearches` hook
- [ ] Add error handling and loading states
- [ ] Write unit tests for hooks

### Phase 3: UI Components (Days 3-4)

- [ ] Create `SearchInput` component
- [ ] Create `SearchResultCard` component
- [ ] Create `SearchTypeFilter` component
- [ ] Create `SearchEmptyState` component
- [ ] Create `RecentSearches` component
- [ ] Create `SearchModal` component
- [ ] Add `SearchTrigger` to header components

### Phase 4: Integration & Polish (Day 5)

- [ ] Integrate search into `WebHeader`
- [ ] Integrate search into `MobileHeader`
- [ ] Add navigation to content detail pages
- [ ] Implement offline detection and messaging
- [ ] Add loading skeletons
- [ ] Test across platforms (web, iOS, Android)

### Phase 5: Testing & Refinement (Day 6)

- [ ] E2E tests for search flow
- [ ] Performance testing with sample data
- [ ] Accessibility audit
- [ ] Bilingual testing (EN and LUS queries)
- [ ] Edge case handling (special characters, etc.)

---

## Appendix A: Content Type Icons

| Type       | Icon (Ionicons)         | Color   |
| ---------- | ----------------------- | ------- |
| news       | `newspaper-outline`     | Primary |
| article    | `document-text-outline` | Primary |
| event      | `calendar-outline`      | Primary |
| newsletter | `mail-outline`          | Primary |
| gallery    | `images-outline`        | Primary |
| leadership | `people-outline`        | Primary |

---

## Appendix B: Search Prompt Examples

### English Queries

| Query          | Expected Results                            |
| -------------- | ------------------------------------------- |
| "membership"   | Articles about joining, membership benefits |
| "annual event" | Annual General Meeting, recurring events    |
| "BMA history"  | About page content, historical articles     |
| "contact"      | Contact information, leadership profiles    |

### Mizo Queries

| Query          | Expected Results                         |
| -------------- | ---------------------------------------- |
| "member"       | Member-related content (Mizo + English)  |
| "inkhawm"      | Meeting/gathering related content        |
| "thuthang"     | News content (Mizo for "news")           |
| "hun pawimawh" | Events (Mizo for "important time/event") |

---

## Appendix C: Future Enhancements

Potential improvements for post-launch:

1. **Fuzzy matching**: Add `pg_trgm` extension for typo tolerance
2. **Search suggestions**: Auto-complete based on popular searches
3. **Search analytics**: Track popular queries for content insights
4. **Semantic search**: Hybrid FTS + vector for natural language queries
5. **Member directory search**: Paid members can search other members
6. **Search history sync**: Sync recent searches across devices (authenticated)
7. **Advanced filters**: Date range, author, category filters
8. **Highlighted snippets**: Highlight matching terms in excerpts
