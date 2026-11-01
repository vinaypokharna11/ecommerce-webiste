# Nakoda Store / ShopEase — Comprehensive Security Audit Report

## 1. Vulnerability Assessment Overview

A comprehensive dependency and code vulnerability audit was conducted before and after the Next.js 16 migration.

### 1.1 Baseline Audit Findings (Prior to Migration)
* **Total Vulnerabilities:** 17 (1 Critical, 6 High, 10 Moderate)
* **Critical Vulnerabilities:**
  - `next` (9.3.4-canary.0 - 16.3.0-preview.10):
    - Next.js self-hosted DoS via Image Optimizer remotePatterns (GHSA-9g9p-9gw9-jx7f)
    - RSC HTTP deserialization DoS (GHSA-h25m-26qc-wcjf)
    - HTTP request smuggling in rewrites (GHSA-ggv3-7p47-pfv8)
    - Unbounded next/image disk cache exhaustion (GHSA-3x4c-7xq6-9pq8)
    - Middleware / Proxy redirect cache poisoning (GHSA-3g8h-86w9-wvmq)
    - Cross-site scripting in App Router using CSP nonces (GHSA-ffhc-5mcf-pf4q)
    - Server Actions DoS and SSRF (GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x)
* **High Severity Vulnerabilities:**
  - `nodemailer` (< 10.3.1): Quadratic time complexity in addressparser, domain allow-list bypass, stack exhaustion via nested structured recipients.
  - `postcss` (<= 8.5.22): XSS via unescaped `</style>` tags, arbitrary `.map` file disclosure via sourceMappingURL traversal.
  - `zod` (< 4.6.6): Memory exhaustion on oversized constrained collections (GHSA-mrhx-c7xc-m3w5).
  - `xlsx` (*): Prototype pollution and regular expression DoS.
  - `brace-expansion` (<= 1.1.20): Quadratic-time expansion DoS.

### 1.2 Post-Migration Audit Results
* **Critical Vulnerabilities Remaining:** **0** (All Next.js critical CVEs completely resolved via upgrade to `next@16.4.3`).
* **High Severity Vulnerabilities Resolved:**
  - `next`: Upgraded to `16.4.3` (Patched).
  - `postcss`: Upgraded to `8.5.32` (Patched).
  - `nodemailer`: Upgraded to `10.3.1` (Patched).
  - `zod`: Upgraded to `4.6.7` (Patched).
* **Residual Unresolved Vulnerabilities:**
  - `xlsx@0.18.5`: Upstream library is discontinued on npm without a published patch. The codebase already includes `exceljs@4.4.0` for safe spreadsheet operations.
  - `brace-expansion` (indirect transitive dependency via glob/archiver): Low real-world reachability in production web request paths.

---

## 2. Authentication & Authorization Security Controls

### 2.1 Route Guarding via Edge Proxy (`src/proxy.js`)
* Validates `admin_token` on all routes matching `/admin/:path*` (excluding `/admin/login`).
* Uses native **Web Crypto API** (`crypto.subtle`) for edge-compatible HMAC SHA-256 signature verification.
* Validates expiration timestamp (`exp * 1000 < Date.now()`) and verified roles (`admin`, `superadmin`, `seller`).
* Deletes invalid cookies upon redirection to prevent token fixation.
* Verified via Playwright automated test: Visiting `/admin` without authentication correctly returns HTTP 307 redirect to `/admin/login`.

### 2.2 Server-Side Data Boundary Authorization
* Verified that sensitive operations in API route handlers (`/api/admin/*`, `/api/products/*`, `/api/categories/*`, `/api/offers/*`) do not rely solely on frontend state.
* Each mutating endpoint executes `verifyAdminAuth(request)` or `verifyCustomerAuth(request)`.
* IDOR prevention: Customer endpoints (e.g. `/api/conversations/[id]`, `/api/orders/[id]/chat`) verify ownership against the authenticated customer or administrative role.

---

## 3. Secret Management & Environment Security

1. **Environment File Audit:**
   - Real `.env` and `.env.local` files are strictly excluded via `.gitignore` (`.env`, `.env.local`, `.env*.local`).
   - Verified that no database credentials, JWT secrets, or SMTP passwords are committed to Git.
2. **Template Sanitization:**
   - Created comprehensive `.env.example` documenting all configuration keys using safe placeholders.
   - Enforced in `src/lib/auth.js` that `JWT_SECRET` must be explicitly configured in production; fallback development keys trigger a runtime fatal error if attempted in `NODE_ENV === 'production'`.

---

## 4. HTTP Security Headers Configured (`next.config.js`)

The following defensive headers are enforced on all routes (`/:path*`):

```http
X-DNS-Prefetch-Control: on
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' blob: data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://www.google.com https://maps.google.com https://*.google.com https://www.openstreetmap.org; frame-ancestors 'none';
```

---

## 5. Input Validation & Injection Defenses
* Input sanitation enforced using Zod schemas (`zod@4.6.7`).
* Database interactions utilize Mongoose parameterized query builders and safe document schemas, preventing SQL/NoSQL injection.
* JSON-LD scripts on product pages escape angle brackets (`JSON.stringify(jsonLd).replace(/</g, '\\u003c')`) preventing script breakout XSS.

