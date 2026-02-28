<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\NewsletterSubscriptionController;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\GiftRequestController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\UserController;

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

    // Gift Requests (Public routes for viewing and submitting)
    Route::get('/gift-requests', [GiftRequestController::class, 'index']);
    Route::post('/gift-requests', [GiftRequestController::class, 'store']);

    // Gift Item Stock (public access for fetching status)
    Route::get('/gift-items/out-of-stock', [\App\Http\Controllers\GiftItemStockController::class, 'index']);

    // Newsletter Subscription (public)
    Route::post('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'store']);

    // Admin Login Route (public, as authentication is done here)
    Route::post('/admin/login', [AdminLoginController::class, 'login'])->middleware('throttle:5,1');

    // Admin-specific routes - protected by authentication middleware
    Route::middleware(['auth:sanctum', 'role:admin|super-admin'])->prefix('admin')->group(function () {
        // Users & Roles
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::get('/roles-permissions', [UserController::class, 'rolesAndPermissions']);

        // Newsletter Management
        Route::get('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'index']);
        Route::delete('/newsletter-subscriptions/{subscriber}', [NewsletterSubscriptionController::class, 'destroy']);

        // Audit Logs
        Route::get('/activities', [ActivityController::class, 'index']);
        Route::get('/activities/{activity}', [ActivityController::class, 'show']);

        // Admin
        Route::get('/stats', [AdminController::class, 'stats']);

        // Appointments
        Route::get('/appointments', [AppointmentController::class, 'index']);
        Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
        Route::delete('/appointments/completed', [AppointmentController::class, 'clearCompleted']);

        // Gift Requests
        Route::patch('/gift-requests/{giftRequest}/status', [GiftRequestController::class, 'updateStatus']);
        Route::delete('/gift-requests/{giftRequest}', [GiftRequestController::class, 'destroy']);

        // Products
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::patch('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Collections
        Route::post('/collections', [ProductController::class, 'storeCollection']);
        Route::delete('/collections/{id}', [ProductController::class, 'destroyCollection']);
        
        // Image Uploads
        Route::post('/images/upload', [ImageUploadController::class, 'upload']);
        Route::get('/images', [ImageUploadController::class, 'listImages']);
        Route::post('/images/delete', [ImageUploadController::class, 'deleteImage']);
    });
});
