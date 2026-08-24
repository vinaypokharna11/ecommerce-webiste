# ShopEase — Project Architecture

## Folder Structure

```
ecommerce website/
│
├── src/                         ← All source code (Next.js root)
│   │
│   ├── app/                     ← Next.js App Router (MUST stay here)
│   │   ├── page.jsx             Main storefront (Home, Catalog, Offers, Cart, Profile, Contact)
│   │   ├── layout.jsx           Root layout with SEO metadata, fonts, providers
│   │   ├── globals.css          Global styles
│   │   ├── contact/             /contact route page (unified Contact + Inquire)
│   │   ├── admin/               /admin route page
│   │   └── api/                 All API route handlers (Next.js server functions)
│   │       ├── contact/         POST: save contact message, GET: admin list
│   │       ├── inquiries/       POST: save inquiry, GET: admin list
│   │       ├── products/        CRUD for products
│   │       ├── categories/      CRUD for categories
│   │       ├── offers/          CRUD for offers
│   │       ├── orders/          POST: create order
│   │       ├── settings/        GET/PUT: store config
│   │       └── admin/           Admin auth routes
│   │
│   ├── frontend/                ← Frontend layer (UI components, utilities)
│   │   ├── components/          All React UI components (copy of src/components)
│   │   ├── context/             React Context providers (copy of src/context)
│   │   ├── utils/               Helper utilities — whatsapp.js (copy of src/utils)
│   │   └── assets/              Images and static media (copy of src/assets)
│   │
│   ├── backend/                 ← Backend layer (server-side logic)
│   │   ├── db.js                Database access layer — JSON file CRUD operations
│   │   └── email.js             Email / SMTP service using Nodemailer
│   │
│   ├── database/                ← Database layer (data storage)
│   │   ├── db.json              JSON file database (persisted data: orders, messages, inquiries)
│   │   └── mockData.js          Static seed/mock data (products, categories, config)
│   │
│   │   [LEGACY — kept for Next.js import compatibility]
│   ├── components/              Same as frontend/components (original location)
│   ├── context/                 Same as frontend/context (original location)
│   ├── utils/                   Same as frontend/utils (original location)
│   ├── assets/                  Same as frontend/assets (original location)
│   ├── lib/                     Same as backend/ (original location: db.js, email.js)
│   └── data/                    Same as database/ (original location: db.json, mockData.js)
│
├── public/                      ← Static public assets served directly
│   ├── favicon.jpg              ShopEase logo favicon
│   ├── robots.txt               SEO crawler rules
│   └── site.webmanifest         PWA web app manifest
│
├── .env.local                   Environment variables (SMTP, JWT, admin credentials)
├── next.config.js               Next.js configuration (redirects, image domains)
├── tailwind.config.js           Tailwind CSS configuration
├── jsconfig.json                Path aliases (@/ → src/)
└── package.json                 Dependencies
```

## Layer Responsibilities

| Layer | Folder | Purpose |
|-------|--------|---------|
| **Frontend** | `src/frontend/` | UI components, contexts, utilities, assets |
| **Backend** | `src/backend/` | Database access (db.js), email service (email.js) |
| **Database** | `src/database/` | db.json (runtime data), mockData.js (seed data) |
| **Routing** | `src/app/` | Next.js page routes and API handlers |

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.jsx` | Main storefront SPA — manages all tab states |
| `src/components/ContactInquirePage.jsx` | Unified Contact + Inquire dual-mode page |
| `src/components/admin/AdminLayout.jsx` | Admin portal layout with nav |
| `src/lib/db.js` | All database CRUD operations |
| `src/lib/email.js` | Nodemailer email dispatchers |
| `src/data/db.json` | Persisted data: products, orders, messages, inquiries |
| `src/data/mockData.js` | Static config: products, nav items, categories |
| `.env.local` | Credentials: SMTP, JWT, admin login |

## Environment Setup

See `.env.local` for configuration. Required for email:
- `SMTP_USER`: Your Gmail address
- `SMTP_PASS`: Gmail App Password (16-char, no spaces)

## Routes

| URL | Description |
|-----|-------------|
| `/` | Main storefront (Home, Catalog, Offers, Cart, Profile, Contact) |
| `/contact` | Standalone Contact Us & Inquiry page |
| `/contact?tab=inquire` | Opens Contact page in Inquire mode |
| `/contact?tab=inquire&product=prod-1` | Pre-filled product inquiry |
| `/inquire` | Redirects → `/contact?tab=inquire` |
| `/admin` | Admin login redirect |
| `/admin/login` | Admin login page |
| `/api/contact` | Contact messages API |
| `/api/inquiries` | Inquiries API |
| `/api/products` | Products CRUD API |
| `/api/orders` | Orders API |
