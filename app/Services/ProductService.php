<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

use App\Models\Category;
use App\Models\Collection as ProductCollection; // Use alias to avoid confusion with Illuminate\Support\Collection

class ProductService
{
    /**
     * @var ProductRepositoryInterface
     */
    protected $productRepository;

    public function __construct(ProductRepositoryInterface $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Get paginated products with caching.
     */
    public function getPaginatedProducts(array $requestData): LengthAwarePaginator
    {
        // Add category_id or collection_id to requestData if category slug is provided
        if (isset($requestData['category'])) {
            $slug = $requestData['category'];

            // 1. Try Collection lookup first (prioritize for UI)
            $collectionId = Cache::remember("collection_id.{$slug}", 3600, function () use ($slug) {
                $collection = ProductCollection::where('slug', $slug)->first();
                return $collection ? $collection->id : null;
            });

            if ($collectionId) {
                $requestData['collection_id'] = $collectionId;
                // Clear category to avoid filtering by both
                unset($requestData['category']);
            } else {
                // 2. Try Category lookup if Collection fails
                $categoryId = Cache::remember("category_id.{$slug}", 3600, function () use ($slug) {
                    $category = Category::where('slug', $slug)->first();
                    return $category ? $category->id : null;
                });

                if ($categoryId) {
                    $requestData['category_id'] = $categoryId;
                    unset($requestData['category']);
                } else {
                    // If neither exist, remove filter
                    unset($requestData['category']);
                }
            }
        }

        $cacheKey = 'products.' . md5(json_encode($requestData));

        return Cache::remember($cacheKey, 3600, function () use ($requestData) {
            $filters = [
                'category_id' => $requestData['category_id'] ?? null,
                'collection_id' => $requestData['collection_id'] ?? null,
                'search' => $requestData['search'] ?? null
            ];
            $sort = $requestData['sort'] ?? 'newest';
            $perPage = (int)($requestData['per_page'] ?? 12);

            return $this->productRepository->getPaginated($filters, $sort, $perPage);
        });
    }

    /**
     * Get featured products with caching.
     */
    public function getFeaturedProducts(int $limit = 8): Collection
    {
        return Cache::remember('featured_products', 3600, function () use ($limit) {
            return $this->productRepository->getFeatured($limit);
        });
    }

    /**
     * Get distinct product categories with caching.
     */
    public function getProductCategories(): Collection
    {
        return Cache::remember('product_categories', 7200, function () {
            return $this->productRepository->getCategories();
        });
    }

    /**
     * Find a product by slug with caching.
     */
    public function getProductBySlug(string $slug)
    {
        return Cache::remember("product.{$slug}", 3600, function () use ($slug) {
            return $this->productRepository->findBySlug($slug);
        });
    }
}
