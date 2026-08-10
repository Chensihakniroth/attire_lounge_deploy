# Admin Dashboard — Kill the Fake Data (Fix #1) Implementation Plan

**Goal:** Replace the three hardcoded/placeholder stats in the dashboard right-rail "Stats" panel (Peak Activity trend `12`, Rate `"84%"`, State "Everything is running well.") with real values computed from the existing `/api/v1/admin/stats` payload.

**Architecture:** Pure frontend change in `AdminDashboard.jsx`. All required data already exists in the `stats` object provided by `useAdmin()` — no backend/controller changes, no new endpoints, no new API calls. Computation is trivial derived-state (useMemo-free inline math is fine, values are already loaded).

**Tech Stack:** React 18, Tailwind CSS, framer-motion (already in use), esbuild build via `npm run build:js`.

**Scope guard:** Fixes #2 (DailySummaryWidget), #3 (POS sales trend series), #4 (pending badges) are explicitly OUT of scope — they were deferred by user pick. Only the three right-rail cards change.

---

## Current State (target lines)

`resources/js/components/pages/admin/AdminDashboard.jsx` — right-rail "Stats" panel, lines ~888-939:

```jsx
<GlassyStatCard
    label="Peak Activity"
    value={ stats.trends && stats.trends[timeframe]?.length > 0
        ? Math.max(...stats.trends[timeframe].map((t) =>
            t[dashboardMode === 'services' ? 'appointments' : 'customers']))
        : 0 }
    icon={Activity}
    trend={12}                       // ← HARDCODED
/>
<GlassyStatCard
    label="Rate"
    value="84%"                      // ← HARDCODED
    icon={TrendingUp}
    color="green-500"                // ← dead prop (unused in GlassyStatCard)
/>
<div className="p-6 bg-[#0d3542]/5 ...">
    ... "State" card, body text "Everything is running well."  // ← HARDCODED
</div>
```

**Verified facts:**
- `stats.trends` = `{ month: [6 buckets], week: [4 buckets], day: [7 buckets] }`, each bucket `{ name, appointments, customers }` (from `AdminController.php:96-100`).
- `stats.pending_appointments`, `stats.pending_gifts` exist (attire_lounge only; 0/absent for POS outlets).
- `stats.pos_summary` = `{ total_revenue, invoice_count, total_refunds }` (POS outlets only).
- `stats.low_stock`, `stats.out_of_stock` exist (POS outlets only).
- `activeOutlet` from `useAdmin()`: `'attire_lounge' | 'nile' | 'kravat'` (per `AdminContext.jsx` OUTLET_CONFIG).
- `dashboardMode`: `'services' | 'registry'` (attire_lounge) or `'sales'` (POS).
- GlassyStatCard (lines 304-348) destructures `color` but never uses it — do NOT wire it; leave dead prop alone (YAGNI).
- No JS test infra exists in this repo (no vitest/jest config found). Verification = esbuild build + bundle grep + user visual check. **TDD is not applicable here; build-verify instead.**

---

## Task 1: Add derived-value computations to the component body

**Objective:** Compute `peakTrend`, `rateLabel`, `rateValue`, `stateInfo` from `stats` once, so the JSX below stays clean.

**Files:** Modify `resources/js/components/pages/admin/AdminDashboard.jsx`

**Step 1:** Add `TrendingDown` to the lucide-react import (lines 3-18):

```jsx
import {
    Calendar,
    Gift,
    ArrowRight,
    TrendingUp,
    TrendingDown,      // ← ADD
    Package,
    ShoppingBag,
    Plus,
    Users,
    Activity,
    ShieldCheck,
    PieChart as PieIcon,
    BarChart,
    Loader2,
    Footprints
} from 'lucide-react';
```

**Step 2:** Inside `AdminDashboard` (after the state declarations at line ~529, before `return`), add:

