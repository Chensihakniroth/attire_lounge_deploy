<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiKey
{
    /**
     * Handle an incoming request.
     * Validates the X-API-Key header against the configured key.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key');
        $validKey = config('services.webhook.api_key');

        if (!$validKey) {
            // If no key is configured, allow (for development)
            if (app()->environment('local', 'development')) {
                return $next($request);
            }

            return response()->json([
                'success' => false,
                'error'   => 'api_key_not_configured',
                'message' => 'Webhook API key is not configured on this server.',
            ], 500);
        }

        if (!$apiKey || !hash_equals($validKey, $apiKey)) {
            return response()->json([
                'success' => false,
                'error'   => 'invalid_api_key',
                'message' => 'Invalid or missing API key.',
            ], 401);
        }

        return $next($request);
    }
}
