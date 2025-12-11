<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;

// Your React app - MAIN ROUTE
Route::get('/', function () {
    return view('app');
});

// For Single Page App - catch all routes
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

// Test route (keep your existing test)
Route::get('/test-redis', function() {
    try {
        // Test Redis connection
        Redis::ping();

        // Test storing and retrieving from Redis
        Redis::set('laravel_test', 'Redis is working with Laravel!');
        $value = Redis::get('laravel_test');

        // Test caching
        Cache::put('test_cache', 'Cached value', 60); // 1 minute
        $cached = Cache::get('test_cache');

        return response()->json([
            'status' => 'success',
            'redis_value' => $value,
            'cached_value' => $cached,
            'redis_info' => Redis::info(),
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});
