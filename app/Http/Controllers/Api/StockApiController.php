<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\StockChanged;
use App\Models\PosProduct;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class StockApiController extends Controller
{
    /**
     * Get stock levels for Nile outlet products.
     * GET /api/v1/stock
     */
    public function index(Request $request): JsonResponse
    {
        // Always nile — Khron only sees Nile stock
        // Disable the global OutletScope and filter manually
        $query = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)
            ->where('outlet', 'nile')
            ->where('is_active', true)
            ->where('is_service', false);

        // Filter by SKU(s)
        if ($request->filled('skus')) {
            $skus = array_map('trim', explode(',', $request->get('skus')));
            $query->whereIn('sku', $skus);
        }

        // Filter by low stock
        if ($request->boolean('low_stock')) {
            $query->where('stock_qty', '<=', 5)->where('stock_qty', '>', 0);
        }

        // Filter by out of stock
        if ($request->boolean('out_of_stock')) {
            $query->where('stock_qty', '<=', 0);
        }

        $products = $query
            ->orderBy('stock_qty', 'asc')
            ->get(['id', 'sku', 'name', 'variant', 'stock_qty', 'min_stock', 'category']);

        return response()->json([
            'success' => true,
            'data'    => $products,
            'count'   => $products->count(),
        ]);
    }

    /**
     * Get stock for a single product by SKU.
     * GET /api/v1/stock/{sku}
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
            'data'    => [
                'id'         => $product->id,
                'sku'        => $product->sku,
                'name'       => $product->name,
                'variant'    => $product->variant,
                'stock_qty'  => $product->stock_qty,
                'min_stock'  => $product->min_stock,
                'category'   => $product->category,
                'is_service' => $product->is_service,
            ],
        ]);
    }

    /**
     * Update stock quantity for a product.
     * PUT /api/v1/stock/{sku}
     */
    public function update(Request $request, string $sku): JsonResponse
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

        if ($product->is_service) {
            return response()->json([
                'success' => false,
                'error'   => 'service_item',
                'message' => 'Cannot update stock for service items',
            ], 422);
        }

        $validated = $request->validate([
            'stock_qty'  => 'nullable|integer|min:0',
            'adjustment' => 'nullable|integer',
            'reason'     => 'nullable|string|max:255',
        ]);

        $oldStock = $product->stock_qty;
        $newStock = $oldStock;

        if (isset($validated['stock_qty'])) {
            // Absolute set
            $newStock = $validated['stock_qty'];
        } elseif (isset($validated['adjustment'])) {
            // Relative adjustment (positive or negative)
            $newStock = $oldStock + $validated['adjustment'];
            if ($newStock < 0) {
                return response()->json([
                    'success' => false,
                    'error'   => 'insufficient_stock',
                    'message' => "Cannot reduce stock below zero. Current: {$oldStock}, Adjustment: {$validated['adjustment']}",
                    'current_stock' => $oldStock,
                ], 409);
            }
        } else {
            return response()->json([
                'success' => false,
                'error'   => 'missing_field',
                'message' => 'Either stock_qty or adjustment is required',
            ], 422);
        }

        $product->update(['stock_qty' => $newStock]);

        // Broadcast stock change event via Reverb
        broadcast(new StockChanged(
            sku: $sku,
            name: $product->name,
            oldStock: $oldStock,
            newStock: $newStock,
            outlet: $product->outlet,
            reason: $validated['reason'] ?? 'api_update'
        ))->toOthers();

        Log::info('Stock updated via API', [
            'sku'      => $sku,
            'old_stock'=> $oldStock,
            'new_stock'=> $newStock,
            'reason'   => $validated['reason'] ?? 'manual_update',
        ]);

        return response()->json([
            'success'      => true,
            'data'         => [
                'sku'        => $product->sku,
                'name'       => $product->name,
                'old_stock'  => $oldStock,
                'new_stock'  => $newStock,
                'difference' => $newStock - $oldStock,
            ],
        ]);
    }
}
