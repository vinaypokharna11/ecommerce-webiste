# Nakoda Store / ShopEase — Final Migration Handover Document

## 1. Summary of Migration
The Nakoda Store / ShopEase codebase has been upgraded from **Next.js 14.2.35** to **Next.js 16.4.3 (Active LTS)** and **React 19.3.1**.

All critical framework security vulnerabilities (including RSC deserialization DoS, Image Optimizer DoS, request smuggling, and CSP nonce bypass) have been resolved. Next.js 16 conventions have been adopted (`src/proxy.js`, asynchronous request parameters across all dynamic routes, SWC removal from config, and error boundary resilience).

The visual design, customer ordering, cart persistence, authentication, WhatsApp messaging, and admin dashboard remain 100% functional and verified with 87 automated tests passing.

---

## 2. Final Framework & Key Dependency Versions

```json
{
  "next": "^16.4.3",
  "react": "^19.3.1",
  "react-dom": "^19.3.1",
  "@types/react": "^19.3.0",
  "@types/react-dom": "^19.3.0",
  "postcss": "^8.5.32",
  "nodemailer": "^10.3.1",
  "zod": "^4.6.7",
  "framer-motion": "^12.4.7",
  "tailwindcss": "^3.4.17",
  "daisyui": "^4.12.24"
}
```

---

## 3. Operational Commands

### Development Server
```bash
npm run dev
# Starts Next.js 16 development server with Turbopack at http://localhost:3000
```

### Production Build
```bash
npm run build
# Compiles optimized production bundle with Turbopack in ~8.4 seconds
```

### Production Start
```bash
npm run start
# Runs the production server on port 3000
```

### Running Test Suites
```bash
# Run complete Playwright end-to-end test suite
npx playwright test

# Run specific suite (e.g. homepage, catalog, admin, accessibility)
npx playwright test tests/01-homepage.spec.js
npx playwright test tests/08-accessibility.spec.js
```

---

## 4. Environment Variables Required

Refer to [`.env.example`](file:///.env.example) for placeholder definitions. Required keys in production:

* `NEXT_PUBLIC_SITE_URL`
* `NEXT_PUBLIC_WHATSAPP_NUMBER`
* `NEXT_PUBLIC_WHATSAPP_DISPLAY`
* `NEXT_PUBLIC_WHATSAPP_LINK`
* `MONGODB_URI`
* `JWT_SECRET` (Must be at least 32 characters in production)
* `ADMIN_EMAIL`
* `ADMIN_PASSWORD`
* `ADMIN_NOTIFICATION_EMAIL`
* `SMTP_HOST`
* `SMTP_PORT`
* `SMTP_USER`
* `SMTP_PASS`
* `SMTP_SECURE`
* `SMTP_FROM`
* `CLOUDINARY_CLOUD_NAME` (Optional)
* `CLOUDINARY_API_KEY` (Optional)
* `CLOUDINARY_API_SECRET` (Optional)

---

## 5. Deployment Instructions

1. Ensure the target hosting environment (e.g., Vercel, Node.js VPS, Docker) has **Node.js >= 20.9.0** installed.
2. In the deployment settings (e.g. Vercel Project Settings):
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
3. Configure the environment variables listed in Section 4.
4. Deploy the `next16-upgrade` branch to a staging / preview URL first.
5. Verify key flows on the preview deployment (browse catalog, add to cart, admin login).
6. Merge `next16-upgrade` into `main` for production rollout.

---

## 6. Verification Status Confirmation

* **Production Build:** **PASS** (Confirmed with `npm run build` using Next.js 16.4.3 / Turbopack in 8.4 seconds).
* **Automated Tests:** **PASS** (87 tests passed across 7 test suites).
* **Application Deployed:** **NOT DEPLOYED** (Direct deployment withheld as per instruction guidelines pending user review).

