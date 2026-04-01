<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\NewsletterSubscriptionController;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\GiftRequestController;
use App\Http\Controllers\GiftItemStockController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PromocodeController;

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

    // Promocodes (Public validate route)
    Route::post('/promocodes/validate', [PromocodeController::class, 'validateCode']);

    // Newsletter Subscription (public)
    Route::post('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'store']);

    // Admin Login Route (public, as authentication is done here)
    Route::post('/admin/login', [AdminLoginController::class, 'login'])->middleware('throttle:5,1');

    // Admin-specific routes - protected by authentication middleware
    Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
        
        // User Profile Management (Self-service)
        Route::get('/user', function (Illuminate\Http\Request $request) {
            return $request->user();
        });
        Route::put('/user/profile', [UserController::class, 'updateProfile']);

        // Restricted to Admin & Super Admin
        Route::middleware(['role:admin|super-admin'])->group(function () {
            // Admin Dashboard Stats
            Route::get('/stats', [AdminController::class, 'stats']);

            // Promocodes
            Route::get('/promocodes', [PromocodeController::class, 'index']);
            Route::post('/promocodes', [PromocodeController::class, 'store']);
            Route::delete('/promocodes/{id}', [PromocodeController::class, 'destroy']);

            // Newsletter Management
            Route::get('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'index']);
            Route::delete('/newsletter-subscriptions/{subscriber}', [NewsletterSubscriptionController::class, 'destroy']);

            // Appointments
            Route::get('/appointments', [AppointmentController::class, 'index']);
            Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
            Route::delete('/appointments/completed', [AppointmentController::class, 'clearCompleted']);

            // Gift Requests
            Route::patch('/gift-requests/{id}/status', [GiftRequestController::class, 'updateStatus']);
            Route::delete('/gift-requests/{id}', [GiftRequestController::class, 'destroy']);

            // Gift Item Stock Management
            Route::post('/gift-items/toggle-stock', [GiftItemStockController::class, 'toggle']);

            // Alterings
            Route::get('/alterings', [\App\Http\Controllers\AlteringController::class, 'index']);
            Route::post('/alterings', [\App\Http\Controllers\AlteringController::class, 'store']);
            Route::put('/alterings/{id}', [\App\Http\Controllers\AlteringController::class, 'update']);
            Route::post('/alterings/{id}/notify', [\App\Http\Controllers\AlteringController::class, 'notify']);
            Route::delete('/alterings/{id}', [\App\Http\Controllers\AlteringController::class, 'destroy']);
            Route::post('/alterings/bulk-delete', [\App\Http\Controllers\AlteringController::class, 'bulkDestroy']);
            Route::post('/alterings/import', [\App\Http\Controllers\AlteringController::class, 'import']);

            // Products
            Route::post('/products/bulk', [ProductController::class, 'bulkStore']);
            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{id}', [ProductController::class, 'update']);
            Route::patch('/products/{id}', [ProductController::class, 'update']);
            Route::delete('/products/{id}', [ProductController::class, 'destroy']);

            // Collections
            Route::get('/collections', [ProductController::class, 'adminCollections']);
            Route::post('/collections', [ProductController::class, 'storeCollection']);
            Route::match(['put', 'patch'], '/collections/{id}', [ProductController::class, 'updateCollection']);
            Route::delete('/collections/{id}', [ProductController::class, 'destroyCollection']);
            
            // Image Uploads
            Route::post('/images/upload', [ImageUploadController::class, 'upload']);
            Route::get('/images', [ImageUploadController::class, 'listImages']);
            Route::post('/images/delete', [ImageUploadController::class, 'deleteImage']);

            // Customer Profiles
            Route::get('/customer-profiles', [CustomerProfileController::class, 'index']);
            Route::post('/customer-profiles', [CustomerProfileController::class, 'store']);
            Route::get('/customer-profiles/{id}', [CustomerProfileController::class, 'show']);
            Route::put('/customer-profiles/{id}', [CustomerProfileController::class, 'update']);
            Route::delete('/customer-profiles/{id}', [CustomerProfileController::class, 'destroy']);

            // Restricted strictly to Super Admin ONLY
            Route::middleware(['role:super-admin'])->group(function () {
                // Users & Roles (Team Access)
                Route::get('/users', [UserController::class, 'index']);
                Route::post('/users', [UserController::class, 'store']);
                Route::put('/users/{user}', [UserController::class, 'update']);
                Route::delete('/users/{user}', [UserController::class, 'destroy']);
                Route::get('/roles-permissions', [UserController::class, 'rolesAndPermissions']);

                // Audit Logs
                Route::get('/activities', [ActivityController::class, 'index']);
                Route::get('/activities/{activity}', [ActivityController::class, 'show']);
            });
        });
    });
});
