<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ImageOptimizer
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Add cache headers for images
        if ($response->headers->get('Content-Type', '')->startsWith('image/')) {
            $response->header('Cache-Control', 'public, max-age=31536000');
        }

        return $response;
    }
}
