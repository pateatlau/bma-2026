# Phase 3: Membership & Payments (Days 29-38)

## Overview

Phase 3 implements the paid membership system with Razorpay integration. This phase is critical for revenue and includes secure payment processing, membership tiers, member directory, and notification systems.

**Duration:** 10 days
**Prerequisites:** Phase 2 completed (public features, content)
**Deliverables:**

- Membership tiers (Free, Annual ₹500, Lifetime ₹5000)
- Razorpay payment integration (webhook-only verification)
- Member directory (paid members only)
- Payment history and receipts
- WhatsApp and Email notifications

> **⚠️ Individual Account Note:**
> During development with individual accounts (before BMA organization accounts are ready):
>
> - **Razorpay:** Use **test mode only**. Real payments require BMA's business account with proper KYC.
> - **Resend/Gupshup:** Can use individual accounts for testing; production may require BMA org accounts.
>
> See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md#30-razorpay-payment-gateway) for setup details.

---

## Critical Security Notes

> **IMPORTANT:** Payment verification MUST be done via webhook only. NEVER trust client-side payment callbacks.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PAYMENT FLOW (Secure)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Client creates order → Edge Function → Razorpay API            │
│  2. Client opens Razorpay checkout (UI only)                       │
│  3. User completes payment on Razorpay                             │
│  4. Razorpay sends webhook → Edge Function (HMAC verified)         │
│  5. Edge Function updates database (payment + membership)          │
│  6. Client polls for status / receives notification                │
│                                                                     │
│  ⚠️  Client callback is for UX ONLY - never trust it for data!    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Task Breakdown

### Task 3.1: Membership Data Layer

**GitHub Issue:** #23 - Implement Membership Data Layer

#### 3.1.1: Create Membership Types

**Files:** `types/membership.ts`

```typescript
import { Database } from '@/lib/database.types';

export type Membership = Database['public']['Tables']['memberships']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];

export type MembershipTier = 'free' | 'annual' | 'lifetime';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface MembershipTierInfo {
  tier: MembershipTier;
  name_en: string;
  name_lus: string;
  price: number; // in INR
  priceInPaise: number;
  features_en: string[];
  features_lus: string[];
  popular?: boolean;
}

export const MEMBERSHIP_TIERS: MembershipTierInfo[] = [
  {
    tier: 'free',
    name_en: 'Free',
    name_lus: 'Free',
    price: 0,
    priceInPaise: 0,
    features_en: ['Access to public content', 'Comment on articles', 'Chatbot (5 messages/day)'],
    features_lus: [
      'Public content en thleng theih',
      'Article-ah comment theih',
      'Chatbot (ni 1-ah message 5)',
    ],
  },
  {
    tier: 'annual',
    name_en: 'Annual Member',
    name_lus: 'Kum Khat Member',
    price: 500,
    priceInPaise: 50000,
    features_en: [
      'All free features',
      'Member directory access',
      'Chatbot (30 messages/day)',
      'Escalate to human support',
      'Priority event registration',
    ],
    features_lus: [
      'Free features zawng zawng',
      'Member directory thleng theih',
      'Chatbot (ni 1-ah message 30)',
      'Human support-ah escalate theih',
      'Event registration priority',
    ],
    popular: true,
  },
  {
    tier: 'lifetime',
    name_en: 'Lifetime Member',
    name_lus: 'Lifetime Member',
    price: 5000,
    priceInPaise: 500000,
    features_en: [
      'All annual features',
      'Never expires',
      'Founding member badge',
      'Exclusive events access',
    ],
    features_lus: [
      'Annual features zawng zawng',
      'A expire ngai lo',
      'Founding member badge',
      'Exclusive events thleng theih',
    ],
  },
];

export interface MembershipWithPayments extends Membership {
  payments: Payment[];
}

export interface PaymentReceipt {
  id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  tier: MembershipTier;
  created_at: string;
  receipt_url?: string;
}
```

**Acceptance Criteria:**

- [ ] Types match database schema
- [ ] Tier info centralized
- [ ] Prices correct (₹500 annual, ₹5000 lifetime)

#### 3.1.2: Create Membership Hooks

