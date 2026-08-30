<?php
// Nile Cambodia Telegram Bot Configuration
// In production (Railway), set NILE_TELEGRAM_BOT_TOKEN and NILE_TELEGRAM_CHAT_ID env vars.
return [
    'bot_token' => env('NILE_TELEGRAM_BOT_TOKEN', ''),
    'chat_id'   => env('NILE_TELEGRAM_CHAT_ID', '-1003846388047'),
    // Optional "View Order" deep link template. Use {wc_order_id} as the placeholder.
    // e.g. env('NILE_ORDER_VIEW_URL', 'https://nilecambodia.com/my-account/view-order/{wc_order_id}')
    'order_view_url' => env('NILE_ORDER_VIEW_URL', ''),
];
