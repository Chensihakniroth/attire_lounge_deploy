<?php
// Nile Cambodia WooCommerce (storefront) connection.
//
// Used by `php artisan nile:sync-prices` to pull the LIVE storefront price for
// each published variation — including an active sale price — so the POS charges
// the same number the customer sees on nilecambodia.com.
//
// The consumer key/secret are the same WooCommerce REST credentials the
// Next.js frontend already uses. In production (Railway) set
// WC_CONSUMER_KEY and WC_CONSUMER_SECRET env vars.
return [
    'store_url' => env('NILE_WC_STORE_URL', 'https://cms.nilecambodia.com'),
    'consumer_key' => env('WC_CONSUMER_KEY', ''),
    'consumer_secret' => env('WC_CONSUMER_SECRET', ''),

    // The outlet whose POS prices are driven by the storefront.
    'outlet' => env('NILE_WC_SYNC_OUTLET', 'nile'),

    // Cloudflare's bot filter (Error 1010) rejects the default Guzzle user agent
    // on cms.nilecambodia.com, so send a normal browser UA.
    'user_agent' => env(
        'NILE_WC_USER_AGENT',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
        .'(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    ),
];
