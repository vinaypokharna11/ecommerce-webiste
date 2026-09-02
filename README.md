# Nakoda Imitation - E-Commerce Platform

A production-ready e-commerce platform built with Next.js 14, React 18, TailwindCSS, MongoDB / Mongoose, and JWT authentication.

---

## 🔒 Security & Secrets Management (Gitleaks Safety Pass)

### ⚠️ IMPORTANT: Secret Rotation Notice
> **SECURITY WARNING**: If any credentials (such as JWT secret, MongoDB connection strings, admin passwords, or email SMTP passwords) were previously present in local configuration or git history prior to deployment, **they must be rotated immediately**. Never commit `.env` or `.env.local` files to source control.

---

## 🚀 Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Required Server-Side Environment Variables

| Variable | Description | Security Scope |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas / Local connection URI | **Server-Side Only** (Never expose to client) |
| `JWT_SECRET` | 32+ character cryptographic secret for token signing | **Server-Side Only** (Mandatory in production) |
| `ADMIN_EMAIL` | Master administrator login email | **Server-Side Only** |
| `ADMIN_PASSWORD` | Master administrator password | **Server-Side Only** |
| `ADMIN_NOTIFICATION_EMAIL` | Email address to receive store notifications | **Server-Side Only** |
| `SMTP_HOST` | SMTP server host (e.g., `smtp.gmail.com`) | **Server-Side Only** |
| `SMTP_PORT` | SMTP port (`587` for TLS / `465` for SSL) | **Server-Side Only** |
| `SMTP_USER` | SMTP username / Gmail account | **Server-Side Only** |
| `SMTP_PASS` | SMTP application password | **Server-Side Only** |
| `SMTP_FROM` | Outgoing sender display header | **Server-Side Only** |

---

## 🛡️ Security Best Practices Enforced

1. **Zero Client-Side Secret Leakage**: No API keys, database connection strings, or JWT secrets use `NEXT_PUBLIC_` or `REACT_APP_` prefixes.
2. **Password & Token Sanitization**: All database query responses and API responses (`/api/auth/*`, `/api/admin/*`) strictly strip `password` and `passwordHash` before returning data.
3. **HTTP-Only Cookies**: Authentication tokens are stored in `HttpOnly`, `SameSite=Lax`, and `Secure` (production) cookies.
4. **Strict Production Enforcement**: In `production` (`NODE_ENV=production`), missing `JWT_SECRET` or database credentials throws a fatal exception rather than silently falling back to defaults.
5. **No Secret Console Logging**: Server logs, error handlers, and mock transporters never print passwords, keys, or tokens.