**Files:** `hooks/useMembership.ts`

```typescript
// Get current user's active membership
export function useMembership() {
  // Returns: { membership, tier, status, expiresAt, isLoading, error }
}

// Get user's payment history
export function usePaymentHistory() {
  // Returns: { payments, isLoading, error, refetch }
}

// Check if user can access paid features
export function useIsPaidMember() {
  // Returns: { isPaid, tier, isLoading }
}

// Check membership expiry
export function useMembershipExpiry() {
  // Returns: { daysUntilExpiry, isExpiringSoon, isExpired }
}
```

**Acceptance Criteria:**

- [ ] Current membership fetched correctly
- [ ] Payment history paginated
- [ ] Paid member check works for both tiers
- [ ] Expiry calculations accurate

---

### Task 3.2: Razorpay Integration

**GitHub Issue:** #24 - Implement Razorpay Payment Integration

#### 3.2.1: Create Payment Order Edge Function

**Files:** `supabase/functions/create-payment-order/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Razorpay from 'https://esm.sh/razorpay@2.9.2';

const razorpay = new Razorpay({
  key_id: Deno.env.get('RAZORPAY_KEY_ID')!,
  key_secret: Deno.env.get('RAZORPAY_KEY_SECRET')!,
});

interface CreateOrderRequest {
  tier: 'annual' | 'lifetime';
  idempotency_key: string;
}

serve(async (req) => {
  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const { tier, idempotency_key }: CreateOrderRequest = await req.json();

    // Validate tier
    const tierPrices: Record<string, number> = {
      annual: 50000, // ₹500 in paise
      lifetime: 500000, // ₹5000 in paise
    };

    if (!tierPrices[tier]) {
      return new Response(JSON.stringify({ error: 'Invalid tier' }), {
        status: 400,
      });
    }

    // Check for existing pending payment with same idempotency key
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('idempotency_key', idempotency_key)
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({
          order_id: existingPayment.razorpay_order_id,
          payment_id: existingPayment.id,
        }),
        { status: 200 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, phone')
      .eq('id', user.id)
      .single();

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: tierPrices[tier],
      currency: 'INR',
      receipt: `bma_${tier}_${Date.now()}`,
      notes: {
        user_id: user.id,
        tier: tier,
        idempotency_key: idempotency_key,
      },
    });

    // Create pending payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount: tierPrices[tier],
        currency: 'INR',
        status: 'pending',
        idempotency_key: idempotency_key,
        metadata: { tier },
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        payment_id: payment.id,
        amount: tierPrices[tier],
        currency: 'INR',
        key_id: Deno.env.get('RAZORPAY_KEY_ID'),
        prefill: {
          name: profile?.full_name,
          email: profile?.email,
          contact: profile?.phone,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create order' }), {
      status: 500,
    });
  }
});
```

**Acceptance Criteria:**

- [ ] Order created with correct amount
- [ ] Idempotency prevents duplicate orders
- [ ] Pending payment record created
- [ ] User profile info prefilled

#### 3.2.2: Create Razorpay Webhook Edge Function

