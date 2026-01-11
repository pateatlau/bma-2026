# Phase 4: AI Chatbot (Days 39-50)

## Overview

Phase 4 implements the RAG-powered bilingual chatbot using Google Gemini API and pgvector for document retrieval. The chatbot provides community assistance in English and Mizo with intelligent escalation to human support.

**Duration:** 12 days
**Prerequisites:** Phase 3 completed (membership, payments)
**Deliverables:**

- Knowledge base management with vector embeddings
- RAG (Retrieval-Augmented Generation) chatbot
- Google Gemini API integration
- Rate limiting (5/day free, 30/day paid)
- Message classification (informational/guidance/urgent)
- Human escalation system
- Chat history persistence

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CHATBOT FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User Message                                                       │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                        │
│  │  Rate Limiter   │───▶│  Check Quota    │                        │
│  │  (5 or 30/day)  │    │  daily_message  │                        │
│  └────────┬────────┘    │  _counts        │                        │
│           │             └─────────────────┘                        │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │  Generate       │    ┌─────────────────┐                        │
│  │  Embedding      │───▶│  Gemini API     │                        │
│  │  (768-dim)      │    │  embedding-001  │                        │
│  └────────┬────────┘    └─────────────────┘                        │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐    ┌─────────────────┐                        │
│  │  Vector Search  │───▶│  pgvector       │                        │
│  │  (similarity)   │    │  knowledge_base │                        │
│  └────────┬────────┘    └─────────────────┘                        │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐    ┌─────────────────┐                        │
│  │  Build Context  │    │  Retrieved      │                        │
│  │  + System       │◀───│  Documents      │                        │
│  │    Prompt       │    │  (top 5)        │                        │
│  └────────┬────────┘    └─────────────────┘                        │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐    ┌─────────────────┐                        │
│  │  Generate       │───▶│  Gemini API     │                        │
│  │  Response       │    │  gemini-1.5-pro │                        │
│  └────────┬────────┘    └─────────────────┘                        │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │  Classify       │    informational → Normal response            │
│  │  Response       │    guidance → Show help resources             │
│  │                 │    urgent → Offer escalation                  │
│  └────────┬────────┘                                               │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │  Save to DB &   │                                               │
│  │  Return         │                                               │
│  └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Task Breakdown

### Task 4.1: Knowledge Base System

**GitHub Issue:** #29 - Implement Knowledge Base System

#### 4.1.1: Create Knowledge Base Types

**Files:** `types/knowledge-base.ts`

```typescript
import { Database } from '@/lib/database.types';

export type KnowledgeBaseItem = Database['public']['Tables']['knowledge_base']['Row'];
export type KnowledgeBaseInsert = Database['public']['Tables']['knowledge_base']['Insert'];

export interface KnowledgeBaseCategory {
  id: string;
  name_en: string;
  name_lus: string;
  icon?: string;
  itemCount: number;
}

export const KB_CATEGORIES = [
  { id: 'membership', name_en: 'Membership', name_lus: 'Membership' },
  { id: 'events', name_en: 'Events', name_lus: 'Hun Pawimawh' },
  { id: 'community', name_en: 'Community', name_lus: 'Community' },
  { id: 'services', name_en: 'Services', name_lus: 'Services' },
  { id: 'faq', name_en: 'FAQ', name_lus: 'FAQ' },
  { id: 'contact', name_en: 'Contact', name_lus: 'Contact' },
] as const;

export interface DocumentMatch {
  id: string;
  title_en: string;
  title_lus: string | null;
  content_en: string;
  content_lus: string | null;
  category: string | null;
  similarity: number;
}
```

#### 4.1.2: Create Embedding Generation Function

**Files:** `supabase/functions/shared/embeddings.ts`

```typescript
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const EMBEDDING_MODEL = 'embedding-001';

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: {
          parts: [{ text }],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding generation failed: ${error}`);
  }

  const data = await response.json();
  return data.embedding.values; // 768-dimensional vector
}

export async function generateEmbeddingBatch(texts: string[]): Promise<number[][]> {
  // For larger batches, use batch API or sequential calls
  return Promise.all(texts.map((text) => generateEmbedding(text)));
}
```

#### 4.1.3: Create Admin Knowledge Base Edge Function

**Files:** `supabase/functions/admin/knowledge-base/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateEmbedding } from '../shared/embeddings.ts';

