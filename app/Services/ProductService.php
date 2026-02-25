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
        // Resolve slug to IDs if necessary
        if ($dto->categorySlug) {
            $slug = $dto->categorySlug;

            // 1. Try Collection lookup first (prioritize for UI)
            $collectionId = Cache::remember("collection_id.{$slug}", 3600, function () use ($slug) {
                $collection = ProductCollection::where('slug', $slug)->first();
                return $collection ? $collection->id : null;
            });

            if ($collectionId) {
                $dto = $dto->with(['collectionId' => $collectionId, 'categorySlug' => null]);
            } else {
                // 2. Try Category lookup if Collection fails
                $categoryId = Cache::remember("category_id.{$slug}", 3600, function () use ($slug) {
                    $category = Category::where('slug', $slug)->first();
                    return $category ? $category->id : null;
                });

                if ($categoryId) {
                    $dto = $dto->with(['categoryId' => $categoryId, 'categorySlug' => null]);
                }
            }
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