**Files:** `supabase/functions/razorpay-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!;

serve(async (req) => {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();

    // Verify HMAC signature
    const expectedSignature = await generateHMAC(body, WEBHOOK_SECRET);

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Service role for admin operations
    );

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(supabase, event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(supabase, event.payload.payment.entity);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
});

async function generateHMAC(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function handlePaymentCaptured(supabase: any, payment: any) {
  const orderId = payment.order_id;
  const paymentId = payment.id;

  // Find the pending payment
  const { data: pendingPayment, error: findError } = await supabase
    .from('payments')
    .select('*')
    .eq('razorpay_order_id', orderId)
    .single();

  if (findError || !pendingPayment) {
    console.error('Payment not found for order:', orderId);
    return;
  }

  // Start transaction-like operations
  const tier = pendingPayment.metadata?.tier as 'annual' | 'lifetime';
  const userId = pendingPayment.user_id;

  // Calculate membership expiry
  let expiresAt: string | null = null;
  if (tier === 'annual') {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    expiresAt = expiry.toISOString();
  }
  // Lifetime has no expiry (null)

  // Create or update membership
  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  let membershipId: string;

  if (existingMembership) {
    // Upgrade existing membership
    const { data: updated, error: updateError } = await supabase
      .from('memberships')
      .update({
        tier: tier,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingMembership.id)
      .select()
      .single();

    if (updateError) throw updateError;
    membershipId = updated.id;
  } else {
    // Create new membership
    const { data: newMembership, error: createError } = await supabase
      .from('memberships')
      .insert({
        user_id: userId,
        tier: tier,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (createError) throw createError;
    membershipId = newMembership.id;
  }

  // Update payment record
  const { error: paymentUpdateError } = await supabase
    .from('payments')
    .update({
      razorpay_payment_id: paymentId,
      membership_id: membershipId,
      status: 'captured',
      payment_method: payment.method,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pendingPayment.id);

  if (paymentUpdateError) throw paymentUpdateError;

  // Update user role
  const { error: roleError } = await supabase
    .from('profiles')
    .update({ role: 'member' })
    .eq('id', userId);

  if (roleError) throw roleError;

  // Create audit log
  await supabase.from('audit_logs').insert({
    actor_id: userId,
    action: 'membership.activated',
    table_name: 'memberships',
    record_id: membershipId,
    new_data: { tier, status: 'active', payment_id: paymentId },
  });

  // Trigger notifications (async)
  await supabase.functions.invoke('send-notification', {
    body: {
      user_id: userId,
      template: 'membership_activated',
      channels: ['email', 'whatsapp'],
      data: { tier, expires_at: expiresAt },
    },
  });

  console.log('Payment captured successfully:', paymentId);
}

async function handlePaymentFailed(supabase: any, payment: any) {
  const orderId = payment.order_id;

  // Update payment status
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      metadata: {
        error_code: payment.error_code,
        error_description: payment.error_description,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', orderId);

  if (error) {
    console.error('Failed to update payment status:', error);
  }

  console.log('Payment failed:', orderId);
}
```

**Acceptance Criteria:**

- [ ] HMAC signature verified
- [ ] Payment captured updates membership
- [ ] User role updated to 'member'
- [ ] Audit log created
- [ ] Notifications triggered
- [ ] Failed payments logged

#### 3.2.3: Create Payment Client Hook

**Files:** `hooks/usePayment.ts`, `lib/razorpay.ts`

**lib/razorpay.ts:**

```typescript
import { Platform } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

export interface PaymentOptions {
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color: string;
  };
}

export async function openRazorpayCheckout(
  options: PaymentOptions
): Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }> {
  if (Platform.OS === 'web') {
    return openWebCheckout(options);
  }
  return RazorpayCheckout.open(options);
}

async function openWebCheckout(options: PaymentOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    // Load Razorpay script if not loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => initCheckout();
      document.body.appendChild(script);
    } else {
      initCheckout();
    }

    function initCheckout() {
      const rzp = new window.Razorpay({
        ...options,
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        handler: (response: any) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });
      rzp.open();
    }
  });
}
```

**hooks/usePayment.ts:**

```typescript
export function useCreatePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (tier: 'annual' | 'lifetime') => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate idempotency key
      const idempotencyKey = `${tier}_${Date.now()}_${Math.random().toString(36)}`;

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-payment-order',
        {
          body: { tier, idempotency_key: idempotencyKey },
        }
      );

      if (orderError) throw orderError;

      // Open checkout
      const paymentResult = await openRazorpayCheckout({
        order_id: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BMA 2026',
        description: `${tier === 'annual' ? 'Annual' : 'Lifetime'} Membership`,
        prefill: orderData.prefill,
        theme: { color: '#DC2626' },
      });

      // Payment UI completed - but DON'T trust this!
      // Poll for webhook confirmation
      return await pollPaymentStatus(orderData.payment_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPayment, isLoading, error };
}

async function pollPaymentStatus(paymentId: string, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data: payment } = await supabase
      .from('payments')
      .select('status')
      .eq('id', paymentId)
      .single();

    if (payment?.status === 'captured') {
      return true;
    }

    if (payment?.status === 'failed') {
      throw new Error('Payment failed');
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error('Payment verification timed out');
}
```

