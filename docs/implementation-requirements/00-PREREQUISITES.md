# Implementation Prerequisites

This document lists all prerequisites required from stakeholders before and during implementation. Items are organized by category and urgency.

**Last Updated:** 2026-01-13
**Status:** Draft - Under Discussion

---

## 1. Accounts & Access (Critical - Before Phase 0)

> **Note:** Individual/personal accounts can be used for development. See [Section 6.0](#60-blocker-app-store-account-prerequisites) for details on using individual accounts and the BMA org account blocker situation.

| Item                     | Service                                                                   | Purpose                | Phase | Individual Account OK?         | Status |
| ------------------------ | ------------------------------------------------------------------------- | ---------------------- | ----- | ------------------------------ | ------ |
| **Supabase Project**     | [supabase.com](https://supabase.com)                                      | Backend infrastructure | 0     | ✅ Yes                         | ⬜     |
| **Google Cloud Console** | [cloud.google.com](https://cloud.google.com)                              | OAuth + Gemini API     | 0, 4  | ✅ Yes                         | ⬜     |
| **Facebook Developer**   | [developers.facebook.com](https://developers.facebook.com)                | OAuth provider         | 0     | ✅ Yes                         | ⬜     |
| **Apple Developer**      | [developer.apple.com](https://developer.apple.com) ($99/yr)               | OAuth + App Store      | 0, 6  | ✅ Yes (for dev)               | ⬜     |
| **Razorpay Account**     | [razorpay.com](https://razorpay.com)                                      | Payment processing     | 3     | ⚠️ Test mode only              | ⬜     |
| **Expo/EAS Account**     | [expo.dev](https://expo.dev)                                              | Build service          | 0     | ✅ Yes                         | ⬜     |
| **Vercel Account**       | [vercel.com](https://vercel.com)                                          | Web hosting            | 0     | ✅ Yes                         | ⬜     |
| **Gupshup Account**      | [gupshup.io](https://gupshup.io)                                          | WhatsApp notifications | 3     | ⚠️ Needs business verification | ⬜     |
| **Resend Account**       | [resend.com](https://resend.com)                                          | Email notifications    | 3     | ✅ Yes                         | ⬜     |
| **Cloudinary Account**   | [cloudinary.com](https://cloudinary.com)                                  | Image optimization     | 2     | ✅ Yes                         | ⬜     |
| **Sentry Account**       | [sentry.io](https://sentry.io)                                            | Error monitoring       | 6     | ✅ Yes                         | ⬜     |
| **Google Play Console**  | [play.google.com/console](https://play.google.com/console) ($25 one-time) | Android distribution   | 6     | ❌ Org only for release        | ⬜     |
| **CodeRabbit**           | [coderabbit.ai](https://coderabbit.ai)                                    | Automated code review  | 0     | ✅ Yes                         | ⬜     |

---

## 1.1 Development Tools

### AI Coding Tools

| Tool            | Plan | Cost       | Purpose                                    | Status |
| --------------- | ---- | ---------- | ------------------------------------------ | ------ |
| **Claude Code** | Max  | $100/month | AI-assisted coding, code review, debugging | ⬜     |
| **Cursor**      | Pro  | $20/month  | AI-powered IDE, code completion            | ⬜     |

#### Heavy Opus Usage Warning

**Risk:** Using Claude Opus for almost all tasks (as preferred for code quality) may exceed monthly allocations, especially during intensive development phases.

| Month   | Expected Phases       | Complexity                               | Opus Exhaustion Risk |
| ------- | --------------------- | ---------------------------------------- | -------------------- |
| Month 1 | Phase 0, 1, part of 2 | High (foundation + core infrastructure)  | **Medium-High**      |
| Month 2 | Phase 2, 3, part of 4 | High (features + payments + AI)          | **Medium-High**      |
| Month 3 | Phase 4, 5, 6         | Very High (AI chatbot + admin dashboard) | **High**             |

**Mitigation Strategies:**

1. **Monitor usage weekly** - Track Opus consumption vs allocation
2. **Strategic task division:**
   - Opus: Architecture, complex logic, debugging, code review
   - Sonnet: Boilerplate, repetitive code, documentation
3. **Budget buffer** - Add $50-80/month contingency for overages

**Recommended Budget (Heavy Opus Usage):**

| Tool            | Base Cost | Buffer | Budgeted       |
| --------------- | --------- | ------ | -------------- |
| Claude Code Max | $100      | +$50   | $150           |
| Cursor Pro      | $20       | +$20   | $40            |
| **Total**       | $120      | +$70   | **$190/month** |

### Code Review Tools

| Tool               | Plan       | Cost           | Features                                  | Recommendation            |
| ------------------ | ---------- | -------------- | ----------------------------------------- | ------------------------- |
| **CodeRabbit**     | Free       | $0             | Unlimited PRs, 200 files/hr, 3 reviews/hr | ✅ Start here             |
| **CodeRabbit**     | Pro        | $15/user/month | Higher limits, priority support           | Upgrade if needed         |
| **GitHub Copilot** | Individual | $10/month      | Code review + coding assistance           | ❌ Not needed (redundant) |

**Note:** CodeRabbit Free plan is sufficient for small teams. GitHub Copilot not recommended since we already have Claude Code + Cursor for coding assistance.

### GitHub Services

| Service    | Plan | Cost     | Included                               | Status            |
| ---------- | ---- | -------- | -------------------------------------- | ----------------- |
| **GitHub** | Free | $0       | 2,000 Actions min/month, 500MB storage | ✅ Start here     |
| **GitHub** | Pro  | $4/month | 3,000 Actions min/month, 2GB storage   | Upgrade if needed |

**Note:** Free tier provides ~130-400 PR builds/month (assuming 5-15 min per build). Monitor usage and upgrade only if hitting limits.

### Development Tools Cost Summary

| Tool            | Base Cost      | With Buffer (Heavy Opus) |
| --------------- | -------------- | ------------------------ |
| Claude Code Max | $100           | $150                     |
| Cursor Pro      | $20            | $40                      |
| CodeRabbit      | Free           | Free                     |
| GitHub          | Free           | Free                     |
| **Total**       | **$120/month** | **$190/month**           |

**Recommendation:** Budget $190/month for development tools during active development phases to account for heavy Opus usage.

---

## 2. API Keys & Credentials

### 2.1 Public Environment Variables

These are safe to expose in client-side code:

| Variable                            | Service    | Where to Set                   | Phase | Status |
| ----------------------------------- | ---------- | ------------------------------ | ----- | ------ |
| `EXPO_PUBLIC_SUPABASE_URL`          | Supabase   | `.env`, GitHub Secrets, Vercel | 0     | ⬜     |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`     | Supabase   | `.env`, GitHub Secrets, Vercel | 0     | ⬜     |
| `EXPO_PUBLIC_RAZORPAY_KEY_ID`       | Razorpay   | `.env`, GitHub Secrets, Vercel | 3     | ⬜     |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary | `.env`, GitHub Secrets, Vercel | 2     | ⬜     |
| `EXPO_PUBLIC_SENTRY_DSN`            | Sentry     | `.env`, GitHub Secrets, Vercel | 6     | ⬜     |

### 2.2 Server-Side Secrets (Supabase Edge Functions)

These must NEVER be exposed in client code:

| Secret                      | Service      | Where to Set     | Phase | Status |
| --------------------------- | ------------ | ---------------- | ----- | ------ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase     | Supabase Secrets | 0     | ⬜     |
| `RAZORPAY_KEY_SECRET`       | Razorpay     | Supabase Secrets | 3     | ⬜     |
| `RAZORPAY_WEBHOOK_SECRET`   | Razorpay     | Supabase Secrets | 3     | ⬜     |
| `GEMINI_API_KEY`            | Google Cloud | Supabase Secrets | 4     | ⬜     |
| `GUPSHUP_API_KEY`           | Gupshup      | Supabase Secrets | 3     | ⬜     |
| `GUPSHUP_APP_NAME`          | Gupshup      | Supabase Secrets | 3     | ⬜     |
| `RESEND_API_KEY`            | Resend       | Supabase Secrets | 3     | ⬜     |

### 2.3 OAuth Credentials (Supabase Dashboard)

Configure in Supabase Dashboard → Authentication → Providers:

| Provider | Credentials Needed                        | Phase | Status |
| -------- | ----------------------------------------- | ----- | ------ |
| Google   | Client ID, Client Secret                  | 0     | ⬜     |
| Facebook | App ID, App Secret                        | 0     | ⬜     |
| Apple    | Services ID, Key ID, Private Key, Team ID | 0     | ⬜     |

### 2.4 CI/CD Secrets (GitHub Actions)

| Secret                  | Service  | Purpose                     | Phase | Status |
| ----------------------- | -------- | --------------------------- | ----- | ------ |
| `VERCEL_TOKEN`          | Vercel   | Deployment                  | 0     | ⬜     |
| `VERCEL_ORG_ID`         | Vercel   | Deployment                  | 0     | ⬜     |
| `VERCEL_PROJECT_ID`     | Vercel   | Deployment                  | 0     | ⬜     |
| `EXPO_TOKEN`            | Expo     | EAS Build                   | 0     | ⬜     |
| `CODECOV_TOKEN`         | Codecov  | Coverage reports (optional) | 0     | ⬜     |
| `SUPABASE_ACCESS_TOKEN` | Supabase | CLI operations              | 0     | ⬜     |
| `SUPABASE_PROJECT_ID`   | Supabase | CLI operations              | 0     | ⬜     |

---

## 2.5 Image Optimization Strategy

### Overview

The BMA app includes a photo gallery and uses images throughout (news, events, profiles). Proper image optimization is critical for performance, especially on mobile devices and slower networks common in India.

### Requirements

| Requirement            | Target                  | Notes                    |
| ---------------------- | ----------------------- | ------------------------ |
| **Gallery thumbnails** | < 50KB each             | Fast grid loading        |
| **Hero images**        | < 200KB                 | Above-fold performance   |
| **Format**             | WebP/AVIF with fallback | 25-35% smaller than JPEG |
| **Lazy loading**       | Below-fold images       | Reduce initial load      |
| **Placeholders**       | Blurhash                | Smooth loading UX        |
| **CDN delivery**       | Global edge caching     | Low latency worldwide    |

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE OPTIMIZATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Upload Flow:                                                  │
│   ┌──────────┐    ┌─────────────┐    ┌──────────────────┐      │
│   │  Admin   │───▶│  Cloudinary │───▶│ Store URL in DB  │      │
│   │  Upload  │    │  (gallery)  │    │ + Blurhash       │      │
│   └──────────┘    └─────────────┘    └──────────────────┘      │
│                                                                 │
│   ┌──────────┐    ┌─────────────┐    ┌──────────────────┐      │
│   │  User    │───▶│  Supabase   │───▶│ Store URL in DB  │      │
│   │  Avatar  │    │  Storage    │    │ (profiles table) │      │
│   └──────────┘    └─────────────┘    └──────────────────┘      │
│                                                                 │
│   Display Flow:                                                 │
│   ┌──────────┐    ┌─────────────┐    ┌──────────────────┐      │
│   │  Client  │───▶│ Transform   │───▶│ CDN Edge Cache   │      │
│   │  Request │    │ URL Builder │    │ (WebP/AVIF)      │      │
│   └──────────┘    └─────────────┘    └──────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Service Options

#### Option A: Cloudinary (Recommended)

| Feature             | Free Tier         | Pro ($99/month)   |
| ------------------- | ----------------- | ----------------- |
| **Storage**         | 25GB              | 225GB             |
| **Bandwidth**       | 25GB/month        | 225GB/month       |
| **Transformations** | 25K/month         | 225K/month        |
| **CDN**             | ✅ Included       | ✅ Included       |
| **Auto format**     | ✅ WebP/AVIF      | ✅ WebP/AVIF      |
| **Smart crop**      | ✅ Face detection | ✅ Face detection |

**Why Cloudinary:**

- On-the-fly transformations (no pre-generation needed)
- Automatic WebP/AVIF delivery based on browser support
- Built-in CDN with global edge locations
- Face-aware cropping for profile photos and group shots
- Free tier sufficient for BMA's expected usage (~500 members)

**Setup:**

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Create unsigned upload preset named `bma_unsigned`
3. Configure folder structure: `bma/gallery`, `bma/news`, `bma/events`
4. Add `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` to environment

#### Option B: Supabase Storage Transforms

| Feature        | Free Tier       | Pro ($25/month) |
| -------------- | --------------- | --------------- |
| **Storage**    | 1GB             | 100GB           |
| **Bandwidth**  | 2GB/month       | 200GB/month     |
| **Transforms** | ❌ Not included | ✅ Included     |
| **CDN**        | ✅ Basic        | ✅ Full         |

**When to use:**

- Already on Supabase Pro plan
- Simpler architecture preferred
- Lower image volume

#### Option C: Hybrid Approach (Recommended for BMA)

| Image Type            | Service          | Rationale                     |
| --------------------- | ---------------- | ----------------------------- |
| **Photo gallery**     | Cloudinary       | High volume, needs transforms |
| **News/Event images** | Cloudinary       | Public, high traffic          |
| **User avatars**      | Supabase Storage | Low traffic, simple uploads   |
| **Admin uploads**     | Supabase Storage | Internal, low volume          |

**Estimated Cloudinary Usage for BMA:**

- ~20 gallery albums × 50 photos = 1,000 gallery images
- ~100 news/event images per year
- ~500 member avatars (Supabase)
- Monthly transforms: ~10K (well within free tier)
- Monthly bandwidth: ~5GB (well within free tier)

### Environment Variables

| Variable                            | Service    | Where to Set   | Phase |
| ----------------------------------- | ---------- | -------------- | ----- |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary | `.env`, Vercel | 2     |

**Note:** Cloudinary unsigned uploads don't require API secret on client. For server-side operations, add `CLOUDINARY_API_SECRET` to Supabase Edge Function secrets.

### Cost Summary

| Scenario                            | Monthly Cost | Notes                          |
| ----------------------------------- | ------------ | ------------------------------ |
| **Cloudinary Free + Supabase Free** | $0           | Sufficient for launch          |
| **Cloudinary Free + Supabase Pro**  | $25          | If needing Supabase transforms |
| **Cloudinary Pro**                  | $99          | Only if exceeding free tier    |

**Recommendation:** Start with **Cloudinary Free tier** for gallery/news images + **Supabase Free** for avatars. Monitor usage and upgrade only if limits are hit.

### Implementation Reference

See [Phase 2 - Task 2.11: Image Optimization](implementation/03-PHASE-2-PUBLIC-FEATURES.md#task-211-image-optimization) for implementation details.

---

## 3. Content & Assets

### 3.1 Branding Assets (Before Phase 1)

| Asset                       | Specifications                     | Purpose          | Status |
| --------------------------- | ---------------------------------- | ---------------- | ------ |
| **BMA Logo (Primary)**      | SVG + PNG (1024x1024)              | App branding     | ⬜     |
| **BMA Logo (Dark mode)**    | SVG + PNG                          | Dark theme       | ⬜     |
| **App Icon**                | PNG 1024x1024, no transparency     | App stores       | ⬜     |
| **Adaptive Icon (Android)** | Foreground + Background layers     | Android launcher | ⬜     |
| **Splash Screen**           | PNG 1284x2778 (safe area 640x1136) | App loading      | ⬜     |
| **Favicon**                 | ICO/PNG 32x32, 16x16               | Web browser      | ⬜     |

### 3.2 About/Organization Content (Before Phase 2)

| Content                 | Languages                   | Purpose         | Status |
| ----------------------- | --------------------------- | --------------- | ------ |
| **About BMA**           | EN + Mizo                   | About page      | ⬜     |
| **Mission Statement**   | EN + Mizo                   | About page      | ⬜     |
| **Vision Statement**    | EN + Mizo                   | About page      | ⬜     |
| **BMA History**         | EN + Mizo                   | History page    | ⬜     |
| **Leadership Team**     | Names, titles, photos, bios | Leadership page | ⬜     |
| **Contact Information** | Address, phone, email       | Contact section | ⬜     |
| **Social Media URLs**   | Facebook, Instagram, etc.   | Footer/About    | ⬜     |

### 3.3 Launch Content (Before Phase 2)

| Content Type         | Quantity | Languages             | Status |
| -------------------- | -------- | --------------------- | ------ |
| News Articles        | 3-5      | EN + Mizo             | ⬜     |
| Upcoming Events      | 2-3      | EN + Mizo             | ⬜     |
| Gallery Photos       | 10-20    | Captions in EN + Mizo | ⬜     |
| Community Guidelines | 1        | EN + Mizo             | ⬜     |

### 3.4 Knowledge Base Content (Before Phase 4)

Minimum 20 items across these categories:

| Category       | Suggested Items                                  | Status |
| -------------- | ------------------------------------------------ | ------ |
| **Membership** | How to join, benefits, renewal, tiers, fees      | ⬜     |
| **Events**     | Annual event info, regular meetups, registration | ⬜     |
| **Community**  | Guidelines, volunteering, committees             | ⬜     |
| **Services**   | Member services, assistance programs             | ⬜     |
| **FAQ**        | Common questions and answers                     | ⬜     |
| **Contact**    | How to reach BMA, escalation paths               | ⬜     |

Each item needs:

- Title (EN + Mizo)
- Content (EN + Mizo)
- Category tag
- Keywords/tags for search

---

## 4. Mizo Translations

### 4.1 UI String Translation Schedule

| Translation File  | Approx. Strings | Phase Needed | Status |
| ----------------- | --------------- | ------------ | ------ |
| `common.json`     | ~50             | 1            | ⬜     |
| `auth.json`       | ~40             | 1            | ⬜     |
| `profile.json`    | ~30             | 1            | ⬜     |
| `content.json`    | ~40             | 2            | ⬜     |
| `membership.json` | ~30             | 3            | ⬜     |
| `chat.json`       | ~25             | 4            | ⬜     |
| `admin.json`      | ~50             | 5            | ⬜     |

### 4.2 Translation Process

1. **AI Draft:** Use Gemini API for initial translation
2. **Human Review:** Native Mizo speaker reviews for accuracy
3. **Cultural Terms:** Special attention to cultural/community terms
4. **Testing:** UI testing with Mizo strings for overflow/layout

### 4.3 Cultural Terms Requiring Special Attention

| English Term | Notes                       |
| ------------ | --------------------------- |
| Membership   | Community-specific meaning? |
| Association  | Formal vs informal?         |
| Community    | Mizo cultural equivalent?   |
| Newsletter   | Appropriate term?           |
| Dashboard    | Technical term handling?    |

---

## 5. Domain & Infrastructure

### 5.1 Domain Requirements

| Item                  | Purpose                                   | Status |
| --------------------- | ----------------------------------------- | ------ |
| **Production Domain** | e.g., `bma2026.org` or `bma2026.com`      | ⬜     |
| **DNS Access**        | For domain verification and configuration | ⬜     |
| **SSL Certificate**   | Usually included with Vercel/hosting      | ⬜     |

### 5.2 Email Domain

| Item                             | Purpose                     | Status |
| -------------------------------- | --------------------------- | ------ |
| **Email Sender Domain**          | e.g., `noreply@bma2026.org` | ⬜     |
| **Domain Verification (Resend)** | SPF, DKIM, DMARC records    | ⬜     |
| **Reply-to Email**               | e.g., `support@bma2026.org` | ⬜     |

### 5.3 Deep Link Configuration

| Platform                | Configuration                         | Status |
| ----------------------- | ------------------------------------- | ------ |
| **Custom Scheme**       | `bma2026://` (already configured)     | ✅     |
| **Android App Links**   | Requires `assetlinks.json` on domain  | ⬜     |
| **iOS Universal Links** | Requires `apple-app-site-association` | ⬜     |

---

## 6. App Store Preparation (Phase 6)

### 6.0 BLOCKER: App Store Account Prerequisites

⚠️ **Current Status:** BMA cannot apply for Apple Developer or Google Play Console accounts due to missing business prerequisites.

#### Blocker Chain

```
PAN Card Application ──── IN PROGRESS
        ↓
D-U-N-S Number Application ──── BLOCKED (requires PAN)
        ↓ (~2-4 weeks after PAN)
Apple Developer Enrollment ──── BLOCKED (requires D-U-N-S)
        ↓ (~1-2 weeks)
Google Play Console ──── BLOCKED (needs business verification)
        ↓ (~1 week)
App Store Releases ──── BLOCKED
```

**Realistic Timeline:** 2-3 months minimum from PAN card receipt to app store access.

#### Parallel Track Action Items

Start these immediately to minimize delays:

| Action                                           | Dependency        | Status         |
| ------------------------------------------------ | ----------------- | -------------- |
| Complete PAN card application                    | None              | 🔄 In Progress |
| Apply for D-U-N-S number                         | PAN card received | ⬜ Waiting     |
| Prepare store assets (screenshots, descriptions) | None              | ⬜             |
| Draft privacy policy                             | None              | ⬜             |
| Draft terms of service                           | None              | ⬜             |
| Identify backup Apple Developer account          | None              | ⬜             |

#### Alternate Plan: Development & Testing Without Store Accounts

Development can proceed fully without app store accounts. Only public release is blocked.

##### What Works Without Store Accounts

| Platform    | Method                    | Requirements                | Capabilities                           |
| ----------- | ------------------------- | --------------------------- | -------------------------------------- |
| **Web**     | Vercel deployment         | Vercel account              | ✅ Full functionality                  |
| **Android** | APK direct install        | Expo account                | ✅ Full functionality (sideload)       |
| **Android** | EAS Internal Distribution | Expo account                | ✅ Up to 100 testers                   |
| **iOS**     | Expo Go app               | Expo account                | ⚠️ Limited native features             |
| **iOS**     | Simulator builds          | Expo account + Mac          | ✅ Full functionality (simulator only) |
| **iOS**     | TestFlight                | ⚠️ Requires Apple Developer | ✅ Full functionality                  |

##### Recommended Testing Strategy by Phase

| Phase                | Web               | Android            | iOS                       |
| -------------------- | ----------------- | ------------------ | ------------------------- |
| **0-1** (Foundation) | Vercel Preview    | Expo Go / APK      | Expo Go                   |
| **2-3** (Features)   | Vercel Preview    | EAS APK builds     | Expo Go                   |
| **4-5** (AI + Admin) | Vercel Staging    | EAS Internal Dist. | Expo Go / Simulator       |
| **6** (Polish)       | Vercel Production | EAS Internal Dist. | TestFlight (if available) |
| **Launch**           | ✅ Live           | Play Store         | App Store                 |

##### iOS Testing Options

| Option                    | Cost   | Setup Time | Max Testers | Native Features | Recommendation     |
| ------------------------- | ------ | ---------- | ----------- | --------------- | ------------------ |
| **Expo Go**               | Free   | Immediate  | Unlimited   | ❌ Limited      | ✅ Use for dev     |
| **Simulator**             | Free   | Immediate  | N/A         | ✅ Full         | ✅ Use for testing |
| **Personal Apple Dev**    | $99/yr | 1-2 days   | 100 devices | ✅ Full         | ✅ Backup option   |
| **TestFlight (personal)** | $99/yr | ~1 week    | 10,000      | ✅ Full         | ✅ Best for beta   |
| **Wait for BMA account**  | $99/yr | 2-3 months | 10,000      | ✅ Full         | For public release |

##### Decision Required: iOS Testing Backup

❓ **Question:** Does anyone on the team have a personal Apple Developer account ($99/yr) that can be used temporarily for TestFlight builds?

- If **Yes:** Use it for development builds, transfer app to BMA organization account later
- If **No:** Continue with Expo Go + Simulator testing until BMA account is ready

**Note:** Both Apple and Google support transferring apps to a different organization account.

---

#### Using Individual Accounts for Development

Individual/personal accounts can be used during development. Only public app store release requires organization accounts.

##### Google Services ✅ No Blocker

| Service          | Individual Account | Notes                                           |
| ---------------- | ------------------ | ----------------------------------------------- |
| **Google OAuth** | ✅ Works fully     | Any Google account can create OAuth credentials |
| **Gemini API**   | ✅ Works fully     | API keys work the same for individual or org    |

**Setup:** Create a Google Cloud project under any personal Gmail account.

**Transfer options when BMA org account is ready:**

- Transfer the Google Cloud project to BMA organization, OR
- Create new credentials under BMA account and swap environment variables

##### Facebook OAuth ✅ No Blocker

| Service            | Individual Account | Notes                                    |
| ------------------ | ------------------ | ---------------------------------------- |
| **Facebook OAuth** | ✅ Works fully     | Personal Facebook Dev account sufficient |

**Note:** Business verification only needed for advanced features, not basic OAuth.

##### Apple OAuth ⚠️ Requires Developer Account

| Scenario                           | Works? | Notes                                     |
| ---------------------------------- | ------ | ----------------------------------------- |
| **Personal Apple Developer ($99)** | ✅ Yes | Full OAuth, can transfer app later        |
| **No Apple Developer account**     | ❌ No  | Apple Sign-In requires enrolled developer |

**Options for Apple Sign-In during development:**

| Option                        | Cost   | Pros                   | Cons                                 |
| ----------------------------- | ------ | ---------------------- | ------------------------------------ |
| **1. Use personal Apple Dev** | $99/yr | Full functionality now | Personal cost, transfer needed later |
| **2. Defer Apple Sign-In**    | $0     | No cost now            | Implement later, delayed testing     |
| **3. Skip Apple Sign-In**     | $0     | Simpler OAuth setup    | Some iOS users prefer Apple Sign-In  |

##### Recommended Development Account Setup

| Service            | Account Type                      | Cost        | Transfer Strategy             |
| ------------------ | --------------------------------- | ----------- | ----------------------------- |
| **Google OAuth**   | Personal Google Cloud             | Free        | Swap keys or transfer project |
| **Gemini API**     | Personal Google Cloud             | Usage-based | Swap keys or transfer project |
| **Facebook OAuth** | Personal Facebook Dev             | Free        | Swap keys                     |
| **Apple OAuth**    | Personal Apple Dev (if available) | $99/yr      | App transfer to BMA org       |

##### Decision Required: Apple Sign-In Approach

❓ **Which approach for Apple Sign-In during development?**

1. ⬜ Use personal Apple Developer account ($99) - Full functionality
2. ⬜ Defer Apple Sign-In - Implement when BMA account ready
3. ⬜ Skip Apple Sign-In entirely - Google + Facebook + Email only

---

#### Summary: Development with Individual Accounts

##### What's NOT Blocked

| Activity                        | Status       | Notes                       |
| ------------------------------- | ------------ | --------------------------- |
| All development (Phases 0-5)    | ✅ Unblocked | Full functionality          |
| Web production deployment       | ✅ Unblocked | Can launch immediately      |
| Android testing (APK/Internal)  | ✅ Unblocked | Up to 100 testers           |
| iOS testing (Expo Go/Simulator) | ✅ Unblocked | Limited native features     |
| iOS testing (TestFlight)        | ✅ Unblocked | If using personal Apple Dev |
| Google OAuth                    | ✅ Unblocked | Personal Google Cloud       |
| Facebook OAuth                  | ✅ Unblocked | Personal Facebook Dev       |
| Apple OAuth                     | ✅ Unblocked | If using personal Apple Dev |
| Gemini API                      | ✅ Unblocked | Personal Google Cloud       |

##### What IS Blocked (Until BMA Org Accounts Ready)

| Activity                  | Status     | Timeline   |
| ------------------------- | ---------- | ---------- |
| App Store public release  | ❌ Blocked | 2-3 months |
| Play Store public release | ❌ Blocked | 2-3 months |

##### Trade-offs of Using Individual Accounts

| Factor                | Impact                                            | Mitigation                                      |
| --------------------- | ------------------------------------------------- | ----------------------------------------------- |
| **Extra cost**        | $99 for personal Apple Dev (if used)              | BMA can reimburse later                         |
| **Transfer overhead** | ~1-2 hours work                                   | Straightforward process                         |
| **Env var changes**   | Update API keys when switching                    | Simple configuration change                     |
| **Timeline impact**   | Web launches on schedule; Mobile waits for stores | Internal testing continues via APK + TestFlight |

##### Recommendation

**Proceed with development using individual accounts.** The trade-offs are minimal:

- All development work proceeds without delays
- Web version can launch on **March 21, 2026** (BMA Annual Day) as planned
- Mobile apps can be fully tested internally
- Public mobile release follows when BMA org accounts are ready (2-3 months)
- No development time is wasted - all code works identically regardless of account type

---

### 6.1 iOS App Store

| Item                           | Details                              | Status |
| ------------------------------ | ------------------------------------ | ------ |
| **Apple Developer Enrollment** | $99/year, requires D-U-N-S for org   | ⬜     |
| **App Name**                   | Reserve "BMA 2026" or similar        | ⬜     |
| **Bundle ID**                  | e.g., `org.bma2026.app`              | ⬜     |
| **App Store Screenshots**      | 6.7", 6.5", 5.5" iPhone + 12.9" iPad | ⬜     |
| **App Preview Video**          | Optional, 15-30 seconds              | ⬜     |
| **App Description**            | EN (Mizo if supporting)              | ⬜     |
| **Keywords**                   | Up to 100 characters                 | ⬜     |
| **Privacy Policy URL**         | Required, publicly accessible        | ⬜     |
| **Support URL**                | Required                             | ⬜     |
| **Demo Account**               | For App Review team                  | ⬜     |
| **Age Rating**                 | Complete questionnaire               | ⬜     |

### 6.2 Google Play Store

| Item                          | Details                             | Status |
| ----------------------------- | ----------------------------------- | ------ |
| **Play Console Registration** | $25 one-time                        | ⬜     |
| **App Name**                  | Reserve "BMA 2026"                  | ⬜     |
| **Package Name**              | e.g., `org.bma2026.app`             | ⬜     |
| **Store Listing Screenshots** | Phone (2+) + 7" tablet + 10" tablet | ⬜     |
| **Feature Graphic**           | 1024x500 PNG/JPG                    | ⬜     |
| **Short Description**         | Up to 80 characters                 | ⬜     |
| **Full Description**          | Up to 4000 characters               | ⬜     |
| **Privacy Policy URL**        | Required                            | ⬜     |
| **Content Rating**            | Complete questionnaire              | ⬜     |
| **Data Safety Form**          | Required, detail data collection    | ⬜     |
| **Target Audience**           | Declare target age groups           | ⬜     |

### 6.3 Legal Documents

| Document                 | Purpose                  | Status |
| ------------------------ | ------------------------ | ------ |
| **Privacy Policy**       | Required for both stores | ⬜     |
| **Terms of Service**     | Recommended              | ⬜     |
| **Community Guidelines** | For content moderation   | ⬜     |
| **Refund Policy**        | For Razorpay/payments    | ⬜     |

---

## 7. Decisions Required

### 7.1 Technical Decisions

| Decision                   | Options            | Recommendation                          | Status |
| -------------------------- | ------------------ | --------------------------------------- | ------ |
| **Supabase Region**        | Multiple available | Mumbai (`ap-south-1`) for India latency | ⬜     |
| **Payment Mode (Initial)** | Test / Live        | Start with Test mode                    | ⬜     |
| **Build Environment**      | EAS Build / Local  | EAS Build for consistency               | ⬜     |

### 7.2 Business Decisions

| Decision                   | Options                      | Impact            | Status |
| -------------------------- | ---------------------------- | ----------------- | ------ |
| **Membership Pricing**     | ₹500 annual / ₹5000 lifetime | Revenue model     | ⬜     |
| **Free Tier Limits**       | 5 messages/day proposed      | User experience   | ⬜     |
| **Paid Tier Limits**       | 30 messages/day proposed     | Value proposition | ⬜     |
| **WhatsApp Notifications** | Opt-in / Opt-out default     | User preference   | ⬜     |

### 7.3 Verification Requirements

| Item                   | Requirement                               | Status |
| ---------------------- | ----------------------------------------- | ------ |
| **WhatsApp Business**  | Business verification required by Gupshup | ⬜     |
| **Razorpay KYC**       | Business documents for live mode          | ⬜     |
| **Apple Organization** | D-U-N-S number for organization account   | ⬜     |

---

## 8. Priority Order

> **Note:** Items marked with 🔵 can use individual accounts during development. Items marked with 🏢 require BMA organization accounts for production/release.

### Immediate (Before Phase 0/1)

1. ⬜ 🔵 Supabase project creation (individual account OK)
2. ⬜ 🔵 Google Cloud project setup - OAuth + Gemini (individual account OK)
3. ⬜ 🔵 Facebook Developer app (individual account OK)
4. ⬜ 🔵 Expo/EAS account setup (individual account OK)
5. ⬜ 🔵 Vercel account setup (individual account OK)
6. ⬜ 🔵 CodeRabbit setup (individual account OK)
7. ⬜ GitHub repository secrets
8. ⬜ BMA logo and basic branding
9. ⬜ **Decision:** Apple Sign-In approach (personal dev account / defer / skip)

### Before Phase 3 (Payments)

10. ⬜ 🔵 Razorpay account (test mode - individual OK; live mode needs KYC)
11. ⬜ ⚠️ Gupshup account (needs business verification for WhatsApp)
12. ⬜ 🔵 Resend account (individual account OK)
13. ⬜ Email domain verification

### Before Phase 4 (Chatbot)

14. ⬜ Knowledge Base content (20+ items)
15. ⬜ Gemini API enablement (already in Google Cloud project)
16. ⬜ Mizo translation review

### Before Phase 6 (Launch) - Web

17. ⬜ Production domain
18. ⬜ Privacy policy
19. ⬜ 🔵 Sentry account (individual account OK)
20. ⬜ Store assets and screenshots (prepare in advance)

### Before Public Mobile Release (When BMA Org Accounts Ready)

21. ⬜ 🏢 BMA PAN card received
22. ⬜ 🏢 D-U-N-S number application
23. ⬜ 🏢 Apple Developer enrollment (BMA organization)
24. ⬜ 🏢 Google Play Console registration (BMA organization)
25. ⬜ Transfer app from personal to BMA org account (if applicable)
26. ⬜ Update OAuth credentials to BMA org (if needed)
27. ⬜ App Store submission
28. ⬜ Play Store submission

---

## 9. Detailed Cost Breakdown

### 9.1 One-Time Costs

| Item                    | Cost      | Notes                   |
| ----------------------- | --------- | ----------------------- |
| Apple Developer Program | $99       | Annual renewal required |
| Google Play Console     | $25       | One-time registration   |
| Domain Registration     | $10-15    | .org or .com            |
| **Total One-Time**      | **~$135** |                         |

### 9.2 Monthly Development Costs

| Item                  | Base Cost      | With Buffer    | Notes                              |
| --------------------- | -------------- | -------------- | ---------------------------------- |
| Claude Code Max       | $100           | $150           | +$50 buffer for heavy Opus usage   |
| Cursor Pro            | $20            | $40            | +$20 buffer for overages           |
| CodeRabbit            | Free           | Free           | Code review (Free tier sufficient) |
| GitHub                | Free           | Free           | CI/CD (Free tier sufficient)       |
| **Total Development** | **$120/month** | **$190/month** | Budget the higher amount           |

**Note:** Heavy Opus usage (preferred for code quality) is expected during all phases. The buffered amount ($190/month) is the recommended budget during active development.

### 9.3 Monthly Production Costs (Estimated)

#### Infrastructure Services

| Service      | Free Tier                       | Paid Tier     | Est. BMA Usage              | Est. Cost |
| ------------ | ------------------------------- | ------------- | --------------------------- | --------- |
| **Supabase** | 500MB DB, 1GB storage, 50K auth | $25/month Pro | May stay on free initially  | $0-25     |
| **Vercel**   | 100GB bandwidth                 | $20/month Pro | Likely free tier sufficient | $0-20     |
| **Expo EAS** | Limited priority builds         | $29/month     | Free tier for development   | $0-29     |
| **Sentry**   | 5K errors/month                 | $26/month     | Free tier likely sufficient | $0-26     |

#### API & Communication Services

| Service                | Pricing Model          | Est. Monthly Usage | Est. Cost      |
| ---------------------- | ---------------------- | ------------------ | -------------- |
| **Google Gemini API**  | See breakdown below    | ~2-3M tokens       | $15-25         |
| **Gupshup (WhatsApp)** | $0.001/msg + Meta fees | ~2,000 messages    | $7-15          |
| **Resend (Email)**     | Free: 3K/month         | ~2,500 emails      | $0 (Free tier) |

#### Google Gemini API Detailed Pricing

| Model                                 | Input Cost           | Output Cost      |
| ------------------------------------- | -------------------- | ---------------- |
| Gemini Embedding (text-embedding-004) | $0.15/1M tokens      | N/A              |
| Gemini 2.5 Pro                        | $1.25-2.00/1M tokens | $10-12/1M tokens |

**Estimated BMA Chatbot Usage:**

| Use Case                          | Est. Tokens/Month | Est. Cost         |
| --------------------------------- | ----------------- | ----------------- |
| KB Embeddings (initial, one-time) | ~100K             | ~$0.02            |
| Chat query embeddings             | ~500K             | ~$0.08            |
| Chat responses (input)            | ~2M               | ~$3-4             |
| Chat responses (output)           | ~1M               | ~$10-12           |
| **Total Gemini**                  |                   | **~$15-25/month** |

**Note:** Gemini has a free tier (100 req/min, 1K req/day) suitable for development but not production.

#### Gupshup WhatsApp Detailed Pricing

| Component               | Cost                   |
| ----------------------- | ---------------------- |
| Setup fee               | Free                   |
| Monthly subscription    | Free                   |
| Gupshup fee per message | $0.001 (~₹0.08)        |
| Meta fee per message    | Varies by message type |

**Estimated BMA Usage:**

- ~500 members × 4 notifications/month = 2,000 messages
- Gupshup fees: ~$2
- Meta fees: ~$5-13 (depends on message type)
- **Total: ~$7-15/month**

**Requirements:**

- WhatsApp Business verification required
- Business documents needed

#### Resend Email Pricing

| Plan | Price     | Volume                      |
| ---- | --------- | --------------------------- |
| Free | $0        | 3,000/month (100/day limit) |
| Pro  | $20/month | 50,000/month                |

**BMA Estimate:** ~2,500 emails/month (welcome, password reset, notifications) - **Free tier sufficient**

#### Domain Costs

| Item                   | Annual Cost   |
| ---------------------- | ------------- |
| .org domain            | $10-15/year   |
| .com domain            | $10-15/year   |
| .in domain             | $8-12/year    |
| **Monthly equivalent** | **~$1/month** |

### 9.4 Production Cost Summary

| Scenario                     | Monthly Cost | Annual Cost |
| ---------------------------- | ------------ | ----------- |
| **Minimum (all free tiers)** | ~$23         | ~$276       |
| **Typical (moderate usage)** | ~$70         | ~$840       |
| **Maximum (paid tiers)**     | ~$170        | ~$2,040     |

**Typical monthly breakdown:**

- Domain: $1
- Gemini API: $20
- Gupshup: $10
- Supabase: Free
- Vercel: Free
- Resend: Free
- Sentry: Free
- **Total: ~$31/month base + infrastructure if exceeded**

### 9.5 Transaction Costs (Razorpay)

| Fee Type              | Rate               |
| --------------------- | ------------------ |
| Standard transactions | 2% per transaction |
| International cards   | 3% per transaction |
| UPI/Netbanking        | 2% per transaction |

**Note:** No monthly fees. Costs scale with transaction volume.

### 9.6 Total Cost Summary

#### Year 1 Estimate (Active Development)

| Category                          | Conservative     | Recommended (Heavy Opus) |
| --------------------------------- | ---------------- | ------------------------ |
| **One-Time Setup**                | $135             | $135                     |
| **Development Tools (12 months)** | $1,440 ($120×12) | $2,280 ($190×12)         |
| **Production Costs (12 months)**  | $276             | $2,040                   |
| **Apple Developer Renewal**       | $99              | $99                      |
| **Total Year 1**                  | **~$1,950**      | **~$4,554**              |

**Recommendation:** Budget for the "Recommended" column ($4,554) to ensure uninterrupted Opus access throughout development.

#### Development Phase Budget (3 months intensive)

If active development is concentrated in ~3 months:

| Category                            | Cost      |
| ----------------------------------- | --------- |
| One-Time Setup                      | $135      |
| Development Tools (3 months @ $190) | $570      |
| Production Costs (3 months @ $31)   | $93       |
| **Total Development Phase**         | **~$800** |

#### Ongoing Annual Costs (Year 2+ / Maintenance)

| Category                          | Low           | High             |
| --------------------------------- | ------------- | ---------------- |
| Development Tools (reduced usage) | $720 ($60×12) | $1,440 ($120×12) |
| Production Costs                  | $276          | $2,040           |
| Apple Developer                   | $99           | $99              |
| Domain Renewal                    | $15           | $15              |
| **Total Annual**                  | **~$1,110**   | **~$3,594**      |

**Note:** Year 2+ assumes reduced development activity. Adjust based on ongoing feature development needs.

---

## Change Log

| Date       | Changes                                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-13 | Added Section 2.5: Image Optimization Strategy (Cloudinary recommended); Added Cloudinary to accounts and env vars                                                           |
| 2026-01-13 | Added summary of individual account trade-offs; Updated Section 1 with "Individual Account OK?" column; Reorganized Priority Order with individual vs org account indicators |
| 2026-01-13 | Added individual account usage for development (Google OAuth, Gemini, Facebook OAuth, Apple OAuth options)                                                                   |
| 2026-01-13 | Added Section 6.0: App Store blocker documentation, alternate testing plan without store accounts                                                                            |
| 2026-01-13 | Added heavy Opus usage warning, budget buffers ($190/month recommended), revised Year 1 estimates                                                                            |
| 2026-01-13 | Added detailed cost breakdowns, development tools section, Gemini/Gupshup/Resend pricing                                                                                     |
| 2026-01-12 | Initial document created                                                                                                                                                     |
