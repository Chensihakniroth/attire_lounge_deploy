<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request and add security headers to the response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Enable XSS filter in older browsers
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Control referrer information leakage
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Restrict browser feature access
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // Isolate browsing context (prevents Spectre-style attacks)
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');

        // Force HTTPS for 1 year including subdomains
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        // Content Security Policy
        $csp = $this->buildCspHeader($request);
        $response->headers->set('Content-Security-Policy', $csp);

        // Remove server version disclosure headers
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }

    /**
     * Build the Content-Security-Policy header value.
     */
    private function buildCspHeader(Request $request): string
    {
        $host = $request->getHost();
        if (empty($host) || $host === 'localhost' || $host === '127.0.0.1') {
            $appUrl = parse_url(config('app.url'), PHP_URL_HOST);
            $host = $appUrl ?: 'localhost';
        }

        $isLocal = in_array($host, ['localhost', '127.0.0.1', '::1']) || str_contains($host, '.test');

        // Build WebSocket URLs from the actual Reverb config
        // This ensures CSP matches the real WebSocket endpoint in each environment
        $reverbHost = config('reverb.apps.apps.0.options.host', $host);
        $reverbPort = (int) config('reverb.apps.apps.0.options.port', 443);
        $reverbScheme = config('reverb.apps.apps.0.options.scheme', 'https');

        $wsUrls = [];

        // Always allow the main API host
        $wsUrls[] = "https://{$host}";

        // Add the Reverb WebSocket URL from config
        if ($reverbScheme === 'https' || $reverbScheme === 'wss') {
            $wsUrls[] = "wss://{$reverbHost}";
            if ($reverbPort !== 443) {
                $wsUrls[] = "wss://{$reverbHost}:{$reverbPort}";
            }
        } else {
            $wsUrls[] = "ws://{$reverbHost}";
            if ($reverbPort !== 80) {
                $wsUrls[] = "ws://{$reverbHost}:{$reverbPort}";
            }
        }

        // On local dev, also allow plain http/ws for the request host
        if ($isLocal) {
            $wsUrls[] = "http://{$host}";
            $wsUrls[] = "ws://{$host}";
        }

        $directives = [
            "default-src"     => ["'self'"],
            "script-src"      => array_merge(["'self'"], $isLocal ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
            "style-src"       => array_merge(["'self'", "'unsafe-inline'"], ["https://fonts.googleapis.com"]),
            "img-src"         => array_merge(
                ["'self'", "data:"],
                ["https://bucket-production-4ca0.up.railway.app"],
                ["https://images.prestigeonline.com"],
                ["https://www.prestigeonline.com"],
                ["https://images.unsplash.com"]
            ),
            "media-src"       => array_merge(
                ["'self'"],
                ["https://bucket-production-4ca0.up.railway.app"]
            ),
            "font-src"        => array_merge(["'self'"], ["https://fonts.gstatic.com"]),
            "connect-src"     => array_merge(["'self'"], array_unique($wsUrls)),
            "frame-ancestors" => ["'none'"],
            "form-action"     => ["'self'"],
            "base-uri"        => ["'self'"],
        ];

        $parts = [];
        foreach ($directives as $directive => $sources) {
            $parts[] = $directive . ' ' . implode(' ', $sources);
        }

        return implode('; ', $parts);
    }
}
