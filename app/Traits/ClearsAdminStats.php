<?php

namespace App\Traits;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

trait ClearsAdminStats
{
    /**
     * Boot the trait and hook into model events.
     */
    protected static function bootClearsAdminStats()
    {
        static::created(fn() => static::clearAdminStatsCache());
        static::updated(fn() => static::clearAdminStatsCache());
        static::deleted(fn() => static::clearAdminStatsCache());
    }

    /**
     * Flush the admin stats cache.
     */
    protected static function clearAdminStatsCache()
    {
        if (Cache::supportsTags()) {
            Cache::tags(['admin-stats'])->flush();
        } else {
            // Forget v2 dashboard stats keys for every outlet
            foreach (['attire_lounge', 'caffeine', 'kravat', 'nile'] as $outlet) {
                Cache::forget("admin_dashboard_stats_v2_{$outlet}");
            }
            // Flush sales daily/monthly/weekly caches (v2 key scheme — see SalesService).
            // These power the dashboard widgets, and the keys must match EXACTLY
            // (a mismatch means reports stay stale until TTL expiry).
            $today = now()->toDateString();
            $weekStart = now()->startOfWeek(Carbon::MONDAY)->toDateString();
            foreach (['attire_lounge', 'caffeine', 'kravat', 'nile'] as $outlet) {
                Cache::forget("sales_daily_v2_{$outlet}_{$today}");
                Cache::forget("sales_monthly_v2_{$outlet}_" . now()->year . '_' . now()->month);
                Cache::forget("sales_weekly_v2_{$outlet}_{$weekStart}");
            }
        }
    }
}
