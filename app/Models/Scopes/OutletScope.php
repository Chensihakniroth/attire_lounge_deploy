<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class OutletScope implements Scope
{
    /**
     * Apply the scope to all Eloquent queries.
     * Reads the outlet from the X-Active-Outlet header or 'outlet' query param.
     * Falls back to 'attire_lounge' if none is provided.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $outlet = $this->resolveOutlet();

        if ($outlet) {
            $builder->where($model->getTable() . '.outlet', $outlet);
        }
    }

    /**
     * Resolve the current outlet from the HTTP request context.
     */
    protected function resolveOutlet(): ?string
    {
        // In console/artisan context, skip scoping
        if (app()->runningInConsole() && !app()->runningUnitTests()) {
            return null;
        }

        $request = request();

        // Priority: header > query param > default
        $outlet = $request->header('X-Active-Outlet')
            ?? $request->get('outlet')
            ?? 'attire_lounge';

        // Validate against allowed values
        $allowed = ['attire_lounge', 'caffeine', 'kravat'];
        return in_array($outlet, $allowed) ? $outlet : 'attire_lounge';
    }
}
