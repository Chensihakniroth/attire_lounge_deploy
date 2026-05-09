---
trigger: model_decision
description: only when you developing my clothing shop store attirelounge "gentlement styling house"
---

# 🧠 Gemini Project Memory

## ⚙️ Development Rules
* Always run `npm run build` after every change — no exceptions.
* Utilize `localStorage` over `sessionStorage` for session persistence across the admin panel to ensure stability.
* Use React Query v5 for local data fetching to prevent global state bottlenecks and UI latency.

## 🏗️ Project Architecture

### Overview
A full-stack web application with a **Laravel (PHP 8.2+)** backend and a **React + TypeScript** frontend. The platform operates as a "Styling House" brand with multi-tenant capabilities, serving an e-commerce platform and a multi-outlet POS system.

### Backend (Laravel 12)
- **Architecture**: Repository + Service pattern for clean separation of concerns.
- **Auth**: Laravel Sanctum for API authentication, Spatie Permission for roles.
- **Multi-Tenant POS**: Supports `attire_lounge`, `caffeine`, and `kravat` outlets. Queries are scoped using traits like `BelongsToOutlet`.
- **Features**: Product management, appointments, gift item stock, gift requests, newsletter subscriptions, image uploads, POS invoicing.
- **Real-time**: Laravel Reverb for WebSockets (stock updates), Telegram Bot notifications.
- **Data Seeding**: Uses JSON exports (e.g., `pos_products.json`, `kravat_products.json`) to populate databases via `DrinkManagerSeeder` and `KravatDrinkSeeder`.

### Frontend (React 18 / TypeScript)
- **State Management & Data**: TanStack React Query v5 (local module queries), Context API (`FavoritesContext`, `AdminContext`, `POSContext`).
- **UI Libraries**: Tailwind CSS 3, Headless UI, Framer Motion, Lucide React, Lenis (smooth scroll).
- **Admin Dashboard**: `admin.tsx` handles isolated UI configurations and layout changes based on the active outlet (e.g., switching logos to "Asset 5.png" for Kravat).
- **Performance**: Quick Access components pre-fetch/cache data to reduce main-thread blocking.

### Frontend Structure (`src/`)

```
src/
├── components/
│   ├── MainApp.jsx              → Top-level app orchestrator
│   ├── common/
│   │   ├── ErrorBoundary.jsx
│   │   ├── GrainOverlay.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── OptimizedImage.jsx   → Lazy loading / compression
│   │   ├── SEO.tsx
│   │   └── Skeleton.jsx
│   ├── layouts/
│   │   ├── Footer.jsx
│   │   └── Navigation.jsx
│   ├── pages/                   → Main application views
│   └── sections/                → Large page sub-sections
├── context/
│   ├── FavoritesContext.tsx
│   ├── AdminContext.tsx         → Admin session & outlet state
│   └── POSContext.tsx           → POS operations & outlet context
├── data/
│   ├── giftOptions.js
│   ├── lookbook.js
│   └── products.js
├── helpers/
│   ├── imageCompression.js
│   └── math.js
├── hooks/
│   ├── useDebounce.js
│   ├── useProducts.ts
│   └── usePullToRefresh.js
├── services/
│   └── railwayService.ts        → Railway platform integration
├── types/
│   ├── context.ts
│   └── index.ts
├── api.js
├── app.jsx
├── bootstrap.js
└── config.js
```

---

## ☁️ MinIO Storage Configuration

| Property | Value |
|----------|-------|
| Endpoint | `bucket-production-4ca0.up.railway.app` |
| Bucket Name | `product-assets` |

## 🔗 URL Construction Pattern

```
https://{endpoint}/{bucket}/{path}/{filename}
```

Full example:

```
https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/example.jpg
```

## 📁 Upload Path Reference
All paths are relative to the bucket root (`product-assets/`).

### General Assets

| Path | Description |
|------|-------------|
| `/uploads/asset/` | Miscellaneous site assets |

### Product Collections

| Path | Description |
|------|-------------|
| `/uploads/collections/accessories/` | Accessories collection items |
| `/uploads/collections/default/` | Legacy/OG collections — first 3 collections added to the site (e.g. `g1`, `hvn1`, `of1`, `mm1`, `vc`, `as1`, etc.) |
| `/uploads/collections/Travel collections/` | Travel collection items (note: space in folder name) |

### Fashion Show — "Shades of Elegance" (Act 1)

| Path | Description |
|------|-------------|
| `/uploads/shades1/` | 📸 Catalog/lookbook photos for Act 1 |
| `/uploads/WALK_1/` | 🎬 Runway walk photos for Act 1 |

### Fashion Show — "Street Sartorial" (Act 2)

| Path | Description |
|------|-------------|
| `/uploads/street1/` | 📸 Catalog/lookbook photos for Act 2 |
| `/uploads/WALK_2/` | 🎬 Runway walk photos for Act 2 |

## 🗂️ Quick Path Cheatsheet

```
product-assets/
├── uploads/
│   ├── asset/                          → General assets
│   ├── collections/
│   │   ├── accessories/                → Accessories collection
│   │   ├── default/                    → OG collections (g1, hvn1, of1, mm1, vc, as1...)
│   │   └── Travel collections/         → Travel collection
│   ├── shades1/                        → Act 1 catalog (Shades of Elegance)
│   ├── street1/                        → Act 2 catalog (Street Sartorial)
│   ├── WALK_1/                         → Act 1 runway (Shades of Elegance)
│   └── WALK_2/                         → Act 2 runway (Street Sartorial)
```



## Gemini Added Memories / Context Evolution
- **Image Extensions**: The Havana (hvn), Mocha Mousse (mm), and Office (of) collections in the Attire Lounge project use `.jpg` image extensions.
- **Branding**: The Attire Lounge project is a "Styling House" brand. All frontend branding and styling reflect this premium positioning.
- **Multi-Tenant POS System**: A comprehensive Point of Sale system built for multiple outlets: `attire_lounge`, `caffeine`, and `kravat`.
  - **Outlet Isolation**: Admin Dashboard and POS interfaces dynamically adapt layouts, branding (e.g., Kravat logo switching), and data queries based on the active outlet context. Users are redirected immediately upon switching outlets to prevent accessing irrelevant modules.
  - **Inventory/POS Products**: Managed via the `PosProduct` model using a `BelongsToOutlet` trait to scope queries. The `PosProductController` dynamically handles outlet scoping and image path storage.
  - **POS Invoicing**: Handled via `POST /api/v1/admin/pos/invoices` and processed by `PosInvoiceController` using payload structures mapping `outlet`, `items`, and `payments`.
- **Admin Dashboard Architecture**: 
  - Session persistence relies on `localStorage` ensuring an uninterrupted re-hydration loop via `/admin/me` and the `AdminContext`.
  - To eliminate UI latency and redundant API calls, module-specific data fetching (like Gift Requests or Out-of-Stock Items) is decoupled from the global context into targeted React Query v5 implementations.
- **Data Seeding Lifecycle**: Products are populated from local database exports into JSON files (like `pos_products.json` and `kravat_products.json`) and run through dedicated Laravel seeders (e.g., `DrinkManagerSeeder` and `KravatDrinkSeeder`) to ensure consistency between development and production databases.
- **WebSockets/Reverb**: Configured for real-time operations, but falls back gracefully. Session and UI state persistence utilizes `localStorage` to handle page reloads robustly.
