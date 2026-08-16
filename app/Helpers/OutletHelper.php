<?php

namespace App\Helpers;

/**
 * Central helper for resolving the active outlet from the request context.
 *
 * Accepts a raw value (header / query param) and guarantees it is one of the
 * allowed outlets — falling back to 'attire_lounge' for anything unexpected.
 * This prevents arbitrary strings from being persisted to the `outlet` column
 * (which would silently orphan the row from every outlet-scoped query).
 */
final class OutletHelper
{
    public const ALLOWED_OUTLETS = ['attire_lounge', 'caffeine', 'kravat', 'nile'];

    public static function resolve(?string $outlet): string
    {
        if (is_string($outlet) && in_array($outlet, self::ALLOWED_OUTLETS, true)) {
            return $outlet;
        }

        return 'attire_lounge';
    }
}