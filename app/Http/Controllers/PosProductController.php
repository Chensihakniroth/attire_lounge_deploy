<?php

namespace App\Http\Controllers;

use App\Models\PosProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PosProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $type = $request->get('type', 'products');
        
        if ($type === 'services') {
            $query = PosProduct::active()->services();
        } elseif ($type === 'all') {
            $query = PosProduct::active();
        } else {
            $query = PosProduct::active()->products();
        }

        if ($search = $request->get('search')) {
            $query->search($search);
        }

        if ($category = $request->get('category')) {
            $query->where('category', $category);
        }

        if ($tier = $request->get('tier')) {
            $query->where('tier', $tier);
        }

        $products = $query
            ->orderBy('category')
            ->orderBy('name')
            ->paginate($request->get('per_page', 60));

        return response()->json($products);
    }

    /**
     * Store a new product/service.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sku' => 'required|string|unique:pos_products,sku',
            'name' => 'required|string',
            'variant' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string',
            'is_service' => 'boolean',
            'stock_qty' => 'integer|min:0',
            'tier' => 'nullable|string',
        ]);

        $product = PosProduct::create($validated);
        return response()->json($product, 201);
    }

    /**
     * Update an existing product/service.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = PosProduct::findOrFail($id);
        
        $validated = $request->validate([
            'sku' => 'string|unique:pos_products,sku,' . $id,
            'name' => 'string',
            'variant' => 'nullable|string',
            'price' => 'numeric|min:0',
            'category' => 'string',
            'is_service' => 'boolean',
            'stock_qty' => 'integer|min:0',
            'tier' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    /**
     * Remove a product (soft delete via is_active = false).
     */
    public function destroy(int $id): JsonResponse
    {
        $product = PosProduct::findOrFail($id);
        $product->update(['is_active' => false]);
        return response()->json(['message' => 'Product deactivated successfully']);
    }

    /**
     * List service items for quick-tap panel.
     * GET /api/v1/pos/products/services
     */
    public function services(): JsonResponse
    {
        $services = PosProduct::active()
            ->services()
            ->orderBy('name')
            ->get(['id', 'name', 'variant', 'price', 'category', 'sku']);

        return response()->json($services);
    }

    /**
     * Get all unique categories (for filter chips).
     * GET /api/v1/pos/products/categories
     */
    public function categories(): JsonResponse
    {
        $categories = PosProduct::active()
            ->products()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }

    /**
     * Single product detail (includes tier info).
     * GET /api/v1/pos/products/{id}
     */
    public function show(int $id): JsonResponse
    {
        $product = PosProduct::findOrFail($id);
        return response()->json($product);
    }

    /**
     * Generate a price tag label (returns data needed for frontend print).
     * GET /api/v1/pos/products/{id}/label
     */
    public function label(int $id): JsonResponse
    {
        $product = PosProduct::findOrFail($id);

        return response()->json([
            'sku'      => $product->sku,
            'barcode'  => $product->barcode ?? $product->sku,
            'name'     => $product->name,
            'variant'  => $product->variant,
            'price'    => $product->price,
            'category' => $product->category,
            'tier'     => $product->tier,
        ]);
    }

    /**
     * Update stock quantity (for future use).
     * PATCH /api/v1/pos/products/{id}/stock
     */
    public function updateStock(Request $request, int $id): JsonResponse
    {
        $request->validate(['stock_qty' => 'required|integer']);
        $product = PosProduct::findOrFail($id);
        $product->update(['stock_qty' => $request->stock_qty]);
        return response()->json($product);
    }
}
