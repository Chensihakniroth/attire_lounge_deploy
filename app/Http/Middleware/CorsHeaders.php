<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsHeaders
{
    /**
     * Handle an incoming request and add CORS headers to the response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $origin = $request->headers->get('Origin');

        // Allow only the application's own origin
        $allowedOrigins = [
            config('app.url'),
            'https://www.attireloungeofficial.com',
            'https://attireloungeofficial.com',
        ];

        // In local/dev environment, allow localhost
        if (app()->environment('local', 'development')) {
            $allowedOrigins[] = 'http://localhost';
            $allowedOrigins[] = 'http://localhost:3000';
            $allowedOrigins[] = 'http://localhost:5173';
            $allowedOrigins[] = 'http://127.0.0.1:8000';
        }

        if ($origin && in_array($origin, $allowedOrigins, true)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-Token, X-Active-Outlet');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
        }

        // Handle preflight OPTIONS requests
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(204);
        }

        return $response;
    }
}
