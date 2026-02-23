<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log; // Import Log facade
use App\Http\Resources\ProductResource;
use App\Http\Resources\CollectionResource;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // DEBUG: Log incoming request parameters
        Log::info('ProductController: Incoming request parameters', $request->all());

        $collectionFilter = $request->collection;
        if ($collectionFilter && is_string($collectionFilter)) {
            $collectionFilter = array_filter(explode(',', $collectionFilter));
        }

        // DEBUG: Log collectionFilter after processing
        Log::info('ProductController: collectionFilter after processing', ['filter' => $collectionFilter]);

        $query = Product::query()
            ->filter([
                'category' => $request->category,
                'collection' => $collectionFilter,
                'search' => $request->search
            ])
            ->sort($request->get('sort', 'newest'));

        // Pagination
        $perPage = $request->get('per_page', 100); // Now defaulting to 100 as per frontend change
        $products = $query->paginate($perPage);

        // DEBUG: Log products count and a sample of products being returned
        Log::info('ProductController: Products fetched for request', [
            'total_products_fetched' => $products->total(),
            'per_page' => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'sample_products_slugs' => collect($products->items())->pluck('slug')->toArray(),
        ]);

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

    public function featured()
    {
        $products = Product::where('featured', true)
            ->where('in_stock', true)
            ->orderBy('sort_order')
            ->limit(8)
            ->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products)
        ]);
    }

    public function categories()
    {
        $categories = Category::select('id', 'name', 'slug')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
    
    public function collections()
    {
        $collections = Collection::active()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CollectionResource::collection($collections)
        ]);
    }

    public function show($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product)
        ]);
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }
}
