# Non-Functional Requirements (NFR) Document

## BMA Digital Platform

**Version:** 1.0
**Last Updated:** January 2026
**Status:** Active
**Audience:** Engineering, QA, Product

---

## Table of Contents

1. [Overview](#1-overview)
2. [Performance](#2-performance)
3. [Scalability](#3-scalability)
4. [Security](#4-security)
5. [Availability](#5-availability)
6. [Accessibility](#6-accessibility)
7. [Usability](#7-usability)
8. [Compatibility](#8-compatibility)
9. [Maintainability](#9-maintainability)
10. [Compliance](#10-compliance)
11. [Appendix A: Priority Definitions](#appendix-a-priority-definitions)
12. [Appendix B: Verification Methods](#appendix-b-verification-methods)
13. [Appendix C: Traceability Matrix](#appendix-c-traceability-matrix)

---

## 1. Overview

### 1.1 Purpose

This document defines the Non-Functional Requirements (NFRs) for the BMA Digital Platform. These requirements specify the quality attributes, constraints, and system properties that govern how the system performs its functions.

### 1.2 Scope

NFRs apply to all components of the BMA platform:

- Web application (Expo Web on Vercel)
- iOS application (Expo on App Store)
- Android application (Expo on Google Play)
- Backend services (Supabase Edge Functions)
- Database (PostgreSQL via Supabase)

### 1.3 Priority Levels

| Priority         | Definition                                        |
| ---------------- | ------------------------------------------------- |
| **Must Have**    | Blocks launch; critical for platform operation    |
| **Should Have**  | Important for user experience; not launch-blocker |
| **Nice to Have** | Aspirational goals; improves quality              |

### 1.4 Target Audience & Scale

| Metric              | Value                      |
| ------------------- | -------------------------- |
| Launch users        | 5,000                      |
| Growth (3-6 months) | 30,000                     |
| Mature (12 months)  | 100,000+                   |
| Geographic focus    | India (Bangalore primary)  |
| Network conditions  | 2G/3G/4G/5G                |
| Device range        | 2GB RAM budget to flagship |

---

## 2. Performance

### 2.1 Page Load Time

| Requirement                                      | Target        | Measurement            | Priority    | Verification Method          | Source                              |
| ------------------------------------------------ | ------------- | ---------------------- | ----------- | ---------------------------- | ----------------------------------- |
| **NFR-PERF-001**: Initial page load (FCP)        | < 3 seconds   | First Contentful Paint | Must Have   | Lighthouse, WebPageTest      | PRD-BMA-2026.md §11.1, Phase-6 §6.2 |
| **NFR-PERF-002**: Time to Interactive (TTI)      | < 5 seconds   | Time to Interactive    | Must Have   | Lighthouse                   | Phase-6 §6.2                        |
| **NFR-PERF-003**: Largest Contentful Paint (LCP) | < 2.5 seconds | Core Web Vitals        | Should Have | Lighthouse, Vercel Analytics | Phase-6 §6.2                        |

**Notes:**

- Targets apply to all network conditions (no by-network classification)
- Measured on mid-range device (4GB RAM, mid-tier chipset)
- Public-facing pages only (home, news, events, about)

**Traceability:**

- PRD-BMA-2026.md §11.1 (Performance targets)
- Phase-6-POLISH-LAUNCH.md §6.2 (Performance optimization)
- 00-PREREQUISITES.md §2.3 (Device performance targets)

---

### 2.2 API Response Time

| Requirement                                 | Target      | Measurement     | Priority    | Verification Method              | Source                                  |
| ------------------------------------------- | ----------- | --------------- | ----------- | -------------------------------- | --------------------------------------- |
| **NFR-PERF-004**: API response time (p95)   | < 500ms     | 95th percentile | Must Have   | Supabase dashboard, load testing | PRD-BMA-2026.md §11.1, API-DESIGN.md §7 |
| **NFR-PERF-005**: Database query time (p95) | < 200ms     | 95th percentile | Should Have | Supabase slow query log          | DATABASE-SCHEMA.md (implicit)           |
| **NFR-PERF-006**: Chatbot response time     | < 3 seconds | End-to-end      | Must Have   | Edge Function logs               | PRD-BMA-2026.md §11.1                   |

**Notes:**

- Measured from client request to response received
- Excludes network latency
- Database queries optimized with indexes (see DATABASE-SCHEMA.md)

**Traceability:**

- PRD-BMA-2026.md §11.1 (Performance requirements)
- API-DESIGN.md §7 (Rate limiting section mentions response times)
- DATABASE-SCHEMA.md (Indexes for query optimization)

---

### 2.3 Interaction Response Time

| Requirement                                       | Target  | Measurement               | Priority    | Verification Method       | Source       |
| ------------------------------------------------- | ------- | ------------------------- | ----------- | ------------------------- | ------------ |
| **NFR-PERF-007**: Button press to visual feedback | < 100ms | First visual response     | Must Have   | Manual testing, E2E tests | Phase-6 §6.2 |
| **NFR-PERF-008**: Form submission feedback        | < 200ms | Loading indicator display | Must Have   | E2E tests                 | Phase-6 §6.2 |
| **NFR-PERF-009**: Navigation transition           | < 300ms | Route change complete     | Should Have | Performance profiling     | Phase-6 §6.2 |

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.2 (Performance targets)

---

### 2.4 Bundle Size

| Requirement                                     | Target       | Measurement        | Priority    | Verification Method                            | Source                        |
| ----------------------------------------------- | ------------ | ------------------ | ----------- | ---------------------------------------------- | ----------------------------- |
| **NFR-PERF-010**: Initial bundle size (gzipped) | < 1MB        | Gzipped JS bundle  | Must Have   | Webpack bundle analyzer, Expo export --analyze | Phase-6 §6.2                  |
| **NFR-PERF-011**: Code splitting per route      | Lazy loading | Dynamic imports    | Should Have | Code review, bundle analysis                   | Phase-6 §6.2                  |
| **NFR-PERF-012**: Admin dashboard isolation     | Lazy loaded  | Not in main bundle | Must Have   | Bundle analysis                                | PRD §2.5 (Admin lazy loading) |

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.2.1 (Bundle size optimization)
- PRD-BMA-2026.md §2.5 (Admin routes lazy-loaded)

---

### 2.5 Image Optimization

| Requirement                                          | Target           | Measurement                   | Priority     | Verification Method               | Source                                   |
| ---------------------------------------------------- | ---------------- | ----------------------------- | ------------ | --------------------------------- | ---------------------------------------- |
| **NFR-PERF-013**: Gallery thumbnails                 | < 50KB           | File size per image           | Must Have    | Network tab, Cloudinary analytics | 00-PREREQUISITES.md §2.5, Phase-6 §6.2.2 |
| **NFR-PERF-014**: Hero images                        | < 200KB          | File size per image           | Must Have    | Network tab, Cloudinary analytics | 00-PREREQUISITES.md §2.5, Phase-6 §6.2.2 |
| **NFR-PERF-015**: Card images                        | < 100KB          | File size per image           | Should Have  | Network tab                       | Phase-6 §6.2.2                           |
| **NFR-PERF-016**: Fullscreen images                  | < 500KB          | File size per image           | Should Have  | Network tab                       | Phase-6 §6.2.2                           |
| **NFR-PERF-017**: WebP/AVIF delivery                 | 85%+ of requests | Response content-type headers | Nice to Have | CDN analytics, response headers   | Phase-6 §6.2.2 (aspiration goal)         |
| **NFR-PERF-018**: CDN cache hit ratio                | > 90%            | Cache hit vs miss             | Should Have  | Cloudinary analytics              | 00-PREREQUISITES.md §2.5                 |
| **NFR-PERF-019**: Lazy loading below-fold images     | 100%             | Default behavior              | Must Have    | Code review, manual testing       | Phase-6 §6.2.2                           |
| **NFR-PERF-020**: Priority loading above-fold images | 100%             | priority={true} attribute     | Must Have    | Code review                       | Phase-6 §6.2.2                           |

**Traceability:**

- 00-PREREQUISITES.md §2.5 (Image optimization strategy)
- Phase-6-POLISH-LAUNCH.md §6.2.2 (Image optimization verification)

---

### 2.6 Offline Performance

| Requirement                                | Target   | Measurement              | Priority    | Verification Method          | Source                       |
| ------------------------------------------ | -------- | ------------------------ | ----------- | ---------------------------- | ---------------------------- |
| **NFR-PERF-021**: Cached content load time | < 500ms  | TanStack Query cache hit | Should Have | Network throttling test      | PRD §5.6 (Offline-Lite mode) |
| **NFR-PERF-022**: Cache TTL (content)      | 24 hours | Cache expiration         | Should Have | TanStack Query config review | PRD §5.6                     |
| **NFR-PERF-023**: Cache TTL (static pages) | 7 days   | Cache expiration         | Should Have | TanStack Query config review | PRD §5.6                     |

**Traceability:**

- PRD-BMA-2026.md §5.6 (Offline-Lite mode)

---

## 3. Scalability

### 3.1 User Capacity

| Requirement                                   | Target             | Measurement                   | Priority    | Verification Method        | Source                        |
| --------------------------------------------- | ------------------ | ----------------------------- | ----------- | -------------------------- | ----------------------------- |
| **NFR-SCALE-001**: Total user capacity        | 100,000+ users     | Database row count            | Must Have   | Database capacity planning | PRD §1 (Target scale)         |
| **NFR-SCALE-002**: Concurrent users (typical) | 1-10% of total     | Active sessions               | Must Have   | Load testing, monitoring   | Clarification (user provided) |
| **NFR-SCALE-003**: Concurrent users (peak)    | Up to 50% of total | Active sessions during events | Should Have | Load testing, monitoring   | Clarification (user provided) |

**Scaling Examples:**

| Total Users | Typical Concurrent | Peak Concurrent (Events) |
| ----------- | ------------------ | ------------------------ |
| 5,000       | 50-500             | Up to 2,500              |
| 30,000      | 300-3,000          | Up to 15,000             |
| 100,000     | 1,000-10,000       | Up to 50,000             |

**Traceability:**

- PRD-BMA-2026.md §1 (Purpose & Goals - Target Scale)
- User clarification (concurrent user expectations)

---

### 3.2 Data Growth

| Requirement                             | Target               | Measurement         | Priority  | Verification Method    | Source                   |
| --------------------------------------- | -------------------- | ------------------- | --------- | ---------------------- | ------------------------ |
| **NFR-SCALE-004**: Content items        | Unlimited            | Database rows       | Must Have | Database schema design | DATABASE-SCHEMA.md       |
| **NFR-SCALE-005**: Pagination           | 20-50 items per page | API response        | Must Have | API testing            | PRD §11.2, API-DESIGN.md |
| **NFR-SCALE-006**: Comments per content | Unlimited            | Paginated (20/page) | Must Have | Database schema        | PRD §5.5                 |
| **NFR-SCALE-007**: Chat messages        | 5-30 per user/day    | Rate-limited        | Must Have | Rate limiting logic    | PRD §7.2                 |

**Traceability:**

- PRD-BMA-2026.md §11.2 (Scalability section)
- DATABASE-SCHEMA.md (Schema design for scale)
- API-DESIGN.md §4 (Pagination parameters)

---

### 3.3 Database Performance at Scale

| Requirement                                       | Target                | Measurement     | Priority  | Verification Method               | Source                       |
| ------------------------------------------------- | --------------------- | --------------- | --------- | --------------------------------- | ---------------------------- |
| **NFR-SCALE-008**: Query performance with indexes | < 200ms at 100K users | Slow query log  | Must Have | Load testing, Supabase monitoring | DATABASE-SCHEMA.md (Indexes) |
| **NFR-SCALE-009**: Database connection pooling    | Configured            | Supabase pooler | Must Have | Supabase config review            | PRD §12.1 (Supabase backend) |

**Traceability:**

- DATABASE-SCHEMA.md (Indexes on all query-heavy columns)
- PRD-BMA-2026.md §12.1 (Supabase as backend)

---

### 3.4 Edge Function Scalability

| Requirement                                 | Target        | Measurement             | Priority    | Verification Method    | Source           |
| ------------------------------------------- | ------------- | ----------------------- | ----------- | ---------------------- | ---------------- |
| **NFR-SCALE-010**: Edge Function cold start | < 500ms       | First invocation        | Should Have | Monitoring             | API-DESIGN.md §5 |
| **NFR-SCALE-011**: Edge Function timeout    | 5 seconds max | Function execution time | Must Have   | Edge Function config   | API-DESIGN.md §5 |
| **NFR-SCALE-012**: Horizontal scaling       | Automatic     | Supabase handles        | Must Have   | Platform documentation | PRD §11.2        |

**Traceability:**

- API-DESIGN.md §5 (Edge Functions)
- PRD-BMA-2026.md §11.2 (Horizontal scaling via Supabase)

---

## 4. Security

### 4.1 Authentication & Authorization

| Requirement                                        | Target            | Measurement             | Priority  | Verification Method         | Source                   |
| -------------------------------------------------- | ----------------- | ----------------------- | --------- | --------------------------- | ------------------------ |
| **NFR-SEC-001**: Password hashing                  | bcrypt/PBKDF2     | Supabase Auth handles   | Must Have | Auth provider documentation | PRD §5.2, Phase-6 §6.4.2 |
| **NFR-SEC-002**: Session token expiration          | 60 minutes        | JWT exp claim           | Must Have | Token inspection            | API-DESIGN.md §3.2       |
| **NFR-SEC-003**: Automatic token refresh           | Before expiration | Supabase client handles | Must Have | Manual testing              | PRD §5.2                 |
| **NFR-SEC-004**: OAuth PKCE flow                   | Enabled           | OAuth implementation    | Must Have | OAuth flow testing          | Phase-6 §6.4.2           |
| **NFR-SEC-005**: Password reset token one-time use | Single use        | Token invalidation      | Must Have | Password reset testing      | Phase-6 §6.4.2           |

**Traceability:**

- PRD-BMA-2026.md §5.2 (Authentication requirements)
- API-DESIGN.md §3 (Authentication section)
- Phase-6-POLISH-LAUNCH.md §6.4.2 (Auth security checklist)

---

### 4.2 Row Level Security (RLS)

| Requirement                                | Target                | Measurement            | Priority  | Verification Method     | Source                       |
| ------------------------------------------ | --------------------- | ---------------------- | --------- | ----------------------- | ---------------------------- |
| **NFR-SEC-006**: RLS enabled on all tables | 100% of tables        | Database schema review | Must Have | SQL query, schema audit | PRD §4.3, DATABASE-SCHEMA.md |
| **NFR-SEC-007**: No table bypasses RLS     | Zero exceptions       | RLS policy audit       | Must Have | Database security audit | PRD §4.3, Phase-6 §6.4.1     |
| **NFR-SEC-008**: RLS policy testing        | All policies verified | Security test suite    | Must Have | RLS verification script | Phase-6 §6.4.1               |

**Traceability:**

- PRD-BMA-2026.md §4.3 (RLS as primary authorization)
- DATABASE-SCHEMA.md (RLS policies section)
- Phase-6-POLISH-LAUNCH.md §6.4.1 (RLS policy verification)

---

### 4.3 Data Protection

| Requirement                                             | Target                         | Measurement                    | Priority  | Verification Method       | Source                    |
| ------------------------------------------------------- | ------------------------------ | ------------------------------ | --------- | ------------------------- | ------------------------- |
| **NFR-SEC-009**: No secrets in client code              | Zero secrets                   | Code review, git history audit | Must Have | Automated secret scanning | PRD §11.3, Phase-6 §6.4.4 |
| **NFR-SEC-010**: Environment variable prefix validation | EXPO*PUBLIC*\* for public only | Config review                  | Must Have | Code review               | Phase-6 §6.4.4            |
| **NFR-SEC-011**: Payment details not stored client-side | No storage                     | Code review                    | Must Have | Code audit                | PRD §6.3                  |
| **NFR-SEC-012**: Audit logs exclude passwords           | Zero password logs             | Log inspection                 | Must Have | Audit log review          | Phase-6 §6.4.4            |

**Traceability:**

- PRD-BMA-2026.md §11.3 (Security requirements)
- Phase-6-POLISH-LAUNCH.md §6.4.4 (Sensitive data protection)

---

### 4.4 Input Validation & Sanitization

| Requirement                                            | Target                     | Measurement                | Priority  | Verification Method | Source                    |
| ------------------------------------------------------ | -------------------------- | -------------------------- | --------- | ------------------- | ------------------------- |
| **NFR-SEC-013**: Server-side input validation          | 100% of inputs             | Code review                | Must Have | Security audit      | PRD §11.3, Phase-6 §6.4.3 |
| **NFR-SEC-014**: Content sanitization (XSS prevention) | All user-generated content | Sanitization library usage | Must Have | XSS testing         | PRD §11.3                 |
| **NFR-SEC-015**: SQL injection prevention              | Parameterized queries only | Code review                | Must Have | SAST scanning       | PRD §11.3                 |

**Traceability:**

- PRD-BMA-2026.md §11.3 (Security requirements)
- Phase-6-POLISH-LAUNCH.md §6.4.3 (Input validation)

---

### 4.5 Payment Security

| Requirement                                     | Target                  | Measurement               | Priority  | Verification Method | Source                        |
| ----------------------------------------------- | ----------------------- | ------------------------- | --------- | ------------------- | ----------------------------- |
| **NFR-SEC-016**: Webhook signature verification | 100% of webhooks        | HMAC SHA256 validation    | Must Have | Webhook testing     | PRD §6.3, API-DESIGN.md §8    |
| **NFR-SEC-017**: Client callback never trusted  | Zero trust              | Code review               | Must Have | Payment flow audit  | PRD §6.3 (Async-first design) |
| **NFR-SEC-018**: Idempotent payment processing  | Duplicate prevention    | Database transaction test | Must Have | Integration testing | PRD §6.3, API-DESIGN.md §8    |
| **NFR-SEC-019**: Payment audit trail            | All transactions logged | Audit log review          | Must Have | Database query      | PRD §6.3                      |

**Traceability:**

- PRD-BMA-2026.md §6.3 (Payment technical requirements)
- API-DESIGN.md §8 (Webhook verification)

---

### 4.6 Rate Limiting

| Requirement                                        | Target                        | Measurement              | Priority    | Verification Method  | Source                        |
| -------------------------------------------------- | ----------------------------- | ------------------------ | ----------- | -------------------- | ----------------------------- |
| **NFR-SEC-020**: Auth endpoints rate limit         | 10 requests/min per IP        | Rate limit headers       | Must Have   | Load testing         | API-DESIGN.md §7.1            |
| **NFR-SEC-021**: Profile updates rate limit        | 30 requests/min per user      | Rate limit headers       | Must Have   | Load testing         | API-DESIGN.md §7.1            |
| **NFR-SEC-022**: Content list rate limit           | 100 requests/min per user     | Rate limit headers       | Should Have | Load testing         | API-DESIGN.md §7.1            |
| **NFR-SEC-023**: Comment create rate limit         | 20 requests/min per user      | Rate limit headers       | Must Have   | Load testing         | API-DESIGN.md §7.1            |
| **NFR-SEC-024**: Like toggle rate limit            | 60 requests/min per user      | Rate limit headers       | Should Have | Load testing         | API-DESIGN.md §7.1            |
| **NFR-SEC-025**: Chatbot message rate limit        | 5/day (free) or 30/day (paid) | Database + cache check   | Must Have   | Integration testing  | PRD §7.2, API-DESIGN.md §7.1  |
| **NFR-SEC-026**: Admin endpoints rate limit        | 100 requests/min per user     | Rate limit headers       | Should Have | Load testing         | API-DESIGN.md §7.1            |
| **NFR-SEC-027**: Edge Functions default rate limit | 100 requests/min per user     | Rate limit headers       | Should Have | Configuration review | Clarification (user provided) |
| **NFR-SEC-028**: Rate limit response headers       | X-RateLimit-\* headers        | HTTP response inspection | Should Have | API testing          | API-DESIGN.md §7.2            |

**Traceability:**

- API-DESIGN.md §7 (Rate limiting)
- PRD-BMA-2026.md §7.2 (Chatbot access rules)

---

### 4.7 OWASP Top 10 Compliance

| Requirement                                      | Target               | Measurement                         | Priority  | Verification Method     | Source    |
| ------------------------------------------------ | -------------------- | ----------------------------------- | --------- | ----------------------- | --------- |
| **NFR-SEC-029**: No A01 (Broken Access Control)  | Zero vulnerabilities | Security audit, penetration testing | Must Have | OWASP testing checklist | PRD §11.3 |
| **NFR-SEC-030**: No A02 (Cryptographic Failures) | Zero vulnerabilities | Crypto audit                        | Must Have | Security audit          | PRD §11.3 |
| **NFR-SEC-031**: No A03 (Injection)              | Zero vulnerabilities | SAST, penetration testing           | Must Have | Security audit          | PRD §11.3 |
| **NFR-SEC-032**: CSRF protection                 | Built into Supabase  | Framework validation                | Must Have | Documentation review    | PRD §11.3 |

**Traceability:**

- PRD-BMA-2026.md §11.3 (Security requirements)

---

## 5. Availability

### 5.1 Uptime

| Requirement                                      | Target     | Measurement               | Priority  | Verification Method                            | Source                        |
| ------------------------------------------------ | ---------- | ------------------------- | --------- | ---------------------------------------------- | ----------------------------- |
| **NFR-AVAIL-001**: System uptime (web + mobile)  | 99.5%      | Monthly uptime percentage | Must Have | Uptime monitoring (UptimeRobot, Better Uptime) | PRD §11.4, Clarification      |
| **NFR-AVAIL-002**: Acceptable downtime per month | ~3.6 hours | Calculated from 99.5%     | Must Have | Monitoring dashboard                           | PRD §11.4                     |
| **NFR-AVAIL-003**: Planned maintenance included  | Yes        | Scheduled downtime        | Must Have | Maintenance schedule                           | Clarification (user provided) |

**Notes:**

- 99.5% = 43 minutes downtime per week OR 3 hours 36 minutes per month
- Applies to both web and mobile platforms
- Includes planned maintenance windows

**Traceability:**

- PRD-BMA-2026.md §11.4 (Reliability section)
- User clarification (uptime target applies to web + mobile)

---

### 5.2 Backup & Recovery

| Requirement                                      | Target          | Measurement              | Priority    | Verification Method         | Source    |
| ------------------------------------------------ | --------------- | ------------------------ | ----------- | --------------------------- | --------- |
| **NFR-AVAIL-004**: Automated database backups    | Daily           | Backup frequency         | Must Have   | Supabase backup logs        | PRD §11.4 |
| **NFR-AVAIL-005**: Backup retention              | 30 days minimum | Backup age               | Should Have | Backup configuration review | PRD §11.4 |
| **NFR-AVAIL-006**: Point-in-time recovery (PITR) | Available       | Supabase feature enabled | Should Have | Configuration review        | PRD §11.4 |

**Traceability:**

- PRD-BMA-2026.md §11.4 (Reliability - Automated backups)

---

### 5.3 Monitoring & Alerting

| Requirement                                           | Target                        | Measurement                | Priority    | Verification Method     | Source                           |
| ----------------------------------------------------- | ----------------------------- | -------------------------- | ----------- | ----------------------- | -------------------------------- |
| **NFR-AVAIL-007**: Frontend error monitoring (Sentry) | 100% error capture            | Error tracking enabled     | Must Have   | Sentry dashboard        | PRD §11.4, Phase-6 §6.8          |
| **NFR-AVAIL-008**: Backend error monitoring           | 100% error capture            | Edge Function logs         | Must Have   | Supabase logs           | OBSERVABILITY §3                 |
| **NFR-AVAIL-009**: Structured logging                 | JSON format, 5 log levels     | Log format validation      | Must Have   | Supabase logs           | OBSERVABILITY §3.1               |
| **NFR-AVAIL-010**: Request tracing                    | Trace ID, span ID, request ID | Log context inspection     | Should Have | Supabase logs           | OBSERVABILITY §3.1.3             |
| **NFR-AVAIL-011**: Health check endpoints             | Available, < 1s response      | HTTP 200 response          | Must Have   | Endpoint testing        | PRD §11.4, OBSERVABILITY §4.1    |
| **NFR-AVAIL-012**: Uptime monitoring                  | 5-minute checks               | UptimeRobot active         | Must Have   | UptimeRobot dashboard   | Phase-6 §6.8.3                   |
| **NFR-AVAIL-013**: Alert on website down              | < 2 minutes detection         | Monitoring alert triggered | Must Have   | Alert testing           | Phase-6 §6.8.4, OBSERVABILITY §5 |
| **NFR-AVAIL-014**: Alert on high error rate (> 5%)    | < 5 minutes detection         | Monitoring alert triggered | Must Have   | Alert testing           | Phase-6 §6.8.4                   |
| **NFR-AVAIL-015**: Alert on API response time (> 3s)  | < 10 minutes detection        | Monitoring alert triggered | Should Have | Alert testing           | Phase-6 §6.8.4                   |
| **NFR-AVAIL-016**: Alert on payment webhook failure   | Immediate                     | Monitoring alert triggered | Must Have   | Alert testing           | OBSERVABILITY §5.1               |
| **NFR-AVAIL-017**: Error context capture              | User ID, session, request ID  | Sentry event inspection    | Must Have   | Sentry dashboard        | OBSERVABILITY §2.1               |
| **NFR-AVAIL-018**: Source map uploads                 | Every production build        | Stack traces resolved      | Must Have   | Sentry release tracking | OBSERVABILITY §2.1.3             |
| **NFR-AVAIL-019**: Performance monitoring (APM)       | 20% transaction sampling      | Sentry Performance enabled | Should Have | Sentry Performance      | OBSERVABILITY §2.2               |
| **NFR-AVAIL-020**: Incident response runbook          | Documented procedures         | Runbook completeness       | Must Have   | Manual review           | Phase-6 §6.8.6, OBSERVABILITY §6 |

**Traceability:**

- PRD-BMA-2026.md §11.4 (Reliability - Error monitoring, health checks)
- Phase-6-POLISH-LAUNCH.md §6.8 (Monitoring setup)
- OBSERVABILITY-IMPLEMENTATION.md (Complete observability strategy)

---

### 5.4 Graceful Degradation

| Requirement                                           | Target                     | Measurement                | Priority    | Verification Method     | Source    |
| ----------------------------------------------------- | -------------------------- | -------------------------- | ----------- | ----------------------- | --------- |
| **NFR-AVAIL-021**: Offline-Lite mode (read-only)      | Cached content accessible  | Network disconnection test | Should Have | Offline testing         | PRD §5.6  |
| **NFR-AVAIL-022**: Offline banner notification        | Visible when offline       | UI testing                 | Should Have | Manual testing          | PRD §5.6  |
| **NFR-AVAIL-023**: Graceful external service failures | Error messages, no crashes | Failure simulation         | Should Have | Fault injection testing | PRD §11.4 |

**Traceability:**

- PRD-BMA-2026.md §5.6 (Offline-Lite mode)
- PRD-BMA-2026.md §11.4 (Graceful degradation)

---

## 6. Accessibility

### 6.1 WCAG 2.1 AA Compliance

| Requirement                                               | Target       | Measurement                | Priority     | Verification Method                | Source                             |
| --------------------------------------------------------- | ------------ | -------------------------- | ------------ | ---------------------------------- | ---------------------------------- |
| **NFR-ACCESS-001**: WCAG 2.1 AA compliance (public pages) | Level AA     | Automated + manual testing | Must Have    | Lighthouse, axe-core, manual audit | Phase-6 §6.3                       |
| **NFR-ACCESS-002**: Admin dashboard accessibility         | Not required | N/A                        | Nice to Have | N/A                                | Clarification (public-facing only) |

**Notes:**

- Accessibility requirements apply to public-facing pages only
- Admin dashboard accessibility is nice to have but not required

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.3 (Accessibility audit)
- User clarification (public-facing pages only)

---

### 6.2 Keyboard Navigation (Priority)

| Requirement                                                      | Target                   | Measurement         | Priority    | Verification Method        | Source                        |
| ---------------------------------------------------------------- | ------------------------ | ------------------- | ----------- | -------------------------- | ----------------------------- |
| **NFR-ACCESS-003**: All interactive elements keyboard accessible | 100%                     | Tab navigation test | Must Have   | Manual keyboard testing    | Phase-6 §6.3.2, Clarification |
| **NFR-ACCESS-004**: Logical focus order                          | Linear, intuitive        | Tab order test      | Must Have   | Manual testing             | Phase-6 §6.3.4                |
| **NFR-ACCESS-005**: Focus indicators visible                     | 2px minimum outline      | Visual inspection   | Must Have   | Automated + manual testing | Phase-6 §6.3.2                |
| **NFR-ACCESS-006**: Skip links present                           | Available on all pages   | Keyboard testing    | Should Have | Manual testing             | Phase-6 §6.3 (checklist)      |
| **NFR-ACCESS-007**: Modal focus management                       | Auto-focus, return focus | Keyboard testing    | Must Have   | Manual testing             | Phase-6 §6.3.4                |

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.3.2 (Keyboard navigation)
- Phase-6-POLISH-LAUNCH.md §6.3.4 (Focus management)
- User clarification (keyboard navigation as priority)

---

### 6.3 Color Contrast (Priority)

| Requirement                                      | Target                 | Measurement           | Priority  | Verification Method  | Source                        |
| ------------------------------------------------ | ---------------------- | --------------------- | --------- | -------------------- | ----------------------------- |
| **NFR-ACCESS-008**: Normal text contrast ratio   | ≥ 4.5:1                | WCAG contrast checker | Must Have | Lighthouse, axe-core | Phase-6 §6.3.3, Clarification |
| **NFR-ACCESS-009**: Large text contrast ratio    | ≥ 3:1                  | WCAG contrast checker | Must Have | Lighthouse, axe-core | Phase-6 §6.3.3                |
| **NFR-ACCESS-010**: Interactive element contrast | ≥ 3:1                  | WCAG contrast checker | Must Have | Lighthouse, axe-core | Phase-6 §6.3.3                |
| **NFR-ACCESS-011**: Color not sole indicator     | Additional cue present | Manual review         | Must Have | Design review        | Phase-6 §6.3 (checklist)      |

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.3.3 (Color contrast check)
- User clarification (color contrast as priority)

---

### 6.4 Screen Reader Support

| Requirement                                         | Target                      | Measurement           | Priority    | Verification Method       | Source                   |
| --------------------------------------------------- | --------------------------- | --------------------- | ----------- | ------------------------- | ------------------------ |
| **NFR-ACCESS-012**: All images have alt text        | 100%                        | Automated testing     | Must Have   | Lighthouse, manual review | Phase-6 §6.3 (checklist) |
| **NFR-ACCESS-013**: Form inputs have labels         | 100%                        | Automated testing     | Must Have   | Lighthouse, axe-core      | Phase-6 §6.3 (checklist) |
| **NFR-ACCESS-014**: Buttons have accessible names   | 100%                        | Screen reader testing | Must Have   | Manual testing            | Phase-6 §6.3.1           |
| **NFR-ACCESS-015**: ARIA labels for dynamic content | Where needed                | Screen reader testing | Should Have | Manual testing            | Phase-6 §6.3.1           |
| **NFR-ACCESS-016**: Error messages accessible       | Announced to screen readers | Screen reader testing | Must Have   | Manual testing            | Phase-6 §6.3 (checklist) |

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.3.1 (Screen reader testing)
- Phase-6-POLISH-LAUNCH.md §6.3 (Accessibility checklist)

---

## 7. Usability

### 7.1 Bilingual Support (i18n)

| Requirement                                       | Target                        | Measurement              | Priority    | Verification Method    | Source   |
| ------------------------------------------------- | ----------------------------- | ------------------------ | ----------- | ---------------------- | -------- |
| **NFR-USE-001**: Full English and Mizo UI support | 100% of UI strings            | Translation completeness | Must Have   | Translation file audit | PRD §3   |
| **NFR-USE-002**: Language toggle accessible       | All screens                   | Manual testing           | Must Have   | UI testing             | PRD §3.2 |
| **NFR-USE-003**: Language preference persisted    | Local + profile storage       | Testing                  | Must Have   | Integration testing    | PRD §3.2 |
| **NFR-USE-004**: Device language auto-detection   | Default to device language    | Testing                  | Should Have | Device testing         | PRD §3.2 |
| **NFR-USE-005**: Content dual-language support    | English + Mizo entries        | Content creation testing | Must Have   | CMS testing            | PRD §3.2 |
| **NFR-USE-006**: Chatbot bilingual support        | Language detection + response | Chatbot testing          | Must Have   | Integration testing    | PRD §3.2 |

**Traceability:**

- PRD-BMA-2026.md §3 (Internationalization)

---

### 7.2 Offline Support

| Requirement                                        | Target               | Measurement                | Priority    | Verification Method    | Source   |
| -------------------------------------------------- | -------------------- | -------------------------- | ----------- | ---------------------- | -------- |
| **NFR-USE-007**: Offline-Lite read-only access     | Last 20 viewed items | Network disconnection test | Should Have | Offline testing        | PRD §5.6 |
| **NFR-USE-008**: Stale-while-revalidate pattern    | Background refresh   | Network testing            | Should Have | Cache behavior testing | PRD §5.6 |
| **NFR-USE-009**: Offline banner notification       | Visible when offline | UI testing                 | Must Have   | Manual testing         | PRD §5.6 |
| **NFR-USE-010**: Write operations disabled offline | Forms disabled       | Offline testing            | Must Have   | Manual testing         | PRD §5.6 |

**Traceability:**

- PRD-BMA-2026.md §5.6 (Offline-Lite mode)

---

### 7.3 User Experience

| Requirement                                   | Target                     | Measurement | Priority  | Verification Method | Source       |
| --------------------------------------------- | -------------------------- | ----------- | --------- | ------------------- | ------------ |
| **NFR-USE-011**: Loading indicators           | All async operations       | UI testing  | Must Have | Manual testing      | Phase-6 §6.2 |
| **NFR-USE-012**: Error messages user-friendly | Clear, actionable          | UX review   | Must Have | User testing        | PRD §11.5    |
| **NFR-USE-013**: Success feedback             | All state-changing actions | UI testing  | Must Have | Manual testing      | Phase-6 §6.2 |

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.2 (Performance & UX)
- PRD-BMA-2026.md §11.5 (Compliance - Clear communication)

---

## 8. Compatibility

### 8.1 Browser Support (Web)

| Requirement                                  | Target                                            | Measurement                | Priority     | Verification Method                 | Source   |
| -------------------------------------------- | ------------------------------------------------- | -------------------------- | ------------ | ----------------------------------- | -------- |
| **NFR-COMPAT-001**: Chrome support           | Last 2 versions as of deployment                  | Manual + automated testing | Must Have    | BrowserStack, cross-browser testing | PRD §2.2 |
| **NFR-COMPAT-002**: Firefox support          | Last 2 versions as of deployment                  | Manual + automated testing | Must Have    | BrowserStack, cross-browser testing | PRD §2.2 |
| **NFR-COMPAT-003**: Safari support           | Last 2 versions as of deployment                  | Manual + automated testing | Must Have    | BrowserStack, cross-browser testing | PRD §2.2 |
| **NFR-COMPAT-004**: Edge support             | Last 2 versions as of deployment (Chromium-based) | Manual + automated testing | Must Have    | BrowserStack, cross-browser testing | PRD §2.2 |
| **NFR-COMPAT-005**: Mobile Safari support    | iOS 15+                                           | Device testing             | Must Have    | Physical devices, BrowserStack      | PRD §2.2 |
| **NFR-COMPAT-006**: Chrome Mobile support    | Android 8+                                        | Device testing             | Must Have    | Physical devices, BrowserStack      | PRD §2.2 |
| **NFR-COMPAT-007**: Samsung Internet support | Current + previous version                        | Device testing             | Should Have  | Physical devices                    | PRD §2.2 |
| **NFR-COMPAT-008**: UC Browser support       | Best effort                                       | Device testing             | Nice to Have | Physical devices                    | PRD §2.2 |
| **NFR-COMPAT-009**: IE11 support             | Not supported                                     | N/A                        | N/A          | N/A                                 | PRD §2.2 |

**Notes:**

- "Last 2 versions" is relative to deployment date, not fixed versions
- Focus on browsers popular in India

**Traceability:**

- PRD-BMA-2026.md §2.2 (Browser support)
- User clarification (last 2 versions as of deployment date)

---

### 8.2 Mobile Platform Support

| Requirement                                 | Target                     | Measurement              | Priority     | Verification Method    | Source   |
| ------------------------------------------- | -------------------------- | ------------------------ | ------------ | ---------------------- | -------- |
| **NFR-COMPAT-010**: iOS minimum version     | iOS 14+                    | App Store configuration  | Must Have    | Device testing         | PRD §2.3 |
| **NFR-COMPAT-011**: iOS device support      | iPhone 8 and newer         | Device testing           | Must Have    | Physical devices       | PRD §2.3 |
| **NFR-COMPAT-012**: iPad support            | Responsive (not optimized) | Device testing           | Should Have  | iPad testing           | PRD §2.3 |
| **NFR-COMPAT-013**: Android minimum version | Android 8.0 (Oreo, API 26) | Play Store configuration | Must Have    | Device testing         | PRD §2.3 |
| **NFR-COMPAT-014**: Android tablet support  | Responsive (not optimized) | Device testing           | Should Have  | Tablet testing         | PRD §2.3 |
| **NFR-COMPAT-015**: Android Go support      | Best effort                | Device testing           | Nice to Have | Low-end device testing | PRD §2.3 |

**Traceability:**

- PRD-BMA-2026.md §2.3 (Device & platform requirements)

---

### 8.3 Device Performance Targets

| Requirement                                              | Target                      | Measurement          | Priority    | Verification Method      | Source   |
| -------------------------------------------------------- | --------------------------- | -------------------- | ----------- | ------------------------ | -------- |
| **NFR-COMPAT-016**: Entry-level device support (2GB RAM) | Functional, acceptable lag  | Device testing       | Must Have   | Low-end device testing   | PRD §2.3 |
| **NFR-COMPAT-017**: Mid-range device support (4GB RAM)   | Smooth performance          | Device testing       | Must Have   | Mid-range device testing | PRD §2.3 |
| **NFR-COMPAT-018**: High-end device support (6GB+ RAM)   | Optimal performance         | Device testing       | Should Have | Flagship device testing  | PRD §2.3 |
| **NFR-COMPAT-019**: Low-memory device optimizations      | Reduced animations, caching | Code review, testing | Should Have | Low-end device testing   | PRD §2.3 |

**Traceability:**

- PRD-BMA-2026.md §2.3 (Device performance targets)

---

### 8.4 Screen Size Support

| Requirement                                      | Target               | Measurement        | Priority  | Verification Method              | Source         |
| ------------------------------------------------ | -------------------- | ------------------ | --------- | -------------------------------- | -------------- |
| **NFR-COMPAT-020**: Minimum screen width support | 320px (small phones) | Responsive testing | Must Have | Device testing, browser DevTools | PRD §2.3, §2.4 |
| **NFR-COMPAT-021**: Mobile breakpoint            | 320px - 767px        | Responsive testing | Must Have | Responsive testing               | PRD §2.4       |
| **NFR-COMPAT-022**: Tablet breakpoint            | 768px - 1023px       | Responsive testing | Must Have | Responsive testing               | PRD §2.4       |
| **NFR-COMPAT-023**: Desktop breakpoint           | 1024px+              | Responsive testing | Must Have | Responsive testing               | PRD §2.4       |

**Traceability:**

- PRD-BMA-2026.md §2.3 (Screen sizes)
- PRD-BMA-2026.md §2.4 (Responsive breakpoints)

---

### 8.5 Progressive Web App (PWA)

| Requirement                                    | Target                     | Measurement          | Priority    | Verification Method        | Source   |
| ---------------------------------------------- | -------------------------- | -------------------- | ----------- | -------------------------- | -------- |
| **NFR-COMPAT-024**: PWA installability         | Installable on Android/iOS | Lighthouse PWA audit | Should Have | Lighthouse, manual testing | PRD §2.2 |
| **NFR-COMPAT-025**: Service worker for offline | Service worker registered  | DevTools inspection  | Should Have | Service worker testing     | PRD §2.2 |
| **NFR-COMPAT-026**: Add to home screen support | Manifest configured        | Lighthouse audit     | Should Have | Lighthouse, manual testing | PRD §2.2 |

**Traceability:**

- PRD-BMA-2026.md §2.2 (Progressive Web App)

---

## 9. Maintainability

### 9.1 Code Quality

| Requirement                                     | Target           | Measurement      | Priority    | Verification Method    | Source    |
| ----------------------------------------------- | ---------------- | ---------------- | ----------- | ---------------------- | --------- |
| **NFR-MAINT-001**: ESLint compliance            | Zero errors      | ESLint execution | Must Have   | Pre-commit hooks, CI   | CI-CD §2  |
| **NFR-MAINT-002**: Prettier formatting          | 100% formatted   | Prettier check   | Must Have   | Pre-commit hooks, CI   | CI-CD §2  |
| **NFR-MAINT-003**: TypeScript strict mode       | Enabled          | tsconfig.json    | Must Have   | TypeScript compilation | PRD §12.2 |
| **NFR-MAINT-004**: No unused variables          | Zero warnings    | ESLint execution | Should Have | CI                     | CI-CD §2  |
| **NFR-MAINT-005**: No console.log in production | Zero occurrences | ESLint rule      | Should Have | Code review, CI        | CI-CD §2  |

**Traceability:**

- CI-CD-IMPLEMENTATION-PLAN.md §2 (Lint & type check)

---

### 9.2 Test Coverage

| Requirement                                              | Target | Measurement          | Priority  | Verification Method | Source                         |
| -------------------------------------------------------- | ------ | -------------------- | --------- | ------------------- | ------------------------------ |
| **NFR-MAINT-006**: Overall test coverage                 | 80%+   | Jest coverage report | Must Have | Codecov             | TESTING-PLAN §2, Phase-6 §6.1  |
| **NFR-MAINT-007**: Critical path coverage (auth)         | 95%+   | Jest coverage report | Must Have | Codecov             | TESTING-PLAN §2, Clarification |
| **NFR-MAINT-008**: Critical path coverage (payment)      | 95%+   | Jest coverage report | Must Have | Codecov             | TESTING-PLAN §2, Clarification |
| **NFR-MAINT-009**: Critical path coverage (membership)   | 95%+   | Jest coverage report | Must Have | Codecov             | TESTING-PLAN §2, Clarification |
| **NFR-MAINT-010**: Critical path coverage (content CRUD) | 95%+   | Jest coverage report | Must Have | Codecov             | Clarification                  |
| **NFR-MAINT-011**: Unit tests passing                    | 100%   | CI status            | Must Have | GitHub Actions      | TESTING-PLAN §5                |
| **NFR-MAINT-012**: Integration tests passing             | 100%   | CI status            | Must Have | GitHub Actions      | TESTING-PLAN §5                |
| **NFR-MAINT-013**: E2E tests passing                     | 100%   | CI status            | Must Have | GitHub Actions      | TESTING-PLAN §5                |

**Traceability:**

- TESTING-IMPLEMENTATION-PLAN.md §2 (Testing pyramid)
- Phase-6-POLISH-LAUNCH.md §6.1 (Comprehensive testing)
- User clarification (critical paths = auth, payment, content CRUD, membership)

---

### 9.3 Documentation

| Requirement                                      | Target                        | Measurement                 | Priority    | Verification Method  | Source             |
| ------------------------------------------------ | ----------------------------- | --------------------------- | ----------- | -------------------- | ------------------ |
| **NFR-MAINT-014**: All API endpoints documented  | 100%                          | API documentation review    | Must Have   | Documentation audit  | Clarification      |
| **NFR-MAINT-015**: All Edge Functions documented | 100%                          | Code comments, README       | Must Have   | Documentation review | Clarification      |
| **NFR-MAINT-016**: Database schema documented    | Up-to-date                    | Schema documentation review | Must Have   | Documentation review | DATABASE-SCHEMA.md |
| **NFR-MAINT-017**: Component usage examples      | All design system components  | Storybook or docs           | Should Have | Documentation review | Clarification      |
| **NFR-MAINT-018**: README completeness           | Setup, run, test instructions | README review               | Must Have   | Documentation review | Clarification      |

**Traceability:**

- User clarification (documentation requirements)
- DATABASE-SCHEMA.md (Schema documentation exists)

---

### 9.4 Code Complexity

| Requirement                                | Target                     | Measurement                | Priority     | Verification Method | Source        |
| ------------------------------------------ | -------------------------- | -------------------------- | ------------ | ------------------- | ------------- |
| **NFR-MAINT-019**: Maximum function length | 100 lines                  | ESLint rule                | Should Have  | ESLint, code review | Clarification |
| **NFR-MAINT-020**: Cyclomatic complexity   | < 10 per function          | ESLint complexity rule     | Should Have  | ESLint              | Clarification |
| **NFR-MAINT-021**: Maximum file length     | 500 lines                  | ESLint rule (optional)     | Nice to Have | Code review         | Clarification |
| **NFR-MAINT-022**: DRY principle           | No duplicated logic blocks | SonarQube or manual review | Should Have  | Code review         | Clarification |

**Traceability:**

- User clarification (code complexity metrics)

---

### 9.5 Dependency Management

| Requirement                                        | Target         | Measurement           | Priority    | Verification Method | Source   |
| -------------------------------------------------- | -------------- | --------------------- | ----------- | ------------------- | -------- |
| **NFR-MAINT-023**: Security vulnerability scanning | Weekly         | Dependabot, npm audit | Must Have   | GitHub Dependabot   | CI-CD §4 |
| **NFR-MAINT-024**: Dependency updates              | Monthly review | Dependabot PRs        | Should Have | PR review           | CI-CD §4 |
| **NFR-MAINT-025**: No unused dependencies          | Zero unused    | depcheck              | Should Have | CI                  | CI-CD §2 |

**Traceability:**

- CI-CD-IMPLEMENTATION-PLAN.md §4 (Environment configuration)

---

### 9.6 Git & Version Control

| Requirement                                        | Target             | Measurement       | Priority    | Verification Method  | Source   |
| -------------------------------------------------- | ------------------ | ----------------- | ----------- | -------------------- | -------- |
| **NFR-MAINT-026**: Commit message convention       | Consistent format  | Git history audit | Should Have | Pre-commit hooks     | CI-CD §1 |
| **NFR-MAINT-027**: Branch protection rules         | Enabled on main    | GitHub settings   | Must Have   | GitHub configuration | CI-CD §2 |
| **NFR-MAINT-028**: PR reviews required             | 1 reviewer minimum | GitHub settings   | Must Have   | GitHub configuration | CI-CD §2 |
| **NFR-MAINT-029**: CI checks required before merge | All checks pass    | GitHub settings   | Must Have   | GitHub configuration | CI-CD §2 |

**Traceability:**

- CI-CD-IMPLEMENTATION-PLAN.md §1 (Pre-commit hooks)
- CI-CD-IMPLEMENTATION-PLAN.md §2 (Branch protection)

---

## 10. Compliance

### 10.1 Data Privacy

| Requirement                                        | Target                        | Measurement      | Priority     | Verification Method | Source    |
| -------------------------------------------------- | ----------------------------- | ---------------- | ------------ | ------------------- | --------- |
| **NFR-COMP-001**: Privacy policy published         | Publicly accessible           | URL verification | Must Have    | Manual verification | PRD §11.5 |
| **NFR-COMP-002**: Terms of service published       | Publicly accessible           | URL verification | Must Have    | Manual verification | PRD §11.5 |
| **NFR-COMP-003**: Explicit data collection consent | User consent flow             | Manual testing   | Must Have    | User flow testing   | PRD §11.5 |
| **NFR-COMP-004**: Data minimization                | Only necessary data collected | Data audit       | Should Have  | Privacy audit       | PRD §11.5 |
| **NFR-COMP-005**: GDPR-ready (if needed)           | Compliance framework          | Legal review     | Nice to Have | Legal consultation  | PRD §11.5 |

**Traceability:**

- PRD-BMA-2026.md §11.5 (Compliance)

---

### 10.2 App Store Guidelines

| Requirement                                               | Target                | Measurement           | Priority  | Verification Method | Source             |
| --------------------------------------------------------- | --------------------- | --------------------- | --------- | ------------------- | ------------------ |
| **NFR-COMP-006**: Apple App Store guidelines compliance   | 100%                  | App Review submission | Must Have | App Store review    | Phase-6 §6.6       |
| **NFR-COMP-007**: Google Play Store guidelines compliance | 100%                  | Play Store submission | Must Have | Play Store review   | Phase-6 §6.7       |
| **NFR-COMP-008**: Age rating completion                   | Appropriate rating    | Store listing         | Must Have | Manual verification | Phase-6 §6.6, §6.7 |
| **NFR-COMP-009**: Content rating completion               | Appropriate rating    | Store listing         | Must Have | Manual verification | Phase-6 §6.7       |
| **NFR-COMP-010**: Data safety form completion (Android)   | Complete and accurate | Play Console          | Must Have | Manual verification | Phase-6 §6.7       |

**Traceability:**

- Phase-6-POLISH-LAUNCH.md §6.6 (iOS deployment)
- Phase-6-POLISH-LAUNCH.md §6.7 (Android deployment)

---

### 10.3 Chatbot Compliance

| Requirement                                       | Target                 | Measurement     | Priority  | Verification Method | Source   |
| ------------------------------------------------- | ---------------------- | --------------- | --------- | ------------------- | -------- |
| **NFR-COMP-011**: Chatbot disclaimers displayed   | Before first use       | Manual testing  | Must Have | User flow testing   | PRD §7.5 |
| **NFR-COMP-012**: No emergency service guarantees | Clear disclaimer       | Manual review   | Must Have | Content review      | PRD §7.5 |
| **NFR-COMP-013**: No medical/legal advice         | Safeguards implemented | Chatbot testing | Must Have | Manual testing      | PRD §7.5 |
| **NFR-COMP-014**: Escalation consent              | Explicit user consent  | Manual testing  | Must Have | User flow testing   | PRD §7.5 |

**Traceability:**

- PRD-BMA-2026.md §7.5 (Chatbot safeguards)

---

### 10.4 Payment Compliance

| Requirement                               | Target              | Measurement          | Priority  | Verification Method    | Source                   |
| ----------------------------------------- | ------------------- | -------------------- | --------- | ---------------------- | ------------------------ |
| **NFR-COMP-015**: Razorpay KYC completion | Verified            | Razorpay dashboard   | Must Have | Account verification   | 00-PREREQUISITES.md §7.3 |
| **NFR-COMP-016**: Refund policy published | Publicly accessible | URL verification     | Must Have | Manual verification    | 00-PREREQUISITES.md §6.3 |
| **NFR-COMP-017**: PCI DSS compliance      | Razorpay handles    | Documentation review | Must Have | Razorpay documentation | PRD §6                   |

**Traceability:**

- PRD-BMA-2026.md §6 (Membership & payment flow)
- 00-PREREQUISITES.md §7.3 (Verification requirements)

---

### 10.5 Notification Compliance (WhatsApp Business API)

| Requirement                                               | Target                   | Measurement              | Priority  | Verification Method   | Source    |
| --------------------------------------------------------- | ------------------------ | ------------------------ | --------- | --------------------- | --------- |
| **NFR-COMP-018**: WhatsApp message templates pre-approved | 100% of messages         | Template approval status | Must Have | Gupshup dashboard     | PRD §10.3 |
| **NFR-COMP-019**: Template: Welcome message               | Approved (EN + Mizo)     | Template status          | Must Have | Gupshup dashboard     | PRD §10.3 |
| **NFR-COMP-020**: Template: Payment success               | Approved (EN + Mizo)     | Template status          | Must Have | Gupshup dashboard     | PRD §10.3 |
| **NFR-COMP-021**: Template: Payment failed                | Approved (EN + Mizo)     | Template status          | Must Have | Gupshup dashboard     | PRD §10.3 |
| **NFR-COMP-022**: Template: Membership reminder           | Approved (EN + Mizo)     | Template status          | Must Have | Gupshup dashboard     | PRD §10.3 |
| **NFR-COMP-023**: Template: Membership expired            | Approved (EN + Mizo)     | Template status          | Must Have | Gupshup dashboard     | PRD §10.3 |
| **NFR-COMP-024**: Template: Escalation alert              | Approved (EN + Mizo)     | Template status          | Must Have | Gupshup dashboard     | PRD §10.3 |
| **NFR-COMP-025**: No unapproved message content           | Zero violations          | Code review, testing     | Must Have | Message sending audit | PRD §10.3 |
| **NFR-COMP-026**: WhatsApp Business API compliance        | Gupshup account verified | Account status           | Must Have | Gupshup documentation | PRD §10.1 |

**Notes:**

- All WhatsApp messages must use pre-approved templates (WhatsApp Business API requirement)
- Each template must support both English and Mizo languages
- Template approval required before production launch

**Template List:**

1. `welcome_message` - New user signup
2. `payment_success` - Membership payment successful
3. `payment_failed` - Payment failure notification
4. `membership_reminder` - 30 days and 7 days before expiry
5. `membership_expired` - Membership expiration notice
6. `escalation_alert` - Admin notification for urgent chatbot escalations

**Traceability:**

- PRD-BMA-2026.md §10 (Notifications)
- PRD-BMA-2026.md §10.3 (WhatsApp template messages)

---

## Appendix A: Priority Definitions

### Must Have

**Definition:** Requirements that block launch. The platform cannot go live without meeting these requirements.

**Characteristics:**

- Critical for platform operation
- Required for compliance (legal, store policies)
- Core functionality dependencies
- Security essentials

**Examples:**

- RLS enabled on all tables
- Authentication working correctly
- Payment flow secure and functional
- Accessibility basics (WCAG 2.1 AA for public pages)

---

### Should Have

**Definition:** Important for user experience but not launch-blockers. Can be addressed immediately post-launch if time-constrained.

**Characteristics:**

- Enhances user experience significantly
- Improves performance or reliability
- Reduces operational burden
- Quality of life improvements

**Examples:**

- Advanced caching strategies
- Comprehensive monitoring
- Offline-Lite mode
- Detailed error messages

---

### Nice to Have

**Definition:** Aspirational goals that improve quality but are not essential for successful operation.

**Characteristics:**

- Future enhancements
- Performance optimizations beyond targets
- Advanced features
- Nice-to-have metrics

**Examples:**

- 85%+ WebP/AVIF delivery (aspiration)
- Admin dashboard accessibility
- Advanced analytics
- GDPR compliance (if not required)

---

## Appendix B: Verification Methods

| Method                | Description                                 | Tools                              | When                     |
| --------------------- | ------------------------------------------- | ---------------------------------- | ------------------------ |
| **Automated Testing** | Unit, integration, E2E tests                | Jest, Playwright, Maestro          | Every commit, PR         |
| **Manual Testing**    | Human QA, exploratory testing               | Device testing                     | Pre-release, spot checks |
| **Lighthouse Audit**  | Performance, accessibility, SEO             | Chrome Lighthouse                  | Every build              |
| **Load Testing**      | Concurrent user simulation                  | k6, Artillery                      | Pre-launch, quarterly    |
| **Security Audit**    | Vulnerability scanning, penetration testing | OWASP ZAP, manual audit            | Pre-launch, annually     |
| **Code Review**       | Peer review of code changes                 | GitHub PR reviews                  | Every PR                 |
| **Monitoring**        | Real-time production monitoring             | Sentry, Vercel Analytics, Supabase | Continuous               |
| **BrowserStack**      | Cross-browser compatibility testing         | BrowserStack                       | Pre-release              |
| **Device Testing**    | Physical device testing                     | iPhone, Android devices            | Pre-release              |

---

## Appendix C: Traceability Matrix

### Performance Requirements

| NFR ID                       | Requirement        | Source Document                | Section      |
| ---------------------------- | ------------------ | ------------------------------ | ------------ |
| NFR-PERF-001 to NFR-PERF-003 | Page load time     | PRD-BMA-2026.md, Phase-6       | §11.1, §6.2  |
| NFR-PERF-004 to NFR-PERF-006 | API response time  | PRD-BMA-2026.md, API-DESIGN.md | §11.1, §7    |
| NFR-PERF-010 to NFR-PERF-012 | Bundle size        | Phase-6                        | §6.2.1       |
| NFR-PERF-013 to NFR-PERF-020 | Image optimization | 00-PREREQUISITES.md, Phase-6   | §2.5, §6.2.2 |

### Scalability Requirements

| NFR ID                         | Requirement          | Source Document                     | Section   |
| ------------------------------ | -------------------- | ----------------------------------- | --------- |
| NFR-SCALE-001 to NFR-SCALE-003 | User capacity        | PRD-BMA-2026.md, User clarification | §1        |
| NFR-SCALE-004 to NFR-SCALE-007 | Data growth          | PRD-BMA-2026.md, API-DESIGN.md      | §11.2, §4 |
| NFR-SCALE-008 to NFR-SCALE-009 | Database performance | DATABASE-SCHEMA.md                  | Schema    |

### Security Requirements

| NFR ID                     | Requirement      | Source Document                     | Section      |
| -------------------------- | ---------------- | ----------------------------------- | ------------ |
| NFR-SEC-001 to NFR-SEC-005 | Authentication   | PRD-BMA-2026.md, Phase-6            | §5.2, §6.4.2 |
| NFR-SEC-006 to NFR-SEC-008 | RLS policies     | PRD-BMA-2026.md, DATABASE-SCHEMA.md | §4.3         |
| NFR-SEC-016 to NFR-SEC-019 | Payment security | PRD-BMA-2026.md, API-DESIGN.md      | §6.3, §8     |
| NFR-SEC-020 to NFR-SEC-028 | Rate limiting    | API-DESIGN.md                       | §7           |

### Availability Requirements

| NFR ID                         | Requirement       | Source Document          | Section     |
| ------------------------------ | ----------------- | ------------------------ | ----------- |
| NFR-AVAIL-001 to NFR-AVAIL-003 | Uptime            | PRD-BMA-2026.md          | §11.4       |
| NFR-AVAIL-004 to NFR-AVAIL-006 | Backup & recovery | PRD-BMA-2026.md          | §11.4       |
| NFR-AVAIL-007 to NFR-AVAIL-011 | Monitoring        | PRD-BMA-2026.md, Phase-6 | §11.4, §6.8 |

### Accessibility Requirements

| NFR ID                           | Requirement         | Source Document             | Section        |
| -------------------------------- | ------------------- | --------------------------- | -------------- |
| NFR-ACCESS-001 to NFR-ACCESS-002 | WCAG compliance     | Phase-6, User clarification | §6.3           |
| NFR-ACCESS-003 to NFR-ACCESS-007 | Keyboard navigation | Phase-6, User clarification | §6.3.2, §6.3.4 |
| NFR-ACCESS-008 to NFR-ACCESS-011 | Color contrast      | Phase-6, User clarification | §6.3.3         |
| NFR-ACCESS-012 to NFR-ACCESS-016 | Screen reader       | Phase-6                     | §6.3.1         |

### Usability Requirements

| NFR ID                     | Requirement       | Source Document | Section |
| -------------------------- | ----------------- | --------------- | ------- |
| NFR-USE-001 to NFR-USE-006 | Bilingual support | PRD-BMA-2026.md | §3      |
| NFR-USE-007 to NFR-USE-010 | Offline support   | PRD-BMA-2026.md | §5.6    |

### Compatibility Requirements

| NFR ID                           | Requirement             | Source Document | Section    |
| -------------------------------- | ----------------------- | --------------- | ---------- |
| NFR-COMPAT-001 to NFR-COMPAT-009 | Browser support         | PRD-BMA-2026.md | §2.2       |
| NFR-COMPAT-010 to NFR-COMPAT-015 | Mobile platform support | PRD-BMA-2026.md | §2.3       |
| NFR-COMPAT-016 to NFR-COMPAT-019 | Device performance      | PRD-BMA-2026.md | §2.3       |
| NFR-COMPAT-020 to NFR-COMPAT-023 | Screen size support     | PRD-BMA-2026.md | §2.3, §2.4 |

### Maintainability Requirements

| NFR ID                         | Requirement     | Source Document                         | Section  |
| ------------------------------ | --------------- | --------------------------------------- | -------- |
| NFR-MAINT-001 to NFR-MAINT-005 | Code quality    | CI-CD-IMPLEMENTATION-PLAN.md            | §2       |
| NFR-MAINT-006 to NFR-MAINT-013 | Test coverage   | TESTING-IMPLEMENTATION-PLAN.md, Phase-6 | §2, §6.1 |
| NFR-MAINT-014 to NFR-MAINT-018 | Documentation   | User clarification, DATABASE-SCHEMA.md  | -        |
| NFR-MAINT-019 to NFR-MAINT-022 | Code complexity | User clarification                      | -        |

### Compliance Requirements

| NFR ID                       | Requirement                        | Source Document                      | Section      |
| ---------------------------- | ---------------------------------- | ------------------------------------ | ------------ |
| NFR-COMP-001 to NFR-COMP-005 | Data privacy                       | PRD-BMA-2026.md                      | §11.5        |
| NFR-COMP-006 to NFR-COMP-010 | App Store guidelines               | Phase-6                              | §6.6, §6.7   |
| NFR-COMP-011 to NFR-COMP-014 | Chatbot compliance                 | PRD-BMA-2026.md                      | §7.5         |
| NFR-COMP-015 to NFR-COMP-017 | Payment compliance                 | PRD-BMA-2026.md, 00-PREREQUISITES.md | §6, §7.3     |
| NFR-COMP-018 to NFR-COMP-026 | Notification compliance (WhatsApp) | PRD-BMA-2026.md                      | §10.1, §10.3 |

---

## Document Change Log

| Version | Date       | Author | Changes                       |
| ------- | ---------- | ------ | ----------------------------- |
| 1.0     | 2026-01-13 | AI     | Initial NFR document creation |

---

**End of NFR Requirements Document**
