<?php

namespace App\Traits;

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
            Cache::forget('admin_dashboard_stats_attire_lounge');
            Cache::forget('admin_dashboard_stats_caffeine');
            Cache::forget('admin_dashboard_stats_kravat');
            // Also flush sales daily/monthly caches since they power the dashboard widgets
            foreach (['attire_lounge', 'caffeine', 'kravat'] as $outlet) {
                Cache::forget("sales_daily_{$outlet}_" . now()->toDateString());
                $year = now()->year;
                $month = now()->month;
                Cache::forget("sales_monthly_{$outlet}_{$year}_{$month}");
            }
        }
    }
}