serve(async (req) => {
  // Verify admin role
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403 });
  }

  const method = req.method;

  if (method === 'POST') {
    // Create new KB item
    const body = await req.json();
    const { title_en, title_lus, content_en, content_lus, category, tags } = body;

    // Generate embedding from combined content
    const textForEmbedding = `${title_en}\n${content_en}\n${title_lus || ''}\n${content_lus || ''}`;
    const embedding = await generateEmbedding(textForEmbedding);

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        title_en,
        title_lus,
        content_en,
        content_lus,
        category,
        tags,
        embedding,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'knowledge_base.create',
      table_name: 'knowledge_base',
      record_id: data.id,
      new_data: { title_en, category },
    });

    return new Response(JSON.stringify(data), { status: 201 });
  }

  if (method === 'PUT') {
    // Update existing KB item
    const { id, ...updates } = await req.json();

    // Regenerate embedding if content changed
    if (updates.title_en || updates.content_en || updates.title_lus || updates.content_lus) {
      // Fetch existing for unchanged fields
      const { data: existing } = await supabase
        .from('knowledge_base')
        .select('title_en, title_lus, content_en, content_lus')
        .eq('id', id)
        .single();

      const textForEmbedding = `${updates.title_en || existing?.title_en}\n${updates.content_en || existing?.content_en}\n${updates.title_lus || existing?.title_lus || ''}\n${updates.content_lus || existing?.content_lus || ''}`;
      updates.embedding = await generateEmbedding(textForEmbedding);
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  }

  if (method === 'DELETE') {
    // Soft delete
    const { id } = await req.json();

    const { error } = await supabase
      .from('knowledge_base')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response('Method not allowed', { status: 405 });
});
```

**Acceptance Criteria:**

- [ ] KB items can be created with embeddings
- [ ] Embeddings regenerate on content update
- [ ] Admin-only access enforced
- [ ] Audit logs created

---

### Task 4.2: Chat Edge Functions

**GitHub Issue:** #30 - Implement Chat Edge Functions

#### 4.2.1: Create Chat Start Edge Function

**Files:** `supabase/functions/chat/start/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { language = 'en' } = await req.json();

  // Create new conversation
  const { data: conversation, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: user.id,
      language,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Add system message
  const systemMessage =
    language === 'lus'
      ? 'Ka lawm e! BMA chatbot ka ni. Eng zawng zawng in ka lo tanpui ang. (I am the BMA chatbot. How can I help you today?)'
      : 'Hello! I am the BMA chatbot. How can I help you today?';

  await supabase.from('chat_messages').insert({
    conversation_id: conversation.id,
    role: 'assistant',
    content: systemMessage,
  });

  return new Response(
    JSON.stringify({
      conversation_id: conversation.id,
      message: systemMessage,
    }),
    { status: 200 }
  );
});
```

#### 4.2.2: Create Chat Rate Limit Check Function

**Files:** `supabase/functions/chat/rate-limit/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Check if user is paid member
  const { data: membership } = await supabase
    .from('memberships')
    .select('tier, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const isPaidMember = membership?.tier && ['annual', 'lifetime'].includes(membership.tier);
  const dailyLimit = isPaidMember ? 30 : 5;

  // Get current count
  const { data: countRecord } = await supabase
    .from('daily_message_counts')
    .select('count')
    .eq('user_id', user.id)
    .eq('date', new Date().toISOString().split('T')[0])
    .single();

  const currentCount = countRecord?.count || 0;
  const remaining = Math.max(0, dailyLimit - currentCount);

  return new Response(
    JSON.stringify({
      limit: dailyLimit,
      used: currentCount,
      remaining,
      resets_at: getNextMidnightIST(),
      is_paid_member: isPaidMember,
    }),
    { status: 200 }
  );
});

