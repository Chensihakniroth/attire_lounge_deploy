<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Intervention\Image\Facades\Image;

class ImageOptimizer
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Optimize image responses
        if ($response->headers->get('Content-Type', '')->startsWith('image/')) {
            // You can add image optimization logic here
            // For example, compress JPEG/PNG, convert to WebP, etc.
        }

        return $response;
    }
}
