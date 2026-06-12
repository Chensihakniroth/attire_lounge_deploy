<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReverbConfigController extends Controller
{
    /**
     * Return the Reverb WebSocket configuration for authenticated admins.
     * This endpoint is protected by auth:sanctum middleware.
     *
     * Returns the host/scheme from the environment config.
     * On local (Laragon): ws://127.0.0.1:8081
     * On production (Railway): wss://www.attireloungeofficial.com:443
     */
    public function show(Request $request): JsonResponse
    {
        $host = config('reverb.apps.apps.0.options.host');
        $port = (int) config('reverb.apps.apps.0.options.port', 443);
        $scheme = config('reverb.apps.apps.0.options.scheme', 'https');

        // Handle case where config returns null (env not set)
        if (empty($host)) {
            $host = parse_url(config('app.url'), PHP_URL_HOST) ?: 'localhost';
        }

        return response()->json([
            'key' => config('reverb.apps.apps.0.key'),
            'host' => $host,
            'port' => $port,
            'scheme' => $scheme,
        ]);
    }
}
