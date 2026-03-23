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
            Cache::forget('admin_dashboard_stats');
        }
    }
}
