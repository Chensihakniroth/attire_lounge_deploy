<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Keep the Nile outlet's POS prices aligned with the live storefront, including
// any active WooCommerce sale price. Hourly is plenty for a fashion storefront
// and keeps API traffic light; withoutOverlapping guards the hourly tick.
Schedule::command('nile:sync-prices')
    ->hourly()
    ->withoutOverlapping();
