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

        if ($search = $request->get('search') || $request->get('name') || $request->get('attribute') || $request->get('code')) {
            $query->search(
                $request->get('search'),
                $request->get('name'),
                $request->get('attribute'),
                $request->get('code')
            );
        }

        if ($category = $request->get('category')) {
            $cats = array_map('trim', explode(',', $category));
            if (count($cats) === 1) {
                $query->where('category', $cats[0]);
            } else {
                $query->whereIn('category', $cats);
            }
        }

        if ($tier = $request->get('tier')) {
            $query->where('tier', $tier);
        }

        if ($request->filled('in_stock')) {
            $inStock = $request->get('in_stock');
            if ($inStock == 1) {
                $query->where('stock_qty', '>', 0);
            } elseif ($inStock == 0) {
                $query->where('stock_qty', '<=', 0);
            }
        }

        $products = $query
            ->orderBy('category')
            ->orderBy('name')
            ->paginate($request->get('per_page', 60));

        return response()->json($products);
    }

    /**
     * Store multiple new products/services.
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.sku' => 'required|string|unique:pos_products,sku',
            'products.*.name' => 'required|string',
            'products.*.variant' => 'nullable|string',
            'products.*.price' => 'required|numeric|min:0',
            'products.*.category' => 'required|string',
            'products.*.is_service' => 'boolean',
            'products.*.stock_qty' => 'integer|min:0',
            'products.*.tier' => 'nullable|string',
        ]);

        $created = [];
        foreach ($validated['products'] as $productData) {
            $created[] = PosProduct::create($productData);
        }

        return response()->json([
            'message' => 'Bulk products created successfully',
            'count' => count($created),
            'products' => $created
        ], 201);
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

    /**
     * Bulk update multiple products.
     * POST /api/v1/admin/pos/products/bulk-update
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        // Support full product updates array format
        if ($request->has('products')) {
            $validated = $request->validate([
                'products' => 'required|array',
                'products.*.id' => 'required|exists:pos_products,id',
                'products.*.sku' => 'nullable|string',
                'products.*.name' => 'nullable|string',
                'products.*.price' => 'nullable|numeric|min:0',
                'products.*.stock_qty' => 'nullable|integer|min:0',
                'products.*.category' => 'nullable|string',
                'products.*.variant' => 'nullable|string',
                'products.*.min_stock' => 'nullable|integer|min:0',
                'products.*.max_stock' => 'nullable|integer|min:0',
                'products.*.status' => 'nullable|string|in:available,unavailable,discontinued',
                'products.*.barcode' => 'nullable|string',
            ]);

            $count = 0;
            foreach ($validated['products'] as $productData) {
                $product = PosProduct::find($productData['id']);
                if ($product) {
                    $updates = array_filter([
                        'sku' => $productData['sku'] ?? null,
                        'name' => $productData['name'] ?? null,
                        'price' => isset($productData['price']) ? $productData['price'] : null,
                        'stock_qty' => isset($productData['stock_qty']) ? $productData['stock_qty'] : null,
                        'category' => $productData['category'] ?? null,
                        'variant' => $productData['variant'] ?? null,
                        'min_stock' => isset($productData['min_stock']) ? $productData['min_stock'] : null,
                        'max_stock' => isset($productData['max_stock']) ? $productData['max_stock'] : null,
                        'status' => $productData['status'] ?? null,
                        'barcode' => $productData['barcode'] ?? null,
                    ], function($value) {
                        return $value !== null;
                    });

                    if (!empty($updates)) {
                        $product->update($updates);
                        $count++;
                    }
                }
            }

            return response()->json(['message' => 'Bulk update completed successfully', 'count' => $count]);
        }

        // Legacy format for simple bulk operations
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:pos_products,id',
            'category' => 'nullable|string',
            'price_change_type' => 'nullable|in:percentage,fixed',
            'price_change_value' => 'nullable|numeric',
            'stock_reset_value' => 'nullable|integer|min:0',
        ]);

        $products = PosProduct::whereIn('id', $validated['product_ids'])->get();

        foreach ($products as $product) {
            $updates = [];

            if (isset($validated['category'])) {
                $updates['category'] = $validated['category'];
            }

            if (isset($validated['price_change_value'])) {
                if ($validated['price_change_type'] === 'percentage') {
                    $updates['price'] = $product->price * (1 + ($validated['price_change_value'] / 100));
                } else {
                    $updates['price'] = $product->price + $validated['price_change_value'];
                }
                $updates['price'] = max(0, $updates['price']);
            }

            if (isset($validated['stock_reset_value'])) {
                $updates['stock_qty'] = $validated['stock_reset_value'];
            }

            if (!empty($updates)) {
                $product->update($updates);
            }
        }

        return response()->json(['message' => 'Bulk update completed successfully', 'count' => $products->count()]);
    }

    /**
     * Bulk deactivate (archive) products.
     * POST /api/v1/admin/pos/products/bulk-deactivate
     */
    public function bulkDeactivate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:pos_products,id',
        ]);

        PosProduct::whereIn('id', $validated['product_ids'])->update(['is_active' => false]);

        return response()->json(['message' => 'Products archived successfully', 'count' => count($validated['product_ids'])]);
    }

    /**
     * Export products to CSV.
     * GET /api/v1/admin/pos/products/export
     */
    public function export()
    {
        $products = PosProduct::active()->get([
            'sku', 'barcode', 'name', 'variant', 'price', 
            'stock_qty', 'min_stock', 'category', 'tier', 'is_service'
        ]);

        $callback = function() use ($products) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['SKU', 'Barcode', 'Name', 'Variant', 'Price', 'Stock Qty', 'Min Stock', 'Category', 'Tier', 'Is Service']);

            foreach ($products as $p) {
                fputcsv($file, [
                    $p->sku, $p->barcode, $p->name, $p->variant, $p->price,
                    $p->stock_qty, $p->min_stock, $p->category, $p->tier, $p->is_service ? '1' : '0'
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=pos_products_" . date('Y-m-d') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ]);
    }

    /**
     * Import products from CSV.
     * POST /api/v1/admin/pos/products/import
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), "r");
        
        // Skip header
        $header = fgetcsv($handle);
        
        $imported = 0;
        $errors = [];
        $line = 1;

        while (($data = fgetcsv($handle)) !== FALSE) {
            $line++;
            if (count($data) < 5) continue; // Basic validation

            try {
                // Map columns
                // Expected: SKU, Barcode, Name, Variant, Price, Stock Qty, Min Stock, Category, Tier, Is Service
                $sku        = $data[0] ?? null;
                $barcode    = $data[1] ?? null;
                $name       = $data[2] ?? null;
                $variant    = $data[3] ?? null;
                $price      = floatval($data[4] ?? 0);
                $stock      = intval($data[5] ?? 0);
                $minStock   = intval($data[6] ?? 0);
                $category   = $data[7] ?? 'General';
                $tier       = $data[8] ?? null;
                $isService  = ($data[9] ?? '0') === '1';

                if (!$sku || !$name) {
                    $errors[] = "Line $line: SKU and Name are required.";
                    continue;
                }

                PosProduct::updateOrCreate(
                    ['sku' => $sku],
                    [
                        'barcode'    => $barcode,
                        'name'       => $name,
                        'variant'    => $variant,
                        'price'      => $price,
                        'stock_qty'  => $stock,
                        'min_stock'  => $minStock,
                        'category'   => $category,
                        'tier'       => $tier,
                        'is_service' => $isService,
                        'is_active'  => true
                    ]
                );
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Line $line: " . $e->getMessage();
            }
        }
        fclose($handle);

        return response()->json([
            'message' => 'Import completed',
            'imported' => $imported,
            'errors' => $errors
        ]);
    }
}
