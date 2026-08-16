<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust X-Forwarded-* from configured proxies only (comma-separated
        // IPs/CIDRs in TRUSTED_PROXIES). Defaults to "*" to preserve the
        // previous behaviour behind Railway's load balancer / reverse proxy.
        $middleware->trustProxies(
            at: array_values(array_filter(array_map(
                'trim',
                explode(',', (string) env('TRUSTED_PROXIES', '*'))
            )))
        );

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'api.key' => \App\Http\Middleware\VerifyApiKey::class,
            'product.api.key' => \App\Http\Middleware\VerifyProductApiKey::class,
        ]);

        // Apply security headers to all responses
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Apply CORS headers to API routes
        $middleware->append(\App\Http\Middleware\CorsHeaders::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
