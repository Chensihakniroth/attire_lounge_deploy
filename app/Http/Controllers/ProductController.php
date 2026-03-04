<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\ProductResource;
use App\Http\Resources\CollectionResource;
use App\DTOs\ProductFilterDTO;
use App\Helpers\MathHelper;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\Product;

class ProductController extends Controller
{
    protected $productService;

    /**
     * Inject the ProductService.
     */
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Store multiple products in a single batch (Admin only).
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'base_name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'availability' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'is_featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'is_visible' => 'nullable|boolean',
            'fabric' => 'nullable|string|max:255',
            'silhouette' => 'nullable|string|max:255',
            'details' => 'nullable|string|max:255',
            'sizing' => 'nullable|array',
            'images' => 'required|array|min:1|max:10', // Max 10 as requested
        ]);

        $baseName = $validated['base_name'];
        $images = $validated['images'];
        $results = [];

        // Pre-calculate count once to ensure consistency in the loop ✨
        $existingCount = Product::where('name', $baseName)
            ->orWhere('name', 'like', $baseName . ' %')
            ->count();

        foreach ($images as $index => $imageUrl) {
            $currentIndex = $existingCount + $index;
            $naming = $this->generateRomanNaming($baseName, $currentIndex);

            $productData = array_merge($validated, [
                'name' => $naming['name'],
                'slug' => $naming['slug'],
                'images' => [$imageUrl], // Each product gets exactly one image from the bulk set
            ]);

            unset($productData['base_name']);
            $results[] = $this->productService->createProduct($productData);
        }

        return response()->json([
            'success' => true,
            'message' => count($results) . ' masterpieces created successfully! (ﾉ´ヮ`)ﾉ*:･ﾟ✧',
            'data' => ProductResource::collection($results)
        ]);
    }

    /**
     * Get a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        $dto = ProductFilterDTO::fromRequest($request);
        $products = $this->productService->getPaginatedProducts($dto);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'total' => $products->total(),
                'per_page' => $products->perPage(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ]
        ]);
    }

    /**
     * Get featured products.
     */
    public function featured(): JsonResponse
    {
        $products = $this->productService->getFeaturedProducts();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products)
        ]);
    }

    /**
     * Get all categories.
     */
    public function categories(): JsonResponse
    {
        $categories = $this->productService->getProductCategories();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get all collections.
     */
    public function collections(): JsonResponse
    {
        $collections = Cache::remember('product_collections', 7200, function () {
            return Collection::active()
                ->orderBy('sort_order')
                ->get();
        });

        return response()->json([
            'success' => true,
            'data' => CollectionResource::collection($collections)
        ]);
    }

    /**
     * Get a specific product by slug.
     */
    public function show($slug): JsonResponse
    {
        $product = $this->productService->getProductBySlug($slug);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product)
        ]);
    }

    /**
     * Search products.
     */
    public function search(Request $request): JsonResponse
    {
        return $this->index($request);
    }

    /**
     * Store a new collection (Admin only).
     */
    public function storeCollection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:collections,slug',
            'description' => 'nullable|string',
            'season' => 'nullable|string|max:255',
            'year' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        // Provide defaults for missing required fields if necessary ✨
        if (!isset($validated['year'])) {
            $validated['year'] = date('Y');
        }

        $collection = Collection::create($validated);
        Cache::forget('product_collections');

        return response()->json([
            'success' => true,
            'data' => new CollectionResource($collection)
        ]);
    }

    /**
     * Delete a collection (Admin only).
     */
    public function destroyCollection($id): JsonResponse
    {
        $collection = Collection::find($id);
        
        if (!$collection) {
            return response()->json(['success' => false, 'message' => 'Collection not found'], 404);
        }

        // Safety check: Don't delete collections that have products! ✨
        if ($collection->products()->count() > 0) {
            return response()->json([
                'success' => false, 
                'message' => 'Cannot delete a collection that still contains masterpieces. Please move or delete the products first.'
            ], 422);
        }

        $collection->delete();
        Cache::forget('product_collections');

        return response()->json([
            'success' => true,
            'message' => 'Collection deleted successfully'
        ]);
    }

    /**
     * Helper to generate Roman Numeral naming and slugging.
     */
    private function generateRomanNaming(string $baseName, int $index): array
    {
        $suffix = $index > 0 ? ' ' . MathHelper::toRoman($index) : '';
        $slugSuffix = $index > 0 ? '-' . strtolower(MathHelper::toRoman($index)) : '';
        
        return [
            'name' => $baseName . $suffix,
            'slug' => Str::slug($baseName) . $slugSuffix
        ];
    }

    /**
     * Store a new product (Admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string', // Made nullable to support auto-generation
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'availability' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'is_featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'is_visible' => 'nullable|boolean',
            'fabric' => 'nullable|string|max:255',
            'silhouette' => 'nullable|string|max:255',
            'details' => 'nullable|string|max:255',
            'sizing' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        // If no slug is provided or it matches the name, let's check for Roman sequence ✨
        $baseName = $validated['name'];
        
        // Determine the next index in the sequence
        $existingCount = Product::where('name', $baseName)
            ->orWhere('name', 'like', $baseName . ' %')
            ->count();

        if ($existingCount > 0) {
            $naming = $this->generateRomanNaming($baseName, $existingCount);
            $validated['name'] = $naming['name'];
            $validated['slug'] = $naming['slug'];
        } elseif (!isset($validated['slug']) || empty($validated['slug'])) {
            $validated['slug'] = Str::slug($baseName);
        }

        $product = $this->productService->createProduct($validated);

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product)
        ]);
    }

    /**
     * Update a product (Admin only).
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:products,slug,' . $id,
            'price' => 'sometimes|numeric',
            'description' => 'sometimes|string',
            'availability' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'collection_id' => 'sometimes|nullable|exists:collections,id',
            'is_featured' => 'sometimes|boolean',
            'is_new' => 'sometimes|boolean',
            'is_visible' => 'sometimes|boolean',
            'fabric' => 'sometimes|nullable|string|max:255',
            'silhouette' => 'sometimes|nullable|string|max:255',
            'details' => 'sometimes|nullable|string|max:255',
            'sizing' => 'sometimes|nullable|array',
            'images' => 'sometimes|nullable|array',
        ]);

        $product = $this->productService->updateProduct($id, $validated);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product)
        ]);
    }

    /**
     * Delete a product (Admin only).
     */
    public function destroy($id): JsonResponse
    {
        $deleted = $this->productService->deleteProduct($id);

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Product not found or could not be deleted'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}

