<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $cacheKey = 'products.' . md5(json_encode($request->all()));

        return Cache::remember($cacheKey, 3600, function () use ($request) {
            $query = Product::query();

            // Filters
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            // Sorting
            $sort = $request->get('sort', 'newest');
            switch ($sort) {
                case 'price_low':
                    $query->orderBy('price');
                    break;
                case 'price_high':
                    $query->orderByDesc('price');
                    break;
                case 'featured':
                    $query->where('featured', true)->orderBy('sort_order');
                    break;
                default:
                    $query->orderByDesc('created_at');
            }

            // Pagination
            $perPage = $request->get('per_page', 12);
            $products = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => number_format($product->price, 2),
                        'compare_price' => $product->compare_price ? number_format($product->compare_price, 2) : null,
                        'category' => $product->category,
                        'featured' => $product->featured,
                        'in_stock' => $product->in_stock,
                        'images' => $product->images ? json_decode($product->images) : [],
                        'discount_percent' => $product->compare_price
                            ? round((($product->compare_price - $product->price) / $product->compare_price) * 100)
                            : 0,
                    ];
                }),
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
                'data' => $products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => number_format($product->price, 2),
                        'compare_price' => $product->compare_price ? number_format($product->compare_price, 2) : null,
                        'category' => $product->category,
                        'images' => $product->images ? json_decode($product->images) : [],
                        'in_stock' => $product->in_stock,
                        'discount_percent' => $product->compare_price
                            ? round((($product->compare_price - $product->price) / $product->compare_price) * 100)
                            : 0,
                    ];
                })
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

    public function show($slug)
    {
        return Cache::remember("product.{$slug}", 3600, function () use ($slug) {
            $product = Product::where('slug', $slug)->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'price' => number_format($product->price, 2),
                    'compare_price' => $product->compare_price ? number_format($product->compare_price, 2) : null,
                    'category' => $product->category,
                    'collection' => $product->collection,
                    'featured' => $product->featured,
                    'in_stock' => $product->in_stock,
                    'stock_quantity' => $product->stock_quantity,
                    'images' => $product->images ? json_decode($product->images) : [],
                    'sizes' => $product->sizes ? json_decode($product->sizes) : [],
                    'colors' => $product->colors ? json_decode($product->colors) : [],
                    'fabric' => $product->fabric,
                    'fit' => $product->fit,
                    'discount_percent' => $product->compare_price
                        ? round((($product->compare_price - $product->price) / $product->compare_price) * 100)
                        : 0,
                ]
            ]);
        });
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }
}
