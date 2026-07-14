<?php
// Nile Cambodia Telegram Bot Configuration
// In production (Railway), set NILE_TELEGRAM_BOT_TOKEN and NILE_TELEGRAM_CHAT_ID env vars.
return [
    'bot_token' => env('NILE_TELEGRAM_BOT_TOKEN', ''),
    'chat_id'   => env('NILE_TELEGRAM_CHAT_ID', '-1003846388047'),
];
