<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\NewsletterSubscriptionController;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\GiftRequestController;
// use App\Http\Controllers\TempController; // Removed TempController import

Route::prefix('v1')->group(function () {
    // Public Product routes (accessible to all)
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/featured', [ProductController::class, 'featured'])->name('products.featured');
    Route::get('/products/categories', [ProductController::class, 'categories'])->name('products.categories');
    Route::get('/products/collections', [ProductController::class, 'collections'])->name('products.collections');
    Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

    // Search
    Route::get('/search', [ProductController::class, 'search']);

    // Public Appointments route (for users to store appointments)
    Route::post('/appointments', [AppointmentController::class, 'store']);

    // Gift Requests
    Route::get('/gift-requests', [GiftRequestController::class, 'index']);
    Route::post('/gift-requests', [GiftRequestController::class, 'store']);
    Route::patch('/gift-requests/{giftRequest}/status', [GiftRequestController::class, 'updateStatus']);
    Route::delete('/gift-requests/{giftRequest}', [GiftRequestController::class, 'destroy']);

    // Gift Item Stock (public access for fetching status)
    Route::get('/gift-items/out-of-stock', [\App\Http\Controllers\GiftItemStockController::class, 'index']);

    // Newsletter Subscription (public)
    Route::post('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'store']);

    // Admin Login Route (public, as authentication is done here)
    Route::post('/admin/login', [AdminLoginController::class, 'login']);

    // TEMP ROUTE FOR DEBUGGING COLLECTIONS - REMOVED
    // Route::get('/debug/collections', [TempController::class, 'listCollections']);
    // Route::get('/debug/groom-products', [TempController::class, 'listGroomProducts']);

    // Admin-specific routes - protected by authentication middleware
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        // Appointments management (admin only)
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
        Route::post('/appointments/clear-completed', [AppointmentController::class, 'clearCompleted']);

        // Image Upload and management (admin only)
        Route::post('/upload-image', [ImageUploadController::class, 'upload']);
        Route::get('/images', [ImageUploadController::class, 'listImages']);
        Route::post('/delete-image', [ImageUploadController::class, 'deleteImage']);

        // Gift Item Stock Management (admin only)
        Route::post('/gift-items/toggle-stock', [\App\Http\Controllers\GiftItemStockController::class, 'toggle']);
    });
});
