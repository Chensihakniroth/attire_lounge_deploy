# IT Role — Design Plan

**Goal:** a new role `IT`. It sees the technical screens (Sync POS, SEO, Audit Logs, User Manager, AI settings). Shop admins keep the day-to-day screens. Super Admin keeps everything.

**Status:** design only, no code written.

---

## 1. What's actually there today

I traced the whole role/permission path. The honest finding:

| Thing | State |
|---|---|
| `spatie/laravel-permission` | Installed, working |
| `config/permission.php` | Present |
| `role` + `permission` middleware aliases | Registered in `bootstrap/app.php:28-29` |
| 9 permissions seeded | `PermissionSeeder.php:35-45` |
| Permissions sent to frontend in the login token | `AdminLoginController.php:62-63` |
| **Permissions actually checked anywhere** | **Zero** |
| 3 extra roles seeded | `product-manager`, `appointment-manager`, `gift-manager` — all dead |

Access control today is two hardcoded strings:

- `routes/api.php:104` — `role:admin|super-admin` wraps ~120 routes
- `routes/api.php:231` — `role:super-admin` wraps Users, Roles, Audit Logs
- `AdminLayout.jsx:194` — `isSuperAdmin` string check hides 2 nav items
- `AdminLoginController.php:54` — anyone who isn't admin/super-admin is kicked at login

So the permission layer is **decorative**. It exists, it ships in the token, nothing reads it. The 3 manager roles are unusable — they can't even log in.

**Consequence for this design: we are not building a permission system. We are switching on the one already installed.**

---

## 2. Which features are "technical"

| Move to IT | Stays with Admin |
|---|---|
| Sync POS (Nile sync) | Dashboard |
| SEO Manager | Admin Profile |
| Audit Logs | Customer Profiles |
| User Manager | Appointments, Alterings |
| AI Assistant settings | Collections, Product Manager, POS Products |
| | Drink / Shoe / Order Manager |
| | Promocodes, Sales History, Daily Report |
| | Gift Manager, Inventory, Newsletter |

Rule of thumb: **anything that changes the system or exposes data about the system.** Everything else is shop work.

---

## 3. Roles after the change

| Role | Gets |
|---|---|
| `it` | `view-dashboard` + the 5 technical permissions. No shop permissions. |
| `admin` | Shop permissions. **Loses** the technical ones. |
| `super-admin` | All 14. Still the escape hatch and the only one who can create users. |

4 new permissions needed (the other 9 already exist):

```
manage-sync        Sync POS, Nile sync run
manage-seo         SEO Manager
view-audit-log     Audit Logs
manage-ai          AI Assistant + its settings
```

(`manage-users` already exists — it covers User Manager.)

**Open question for you:** does `admin` actually *lose* Sync POS / SEO / Audit Logs / User Manager, or does `it` just become an *extra* role someone can hold *in addition* to admin? This is the one decision that changes the code. Everything else below is the same either way.

---

## 4. The changes, file by file

**1. `database/seeders/PermissionSeeder.php`**
Add the 4 permissions. Add an `it` role and give it the 5. Strip the 5 technical permissions out of the `admin` role. One-time, idempotent — no new migration.

**2. `routes/api.php`**
- Line 104: swap `role:admin|super-admin` → `permission:view-dashboard` (both roles have it)
- Line 109-110 (`nile-sync`): add `permission:manage-sync`
- Line 113-115 (`ai/*`): add `permission:manage-ai`
- Line 231 (`super-admin` group): `users` + `roles-permissions` → `permission:manage-users`, `activities` → `permission:view-audit-log`. Since `super-admin` is the only role with `manage-users`, **the last-super-admin guard at `UserController.php:126` still holds** — no new protection needed.

**3. `AdminLoginController.php:54`**
Hardcoded `['super-admin','admin']` would lock IT out. Replace with: kick the user only if `getAllPermissions()` is empty. One line. Also handles the 3 dead manager roles for free.

**4. `resources/js/.../AdminLayout.jsx`**
Add a `perm: 'manage-sync'` key to the 5 technical nav items. Change the `restricted: true` check (line 197) to `if (item.perm && !userPermissions.includes(item.perm)) return false;`. `useAdmin` already exposes permissions from the token — no new plumbing.

**5. `resources/js/.../UserManager.jsx`**
Add an IT entry to the `ROLES` array (line 22). ~10 lines.

**Total: 5 files, no new package, no migration, no new table, no policy class, no test scaffolding.**

---

## 5. Risks

| Risk | Fix |
|---|---|
| Existing admin tokens were minted with the old ability list. An old token still says `manage-users`. Sanctum abilities are only read by `permission:` middleware, which Spatie checks against the **role**, not the token — so role change takes effect immediately. But any screen we gate **client-side only** on the token could be stale until re-login. | Have admins re-login after the seed. One line of support, or accept a 24h window. |
| The 3 dead roles (`product-manager`, `appointment-manager`, `gift-manager`) become usable the moment the login gate is relaxed in step 3. Anyone holding one suddenly gets in. | Decide before shipping: delete them, or leave them. **Not touching them without your say-so.** |
| Frontend nav hiding is cosmetic. Real protection is the route middleware in step 2 — IT-only screens must have BOTH, or a shop admin can still hit the URL by typing it. | Don't ship a nav item without a route gate. |

---

## 6. Deliberately skipped

- **Policies per model** (`app/Policies/`) — the route middleware already blocks it. Policies would be a second place to get wrong.
- **Outlet-scoped roles** (IT for outlet A only) — not asked for. Spatie supports it via teams if it ever is.
- **A real permission-management UI** — `roles-permissions` already returns the full list; editing it is a bigger project than the role itself.
- **Audit-log write access for IT** — IT can read logs, not forge them.

---

## 7. Build order

1. Seed the 4 permissions + `it` role
2. Route middleware (step 2) — this is the actual security change
3. Login gate (step 3)
4. Nav `perm` keys (step 4)
5. User Manager role entry (step 5)

Steps 2 and 3 alone give you the real protection. 4 and 5 are what a person actually sees.
