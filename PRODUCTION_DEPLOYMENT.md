# Production Deployment Guide — Attire Lounge POS

## Overview
Deploy fixes for Caffeine outlet branding, MARTINI LOVER category reassignment, and composite SKU uniqueness across outlets.

---

## Changes Summary

### 1. Frontend (React/JS)
- **`resources/js/components/pages/admin/AdminContext.jsx`**
  - Caffeine label: `'Caffeine'` → `'CUFFEINE'`
  - Caffeine logo: added `'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/cuff.png'`

### 2. Database Schema
- **New migration:** `database/migrations/2026_05_08_162536_fix_pos_products_outlet_sku_unique.php`
  - Drops global `UNIQUE(sku)` constraint
  - Adds composite unique `UNIQUE(outlet, sku)` — same SKU allowed in different outlets

### 3. Seeders (Updated to use composite key)
- **`database/seeders/DrinkManagerSeeder.php`** — outlet filter + composite upsert key
- **`database/seeders/KravatDrinkSeeder.php`** — outlet filter + composite upsert key

### 4. Seed Data (JSON)
- **`storage/caffeine_products.json`** — 5 MARTINI LOVER products REMOVED
- **storage/kravat_products.json`** — 5 MARTINI LOVER products ADDED
- **storage/pos_products.json`** — regenerated (571 total products)

---

## Production Deployment Checklist

### Required Files to Deploy
```
resources/js/components/pages/admin/AdminContext.jsx
database/migrations/2026_05_08_162536_fix_pos_products_outlet_sku_unique.php
database/seeders/DrinkManagerSeeder.php
database/seeders/KravatDrinkSeeder.php
storage/caffeine_products.json
storage/kravat_products.json
storage/pos_products.json
```

### Step-by-Step

#### Option A: Automated Script (Windows)
```cmd
deploy_to_production.bat
```

#### Option B: Manual Commands
```bash
# 1. Deploy code + data files via git/rsync/FTP
git pull origin main

# 2. Install dependencies (if needed)
composer install --no-dev --optimize-autoloader

# 3. Run migrations
php artisan migrate --force

# 4. Reseed both outlet tables
php artisan db:seed --class=DrinkManagerSeeder --force
php artisan db:seed --class=KravatDrinkSeeder --force

# 5. Clear caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# 6. Rebuild frontend (if building on server)
npm ci --only=production
npm run build

# 7. Restart Octane (if used)
php artisan octane:restart

# 8. Reload web server (nginx/apache)
sudo systemctl reload nginx   # or sudo service apache2 reload
```

---

## Post-Deployment Verification

### Database
```bash
php artisan tinker
```
```php
// Check counts
DB::table('pos_products')->where('outlet','caffeine')->count();  // Expected: 332
DB::table('pos_products')->where('outlet','kravat')->count();    // Expected: 239

// Check MARTINI LOWER assignment
DB::table('pos_products')->where(['outlet'=>'kravat','category'=>'MARTINI LOVER'])->count();  // Expected: 5
DB::table('pos_products')->where(['outlet'=>'caffeine','category'=>'MARTINI LOVER'])->count(); // Expected: 0
```

### Frontend
1. Login to Admin Panel → Switch to **Caffeine** outlet
   - Header should show **"CUFFEINE"** with its logo
   - Drink Manager → All categories visible (no MARTINI LOVER)
2. Switch to **Kravat** outlet
   - Drink Manager → **MARTINI LOVER** category appears (5 products)
3. Quick Access (POS)
   - Caffeine: no MARTINI LOVER
   - Kravat: MARTINI LOVER available

---

## Rollback (if needed)

```bash
# Undo migration (if composite unique breaks anything)
php artisan migrate:rollback --step=1

# Restore JSON files from git
git checkout HEAD -- storage/caffeine_products.json storage/kravat_products.json storage/pos_products.json

# Re-seed original data
php artisan db:seed --class=DrinkManagerSeeder --force
php artisan db:seed --class=KravatDrinkSeeder --force
```

---

## Notes

- The `storage/*.json` files act as source of truth for seeding.
- The composite unique constraint `(outlet, sku)` is required for outlets to share SKUs (e.g., same product sold at both outlets).
- Changes to outlet label/logo are client-side only; no database impact.

---

**Created:** 2026-05-08
**Deploy to:** Production