function getNextMidnightIST(): string {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  ist.setDate(ist.getDate() + 1);
  ist.setHours(0, 0, 0, 0);
  return ist.toISOString();
}
```

#### 4.2.3: Create Chat Message Edge Function

**Files:** `supabase/functions/chat/message/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateEmbedding } from '../shared/embeddings.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { conversation_id, message, language = 'en' } = await req.json();

  // Verify conversation belongs to user
  const { data: conversation } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', conversation_id)
    .eq('user_id', user.id)
    .single();

  if (!conversation) {
    return new Response(JSON.stringify({ error: 'Conversation not found' }), { status: 404 });
  }

  // Check rate limit
  const { data: membership } = await supabase
    .from('memberships')
    .select('tier, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const isPaidMember = membership?.tier && ['annual', 'lifetime'].includes(membership.tier);
  const dailyLimit = isPaidMember ? 30 : 5;

  // Use service role for rate limit check
  const adminSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: newCount } = await adminSupabase.rpc('increment_daily_message_count', {
    p_user_id: user.id,
  });

  if (newCount > dailyLimit) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        limit: dailyLimit,
        upgrade_available: !isPaidMember,
      }),
      { status: 429 }
    );
  }

  // Save user message
  await adminSupabase.from('chat_messages').insert({
    conversation_id,
    role: 'user',
    content: message,
  });

  // Generate embedding for user message
  const queryEmbedding = await generateEmbedding(message);

  // Vector search for relevant documents
  const { data: documents } = await adminSupabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: 5,
  });

  // Build context from retrieved documents
  const contextLanguage = language === 'lus' ? 'lus' : 'en';
  const context = (documents || [])
    .map((doc: any) => {
      const title = doc[`title_${contextLanguage}`] || doc.title_en;
      const content = doc[`content_${contextLanguage}`] || doc.content_en;
      return `[${title}]\n${content}`;
    })
    .join('\n\n---\n\n');

  // Get conversation history (last 10 messages)
  const { data: history } = await adminSupabase
    .from('chat_messages')
    .select('role, content')
    .eq('conversation_id', conversation_id)
    .order('created_at', { ascending: false })
    .limit(10);

  const historyContext = (history || [])
    .reverse()
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  // Generate response with Gemini
  const systemPrompt = getSystemPrompt(language, isPaidMember);
  const response = await generateGeminiResponse(
    systemPrompt,
    context,
    historyContext,
    message,
    language
  );

  // Classify response
  const classification = classifyResponse(response, message);

  // Save assistant message
  const { data: assistantMessage } = await adminSupabase
    .from('chat_messages')
    .insert({
      conversation_id,
      role: 'assistant',
      content: response.content,
      classification,
      sources: documents?.map((d: any) => ({ id: d.id, title: d.title_en })) || [],
      tokens_used: response.tokens_used,
    })
    .select()
    .single();

  // Update conversation message count
  await adminSupabase
    .from('chat_conversations')
    .update({ message_count: conversation.message_count + 2 })
    .eq('id', conversation_id);

  return new Response(
    JSON.stringify({
      message: response.content,
      classification,
      sources:
        documents?.map((d: any) => ({
          id: d.id,
          title: language === 'lus' ? d.title_lus || d.title_en : d.title_en,
        })) || [],
      can_escalate: isPaidMember && classification === 'urgent',
      remaining_messages: dailyLimit - newCount,
    }),
    { status: 200 }
  );
});

function getSystemPrompt(language: string, isPaidMember: boolean): string {
  const basePrompt = `You are a helpful assistant for the Bangalore Mizo Association (BMA).
You help community members with questions about membership, events, and community services.
Always be respectful and supportive. If you're unsure, say so.`;

  const escalationNote = isPaidMember
    ? '\nIf the user seems distressed or needs urgent human assistance, let them know they can escalate to a human.'
    : '';

  const languageNote =
    language === 'lus'
      ? '\nRespond primarily in Mizo language. You can use English for technical terms.'
      : '\nRespond in English.';

  return basePrompt + escalationNote + languageNote;
}

