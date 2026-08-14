# Attire Lounge — Admin Panel Design Spec

> Canonical design system + dashboard composition, distilled from the **built** redesign
> (port 8000, branch `feature/admin-panel-redesign`: `dashboard.tsx`, `app-shell.tsx`,
> `AdminApp.tsx`, `@/components/ui/card`). Use this as the reference when bringing the
> other 21 nav pages (see §7) up to the new look, and as the review artifact for manual checking.
>
> **Status: DESIGN ONLY.** No code changes in this pass.

---

## 1. Design Goals

- **Luxe-dark, calm, "honey" brand voice** — navy + gold, soft glows, gentle motion.
- **Data-first landing** — the dashboard answers "how is the business doing right now?" at a glance.
- **Per-outlet adaptation** — same shell, different KPI sets + accent per outlet (attire_lounge, caffeine, kravat, nile).
- **Consistent component kit** — every page reuses the same `Card`, KPI, chart, table patterns.
- **No new heavy deps** — charts via `recharts`; sparkline/ring are hand-rolled SVG (zero extra weight).

---

## 2. Design Tokens

| Token | Usage | Observed value / class |
|---|---|---|
| `--attire-navy` | Hero gradient base, outlet avatar bg | `from-attire-navy via-attire-navy/90 to-attire-navy/70` |
| `--attire-gold` | Accent: icons, sparkline, hero heart ♡, hero blob | `text-attire-gold`, `bg-attire-gold`, `bg-attire-gold/20` |
| `--primary` | Interactive: active toggle, KPI chip, CTA | `bg-primary/10 text-primary`, `bg-primary text-primary-foreground` |
| `--card` / `--border` | Surface + divider | `bg-card border-border` (Card) |
| `--foreground` / `--muted-foreground` | Text hierarchy | `text-foreground`, `text-muted-foreground` (uppercase 11px labels) |
| `--muted` | Toggle track, ring track | `bg-muted` |
| Radius | Cards / chips | `rounded-2xl` (cards), `rounded-xl` (buttons), `rounded-lg` (toggle) |
| Shadow | Elevation | `shadow-sm` → hover `shadow-xl shadow-primary/10` |
| **Type** | Hero = serif; numbers = tabular | `font-serif` h1; `tabular-nums` on figures |
| **Motion** | Entrance + ambient | `animate-fade-in-up` (staggered via `animationDelay`), `animate-float` (blobs) |
| **Icons** | `lucide-react` | Sparkles, Calendar, Users, ShoppingBag, TrendingUp, Package, AlertTriangle, Clock… |

> Tailwind **v4**. `@/*` alias → `resources/js/*`. `cn()` from `@/lib/utils` (clsx + tailwind-merge).
> Keep these tokens the single source of truth — do **not** hardcode hex in new pages.

---

## 3. Layout System

### 3.1 AppShell (hero header — shared by all pages)
- Ambient glow: two `blur-3xl` blobs (`bg-attire-gold/20`, `bg-attire-navy/10`), `pointer-events-none -z-10`, one `animate-float`.
- Hero card: `rounded-2xl border bg-gradient-to-br from-attire-navy…`, radial gold glow overlay.
  - Left: **live status dot** (`animate-ping` emerald) + `Live · {OUTLET_LABEL}`; greeting `Good {Morning/Afternoon/Evening}, honey ♡`; date + live clock (`useClock`, 1s tick).
  - Right: **Refresh** button (`RotateCw`, spins while `refreshing`, calls `qc.invalidateQueries()`); circular outlet avatar (`label.charAt(0)`, `bg-attire-gold`, ring).
- Children render in `<div className="space-y-5">{children}</div>`.

### 3.2 Grid vocabulary
- **KPI strip:** `grid grid-cols-2 gap-4 lg:grid-cols-4`.
- **Main + side:** `grid grid-cols-1 gap-4 lg:grid-cols-3` (chart `lg:col-span-2`).
- **Tables/lists:** `Card` wrapper, `space-y-*` between sections.

---

## 4. Component Library (already built — reuse, don't redo)

| Component | File | Notes |
|---|---|---|
| `Card` / `CardTitle` | `@/components/ui/card` | shadcn-style; `rounded-2xl border-border bg-card p-4 shadow-sm` |
| `AppShell` | `app-shell.tsx` | hero + outlet context + refresh |
| `KpiCard` | `dashboard.tsx` | icon chip (hover scale+glow), **count-up** value (`useCountUp`, cubic ease), sparkline or gradient placeholder, `animate-fade-in-up` w/ stagger |
| `Sparkline` | `dashboard.tsx` | hand-rolled SVG, gradient fill, end dot — **no dep** |
| `ProgressRing` | `dashboard.tsx` | SVG ring, `strokeDashoffset` draw-in (1s cubic-bezier) |
| `RevenueTrend` | `dashboard.tsx` | `recharts` `AreaChart`, `ResponsiveContainer`, timeframe toggle `day/week/month` |
| `RecentActivityWidget` | `pages/admin/RecentActivityWidget` | already a widget |

**Chart gotcha (carried from build):** wrap chart mount in an ~80ms `chartReady` delay so `recharts` doesn't compute `width(-1)` and spam console warnings.

---

## 5. Dashboard Composition (what's actually on the page)

