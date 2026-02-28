<?php

namespace App\Services;

use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

use App\Models\Category;
use App\Models\Collection as ProductCollection; // Use alias to avoid confusion with Illuminate\Support\Collection
use App\DTOs\ProductFilterDTO;
use Illuminate\Support\Facades\Artisan;

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
            $slugs = $dto->categorySlugs;
            
            // Fetch all collections and categories in two efficient queries ✨
            $collectionIds = ProductCollection::whereIn('slug', $slugs)->pluck('id')->toArray();
            $categoryIds = Category::whereIn('slug', $slugs)->pluck('id')->toArray();

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

    /**
     * Create a new product and clear cache.
     */
    public function createProduct(array $data)
    {
        $product = $this->productRepository->create($data);
        if ($product) {
            $this->clearProductCache($product);
        }
        return $product;
    }

    /**
     * Update an existing product and clear cache.
     */
    public function updateProduct(int $id, array $data)
    {
        $product = $this->productRepository->update($id, $data);
        if ($product) {
            $this->clearProductCache($product);
        }
        return $product;
    }

    /**
     * Delete a product and clear cache.
     */
    public function deleteProduct(int $id)
    {
        $product = $this->productRepository->findById($id);
        if ($product) {
            $this->clearProductCache($product);
            // We use forceDelete to ensure the deleting event fires for permanent cleanup! ✨
            return $product->forceDelete();
        }
        return false;
    }

    /**
     * Clear all relevant product caches.
     */
    private function clearProductCache($product)
    {
        Cache::forget("product.{$product->slug}");
        Cache::forget('featured_products');
        Cache::forget('product_categories'); // Clear category list cache
        Cache::forget('product_collections'); // Clear collections list cache
        
        // For general paginated product lists (keys starting with 'products.'),
        // if using a cache driver that supports tags (like Redis), we would use Cache::tags('products')->flush();
        // Since the current cache driver might not support tags, and keys are dynamic (md5 of DTO),
        // we'll rely on these caches expiring naturally or implement a more sophisticated invalidation
        // strategy if performance demands it and a tag-supporting driver is adopted.

    }
}
