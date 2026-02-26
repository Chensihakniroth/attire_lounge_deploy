<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

use App\Models\Category;
use App\Models\Collection as ProductCollection; // Use alias to avoid confusion with Illuminate\Support\Collection
use App\DTOs\ProductFilterDTO;

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
    public function getPaginatedProducts(ProductFilterDTO $dto): LengthAwarePaginator
    {
        // Resolve slugs to IDs if necessary
        if (!empty($dto->categorySlugs)) {
            $collectionIds = [];
            $categoryIds = [];

            foreach ($dto->categorySlugs as $slug) {
                // 1. Try Collection lookup first (prioritize for UI)
                $collectionId = Cache::remember("collection_id.{$slug}", 3600, function () use ($slug) {
                    $collection = ProductCollection::where('slug', $slug)->first();
                    return $collection ? $collection->id : null;
                });

                if ($collectionId) {
                    $collectionIds[] = $collectionId;
                } else {
                    // 2. Try Category lookup if Collection fails
                    $categoryId = Cache::remember("category_id.{$slug}", 3600, function () use ($slug) {
                        $category = Category::where('slug', $slug)->first();
                        return $category ? $category->id : null;
                    });

                    if ($categoryId) {
                        $categoryIds[] = $categoryId;
                    }
                }
            }

            $dto = $dto->with([
                'collectionIds' => $collectionIds,
                'categoryIds' => $categoryIds,
                'categorySlugs' => []
            ]);
        }

        $cacheKey = 'products.' . md5(serialize($dto));

        return Cache::remember($cacheKey, 3600, function () use ($dto) {
            return $this->productRepository->getPaginated($dto);
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
