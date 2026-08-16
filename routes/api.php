<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\NewsletterSubscriptionController;
use App\Http\Controllers\AdminLoginController;
use App\Http\Controllers\ReverbConfigController;
use App\Http\Controllers\GiftRequestController;
use App\Http\Controllers\GiftItemStockController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PromocodeController;
use App\Http\Controllers\PosProductController;
use App\Http\Controllers\PosInvoiceController;
use App\Http\Controllers\PosRefundController;
use App\Http\Controllers\SalesReportController;
use App\Http\Controllers\Api\OrderWebhookController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Controllers\Api\StockApiController;

Route::prefix('v1')->group(function () {
    // ═══════════════════════════════════════════════════════════════════════
    // KHRON API ROUTES (must be before ProductController routes to avoid conflicts)
    // ═══════════════════════════════════════════════════════════════════════

    // WooCommerce Order Webhook (called by Khron's integration)
    Route::post('/orders/webhook', [OrderWebhookController::class, 'store'])
        ->middleware(['api.key', 'throttle:30,1'])
        ->name('orders.webhook');

    // Public Product & Stock API (for Khron — separate API key, Nile-only)
    Route::middleware(['product.api.key', 'throttle:60,1'])->group(function () {
        Route::get('/products/nile', [ProductApiController::class, 'index']);
        Route::get('/products/nile/categories', [ProductApiController::class, 'categories']);
        Route::get('/products/nile/{sku}', [ProductApiController::class, 'show']);
        Route::get('/stock/nile', [StockApiController::class, 'index']);
        Route::get('/stock/nile/{sku}', [StockApiController::class, 'show']);
        Route::put('/stock/nile/{sku}', [StockApiController::class, 'update']);
    });

    // Notifications (POS UI — protected; auth token required. Previously public!)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC ROUTES (storefront)
    // ═══════════════════════════════════════════════════════════════════════

    // Newsletter Subscription (public)
    Route::post('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'store'])->middleware('throttle:5,1');

    // Appointment Booking (public)
    Route::post('/appointments', [AppointmentController::class, 'store'])->middleware('throttle:5,1');

    // Gift Request Submission (public)
    Route::post('/gift-requests', [GiftRequestController::class, 'store'])->middleware('throttle:5,1');

    // ═══════════════════════════════════════════════════════════════════════
    // STOREFRONT PUBLIC API (products, collections, categories)
    // ═══════════════════════════════════════════════════════════════════════
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/lookbook', [ProductController::class, 'lookbook']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::get('/products/collections', [ProductController::class, 'collections']);
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Admin Login Route (public, as authentication is done here)
    Route::post('/admin/login', [AdminLoginController::class, 'login'])->middleware('throttle:5,1');

    // Admin-specific routes - protected by authentication middleware
    Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {

        // User Profile Management (Self-service)
        Route::get('/user', function (Illuminate\Http\Request $request) {
            return $request->user();
        });
        Route::get('/me', [AdminLoginController::class, 'me']);
        Route::put('/user/profile', [UserController::class, 'updateProfile']);

        // Gift Requests — admin-only access for viewing
        Route::get('/gift-requests', [GiftRequestController::class, 'index']);

        // Reverb WebSocket config — served server-side, never exposed in HTML
        Route::get('/reverb/config', [ReverbConfigController::class, 'show']);

        // Restricted to Admin & Super Admin
        Route::middleware(['role:admin|super-admin'])->group(function () {
            // Admin Dashboard Stats
            Route::get('/stats', [AdminController::class, 'stats']);

            // Promocodes
            Route::get('/promocodes', [PromocodeController::class, 'index']);
            Route::post('/promocodes', [PromocodeController::class, 'store']);
            Route::put('/promocodes/{id}', [PromocodeController::class, 'update']);
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
            Route::post('/gift-requests/{id}/items', [GiftRequestController::class, 'addItem']);
            Route::delete('/gift-requests/{id}/items', [GiftRequestController::class, 'removeItem']);
            Route::delete('/gift-requests/{id}', [GiftRequestController::class, 'destroy']);

            // Gift Item Stock Management
            Route::post('/gift-items/toggle-stock', [GiftItemStockController::class, 'toggle']);

            // Alterings
            Route::get('/alterings', [\App\Http\Controllers\AlteringController::class, 'index']);
            Route::get('/alterings/trend', [\App\Http\Controllers\AlteringController::class, 'trend']);
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

            // ─── POS System ────────────────────────────────────────────────────
            // Products
            Route::get('/pos/products', [PosProductController::class, 'index']);
            Route::post('/pos/products', [PosProductController::class, 'store']);
            Route::post('/pos/products/bulk', [PosProductController::class, 'bulkStore']);
            Route::put('/pos/products/{id}', [PosProductController::class, 'update']);
            Route::delete('/pos/products/{id}', [PosProductController::class, 'destroy']);
            Route::get('/pos/products/services', [PosProductController::class, 'services']);
            Route::get('/pos/products/categories', [PosProductController::class, 'categories']);
            Route::get('/pos/products/export', [PosProductController::class, 'export']);
            Route::get('/pos/products/{id}', [PosProductController::class, 'show']);
            Route::get('/pos/products/{id}/label', [PosProductController::class, 'label']);
            Route::patch('/pos/products/{id}/stock', [PosProductController::class, 'updateStock']);
            Route::post('/pos/products/bulk-update', [PosProductController::class, 'bulkUpdate']);
            Route::post('/pos/products/bulk-deactivate', [PosProductController::class, 'bulkDeactivate']);
            Route::post('/pos/products/bulk-restore', [PosProductController::class, 'bulkRestore']);
            Route::post('/pos/products/bulk-delete', [PosProductController::class, 'bulkDestroy']);
            Route::post('/pos/products/import', [PosProductController::class, 'import']);

            // Invoices
            Route::get('/pos/invoices', [PosInvoiceController::class, 'index']);
            Route::post('/pos/invoices', [PosInvoiceController::class, 'store']);
            Route::get('/pos/invoices/{id}', [PosInvoiceController::class, 'show']);
            Route::delete('/pos/invoices/{id}', [PosInvoiceController::class, 'delete']);
            Route::post('/pos/invoices/{id}/notify-telegram', [OrderWebhookController::class, 'notifyTelegram']);

            // Refunds
            Route::post('/pos/invoices/{id}/refund', [PosRefundController::class, 'store']);
            Route::post('/pos/invoices/{id}/void', [PosRefundController::class, 'void']);

            // Notifications
            Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
            Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
            Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);

            // Daily summary (for Admin Dashboard widget)
            Route::get('/pos/summary/daily', [PosInvoiceController::class, 'dailySummary']);

            // ─── Sales Report & Targets ────────────────────────────────────────
            Route::get('/sales-report/daily',   [SalesReportController::class, 'daily']);
            Route::get('/sales-report/weekly',  [SalesReportController::class, 'weekly']);
            Route::get('/sales-report/monthly', [SalesReportController::class, 'monthly']);
            Route::get('/sales-report/targets', [SalesReportController::class, 'getTargets']);
            Route::post('/sales-report/targets', [SalesReportController::class, 'setTarget']);
            Route::delete('/sales-report/targets/{id}', [SalesReportController::class, 'deleteTarget']);
            // ───────────────────────────────────────────────────────────────────

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