**Dependencies:**

```bash
npm install react-native-razorpay
```

**Acceptance Criteria:**

- [ ] Checkout opens on all platforms
- [ ] Polling confirms payment status
- [ ] Errors handled gracefully
- [ ] Cancel handled

---

### Task 3.3: Membership UI

**GitHub Issue:** #25 - Implement Membership UI

#### 3.3.1: Create Membership Status Screen

**Files:** `app/(app)/membership/index.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  Membership                    │
├────────────────────────────────┤
│  Current Plan                  │
│  ┌────────────────────────────┐│
│  │  🎫 Annual Member          ││
│  │  Status: Active            ││
│  │  Expires: Jan 15, 2027     ││
│  │  Days remaining: 365       ││
│  │                            ││
│  │  [Upgrade to Lifetime]     ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  Benefits                      │
│  ✓ Member directory access    │
│  ✓ 30 chatbot messages/day    │
│  ✓ Human support escalation   │
│  ✓ Priority event access      │
├────────────────────────────────┤
│  Payment History               │
│  [View All →]                  │
│  ┌────────────────────────────┐│
│  │ Jan 15, 2026 • ₹500       ││
│  │ Annual Membership          ││
│  │ [Download Receipt]         ││
│  └────────────────────────────┘│
└────────────────────────────────┘
```

**Features:**

1. Current membership status card
2. Expiry date and countdown
3. Benefits list
4. Upgrade CTA (if annual)
5. Recent payment history
6. Download receipt links

**Acceptance Criteria:**

- [ ] Status displays correctly
- [ ] Expiry countdown accurate
- [ ] Upgrade button shows for annual
- [ ] Payment history shows

#### 3.3.2: Create Upgrade Flow Screen

**Files:** `app/(app)/membership/upgrade.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  [← Back]    Upgrade           │
├────────────────────────────────┤
│  Choose Your Plan              │
├────────────────────────────────┤
│  ┌────────────────────────────┐│
│  │  FREE                      ││
│  │  ₹0                        ││
│  │  • Public content          ││
│  │  • 5 chatbot msgs/day      ││
│  │  [Current Plan]            ││
│  └────────────────────────────┘│
│  ┌────────────────────────────┐│
│  │  ⭐ ANNUAL (Popular)       ││
│  │  ₹500/year                 ││
│  │  • Directory access        ││
│  │  • 30 chatbot msgs/day     ││
│  │  • Human support           ││
│  │  [Select]                  ││
│  └────────────────────────────┘│
│  ┌────────────────────────────┐│
│  │  LIFETIME                  ││
│  │  ₹5,000 (one-time)         ││
│  │  • All annual features     ││
│  │  • Never expires           ││
│  │  • Founding badge          ││
│  │  [Select]                  ││
│  └────────────────────────────┘│
├────────────────────────────────┤
│  Questions? Contact support    │
└────────────────────────────────┘
```

**Features:**

1. Pricing cards for each tier
2. Feature comparison
3. "Popular" badge on annual
4. Current plan indicator
5. Select button opens payment

#### 3.3.3: Create Payment Confirmation Screen

**Files:** `app/(app)/membership/confirm.tsx`

**States:**

1. **Processing:** Show loading animation
2. **Success:** Green checkmark, receipt download
3. **Failed:** Error message, retry option

**UI Layout (Success):**

```
┌────────────────────────────────┐
│       Payment Successful       │
├────────────────────────────────┤
│            ✅                  │
│   Welcome to BMA!              │
│                                │
│   Your Annual Membership       │
│   is now active.               │
│                                │
│   Amount: ₹500                 │
│   Transaction ID: pay_xxx      │
│   Valid until: Jan 15, 2027    │
├────────────────────────────────┤
│   [Download Receipt]           │
│   [Go to Dashboard]            │
└────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Loading state shows during payment
- [ ] Success shows receipt info
- [ ] Failed shows retry option
- [ ] Receipt downloadable

#### 3.3.4: Create Pricing Card Component

**Files:** `components/PricingCard.tsx`

```typescript
interface PricingCardProps {
  tier: MembershipTierInfo;
  isCurrentPlan?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}