```jsx
// ── Real derived stats (replaces hardcoded placeholders) ──────────────
const isAttire = activeOutlet === 'attire_lounge';
const activeSeriesKey = dashboardMode === 'services' ? 'appointments' : 'customers';
const series = (stats.trends?.[timeframe] ?? []).map((t) => t[activeSeriesKey] ?? 0);
const lastBucket = series[series.length - 1] ?? 0;
const prevBucket = series[series.length - 2] ?? 0;
const peakTrend = prevBucket > 0
    ? Math.round(((lastBucket - prevBucket) / prevBucket) * 100)
    : (lastBucket > 0 ? 100 : 0);

// Rate: Booked Rate (attire_lounge) | Refund Rate (POS)
const totalAppts = stats.appointments || 0;
const pendingAppts = stats.pending_appointments || 0;
const refunds = stats.pos_summary?.total_refunds || 0;
const revenue = stats.pos_summary?.total_revenue || 0;
const rateLabel = isAttire ? 'Booked Rate' : 'Refund Rate';
const rateValue = isAttire
    ? `${totalAppts > 0 ? Math.round((1 - pendingAppts / totalAppts) * 100) : 0}%`
    : `${revenue > 0 ? ((refunds / revenue) * 100).toFixed(1) : '0.0'}%`;

// State card
const pendingCount = (stats.pending_appointments || 0) + (stats.pending_gifts || 0);
const lowStockCount = stats.low_stock || 0;
const outOfStockCount = stats.out_of_stock || 0;
const stateInfo = isAttire
    ? pendingCount > 0
        ? {
              tone: 'warn',
              text: `${stats.pending_appointments || 0} pending bookings · ${stats.pending_gifts || 0} gift requests`,
          }
        : { tone: 'ok', text: 'All clear — nothing pending' }
    : lowStockCount + outOfStockCount > 0
        ? {
              tone: 'warn',
              text: `${lowStockCount} low stock · ${outOfStockCount} out of stock`,
          }
        : { tone: 'ok', text: 'Stock healthy — all levels above minimum' };
```

**Verification:** No test framework — verify by reading the compiled bundle after Task 5.

---

## Task 2: Replace Peak Activity card — real trend

**Objective:** `trend={12}` → `trend={peakTrend}` with sign-aware icon.

**Files:** Modify `resources/js/components/pages/admin/AdminDashboard.jsx` (same Stats panel)

**Step 1:** Replace the existing Peak Activity `<GlassyStatCard>` (lines ~894-917) with:

```jsx
<GlassyStatCard
    label="Peak Activity"
    value={series.length > 0 ? Math.max(...series) : 0}
    icon={Activity}
    trend={peakTrend}
/>
```

**Step 2:** Make the trend badge icon sign-aware inside `GlassyStatCard` (lines ~326-336). Current code always renders `<TrendingUp size={10} />`. Replace with:

```jsx
{trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
```

(Leave the green/red color logic as-is — it already keys off `trend > 0`.)

**Why:** `GlassyStatCard` already renders `{Math.abs(trend)}%` and colors by sign; only the icon was sign-blind. `peakTrend = 0` (no change) renders as a neutral 0% — acceptable.

---

## Task 3: Replace Rate card — real, per-outlet value

**Objective:** `value="84%"` → `value={rateValue}` with dynamic `label={rateLabel}`.

**Files:** Modify `resources/js/components/pages/admin/AdminDashboard.jsx`

**Step 1:** Replace the Rate `<GlassyStatCard>` (lines ~918-923) with:

```jsx
<GlassyStatCard
    label={rateLabel}
    value={rateValue}
    icon={TrendingUp}
/>
```

(Remove the now-meaningless `color="green-500"` prop — it was never used by the component.)

**Semantics (documented for the user):**
- attire_lounge: **Booked Rate** = % of total appointments that are NOT pending (`1 − pending/total`).
- POS outlets: **Refund Rate** = `pos_summary.total_refunds / total_revenue`, 1 decimal.

---

## Task 4: Replace State card — real, per-outlet status

