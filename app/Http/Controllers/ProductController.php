<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use App\Http\Resources\ProductResource;
use App\Http\Resources\CollectionResource;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $cacheKey = 'products.' . md5(json_encode($request->all()));

        return Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Product::query()
                ->filter([
                    'category' => $request->category,
                    'search' => $request->search
                ])
                ->sort($request->get('sort', 'newest'));

            // Pagination
            $perPage = $request->get('per_page', 12);
            $products = $query->paginate($perPage);

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
        });
    }

    public function featured()
    {
        return Cache::remember('featured_products', 3600, function () {
            $products = Product::where('featured', true)
                ->where('in_stock', true)
                ->orderBy('sort_order')
                ->limit(8)
                ->get();

            return response()->json([
                'success' => true,
                'data' => ProductResource::collection($products)
            ]);
        });
    }

    public function categories()
    {
        return Cache::remember('product_categories', 7200, function () {
            $categories = Product::select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        });
    }
    
    public function collections()
    {
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

    public function show($slug)
    {
        return Cache::remember("product.{$slug}", 3600, function () use ($slug) {
            $product = Product::where('slug', $slug)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => new ProductResource($product)
            ]);
        });
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }
}
