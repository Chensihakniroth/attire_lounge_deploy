<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\ProductResource;
use App\Http\Resources\CollectionResource;
use App\DTOs\ProductFilterDTO;
use Illuminate\Support\Facades\Cache;

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
     * Store a new product (Admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug',
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