**Objective:** "Everything is running well." → dynamic text + tone color from real pending/stock counts.

**Files:** Modify `resources/js/components/pages/admin/AdminDashboard.jsx`

**Step 1:** Replace the State card block (lines ~924-937) with:

```jsx
<div className={`p-6 rounded-[2rem] border transition-colors duration-500 ${
    stateInfo.tone === 'ok'
        ? 'bg-green-500/5 border-green-500/10'
        : 'bg-amber-500/5 border-amber-500/10'
}`}>
    <div className="flex items-center gap-3 mb-2">
        <ShieldCheck
            className={stateInfo.tone === 'ok' ? 'text-green-500' : 'text-amber-500'}
            size={14}
        />
        <span className={`text-xs font-black uppercase tracking-widest ${
            stateInfo.tone === 'ok' ? 'text-green-500' : 'text-amber-500'
        }`}>
            {stateInfo.tone === 'ok' ? 'State' : 'Attention'}
        </span>
    </div>
    <p className="text-xs text-gray-600 dark:text-[#8b949e] leading-relaxed">
        {stateInfo.text}
    </p>
</div>
```

**Tone logic:** `ok` (green) = nothing pending / stock healthy; `warn` (amber) = pending bookings/gifts or low/out-of-stock items. Title flips to "Attention" when warn, so the card is never silently misleading.

---

## Task 5: Build & verify

**Objective:** Bundle compiles and the new logic is present in the output.

**Step 1:** Build:
```
npm.cmd run build:js
```
Expected: exit code 0, esbuild prints `AdminDashboard-*.js` output file.

**Step 2:** Grep the freshly built bundle for the new markers (ripgrep over `public/js`):
- `Booked Rate` and `Refund Rate` (string literals survive minification)
- `Attention` and `Stock healthy` / `All clear`
- `peakTrend` will be mangled — do NOT grep for it; the string markers are authoritative.

Expected: ≥1 hit for each marker. (Python substring checks can fail on minified non-ASCII — use `search_files`/ripgrep, per project lesson.)

**Step 3 (visual, user does this after deploy):** Open admin dashboard in both an attire_lounge outlet and a POS outlet (e.g. Nile); confirm: Peak Activity shows a real % change badge, Rate shows Booked/Refund %, State shows real pending/stock text and green/amber coloring.

---

## Task 6: Ship (separate, after user approval)

- `git add resources/js/components/pages/admin/AdminDashboard.jsx`
- `git commit -m "fix(admin): replace hardcoded dashboard stats with real derived values"`
- `git push origin feature/webhook-api-keys` (production branch — Railway auto-deploys on push)
- Poll GitHub deployments API (`gh api repos/Chensihakniroth/attire_lounge_deploy/deployments`) until status = `success`
- Verify live bundle contains markers (curl chunk + ripgrep)

---

## Files Changed

| File | Change |
|---|---|
| `resources/js/components/pages/admin/AdminDashboard.jsx` | Only file. Imports + derived values + 3 card replacements. |

No other files. No backend, no API, no widgets, no CSS files.

## Risks / Tradeoffs / Open Questions

- **Peak trend guard**: `prevBucket === 0` → trend shows 100% if last > 0, else 0%. A "100%" spike badge on a zero→1 jump is technically honest but looks loud; acceptable for now, noted for polish later.
- **Booked Rate semantics**: pending appointments are the only status signal in the stats payload. If the business wants "completion rate" (completed/total), that needs a backend status breakdown — deferred.
- **POS Peak Activity**: still computes from the `customers` series (the wrong-metric Growth chart is fix #3, out of scope). The trend % is consistent with what the chart displays today; when fix #3 lands, this derivation follows automatically because it reads the same `series` variable.
- **Dead `color` prop**: left in `GlassyStatCard` signature; only the call-site prop is removed. No behavior change.
- **Open question for user**: should the "Attention" state title also surface on the top StatCard row (e.g., amber badge on Appointments card when pending > 0)? Deferred — ask after this ships.
