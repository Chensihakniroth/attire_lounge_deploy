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
        // For now, we'll keep collections simple or you can create a CollectionService too!
        return Cache::remember('product_collections', 7200, function () {
            $collections = Collection::active()
                ->orderBy('sort_order')
                ->get();

            return response()->json([
                'success' => true,
                'data' => CollectionResource::collection($collections)
            ]);
        });
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
}