```

**Features:**

1. Tier name and price
2. Feature list with checkmarks
3. Popular badge (optional)
4. Current plan indicator
5. Select button with loading state

---

### Task 3.4: Payment History

**GitHub Issue:** #26 - Implement Payment History

#### 3.4.1: Create Payment History Screen

**Files:** `app/(app)/membership/history.tsx`

**UI Layout:**

```
┌────────────────────────────────┐
│  Payment History               │
├────────────────────────────────┤
│  ┌────────────────────────────┐│
│  │ Jan 15, 2026               ││
│  │ Annual Membership          ││
│  │ ₹500 • Captured            ││
│  │ ID: pay_xxxxx              ││
│  │ [📄 Receipt]               ││
│  └────────────────────────────┘│
│  ┌────────────────────────────┐│
│  │ Jan 14, 2026               ││
│  │ Annual Membership          ││
│  │ ₹500 • Failed              ││
│  │ Card declined              ││
│  └────────────────────────────┘│
└────────────────────────────────┘
```

**Features:**

1. List of all payments
2. Status badge (captured/failed/pending)
3. Download receipt for successful
4. Error reason for failed
5. Pagination for long history

#### 3.4.2: Create Receipt Download

**Files:** `lib/receipts.ts`

```typescript
export async function downloadReceipt(paymentId: string) {
  const { data: payment, error } = await supabase
    .from('payments')
    .select(
      `
      *,
      user:profiles(full_name, email, address, city, state, pincode),
      membership:memberships(tier)
    `
    )
    .eq('id', paymentId)
    .single();

  if (error) throw error;

  // Generate receipt content
  const receipt = generateReceiptHTML(payment);

  if (Platform.OS === 'web') {
    // Open in new tab / trigger download
    const blob = new Blob([receipt], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } else {
    // Share or save on mobile
    await Share.share({
      message: `BMA Receipt - ${payment.razorpay_payment_id}`,
      url: receipt, // Or generate PDF
    });
  }
}
```

---

### Task 3.5: Member Directory

**GitHub Issue:** #27 - Implement Member Directory

#### 3.5.1: Create Directory Screen

**Files:** `app/(app)/directory/index.tsx`

**Access Control:**

- Only paid members (annual/lifetime) can access
- Show upgrade prompt for free users

**UI Layout:**

```
┌────────────────────────────────┐
│  Member Directory              │
├────────────────────────────────┤
│  🔍 [Search by name...]        │
│  Filter: [All] [City ▼]        │
├────────────────────────────────┤
│  87 members                    │
│  ┌────────────────────────────┐│
│  │ 👤 John Doe                ││
│  │    Bangalore               ││
│  │    Member since 2024       ││
│  └────────────────────────────┘│
│  ┌────────────────────────────┐│
│  │ 👤 Jane Smith              ││
│  │    Mumbai                  ││
│  │    Member since 2023       ││
│  └────────────────────────────┘│
│  [Load More]                   │
└────────────────────────────────┘
```

**Features:**

1. Search by name
2. Filter by city
3. Member cards with basic info
4. Respects directory visibility setting
5. Pagination

#### 3.5.2: Create Directory Hook

**Files:** `hooks/useDirectory.ts`

```typescript
export function useDirectory(params: {
  search?: string;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  // Only fetch if user is paid member
  const { isPaid } = useIsPaidMember();

  return useQuery({
    queryKey: ['directory', params],
    queryFn: async () => {
      if (!isPaid) {
        throw new Error('Paid membership required');
      }

      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, city, created_at', { count: 'exact' })
        .eq('is_directory_visible', true)
        .is('deleted_at', null);

      if (params.search) {
        query = query.ilike('full_name', `%${params.search}%`);
      }

      if (params.city) {
        query = query.eq('city', params.city);
      }

      return query
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 20))
        .order('full_name');
    },
    enabled: isPaid,
  });
}
```

#### 3.5.3: Create Member Card Component

**Files:** `components/MemberCard.tsx`

```typescript
interface MemberCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  city?: string;
  memberSince?: Date;
  onPress?: () => void;
}
```

**Acceptance Criteria:**

- [ ] Only paid members can access
- [ ] Search works
- [ ] Filter by city works
- [ ] Pagination works
- [ ] Hidden members not shown

---

### Task 3.6: Notifications System

**GitHub Issue:** #28 - Implement Notification System

#### 3.6.1: Create Send Notification Edge Function

**Files:** `supabase/functions/send-notification/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationRequest {
  user_id: string;
  template: string;
  channels: ('email' | 'whatsapp')[];
  data: Record<string, any>;
}

