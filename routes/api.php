<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\NewsletterSubscriptionController;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\GiftRequestController;

Route::prefix('v1')->group(function () {
    // Handle OPTIONS preflight requests
    Route::match(['options'], '/appointments', [AppointmentController::class, 'handleOptions']);
    Route::match(['options'], '/appointments/{id}/status', [AppointmentController::class, 'handleOptionsStatus']);
    Route::match(['options'], '/appointments/clear-completed', [AppointmentController::class, 'handleOptionsClearCompleted']);

    // Public Product routes (accessible to all)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::get('/products/collections', [ProductController::class, 'collections']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Search
    Route::get('/search', [ProductController::class, 'search']);

    // Public Appointments route (for users to store appointments)
    Route::post('/appointments', [AppointmentController::class, 'store']);

    // Gift Requests
    Route::get('/gift-requests', [GiftRequestController::class, 'index']);
    Route::post('/gift-requests', [GiftRequestController::class, 'store']);
    Route::patch('/gift-requests/{giftRequest}/status', [GiftRequestController::class, 'updateStatus']);
    Route::delete('/gift-requests/{giftRequest}', [GiftRequestController::class, 'destroy']);

    // Newsletter Subscription (public)
    Route::post('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'store']);

    // Debug endpoints (should be protected in production)
    Route::get('/debug/appointments-table', function() {
        try {
            if (!\Illuminate\Support\Facades\Schema::hasTable('appointments')) {
                return response()->json(['error' => 'Table does not exist'], 404);
            }

            $columns = \Illuminate\Support\Facades\Schema::getColumnListing('appointments');
            $sample = \App\Models\Appointment::first();

            return response()->json([
                'table_exists' => true,
                'columns' => $columns,
                'sample_data' => $sample,
                'total_records' => \App\Models\Appointment::count()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    Route::get('/test-db', function() {
        try {
            \Illuminate\Support\Facades\DB::connection()->getPdo();
            return response()->json([
                'success' => true,
                'message' => 'Database connected successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    });
    
    // Admin Login Route (public, as authentication is done here)
    Route::post('/admin/login', [AdminLoginController::class, 'login']);

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
    });
});
