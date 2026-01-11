<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

// Test route
Route::get('/test-redis', function() {
    try {
        \Illuminate\Support\Facades\Redis::ping();
        return response()->json(['status' => 'success', 'message' => 'Redis connected']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

// ===== SINGLE ROUTE FOR REACT SPA =====
Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');

Route::get('/health', function() {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version()
    ]);
});
