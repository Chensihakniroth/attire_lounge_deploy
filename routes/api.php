<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AppointmentController; // Import the new controller

Route::prefix('v1')->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/categories', [ProductController::class, 'categories']);
    Route::get('/products/collections', [ProductController::class, 'collections']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Search
    Route::get('/search', [ProductController::class, 'search']);

    // Appointments
    Route::post('/appointments', [AppointmentController::class, 'store']);
});

Route::get('/debug/appointments-structure', function() {
    try {
        if (!\Illuminate\Support\Facades\Schema::hasTable('appointments')) {
            return response()->json(['error' => 'Table does not exist'], 404);
        }

        $columns = \Illuminate\Support\Facades\Schema::getColumnListing('appointments');
        $columnDetails = [];

        foreach ($columns as $column) {
            $columnDetails[$column] = \Illuminate\Support\Facades\DB::connection()->getDoctrineColumn('appointments', $column)->toArray();
        }

        // Try to insert a test record
        $testData = [
            'name' => 'Test Name',
            'email' => 'test@test.com',
            'phone' => '1234567890',
            'service' => 'test-service',
            'date' => now()->toDateString(),
            'time' => '10:00',
            'message' => 'Test message',
            'appointment_type' => 'test-type',
            'created_at' => now(),
            'updated_at' => now()
        ];

        // Filter only columns that exist
        $filteredData = array_intersect_key($testData, array_flip($columns));

        $testId = \Illuminate\Support\Facades\DB::table('appointments')->insertGetId($filteredData);

        return response()->json([
            'table_exists' => true,
            'columns' => $columns,
            'column_details' => $columnDetails,
            'test_insert' => $testId ? 'success' : 'failed',
            'test_id' => $testId,
            'filtered_data' => $filteredData
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
