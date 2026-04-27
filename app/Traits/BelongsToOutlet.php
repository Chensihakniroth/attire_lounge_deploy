<?php

namespace App\Traits;

use App\Models\Scopes\OutletScope;

/**
 * Trait BelongsToOutlet
 *
 * Apply this trait to any Eloquent model that should be scoped by outlet.
 * It automatically:
 *   1. Applies the OutletScope global scope to all queries.
 *   2. Sets the 'outlet' attribute on new models from the current request context.
 */
trait BelongsToOutlet
{
    public static function bootBelongsToOutlet(): void
    {
        static::addGlobalScope(new OutletScope());

        // Auto-set outlet on creation
        static::creating(function ($model) {
            if (empty($model->outlet)) {
                $model->outlet = static::resolveCurrentOutlet();
            }
        });
    }

    /**
     * Resolve the current outlet from the request context.
     */
    protected static function resolveCurrentOutlet(): string
    {
        $request = request();

        $outlet = $request->header('X-Active-Outlet')
            ?? $request->get('outlet')
            ?? 'attire_lounge';

        $allowed = ['attire_lounge', 'caffeine', 'kravat'];
        return in_array($outlet, $allowed) ? $outlet : 'attire_lounge';
    }

    /**
     * Query without outlet filtering (useful for admin cross-outlet views).
     */
    public function scopeAllOutlets($query)
    {
        return $query->withoutGlobalScope(OutletScope::class);
    }
}
