<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PosProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductApiController extends Controller
{
    /**
     * List products for the Nile outlet only.
     * GET /api/v1/products
     */
    public function index(Request $request): JsonResponse
    {
        // Always nile — Khron only sees Nile products
        // Disable the global OutletScope and filter manually
        $query = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)
            ->where('outlet', 'nile');

        // Filter by active status (default: active only)
        $status = $request->get('status', 'active');
        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        // Filter by SKU
        if ($request->filled('sku')) {
            $query->where('sku', $request->get('sku'));
        }

        // Search by name or SKU
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%");
            });
        }

        $products = $query
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $products,
            'count'   => $products->count(),
        ]);
    }

    /**
     * Get a single product by SKU.
     * GET /api/v1/products/{sku}
     */
    public function show(string $sku): JsonResponse
    {
        $product = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)
            ->where('sku', $sku)
            ->where('outlet', 'nile')
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'error'   => 'not_found',
                'message' => "Product with SKU '{$sku}' not found",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $product,
        ]);
    }

    /**
     * Get all categories for the Nile outlet.
     * GET /api/v1/products/categories
     */
    public function categories(): JsonResponse
    {
        $categories = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)
            ->where('outlet', 'nile')
            ->where('is_active', true)
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json([
            'success' => true,
            'data'    => $categories,
        ]);
    }
}