1. **KPI grid** (per-outlet, see §6) — 4 `KpiCard`s, staggered fade-in.
2. **Revenue Trend** (`lg:col-span-2` `Card`) — title `Sparkles` + "Revenue Trend", `day/week/month` toggle, `AreaChart` of `stats.trends[timeframe]` (series = `appointments` for attire, `sales` for POS).
3. **Right column** — `Billing Health` (`ProgressRing`, refund-rate from `pos_summary.total_refunds / revenue`) + `Sales Channels` (per-outlet revenue list).
4. **Recent Invoices** table — `API.getPosInvoices({per_page:6})`, `react-query` key `['pos-invoices','recent']`.
5. **Recent Activity** feed — `RecentActivityWidget`.

Data freshness: top **Refresh** invalidates all `react-query` (including daily sales report + invoices).

---

## 6. Data Layer & Outlet Scoping

- **`useAdmin()`** (`pages/admin/AdminContext`) exposes: `stats`, `activeOutlet`, `OUTLET_CONFIG`.
- **Per-outlet KPI sets** (already coded):
  - `attire_lounge`: Appointments, Clients, Products, Subscribers (+ spark on appointments).
  - POS outlets (caffeine/kravat/nile): Menu Items, Total Sales (+ spark), Stock Alerts, Daily Orders.
- **`react-query` hooks** read from `API.*` (e.g. `getDailySalesReport`, `getPosInvoices`). Cache keyed by `['sales-report-daily', date]`, `['pos-invoices','recent']`.
- **Outlet scope** is a *feature property*, not a layout property — pages must respect the scope column in §7 (e.g. Customer Profiles is `attire_lounge`-only; Audit Logs / User Manager are restricted).

---

## 7. Information Architecture — 22 nav pages

From `AdminLayout.jsx` `navItems`. **Design status:** Dashboard = ✅ NEW; the rest are on the **old** design and should be migrated to this spec.

| Page | Route | Outlet scope | Migrate to spec? |
|---|---|---|---|
| Dashboard | /admin | all | ✅ done |
| Admin Profile | /admin/profile | all | pending |
| Customer Profiles | /admin/customer-profiles | attire_lounge | pending |
| Appointments | /admin/appointments | all | pending |
| Altering Manager | /admin/alterings | attire_lounge | pending |
| Collections | /admin/collections | attire_lounge | pending |
| Product Manager | /admin/products | attire_lounge | pending |
| POS Products | /admin/pos-products | attire_lounge | pending |
| Drink Manager | /admin/drink-manager | caffeine, kravat | pending |
| Shoe Manager | /admin/shoe-manager | nile | pending |
| Order Manager | /admin/order-manager | nile | pending |
| Promocodes | /admin/promocodes | all | pending |
| Sales History | /admin/sales-history | all | pending |
| Daily Report | /admin/daily-report | all | pending |
| SEO Manager | /admin/seo | all | pending |
| Gift Manager | /admin/customize-gift | attire_lounge | pending |
| Inventory Manager | /admin/inventory | attire_lounge | pending |
| Newsletter | /admin/newsletter | attire_lounge | pending |
| Audit Logs | /admin/audit-logs | all (restricted) | pending |
| User Manager | /admin/users | all (restricted) | pending |

**Migration pattern (recommended for each):** wrap in `<AppShell>`, add a `CardTitle`+icon header row, keep the existing table/form inside a `Card`, add the `animate-fade-in-up` entrance, and reuse `csvExport.js` for any export (Sales History / Customer Profiles / Inventory already use it — don't write another copy).

---

## 8. Proposed Next-Feature Designs (shortlist)

Verified gaps (no existing code): no expenses/net-profit, no inter-outlet stock transfer, no cross-outlet comparison, no refund/void analytics, no announcement banner.

| # | Feature | Design sketch |
|---|---|---|
| #2 | **Expense Manager + NET profit** | Form + table (date, category, amount, note) → `Daily Report` shows `revenue − refunds − expenses`. New admin route group; CSV via `csvExport.js`. |
| #3 | **Outlet Comparison** | Reuses `SalesService`; bar/table of 4 outlets side-by-side. No new queries. |
| #4 | **Stock Transfer** | Source/dest outlet + SKU + qty + audit row; touches inventory + writes audit log. |
| #5 | **Refund/Void rate** | Slice of `PosRefundController` data into `Daily Report` + `Sales History`. |
| #6 | **Announcement banner** | Banner text + active toggle; SEO manager is meta-only today, so this is a new small manager. |

> These are **design candidates** — pick one and I'll expand it into a page-level spec (layout + data + components).

---

## 9. Manual-Check Checklist

- [ ] Tokens in §2 are the only color/radius sources used on new pages (no inline hex).
- [ ] Every page wraps in `<AppShell>` and uses `Card` + `CardTitle` header.
- [ ] KPI cards use `KpiCard` (count-up + sparkline/placeholder), not ad-hoc markup.
- [ ] Charts mount behind the ~80ms `chartReady` guard (no recharts `width(-1)` warnings).
- [ ] Per-outlet KPI sets switch correctly (attire vs POS) via `activeOutlet`.
- [ ] Refresh invalidates `react-query` and repaints live data.
- [ ] Outlet scope per §7 respected (restricted pages gated; attire-only pages hidden for other outlets).
- [ ] Exports reuse `resources/js/utils/csvExport.js` (no duplicate CSV code).
- [ ] `config.yaml` / `.env` untouched by design work.

---

## 10. Open Questions for Review

1. **Scope of this pass:** full 22-page migration spec, or just the dashboard composition + design system (current doc)?
2. **Which next feature (#2–#6) to design first?**
3. **Old `AdminLayout.jsx` header** — keep as the nav shell, or fold the nav into the new `AppShell`?
4. **Restricted pages** (Audit Logs / User Manager) — same luxe treatment, or a visually distinct "admin-only" variant?
