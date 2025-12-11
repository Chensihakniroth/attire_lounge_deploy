<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

// ===== API ROUTES =====
Route::prefix('api')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::get('/products/collections', [ProductController::class, 'collections']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/search', [ProductController::class, 'search']);
});

// ===== REACT APP ROUTES =====
Route::get('/', function () {
    return view('app');
});

Route::get('/collections', function () {
    return view('app');
});

Route::get('/lookbook', function () {
    return view('app');
});

Route::get('/bespoke', function () {
    return view('app');
});

Route::get('/contact', function () {
    return view('app');
});

Route::get('/product/{slug}', function () {
    return view('app');
});

// Test routes
Route::get('/test-redis', function() {
    try {
        \Illuminate\Support\Facades\Redis::ping();
        \Illuminate\Support\Facades\Redis::set('laravel_test', 'Redis is working!');
        $value = \Illuminate\Support\Facades\Redis::get('laravel_test');

        return response()->json([
            'status' => 'success',
            'message' => 'Redis is connected',
            'redis_test' => $value,
            'cache_test' => \Illuminate\Support\Facades\Cache::get('test', 'Cache not set')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});

// Catch-all for React - MUST BE LAST
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
