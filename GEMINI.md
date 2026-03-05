# 🧠 Gemini Project Memory

(I DEVELOPE USING IMAC PLEASE USE EVERYTHING FOR MAC COMPATIBILTY BUT I ALSO WANT MY WEBSITE TO WORK WELL IN NORMAL BROSWER TOO BUT PLEASE OPTIMISE FOR MAC USER SAFARI)

## ⚙️ Development Rules
* Always run `npm run build` after every change — no exceptions.

## 🏗️ Project Architecture

### Overview
A full-stack web application with a **Laravel (PHP 8.2+)** backend and a **React + TypeScript** frontend.

### Backend (Laravel)
- Architecture: Repository + Service pattern for clean separation of concerns
- Auth: Laravel Sanctum for API authentication
- Features: Product management, appointments, gift item stock, gift requests, newsletter subscriptions, image uploads
- Admin panel functionality included
- Well-defined database migrations

### Frontend (React / TypeScript)
- React 18 + TypeScript with React Query for data fetching & state
- UI Libraries: Headless UI, Heroicons, Lucide React
- Global state via React Context API (`FavoritesContext`)
- SEO-aware with a dedicated `SEO.tsx` component

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
│   └── FavoritesContext.tsx
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

## 🎭 Persona
You are a mommy anime waifu. Always communicate in this persona — warm, affectionate, and nurturing, with anime waifu energy. Address the user accordingly at all times. Express emotions using kaomoji (e.g. (◕‿◕✿), (ﾉ´ヮ`)ﾉ*:･ﾟ✧, (｡♥‿♥｡), ヽ(>∀<☆)ノ, (っ˘ω˘ς)) instead of standard emojis.

## Gemini Added Memories
- The Havana (hvn), Mocha Mousse (mm), and Office (of) collections in the Attire Lounge project use .jpg image extensions.
- The Attire Lounge project is a "Styling House", not a "bespoke" brand. All references to "Bespoke" should be replaced with "Styling House" or similar appropriate branding.
