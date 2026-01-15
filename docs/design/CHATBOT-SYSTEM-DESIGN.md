# Help Desk Chatbot System Design Document

**Status:** Draft - Design Decisions Resolved, Awaiting Review
**Version:** 1.0
**Last Updated:** 2026-01-14

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [RAG Pipeline Design](#rag-pipeline-design)
6. [Knowledge Base Design](#knowledge-base-design)
7. [Conversation Management](#conversation-management)
8. [Rate Limiting](#rate-limiting)
9. [Message Classification](#message-classification)
10. [Escalation System](#escalation-system)
11. [Edge Function Design](#edge-function-design)
12. [Chat UI Design](#chat-ui-design)
13. [Design Decisions](#design-decisions)

---

## Overview

The BMA Help Desk Chatbot is a RAG-powered (Retrieval-Augmented Generation) bilingual assistant that helps community members with questions about membership, events, and services. It supports both English and Mizo languages with intelligent escalation to human support.

### Key Features

- **Bilingual Support**: Responds in English or Mizo based on user preference
- **RAG-Powered**: Grounds responses in official BMA knowledge base documents
- **Tiered Rate Limits**: 5 messages/day (free), 30 messages/day (paid members)
- **Message Classification**: Informational, guidance, or urgent
- **Human Escalation**: Paid members can escalate to human support
- **Conversation History**: Persistent chat history with summarization

### Design Principles

- **Accuracy over creativity**: Prefer "I don't know" over hallucination
- **Grounded responses**: Always cite knowledge base sources when available
- **Cultural sensitivity**: Appropriate tone for Mizo community context
- **Graceful degradation**: Helpful fallbacks when KB doesn't have answers

---

## Requirements

### Functional Requirements

| ID    | Requirement                                            | Priority |
| ----- | ------------------------------------------------------ | -------- |
| CB-01 | Respond to user queries using RAG from knowledge base  | P0       |
| CB-02 | Support English and Mizo languages                     | P0       |
| CB-03 | Enforce rate limits (5/day free, 30/day paid)          | P0       |
| CB-04 | Persist conversation history                           | P0       |
| CB-05 | Classify messages (informational/guidance/urgent)      | P0       |
| CB-06 | Allow paid members to escalate to human support        | P0       |
| CB-07 | Display source references for responses                | P1       |
| CB-08 | Summarize older messages for context window management | P1       |
| CB-09 | Chunk long KB documents for better retrieval           | P1       |
| CB-10 | Show typing indicator during response generation       | P2       |

### Non-Functional Requirements

| ID     | Requirement              | Target                     |
| ------ | ------------------------ | -------------------------- |
| NFR-01 | Response generation time | < 5 seconds                |
| NFR-02 | Vector search latency    | < 500ms                    |
| NFR-03 | Knowledge base size      | 15-20 documents initially  |
| NFR-04 | Embedding dimensions     | 768 (Gemini embedding-001) |
| NFR-05 | Similarity threshold     | 0.7 cosine similarity      |

---

## Architecture

### High-Level RAG Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHATBOT RAG FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  User sends message                                                     │
│       │                                                                 │
│       ▼                                                                 │
│  ┌─────────────────┐                                                    │
│  │ Rate Limit      │    Check daily_message_counts                      │
│  │ Check           │    Free: 5/day, Paid: 30/day                       │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼ (if under limit)                                            │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Generate Query  │───▶│ Gemini API      │                            │
│  │ Embedding       │    │ embedding-001   │                            │
│  │ (768-dim)       │    │                 │                            │
│  └────────┬────────┘    └─────────────────┘                            │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Vector Search   │───▶│ pgvector        │                            │
│  │ (cosine sim)    │    │ knowledge_base  │                            │
│  │ threshold: 0.7  │    │ chunks          │                            │
│  └────────┬────────┘    └─────────────────┘                            │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ Build Context   │    Components:                                     │
│  │                 │    1. System prompt                                │
│  │                 │    2. Retrieved KB chunks (top 5)                  │
│  │                 │    3. Conversation summary (if > 10 msgs)          │
│  │                 │    4. Recent messages (last 10)                    │
│  │                 │    5. User's current message                       │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Generate        │───▶│ Gemini API      │                            │
│  │ Response +      │    │ gemini-1.5-pro  │                            │
│  │ Classification  │    │                 │                            │
│  └────────┬────────┘    └─────────────────┘                            │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ Process Output  │    - Parse JSON response                           │
│  │                 │    - Extract classification                        │
│  │                 │    - Map source references                         │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │ Save & Return   │    - Store messages in DB                          │
│  │                 │    - Update conversation summary if needed         │
│  │                 │    - Return response to user                       │
│  └─────────────────┘                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (Expo)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Chat List       │  │ Chat Screen     │  │ Escalation      │         │
│  │ (conversations) │  │ (messages)      │  │ Dialog          │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           ▼                    ▼                    ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      React Hooks Layer                           │   │
│  │  useConversations │ useMessages │ useSendMessage │ useEscalation │   │
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
│  │ Edge Functions  │  │ Database        │  │ External APIs   │         │
│  │                 │  │                 │  │                 │         │
│  │ • chat/start    │  │ • knowledge_base│  │ • Gemini API    │         │
│  │ • chat/message  │  │ • kb_chunks     │  │   (embeddings)  │         │
│  │ • chat/escalate │  │ • conversations │  │   (generation)  │         │
│  │ • chat/rate-    │  │ • messages      │  │                 │         │
│  │   limit         │  │ • escalations   │  │ • Gupshup       │         │
│  │                 │  │ • daily_counts  │  │   (WhatsApp)    │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Existing Tables (from migration 00001)

The following tables already exist in the schema:

#### `knowledge_base`

```sql
-- Already exists - stores KB documents
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_lus TEXT,
  content_en TEXT NOT NULL,
  content_lus TEXT,
  category TEXT,                    -- 'membership', 'events', 'community', etc.
  tags TEXT[],
  embedding_en vector(768),         -- Gemini embedding for English
  embedding_lus vector(768),        -- Gemini embedding for Mizo
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
```

#### `chat_conversations`

```sql
-- Already exists - stores conversation sessions
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT,                       -- Auto-generated from first message
  language TEXT DEFAULT 'en',       -- 'en' or 'lus'
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  summary TEXT,                     -- Conversation summary for context
  summary_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `chat_messages`

```sql
-- Already exists - stores individual messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
  role TEXT NOT NULL,               -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  classification TEXT,              -- 'informational', 'guidance', 'urgent'
  sources JSONB DEFAULT '[]',       -- Array of {id, title} from KB
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `escalations`

```sql
-- Already exists - stores escalation requests
CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',    -- 'pending', 'acknowledged', 'resolved', 'dismissed'
  priority INTEGER DEFAULT 2,       -- 1=high, 2=medium, 3=low
  reason TEXT,
  resolution_notes TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### New Table: `kb_chunks`

For chunking long documents into smaller segments for better retrieval:

```sql
CREATE TABLE kb_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,

  -- Chunk identification
  chunk_index INTEGER NOT NULL,           -- 0, 1, 2... for ordering
  language TEXT NOT NULL,                 -- 'en' or 'lus'

  -- Content
  content TEXT NOT NULL,                  -- Chunk text (~500 tokens)
  token_count INTEGER,                    -- Approximate token count

  -- Embedding
  embedding vector(768) NOT NULL,         -- Gemini embedding for this chunk

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(knowledge_base_id, chunk_index, language)
);

-- Vector similarity search index
CREATE INDEX idx_kb_chunks_embedding ON kb_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Quick lookup by parent document
CREATE INDEX idx_kb_chunks_parent ON kb_chunks(knowledge_base_id);
```

### New Table: `daily_message_counts`

For tracking rate limits:

```sql
CREATE TABLE daily_message_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,

  -- Unique constraint for upsert
  UNIQUE(user_id, date)
);

-- Index for quick lookups
CREATE INDEX idx_daily_counts_user_date ON daily_message_counts(user_id, date);
```

### Database Function: `match_kb_chunks`

Vector similarity search function:

```sql
CREATE OR REPLACE FUNCTION match_kb_chunks(
  query_embedding vector(768),
  match_language TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  knowledge_base_id UUID,
  chunk_index INTEGER,
  content TEXT,
  title_en TEXT,
  title_lus TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.knowledge_base_id,
    c.chunk_index,
    c.content,
    kb.title_en,
    kb.title_lus,
    kb.category,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM kb_chunks c
  JOIN knowledge_base kb ON kb.id = c.knowledge_base_id
  WHERE
    c.language = match_language
    AND kb.is_active = true
    AND kb.deleted_at IS NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Database Function: `increment_daily_message_count`

Atomic increment for rate limiting:

```sql
CREATE OR REPLACE FUNCTION increment_daily_message_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
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
```

### RLS Policies

```sql
-- kb_chunks: Read-only for authenticated users (search via function)
ALTER TABLE kb_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chunks"
  ON kb_chunks FOR SELECT
  USING (auth.role() = 'authenticated');

-- daily_message_counts: Users can only see their own
ALTER TABLE daily_message_counts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own message counts"
  ON daily_message_counts FOR SELECT
  USING (auth.uid() = user_id);

-- Insert/update handled by service role via function
```

---

## RAG Pipeline Design

### Embedding Strategy

**Model:** Gemini `embedding-001` (768 dimensions)

**Embedding Generation:**

1. User message → Generate query embedding
2. KB document chunks → Pre-computed embeddings stored in `kb_chunks`

**Language Handling:**

- Detect user's language preference from conversation
- Search embeddings in matching language
- If no results, fallback to English embeddings

### Retrieval Strategy

**Parameters:**

- Top-K: 5 chunks
- Similarity threshold: 0.7 (cosine similarity)
- Max context tokens: ~2000 tokens from KB

**Retrieval Flow:**

```
1. Generate embedding for user query
2. Vector search in kb_chunks (language-specific)
3. If results < 3 and language != 'en', search English chunks too
4. Deduplicate by knowledge_base_id (keep highest similarity chunk per doc)
5. Return top 5 chunks with metadata
```

### Context Assembly

**Context Window Budget (~8000 tokens total):**

- System prompt: ~500 tokens
- KB context: ~2000 tokens (5 chunks × ~400 tokens)
- Conversation summary: ~500 tokens (if exists)
- Recent messages: ~3000 tokens (last 10 messages)
- User message: ~500 tokens
- Response buffer: ~1500 tokens

**Assembly Order:**

```
[System Prompt]
[KB Context - Retrieved Chunks]
[Conversation Summary - if message_count > 10]
[Recent Messages - last 10]
[Current User Message]
```

---

## Knowledge Base Design

### Document Structure

Each KB document represents a topic (e.g., "Membership Benefits", "Annual Event").

**Categories:**

- `membership` - Joining, benefits, renewal, fees
- `events` - Annual event, regular meetups, registration
- `community` - Guidelines, contact info, leadership
- `services` - Available services for members
- `faq` - Frequently asked questions
- `contact` - Contact information, office hours

### Chunking Strategy

**Chunk Size:** ~500 tokens (~400 words)

**Chunking Rules:**

1. Split on paragraph boundaries when possible
2. Keep headers with their content
3. Don't split mid-sentence
4. Overlap: 50 tokens between chunks for context continuity

**Example Chunking:**

```
Original Document (1500 tokens):
├── Chunk 0: Introduction + Section 1 (500 tokens)
├── Chunk 1: Section 2 (500 tokens)
└── Chunk 2: Section 3 + Conclusion (500 tokens)
```

### Placeholder KB Structure

Initial ~15-20 documents for development:

| ID  | Title (EN)                       | Title (LUS)                       | Category   | Est. Chunks |
| --- | -------------------------------- | --------------------------------- | ---------- | ----------- |
| 1   | How to become a BMA member       | BMA member ni dan                 | membership | 2           |
| 2   | Membership benefits              | Membership hlawkna                | membership | 2           |
| 3   | Membership fees and payment      | Membership man leh payment        | membership | 1           |
| 4   | Membership renewal process       | Membership tihtharte dan          | membership | 1           |
| 5   | Annual General Meeting           | Kum Tin General Meeting           | events     | 2           |
| 6   | Monthly community meetups        | Thla tin inkhawm                  | events     | 1           |
| 7   | Event registration process       | Event registration dan            | events     | 1           |
| 8   | Community guidelines             | Community guidelines              | community  | 2           |
| 9   | BMA leadership team              | BMA hruaitute                     | community  | 1           |
| 10  | Contact information              | Contact information               | contact    | 1           |
| 11  | Office hours and location        | Office hours leh hmun             | contact    | 1           |
| 12  | Emergency contacts               | Emergency contacts                | contact    | 1           |
| 13  | What is BMA?                     | BMA chu eng nge?                  | faq        | 1           |
| 14  | Who can join BMA?                | Tu nge BMA-ah lut thei?           | faq        | 1           |
| 15  | How to update my profile         | Profile tihdan thar               | faq        | 1           |
| 16  | Member directory access          | Member directory en theihna       | services   | 1           |
| 17  | Chatbot usage guide              | Chatbot hmang dan                 | services   | 1           |
| 18  | How to escalate to human support | Human support hnenah escalate dan | services   | 1           |
| 19  | Privacy and data handling        | Privacy leh data enkawlna         | faq        | 1           |
| 20  | Feedback and suggestions         | Feedback leh ngaihdan             | contact    | 1           |

**Total:** ~20 documents, ~25-30 chunks

---

## Conversation Management

### Conversation Lifecycle

```
┌─────────────────┐
│   User opens    │
│   chat screen   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Has active      │ YES │ Load existing   │
│ conversation?   │────▶│ conversation    │
└────────┬────────┘     └─────────────────┘
         │ NO
         ▼
┌─────────────────┐
│ Create new      │
│ conversation    │
│ (chat/start)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show welcome    │
│ message         │
└─────────────────┘
```

### Conversation Summary (for context management)

**Trigger:** When `message_count > 10` and last summary is > 5 messages old

**Summary Generation:**

```
Prompt to Gemini:
"Summarize this conversation in 2-3 sentences, capturing:
1. Main topics discussed
2. Key questions asked
3. Any unresolved issues

Conversation:
[Messages 1-N]"
```

**Storage:**

- Summary stored in `chat_conversations.summary`
- `summary_updated_at` tracks when summary was last generated

**Usage in Context:**

- If summary exists, include it before recent messages
- Recent messages = messages after `summary_updated_at` OR last 10

### Message Window Strategy

**Full History:** Keep all 30 messages in database

**Context Window:** Use summary + recent messages

- Messages 1-N: Summarized into ~500 tokens
- Messages (N+1) to current: Full text (~3000 tokens)

**Example:**

```
Conversation with 25 messages:
├── Summary of messages 1-15: "User asked about membership..."
└── Full messages 16-25: [actual message content]
```

---

## Rate Limiting

### Tier Limits

| User Type              | Daily Limit | Reset Time   |
| ---------------------- | ----------- | ------------ |
| Free (authenticated)   | 5 messages  | Midnight IST |
| Paid (annual/lifetime) | 30 messages | Midnight IST |

### Rate Limit Check Flow

```
1. Get user's membership status from `memberships` table
2. Determine limit (5 or 30)
3. Check current count from `daily_message_counts`
4. If count >= limit:
   - Return 429 with upgrade prompt (if free)
   - Return 429 with reset time (if paid)
5. If count < limit:
   - Proceed with message processing
   - Increment count atomically after response generated
```

### Rate Limit Response

```typescript
interface RateLimitResponse {
  limit: number;
  used: number;
  remaining: number;
  resets_at: string; // ISO timestamp for midnight IST
  is_paid_member: boolean;
  upgrade_available: boolean;
}
```

### UI Display

```
┌─────────────────────────────────────────────────────────────────────┐
│  Daily messages: 4/5 remaining                                     │
│  Resets at 12:00 AM IST                                            │
│  [Upgrade for 30 messages/day →]                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Message Classification

### Classification Types

| Type            | Description                          | UI Treatment                 |
| --------------- | ------------------------------------ | ---------------------------- |
| `informational` | Factual answers, information sharing | Standard response            |
| `guidance`      | How-to, process steps, instructions  | Show help resources link     |
| `urgent`        | Emergency, distress, critical issues | Offer escalation (paid only) |

### Gemini-Based Classification

Classification is performed as part of the response generation, not separately.

**Structured Output Request:**

```json
{
  "response": "The response text...",
  "classification": "informational|guidance|urgent",
  "confidence": 0.95,
  "sources_used": ["kb_chunk_id_1", "kb_chunk_id_2"]
}
```

**Classification Prompt (included in system prompt):**

```
When responding, also classify the nature of your response:
- "informational": Providing facts, answering questions
- "guidance": Explaining processes, giving instructions
- "urgent": User shows distress, emergency, or needs immediate human help

Include your classification in the JSON output.
```

### Urgent Detection Signals

The AI should flag as `urgent` when detecting:

- Emergency language ("urgent", "emergency", "help immediately")
- Distress signals ("crisis", "serious problem", "desperate")
- Life events ("death", "accident", "hospital")
- Explicit escalation requests ("talk to human", "need real person")

---

## Escalation System

### Escalation Eligibility

- **Paid members only** can initiate escalation
- Free users see upgrade prompt if they request escalation
- Escalation offered automatically when classification is `urgent`

### Escalation Flow

```
┌─────────────────┐
│ User requests   │
│ escalation      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Is paid member? │ NO  │ Show upgrade    │
│                 │────▶│ prompt          │
└────────┬────────┘     └─────────────────┘
         │ YES
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Has open        │ YES │ Show existing   │
│ escalation?     │────▶│ escalation      │
└────────┬────────┘     │ status          │
         │ NO           └─────────────────┘
         ▼
┌─────────────────┐
│ Show escalation │
│ reason dialog   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create          │
│ escalation      │
│ record          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notify admins   │
│ (WhatsApp/Email)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show            │
│ confirmation    │
└─────────────────┘
```

### Escalation Notifications

**Channel Priority:**

1. WhatsApp (via Gupshup) - Primary
2. Email (via Resend) - Fallback

**Notification Content:**

```
New Escalation Request

User: [Name]
Conversation: [Link to admin view]
Reason: [User-provided reason]
Priority: Medium

Please review and respond.
```

### Admin Escalation Management

Admins can:

- View all open escalations in admin dashboard
- Acknowledge escalation (changes status to `acknowledged`)
- Respond directly in conversation
- Resolve with notes
- Dismiss if not valid

---

## Edge Function Design

### Function: `chat/start`

**Endpoint:** `POST /functions/v1/chat/start`

**Request:**

```typescript
interface StartChatRequest {
  language?: 'en' | 'lus'; // Default: 'en'
}
```

**Response:**

```typescript
interface StartChatResponse {
  conversation_id: string;
  message: string; // Welcome message
  rate_limit: RateLimitResponse;
}
```

### Function: `chat/message`

**Endpoint:** `POST /functions/v1/chat/message`

**Request:**

```typescript
interface SendMessageRequest {
  conversation_id: string;
  message: string;
  language?: 'en' | 'lus';
}
```

**Response:**

```typescript
interface SendMessageResponse {
  message_id: string;
  content: string;
  classification: 'informational' | 'guidance' | 'urgent';
  sources: Array<{
    id: string;
    title: string;
    category: string;
  }>;
  can_escalate: boolean; // true if paid + urgent
  remaining_messages: number;
  rate_limit: RateLimitResponse;
}
```

### Function: `chat/rate-limit`

**Endpoint:** `GET /functions/v1/chat/rate-limit`

**Response:** `RateLimitResponse`

### Function: `chat/escalate`

**Endpoint:** `POST /functions/v1/chat/escalate`

**Request:**

```typescript
interface EscalateRequest {
  conversation_id: string;
  reason?: string;
}
```

**Response:**

```typescript
interface EscalateResponse {
  escalation_id: string;
  message: string; // Confirmation message
}
```

**Error Responses:**

- 403: Not a paid member
- 409: Escalation already exists for this conversation

---

## Chat UI Design

### Chat List Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]              Chat                      [+ New Chat]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💬 Membership inquiry                                       │   │
│  │ Jan 14 • "Thank you for your question about..."             │   │
│  │                                                     [→]     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💬 Event registration help                                  │   │
│  │ Jan 12 • "The registration process is..."                   │   │
│  │                                                     [→]     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💬 General questions                                        │   │
│  │ Jan 10 • "BMA was founded in..."                            │   │
│  │                                                     [→]     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Daily messages: 3/5 remaining                                     │
│  [Upgrade for more →]                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Chat Conversation Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]         Membership inquiry           [⚠️ Get Help]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ℹ️ This is an AI assistant. Responses may not always be     │   │
│  │ accurate. For urgent matters, contact BMA directly.         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────┐                          │
│  │ 🤖 Hello! I am the BMA assistant.    │                          │
│  │ How can I help you today?            │                          │
│  │                              10:30 AM │                          │
│  └──────────────────────────────────────┘                          │
│                                                                     │
│                    ┌──────────────────────────────────────┐        │
│                    │ What are the membership fees?        │        │
│                    │                              10:31 AM │        │
│                    └──────────────────────────────────────┘        │
│                                                                     │
│  ┌──────────────────────────────────────┐                          │
│  │ 🤖 BMA offers two membership tiers:  │                          │
│  │                                       │                          │
│  │ • Annual: ₹500/year                  │                          │
│  │ • Lifetime: ₹5,000 (one-time)        │                          │
│  │                                       │                          │
│  │ Both tiers include full access to    │                          │
│  │ member benefits including...         │                          │
│  │                                       │                          │
│  │ 📚 Sources:                          │                          │
│  │ • Membership fees and payment        │                          │
│  │ • Membership benefits                │                          │
│  │                              10:31 AM │                          │
│  └──────────────────────────────────────┘                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  [Send]  │
│  │ Type your message...                                │          │
│  └─────────────────────────────────────────────────────┘          │
│  2/5 messages remaining today                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Escalation Dialog

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    ┌─────────────────────────┐                     │
│                    │   Talk to a Human       │                     │
│                    ├─────────────────────────┤                     │
│                    │                         │                     │
│                    │ Your request will be    │                     │
│                    │ sent to a BMA team      │                     │
│                    │ member who will respond │                     │
│                    │ as soon as possible.    │                     │
│                    │                         │                     │
│                    │ Reason (optional):      │                     │
│                    │ ┌─────────────────────┐ │                     │
│                    │ │                     │ │                     │
│                    │ │                     │ │                     │
│                    │ └─────────────────────┘ │                     │
│                    │                         │                     │
│                    │ [Cancel]  [Send Request]│                     │
│                    │                         │                     │
│                    └─────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Chat Components

| Component          | Purpose                                 |
| ------------------ | --------------------------------------- |
| `ChatBubble`       | Message display (user/assistant/system) |
| `ChatInput`        | Message input with send button          |
| `ChatDisclaimer`   | AI disclaimer banner                    |
| `ChatSources`      | Source references list                  |
| `RateLimitBadge`   | Remaining messages indicator            |
| `EscalationDialog` | Escalation request modal                |
| `TypingIndicator`  | Loading state during response           |

---

## Design Decisions (Resolved)

### 1. Message Window Size

**Decision:** 30 messages maximum

- Full conversation stored in database
- Context window uses summary + recent messages
- Cost acceptable for expected usage

### 2. Classification Approach

**Decision:** Gemini-based classification

- Classification returned as part of response JSON
- More accurate than keyword matching
- Handles Mizo language naturally
- No additional API call needed

### 3. Conversation Summarization

**Decision:** Implement summarization for older messages

- Trigger: When `message_count > 10` and summary is stale
- Keeps context window manageable
- Preserves conversation continuity

### 4. Fallback Handling

**Decision:** General guidance + suggest contacting BMA

- When KB similarity < 0.7 for all chunks
- Response: "I don't have specific information about that. For more details, please contact BMA directly at [contact info]."
- Escalation only if user explicitly requests it

### 5. Escalation Notifications

**Decision:** WhatsApp (primary) via Gupshup, Email (fallback) via Resend

- No push notifications for now
- Notify all admins of new escalations

### 6. Knowledge Base Seeding

**Decision:** Create placeholder structure

- ~20 placeholder documents for development
- Final content provided before production
- Structure enables development and testing

### 7. Chunking Strategy

**Decision:** Chunk into ~500 token segments with separate embeddings

- Better retrieval precision for specific questions
- ~50 token overlap between chunks
- Stored in `kb_chunks` table

---

## Appendix: Gemini Prompts

### System Prompt Template

```
You are a helpful assistant for the Bangalore Mizo Association (BMA), a community organization for Mizo people living in Bangalore, India.

CORE RESPONSIBILITIES:
1. Answer questions about BMA membership, events, and services
2. Provide accurate information from the knowledge base
3. Be respectful, supportive, and culturally appropriate
4. Admit when you don't know something

LANGUAGE:
- Current conversation language: {language}
- Respond in {language === 'lus' ? 'Mizo (Lushai)' : 'English'}
- You may use English technical terms when appropriate in Mizo responses

RESPONSE GUIDELINES:
- Be concise but complete
- Use bullet points for lists
- Always cite sources when using knowledge base information
- If unsure, say "I'm not certain about that" rather than guessing

CLASSIFICATION:
After your response, classify it as:
- "informational": Factual answers, information sharing
- "guidance": How-to instructions, process steps
- "urgent": User needs immediate human assistance

{isPaidMember ? 'The user is a paid member and can escalate to human support if needed.' : ''}

OUTPUT FORMAT (JSON):
{
  "response": "Your response text here",
  "classification": "informational|guidance|urgent",
  "sources_used": ["chunk_id_1", "chunk_id_2"]
}

KNOWLEDGE BASE CONTEXT:
{retrievedChunks}

CONVERSATION SUMMARY:
{conversationSummary || 'No previous context'}

RECENT MESSAGES:
{recentMessages}
```

### Summarization Prompt

```
Summarize this conversation between a user and the BMA assistant in 2-3 sentences.

Focus on:
1. Main topics discussed
2. Key questions the user asked
3. Any unresolved issues or pending actions

Conversation:
{messages}

Provide a concise summary that captures the essential context.
```

---

## Appendix: Placeholder Knowledge Base Content

### Document 1: How to become a BMA member

**English:**

```
To become a BMA member:

1. Create an account on the BMA app using your email or social login
2. Complete your profile with required information (name, phone, address)
3. Choose a membership tier:
   - Annual: ₹500/year
   - Lifetime: ₹5,000 (one-time payment)
4. Complete the payment via Razorpay (cards, UPI, netbanking accepted)
5. Your membership will be activated immediately after payment confirmation

Requirements:
- Must be of Mizo origin or have significant connection to Mizo community
- Must be 18 years or older
- Must agree to BMA community guidelines
```

**Mizo:**

```
BMA member ni dan:

1. BMA app-ah account siam rawh - email emaw social login hmang thei
2. Profile i zawng zawng tih famkim rawh (hming, phone, address)
3. Membership tier thlan rawh:
   - Annual: ₹500/kum
   - Lifetime: ₹5,000 (vawi khat chauh)
4. Razorpay hmangin payment kalpui rawh (cards, UPI, netbanking a awm)
5. Payment a confirm hnu chuan i membership a active nghal ang

Ngaihtuahna:
- Mizo hnam ni tur emaw Mizo community nena inzawmna nei tur
- Kum 18 aia upa tur
- BMA community guidelines pawm tur
```

_(Additional placeholder documents would follow same pattern)_