const TEMPLATES = {
  membership_activated: {
    subject_en: 'Welcome to BMA Membership!',
    subject_lus: 'BMA Membership-ah kan lo lawm che!',
    body_en: (data: any) => `Your ${data.tier} membership is now active.`,
    body_lus: (data: any) => `I ${data.tier} membership chu a active tawh.`,
  },
  membership_expiring: {
    subject_en: 'Your BMA Membership is expiring soon',
    subject_lus: 'I BMA Membership a tawp tura awm',
    body_en: (data: any) => `Your membership expires in ${data.days} days.`,
    body_lus: (data: any) => `I membership hi ni ${data.days} ah a tawp dawn.`,
  },
  // ... more templates
};

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { user_id, template, channels, data }: NotificationRequest = await req.json();

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, phone, preferred_language, full_name')
    .eq('id', user_id)
    .single();

  if (!profile) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  const lang = profile.preferred_language || 'en';
  const templateConfig = TEMPLATES[template as keyof typeof TEMPLATES];

  const results = await Promise.allSettled(
    channels.map(async (channel) => {
      const logEntry = {
        user_id,
        channel,
        template,
        recipient: channel === 'email' ? profile.email : profile.phone,
        subject: templateConfig[`subject_${lang}` as keyof typeof templateConfig],
        body:
          typeof templateConfig[`body_${lang}` as keyof typeof templateConfig] === 'function'
            ? (templateConfig[`body_${lang}` as keyof typeof templateConfig] as Function)(data)
            : templateConfig[`body_${lang}` as keyof typeof templateConfig],
        status: 'pending',
      };

      try {
        if (channel === 'email') {
          await sendEmail(logEntry);
        } else if (channel === 'whatsapp') {
          await sendWhatsApp(logEntry);
        }
        logEntry.status = 'sent';
      } catch (error) {
        logEntry.status = 'failed';
        logEntry.error_message = error.message;
      }

      // Log notification
      await supabase.from('notification_logs').insert(logEntry);

      return logEntry;
    })
  );

  return new Response(JSON.stringify({ results }), { status: 200 });
});

async function sendEmail(notification: any) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BMA 2026 <noreply@bma.org.in>',
      to: notification.recipient,
      subject: notification.subject,
      html: notification.body,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend error: ${response.status}`);
  }
}

async function sendWhatsApp(notification: any) {
  const GUPSHUP_API_KEY = Deno.env.get('GUPSHUP_API_KEY');
  const GUPSHUP_APP_NAME = Deno.env.get('GUPSHUP_APP_NAME');

  const response = await fetch('https://api.gupshup.io/sm/api/v1/msg', {
    method: 'POST',
    headers: {
      apikey: GUPSHUP_API_KEY!,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      channel: 'whatsapp',
      source: GUPSHUP_APP_NAME!,
      destination: notification.recipient,
      'src.name': 'BMA2026',
      message: JSON.stringify({
        type: 'text',
        text: notification.body,
      }),
    }),
  });

  if (!response.ok) {
    throw new Error(`Gupshup error: ${response.status}`);
  }
}
```

#### 3.6.2: Create Membership Expiry Cron Function

**Files:** `supabase/functions/cron/membership-expiry/index.ts`

```typescript
// Runs daily via Supabase cron job
serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Find memberships expiring in 7 days
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const { data: expiring } = await supabase
    .from('memberships')
    .select('id, user_id, tier, expires_at')
    .eq('status', 'active')
    .eq('tier', 'annual')
    .gte('expires_at', new Date().toISOString())
    .lte('expires_at', sevenDaysFromNow.toISOString());

  // Send notifications
  for (const membership of expiring || []) {
    const daysUntilExpiry = Math.ceil(
      (new Date(membership.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    await supabase.functions.invoke('send-notification', {
      body: {
        user_id: membership.user_id,
        template: 'membership_expiring',
        channels: ['email', 'whatsapp'],
        data: { days: daysUntilExpiry },
      },
    });
  }

  // Mark expired memberships
  const { error: updateError } = await supabase
    .from('memberships')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString());

  return new Response('OK', { status: 200 });
});
```