async function generateGeminiResponse(
  systemPrompt: string,
  context: string,
  history: string,
  userMessage: string,
  language: string
): Promise<{ content: string; tokens_used: number }> {
  const prompt = `${systemPrompt}

RELEVANT INFORMATION:
${context || 'No specific information found.'}

CONVERSATION HISTORY:
${history}

USER: ${userMessage}

Respond helpfully based on the above context. If the context doesn't contain relevant information, provide general guidance or suggest contacting BMA directly.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'I apologize, but I was unable to generate a response.';
  const tokens = data.usageMetadata?.totalTokenCount || 0;

  return { content, tokens_used: tokens };
}

function classifyResponse(
  response: { content: string },
  userMessage: string
): 'informational' | 'guidance' | 'urgent' {
  const urgentKeywords = [
    'emergency',
    'urgent',
    'help immediately',
    'crisis',
    'serious problem',
    'death',
    'accident',
  ];
  const guidanceKeywords = ['how to', 'process', 'steps', 'apply', 'register', 'contact'];

  const combinedText = (userMessage + ' ' + response.content).toLowerCase();

  if (urgentKeywords.some((k) => combinedText.includes(k))) {
    return 'urgent';
  }

  if (guidanceKeywords.some((k) => combinedText.includes(k))) {
    return 'guidance';
  }

  return 'informational';
}
```

**Acceptance Criteria:**

- [ ] Rate limiting enforced (5/30 messages)
- [ ] RAG retrieval working
- [ ] Bilingual responses
- [ ] Message classification
- [ ] Sources returned

---

### Task 4.3: Escalation System

**GitHub Issue:** #31 - Implement Escalation System

#### 4.3.1: Create Escalation Edge Function

**Files:** `supabase/functions/chat/escalate/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Verify paid membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('tier, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const isPaidMember = membership?.tier && ['annual', 'lifetime'].includes(membership.tier);
  if (!isPaidMember) {
    return new Response(
      JSON.stringify({
        error: 'Paid membership required for escalation',
        upgrade_url: '/membership/upgrade',
      }),
      { status: 403 }
    );
  }

  const { conversation_id, reason } = await req.json();

  // Verify conversation belongs to user
  const { data: conversation } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', conversation_id)
    .eq('user_id', user.id)
    .single();

  if (!conversation) {
    return new Response(JSON.stringify({ error: 'Conversation not found' }), { status: 404 });
  }

  // Check for existing open escalation
  const { data: existingEscalation } = await supabase
    .from('escalations')
    .select('*')
    .eq('conversation_id', conversation_id)
    .in('status', ['pending', 'acknowledged'])
    .single();

  if (existingEscalation) {
    return new Response(
      JSON.stringify({
        error: 'Escalation already exists',
        escalation_id: existingEscalation.id,
        status: existingEscalation.status,
      }),
      { status: 409 }
    );
  }

  // Use service role for insert
  const adminSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Create escalation
  const { data: escalation, error } = await adminSupabase
    .from('escalations')
    .insert({
      conversation_id,
      user_id: user.id,
      reason,
      status: 'pending',
      priority: 2, // Default medium
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Add system message to conversation
  await adminSupabase.from('chat_messages').insert({
    conversation_id,
    role: 'system',
    content:
      'This conversation has been escalated to human support. A team member will respond soon.',
  });

  // Notify admins
  const { data: admins } = await adminSupabase.from('profiles').select('id').eq('role', 'admin');

  for (const admin of admins || []) {
    await adminSupabase.functions.invoke('send-notification', {
      body: {
        user_id: admin.id,
        template: 'new_escalation',
        channels: ['email'],
        data: {
          escalation_id: escalation.id,
          user_id: user.id,
          reason,
        },
      },
    });
  }

  return new Response(
    JSON.stringify({
      escalation_id: escalation.id,
      message: 'Your request has been escalated. A team member will respond soon.',
    }),
    { status: 201 }
  );
});
```

#### 4.3.2: Create Escalation Types and Hooks

**Files:** `types/escalation.ts`, `hooks/useEscalation.ts`

```typescript
// types/escalation.ts
export interface Escalation {
  id: string;
  conversation_id: string;
  user_id: string;
  assigned_to?: string;
  status: 'pending' | 'acknowledged' | 'resolved' | 'dismissed';
  priority: number;
  reason?: string;
  resolution_notes?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
}

// hooks/useEscalation.ts
export function useCreateEscalation() {
  const [isLoading, setIsLoading] = useState(false);

  const escalate = async (conversationId: string, reason?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat/escalate', {
        body: { conversation_id: conversationId, reason },
      });

      if (error) throw error;
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { escalate, isLoading };
}
```

---

### Task 4.4: Chat UI Components

**GitHub Issue:** #32 - Implement Chat UI

#### 4.4.1: Create Chat Screen

**Files:** `app/(app)/chat/index.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  Chat                          │
├────────────────────────────────┤
│  ┌────────────────────────────┐│
│  │ Recent Conversations       ││
│  │ ┌────────────────────────┐ ││
│  │ │ Jan 10 • About events  │ ││
│  │ └────────────────────────┘ ││
│  │ ┌────────────────────────┐ ││
│  │ │ Jan 8 • Membership Q   │ ││
│  │ └────────────────────────┘ ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  [+ Start New Conversation]    │
├────────────────────────────────┤
│  Daily Limit: 5/30 remaining   │
│  [Upgrade for more →]          │
└────────────────────────────────┘
```

**Features:**

1. List of recent conversations
2. Start new conversation button
3. Daily limit display
4. Upgrade prompt for free users

#### 4.4.2: Create Chat Conversation Screen

**Files:** `app/(app)/chat/[id].tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  [← Back]    Chat    [⚠️ Help] │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐  │
│  │ 🤖 Hello! How can I help │  │
│  │    you today?            │  │
│  └──────────────────────────┘  │
│                                │
│           ┌─────────────────┐  │
│           │ What are the    │  │
│           │ membership fees?│  │
│           └─────────────────┘  │
│                                │
│  ┌──────────────────────────┐  │
│  │ 🤖 Membership fees are:  │  │
│  │    Annual: ₹500/year     │  │
│  │    Lifetime: ₹5,000      │  │
│  │                          │  │
│  │    📚 Sources:           │  │
│  │    • Membership FAQ      │  │
│  └──────────────────────────┘  │
│                                │
├────────────────────────────────┤
│  [Type message...    ] [Send]  │
└────────────────────────────────┘
```

**Features:**

1. Chat bubble display (user/assistant)
2. Message input with send button
3. Loading indicator while processing
4. Source references
5. Escalation button (paid members, urgent)
6. Disclaimer at top (first message)

#### 4.4.3: Create Chat Components

**Files:** Various component files

**ChatBubble.tsx:**

```typescript
interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  sources?: Array<{ id: string; title: string }>;
  classification?: 'informational' | 'guidance' | 'urgent';
  isLoading?: boolean;
}
```

**ChatInput.tsx:**

```typescript
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}
```

**ChatDisclaimer.tsx:**

```typescript
// Shows once at conversation start
// "This is an AI assistant. Responses may not always be accurate.
//  For urgent matters, please contact BMA directly."
```

**Acceptance Criteria:**

- [ ] Messages display correctly
- [ ] Typing indicator works
- [ ] Sources shown as links
- [ ] Classification badge shown
- [ ] Disclaimer displayed
- [ ] Escalation button for paid/urgent

---

### Task 4.5: Chat Hooks and State

**GitHub Issue:** #33 - Implement Chat State Management

#### 4.5.1: Create Chat Hooks

**Files:** `hooks/useChat.ts`

```typescript
// Get user's conversations
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Get messages for a conversation
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
}

// Start new conversation
export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (language: 'en' | 'lus') => {
      const { data, error } = await supabase.functions.invoke('chat/start', {
        body: { language },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Send message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
      language,
    }: {
      conversationId: string;
      message: string;
      language: 'en' | 'lus';
    }) => {
      const { data, error } = await supabase.functions.invoke('chat/message', {
        body: {
          conversation_id: conversationId,
          message,
          language,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['rate-limit'] });
    },
  });
}

// Get rate limit status
export function useRateLimit() {
  return useQuery({
    queryKey: ['rate-limit'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('chat/rate-limit');
      if (error) throw error;
      return data;
    },
    staleTime: 60000, // 1 minute
  });
}
```

**Acceptance Criteria:**

- [ ] Conversations list fetches
- [ ] Messages load for conversation
- [ ] Send updates optimistically
- [ ] Rate limit refreshes

---

### Task 4.6: Knowledge Base Seeding

**GitHub Issue:** #34 - Seed Initial Knowledge Base

#### 4.6.1: Create KB Seed Script

**Files:** `scripts/seed-knowledge-base.ts`

```typescript
const INITIAL_KB_ITEMS = [
  {
    title_en: 'How to become a BMA member',
    title_lus: 'BMA member ni dan',
    content_en: `To become a BMA member:
1. Create an account on the BMA app
2. Complete your profile with required information
3. Choose a membership tier (Annual ₹500 or Lifetime ₹5000)
4. Complete the payment via Razorpay
5. Your membership will be activated immediately`,
    content_lus: `BMA member ni dan:
1. BMA app-ah account siam rawh
2. Profile i zawng zawng a tlin rawh
3. Membership tier thlan rawh (Annual ₹500 emaw Lifetime ₹5000)
4. Razorpay hmangin payment kalpui rawh
5. I membership a active nghal ang`,
    category: 'membership',
    tags: ['membership', 'registration', 'payment'],
  },
  {
    title_en: 'Membership benefits',
    title_lus: 'Membership hlawkna',
    content_en: `BMA membership includes:
- Access to member directory
- Extended chatbot usage (30 messages/day)
- Human support escalation
- Priority event registration
- Voting rights in association matters`,
    content_lus: `BMA membership hlawkna:
- Member directory thleng theihna
- Chatbot hmang zau zawk (ni 1-ah message 30)
- Human support escalation
- Event registration priority
- Association thil vote theihna`,
    category: 'membership',
    tags: ['membership', 'benefits'],
  },
  // Add more items for events, contact info, community guidelines, etc.
];

async function seedKnowledgeBase() {
  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  for (const item of INITIAL_KB_ITEMS) {
    // Generate embedding
    const embedding = await generateEmbedding(
      `${item.title_en}\n${item.content_en}\n${item.title_lus || ''}\n${item.content_lus || ''}`
    );

    const { error } = await supabase.from('knowledge_base').insert({
      ...item,
      embedding,
      is_active: true,
    });

    if (error) {
      console.error(`Error seeding ${item.title_en}:`, error);
    } else {
      console.log(`Seeded: ${item.title_en}`);
    }
  }
}

seedKnowledgeBase();
```

**KB Categories to Seed:**

1. Membership (joining, benefits, renewal)
2. Events (annual event, regular meetups)
3. Contact information
4. Community guidelines
5. FAQs
6. Emergency contacts

---

## Testing Requirements

### Unit Tests

- [ ] Embedding generation
- [ ] Rate limit calculations
- [ ] Message classification
- [ ] Response parsing

### Integration Tests

- [ ] Full chat flow (start → message → response)
- [ ] Rate limiting enforcement
- [ ] Escalation creation
- [ ] Vector search accuracy

### E2E Tests

- [ ] Start conversation
- [ ] Send multiple messages
- [ ] Hit rate limit
- [ ] Escalate conversation

### Quality Tests

- [ ] Mizo language responses
- [ ] Source relevance
- [ ] Response accuracy

---

## Files Created/Modified Summary

### New Files

| Category       | Files                                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types          | `types/knowledge-base.ts`, `types/escalation.ts`                                                                                                                                                                                                                                |
| Hooks          | `hooks/useChat.ts`, `hooks/useEscalation.ts`                                                                                                                                                                                                                                    |
| Components     | `components/ChatBubble.tsx`, `components/ChatInput.tsx`, `components/ChatDisclaimer.tsx`                                                                                                                                                                                        |
| Screens        | `app/(app)/chat/index.tsx`, `app/(app)/chat/[id].tsx`                                                                                                                                                                                                                           |
| Edge Functions | `supabase/functions/shared/embeddings.ts`, `supabase/functions/admin/knowledge-base/index.ts`, `supabase/functions/chat/start/index.ts`, `supabase/functions/chat/rate-limit/index.ts`, `supabase/functions/chat/message/index.ts`, `supabase/functions/chat/escalate/index.ts` |
| Scripts        | `scripts/seed-knowledge-base.ts`                                                                                                                                                                                                                                                |

---

## Dependencies

### Supabase Secrets

```bash
supabase secrets set GEMINI_API_KEY=xxx
```

### External Services

- [ ] Google Cloud project with Gemini API enabled
- [ ] Gemini API key with embedding and generative models

---

## Definition of Done

- [ ] Knowledge base seeded with initial content
- [ ] Chat start creates conversation
- [ ] Messages generate RAG responses
- [ ] Bilingual responses working
- [ ] Rate limiting enforced (5/30)
- [ ] Message classification working
- [ ] Escalation creates tickets
- [ ] Admin notified of escalations
- [ ] Chat UI responsive
- [ ] Sources displayed
- [ ] All tests passing
- [ ] All GitHub Issues for Phase 4 closed

---

## Next Phase

Continue to [Phase 5: Admin Dashboard](./06-PHASE-5-ADMIN-DASHBOARD.md)
