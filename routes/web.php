<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;

// ===== API ROUTES ONLY =====
Route::prefix('api')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::get('/products/collections', [ProductController::class, 'collections']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/search', [ProductController::class, 'search']);
});

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
