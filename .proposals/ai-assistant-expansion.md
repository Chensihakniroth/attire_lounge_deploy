# AI Data Assistant — Expansion Proposal (additive, in-scope)

> Review artifact. Untracked — do not commit unless you want it tracked.
> Goal: give the admin AI **more abilities** while staying inside the existing
> "business-data assistant via closed tool allowlist" architecture. No change to
> `AgentService` loop, no new config, no migration for Tier 1.

## 1. Scope & Non-Goals

**In scope (Tier 1 — recommended):**
- New **read tools** for data the admin already manages but the AI cannot see.
- A few small **write tools** that follow the exact same safety pattern as existing ones.
- One **reporting upgrade** built by reusing `SalesService`.

**Explicitly NON-goals (do not touch):**
- `AgentService.php` loop / system prompt contract (only append to it).
- `AiAgentController.php` (no signature change).
- `config/agent.php` (no new env knobs).
- Anything that executes code, hits external APIs, or edits schema/files/deployments.
- Storefront `Product`/`Category`/`Collection` writes (catalog is a different domain).
- Shoe/Drink/CustomizeGift "tools" — there are **no backend models** for these;
  they are frontend managers over `PosProduct`, so they would require new models = out of scope.

## 2. Current State (verified this session — reuse, don't rebuild)

| Building block | Location | Reuse for |
|---|---|---|
| Tool schema allowlist | `BusinessDataTools::definitions()` (lines 36–78) | add new `function` entries |
| Tool dispatcher + validation | `BusinessDataTools::call()` (80–133) + `rules()` (135–180) | add name→method + rules |
| Markdown formatting helpers | `pagination()`, `fmtMoney()`, `cap()` | reuse in new tools |
| Stats daily cache | `Cache::forget("sales_daily_v2_{$outlet}_{$date}")` | reuse in write tools |
| Reporting engine | `SalesService::getDailyReport` / `getWeeklyReport` / `getMonthlyReport` | reuse for `compare_sales` |
| Audit trait | `App\Traits\Auditable` (on `GiftItemStock`, `CustomerProfile`) | auto-logs writes |
| Outlet scoping | `request()->header('X-Active-Outlet')` | reuse for outlet-aware tools |

Existing 30 tools already cover: products, low-stock, customers(read), orders,
invoices, refunds, gift *requests*, altering, appointments, promocodes, sales
targets, notifications, activities, daily report, newsletter, stats.

## 3. Real gaps found (grounded)

- `GiftItemStock` model + `GiftItemStockController` exist → **no AI tool** (gift inventory blind spot).
- `TelegramSubscriber` model exists → **no AI tool** (comms parity gap vs `newsletter_subscribers`).
- `CustomerProfile` is **read-only** to the AI (no `update_customer`) even though admins constantly fix phone/email.
- Bulk edits hit the **8-tool-call cap** — "mark all out-of-stock inactive" needs N calls.
- Reporting is single-period only — no period-over-period comparison.

## 4. Tier 1 — Recommended tools (all additive, zero architecture change)

### 4.1 `update_customer`  (small WRITE)
Update safe fields only: `phone`, `email`, `name`, `nationality`, `remarks`, `is_vip`.
- `rules()`: `id` required int; others nullable with sane constraints (`email` email, `is_vip` bool).
- Method: `findOrFail`, apply only provided keys, `save()` (Auditable logs it), return diff string.
- Safety: never touches `date`/`client_status`/sizes automatically; restricted field allowlist.

### 4.2 `list_gift_item_stock` + `get_gift_item_stock`  (READ)
- Query `GiftItemStock` with optional `is_out_of_stock` filter + pagination (reuse `pagination()`).
- Return `item_id` + status. `get_` by id with `findOrFail`.

### 4.3 `update_gift_item_stock`  (small WRITE)
- `id` + `is_out_of_stock` bool. `save()` → Auditable logs. (Inverse of low-stock toggle for gift items.)

### 4.4 `list_telegram_subscribers`  (READ)
- List `TelegramSubscriber` with pagination (parity with `list_newsletter_subscribers`).

### 4.5 `bulk_update_products`  (WRITE, beats the 8-call cap)
- Params: `ids` (array<int>, **max 50**), optional `price`/`stock_qty`/`min_stock`/`is_active`.
- Loop applies the same allowed fields to each id inside one `DB::transaction`; cap 50 to stay safe.
- Returns `N updated` + per-id diff summary. Solves "restock / deactivate many at once".

### 4.6 `compare_sales`  (REPORTING upgrade, reuses SalesService)
- Params: `period` ∈ {daily, weekly, monthly}, `date` (anchor), optional `compare` ∈ {previous, same_last_week, same_last_month, same_last_year}.
- Calls `SalesService::getDailyReport/getWeeklyReport/getMonthlyReport` for current + comparison period.
- Returns side-by-side: revenue, orders, refunds, net, AOV, delta %.

## 5. Method-by-method touch-point table (Tier 1)

| File | Method | Change |
|---|---|---|
| `BusinessDataTools.php` | `definitions()` | +6 `function` entries (4.1–4.6) |
| `BusinessDataTools.php` | `call()` `$map` | +6 name→method mappings |
| `BusinessDataTools.php` | `rules()` | +6 `match` arms |
| `BusinessDataTools.php` | (new privates) | `updateCustomer`, `listGiftItemStock`, `getGiftItemStock`, `updateGiftItemStock`, `listTelegramSubscribers`, `bulkUpdateProducts`, `compareSales` |
| `AgentService.php` | `systemPrompt()` | append 1 line listing new abilities (optional, improves discovery) |
| `config/agent.php` | — | **no change** |
| `AiAgentController.php` | — | **no change** |

## 6. Open questions / biggest risk

1. **Writes must respect outlet scope + Auditable.** `bulk_update_products` and
   `update_customer`/`update_gift_item_stock` should only act within the active
   outlet and let the audit trail fire. `CustomerProfile`/`GiftItemStock` do NOT
   currently carry an `outlet` column in the models I read — confirm whether these
   are global (single-tenant) or need outlet filtering before shipping writes.
2. `compare_sales` date math depends on `SalesService` period boundaries — verify
   "previous" semantics (last 7d vs calendar week) match admin expectations.
3. `bulk_update_products` cap (50) — confirm with user; raise only with care.

## 7. Verification checklist (manual)

- [ ] Each new tool appears in BOTH `definitions()` and `call()` map (typo here = silent refusal).
- [ ] `rules()` arms added; bad input returns the validated error string, not a 500.
- [ ] Streaming still emits `tool_start`/`tool_end` for new tools (timeline shows them).
- [ ] Write tools fire `Auditable` (row appears in `list_activities`).
- [ ] `bulk_update_products` capped at 50; transaction rolls back on partial failure.
- [ ] `compare_sales` numbers match the existing `/sales-report` widgets for the same date.
- [ ] System prompt mentions new abilities so the model actually offers them.

---
## Tier 2 (optional, bigger — NOT recommended for first pass)
- `list_categories` / `list_collections` (storefront catalog read).
- Server-side **conversation persistence** (new `ai_conversations` table + store/load endpoints) — enables resume + audit; moderate change, technically still "assistant" scope but crosses the "no schema" line.
- `list_outlets` / outlet switching (only if multi-outlet is real).