**Supabase Cron Setup:**

```sql
-- In Supabase dashboard or migration
SELECT cron.schedule(
  'membership-expiry-check',
  '0 6 * * *', -- Every day at 6 AM
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/cron/membership-expiry',
    headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb
  );
  $$
);
```

**Acceptance Criteria:**

- [ ] Email notifications send
- [ ] WhatsApp notifications send
- [ ] Templates support bilingual
- [ ] Notification logs stored
- [ ] Expiry reminders sent at 7 days

---

## Testing Requirements

### Unit Tests

- [ ] Membership tier calculations
- [ ] Expiry date calculations
- [ ] HMAC signature verification
- [ ] Idempotency key generation

### Integration Tests

- [ ] Create payment order flow
- [ ] Webhook processing
- [ ] Membership activation
- [ ] Notification delivery

### E2E Tests

- [ ] Complete payment flow (use test mode)
- [ ] Upgrade from free to annual
- [ ] View payment history
- [ ] Download receipt

### Security Tests

- [ ] Invalid webhook signatures rejected
- [ ] Unauthorized access to directory blocked
- [ ] Payment data not exposed to client

---

## Files Created/Modified Summary

### New Files

| Category       | Files                                                                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types          | `types/membership.ts`                                                                                                                                                                                     |
| Hooks          | `hooks/useMembership.ts`, `hooks/usePayment.ts`, `hooks/useDirectory.ts`                                                                                                                                  |
| Lib            | `lib/razorpay.ts`, `lib/receipts.ts`                                                                                                                                                                      |
| Components     | `components/PricingCard.tsx`, `components/MemberCard.tsx`                                                                                                                                                 |
| Screens        | `app/(app)/membership/index.tsx`, `app/(app)/membership/upgrade.tsx`, `app/(app)/membership/confirm.tsx`, `app/(app)/membership/history.tsx`, `app/(app)/directory/index.tsx`                             |
| Edge Functions | `supabase/functions/create-payment-order/index.ts`, `supabase/functions/razorpay-webhook/index.ts`, `supabase/functions/send-notification/index.ts`, `supabase/functions/cron/membership-expiry/index.ts` |

### Modified Files

| File           | Changes                            |
| -------------- | ---------------------------------- |
| `package.json` | Add react-native-razorpay          |
| `.env.example` | Add Razorpay, Gupshup, Resend keys |

---

## Dependencies

### NPM Packages

```bash
npm install react-native-razorpay
```

### Supabase Secrets (Edge Functions)

```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_xxx
supabase secrets set RAZORPAY_KEY_SECRET=xxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxx
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set GUPSHUP_API_KEY=xxx
supabase secrets set GUPSHUP_APP_NAME=xxx
```

### External Services

> **Note:** Individual accounts can be used for development. See [00-PREREQUISITES.md](../implementation-requirements/00-PREREQUISITES.md).

- [ ] Razorpay account with test mode (Individual OK for testing; BMA org account needed for production)
- [ ] Resend account (Individual OK)
- [ ] Gupshup WhatsApp Business account (Individual OK for testing)

---

## Definition of Done

- [ ] Payment order creation working
- [ ] Razorpay checkout opens on all platforms
- [ ] Webhook verifies HMAC signature
- [ ] Membership activated on payment capture
- [ ] User role updated to 'member'
- [ ] Payment history displays correctly
- [ ] Receipt download working
- [ ] Member directory accessible to paid members
- [ ] Email notifications sending
- [ ] WhatsApp notifications sending
- [ ] Expiry cron job running
- [ ] All tests passing
- [ ] All GitHub Issues for Phase 3 closed

---

## Next Phase

Continue to [Phase 4: AI Chatbot](./05-PHASE-4-CHATBOT.md)
