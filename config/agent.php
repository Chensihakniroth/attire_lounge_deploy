<?php

return [
    /*
     |--------------------------------------------------------------------------
    | AI Data Assistant — OpenCode Zen API (OpenAI-compatible)
     |--------------------------------------------------------------------------
     |
     | This powers the admin-only data assistant. The model is configured via
     | environment variables. The endpoint is expected to speak an OpenAI
     | compatible /chat/completions interface (which is what the OpenCode Zen
     | API exposes). The API key NEVER leaves the server.
     |
     */

    'driver'            => env('AI_DRIVER', 'openai-compatible'),
    'api_base'          => rtrim(env('AI_API_BASE', ''), '/'),
    'api_key'           => env('AI_API_KEY'),
    'model'             => env('AI_MODEL'),

    'max_output_tokens' => (int) env('AI_MAX_OUTPUT_TOKENS', 1024),
    'temperature'       => (float) env('AI_TEMPERATURE', 0.2),
    'top_p'             => (float) env('AI_TOP_P', 1.0),
    'max_turns'         => (int) env('AI_MAX_TURNS', 8),

    'refusal_message'   => 'I can only help with business data — products, orders, customers, appointments, inventory, and dashboard stats. I cannot modify source code, configuration, database schema, files, or deployments.',

    /*
     |--------------------------------------------------------------------------
    | Allowed business domains (informational / documentation)
    |--------------------------------------------------------------------------
    |
    | The assistant may only touch data within these domains. The actual
    | enforcement is the closed tool allowlist in BusinessDataTools.
    |
     */
    'allowed_domains' => [
        'products',
        'orders',
        'customers',
        'appointments',
        'inventory',
        'stats',
        'newsletter',
    ],
];
