<?php

namespace App\Http\Controllers;

use App\Models\CustomerProfile;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\ProductResource;

class SearchController extends Controller
{
    /**
     * Unified search endpoint for both products and customers.
     * This fixes the bug where VIP customer search was returning products.
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        $type = $request->query('type', 'product');

        if (empty($query) && $type !== 'customer') {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        switch ($type) {
            case 'customer':
                return $this->searchCustomers($query);
            
            case 'product':
            default:
                // Delegate to ProductController@index for products
                return app(ProductController::class)->index($request);
        }
    }

    /**
     * Search for customer profiles by name or phone.
     */
    private function searchCustomers(string $query): JsonResponse
    {
        $customers = CustomerProfile::query()
            ->where('name', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        // Transform to meet the expectations of InlineCustomerSearch.jsx
        $formatted = $customers->map(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email, // Optional, might be null
                'is_vip' => $customer->client_status === 'VIP', // Simple mapping
                'type' => 'customer'
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }
}
