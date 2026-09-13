# ShopEase — Project Architecture

## Folder Structure

```
ecommerce website/
│
├── src/                         ← All source code (Next.js root)
│   │
│   ├── app/                     ← Next.js App Router
│   │   ├── page.jsx             Main storefront (Home, Catalog, Offers, Cart, Profile, Contact)
│   │   ├── layout.jsx           Root layout with AuthProvider, CatalogProvider, SEO metadata
│   │   ├── globals.css          Global styles
│   │   ├── contact/             /contact route page (unified Contact + Inquire)
│   │   ├── inquire/             /inquire redirect route
│   │   ├── admin/               Protected Admin portal
│   │   │   ├── page.jsx         Admin dashboard wrapper with server auth check
│   │   │   └── login/           Admin login page (no hardcoded credentials)
│   │   └── api/                 Next.js API route handlers
│   │       ├── auth/            Customer authentication (login, signup, me, logout, profile)
│   │       ├── admin/           Admin auth routes (login, auth check, logout)
│   │       ├── contact/         POST (public), GET/PUT/DELETE (admin protected)
│   │       ├── inquiries/       POST (public), GET/PUT/DELETE (admin protected)
│   │       ├── products/        GET (public), POST/PUT/DELETE (admin protected)
│   │       ├── categories/      GET (public), POST/PUT/DELETE (admin protected)
│   │       ├── offers/          GET (public), POST/PUT/DELETE (admin protected)
│   │       ├── orders/          POST (customer checkout), GET (authenticated), PUT (admin)
│   │       ├── settings/        GET (public), PUT (admin protected)
│   │       └── email/test/      SMTP test endpoint
│   │
│   ├── components/              ← Reusable UI Components
│   │   ├── AuthModal.jsx        Checkout & Profile customer login/signup modal
│   │   ├── Navbar.jsx           Customer-only floating navbar (admin button removed)
│   │   ├── HeroSection.jsx      Storefront hero section
│   │   ├── Categories.jsx       Category cards grid
│   │   ├── PopularProducts.jsx  Featured products showcase
│   │   ├── CatalogPage.jsx      Dynamic catalog with filters, search, sorting
│   │   ├── CartPage.jsx         Checkout-triggered auth flow & order placement
│   │   ├── OffersPage.jsx       Promotional coupons & deals
│   │   ├── ProfilePage.jsx      Customer profile, saved addresses & order history
│   │   ├── ContactInquirePage.jsx Unified Contact & Inquiry form
│   │   ├── FloatingCartBar.jsx  Mobile floating cart pill
│   │   ├── QuickViewModal.jsx   Product details modal
│   │   ├── Toast.jsx            Micro-interaction toasts
│   │   ├── Footer.jsx           Store footer
│   │   └── admin/               Admin management interfaces
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProducts.jsx
│   │       ├── AdminCategories.jsx
│   │       ├── AdminOffers.jsx
│   │       ├── AdminInventory.jsx
│   │       ├── AdminInquiries.jsx
│   │       ├── AdminSettings.jsx
│   │       └── AdminLayout.jsx
│   │
│   ├── context/                 ← React State Providers
│   │   ├── AuthContext.jsx      Customer session & checkout modal trigger
│   │   └── CatalogContext.jsx   Products, categories, offers & store config state
│   │
│   ├── models/                  ← MongoDB Mongoose Schemas
│   │   ├── User.js              Customer & Admin accounts
│   │   ├── Product.js           Catalog products
│   │   ├── Category.js          Product categories
│   │   ├── Offer.js             Coupons & discounts
│   │   ├── Order.js             Customer orders
│   │   ├── Inquiry.js           Bulk inquiries
│   │   ├── ContactMessage.js    Customer support messages
│   │   └── StoreConfig.js       Store settings & metadata
│   │
│   ├── lib/                     ← Core Utilities & Backend Logic
│   │   ├── mongodb.js           Cached MongoDB connection manager
│   │   ├── auth.js              JWT authentication & role authorization guards
│   │   ├── db.js                Database CRUD layer (MongoDB + JSON fallback)
│   │   └── email.js             Nodemailer SMTP email service
│   │
│   ├── data/                    ← Seed & Fallback Data
│   │   ├── db.json              Fallback persistent JSON store
│   │   └── mockData.js          Seed data assets & defaults
│   │
│   ├── utils/                   ← Helpers
│   │   └── whatsapp.js          WhatsApp link generators
│   │
│   └── assets/                  ← Images and Static Media
│
├── public/                      ← Static public assets served directly
│   ├── favicon.jpg              Nakoda N logo favicon
│   ├── favicon.svg              Nakoda N logo vector favicon
│   ├── robots.txt               SEO crawler rules
│   └── site.webmanifest         PWA web app manifest
│
├── .env.local                   Environment variables (MONGODB_URI, SMTP, JWT, ADMIN)
├── next.config.js               Next.js configuration
├── tailwind.config.js           Tailwind CSS configuration
├── jsconfig.json                Path aliases (@/ → src/)
└── package.json                 Dependencies (Next.js, React, Mongoose, Nodemailer, etc.)
```

## Security & Access Control

| Role | Access Level | Routes |
|------|--------------|--------|
| **Guest Visitor** | Browse catalog, view products, add to cart, submit inquiries & contact | `/`, `/contact`, `/inquire` |
| **Customer** | Checkout, place orders, view order history, manage addresses & profile | `/`, `/cart`, `/profile`, `/api/auth/*` |
| **Admin** | Manage products, categories, coupons, inventory, orders, settings, inquiries | `/admin`, `/admin/login`, protected `/api/*` |
