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
        $tags = ['products'];

        // Use cache tags if supported by the driver (e.g., Redis). 
        // This allows us to clear all product lists at once! (ﾉ´ヮ`)ﾉ*:･ﾟ✧
        $cache = Cache::supportsTags() ? Cache::tags($tags) : Cache::getFacadeRoot();

        return $cache->remember($cacheKey, 3600, function () use ($dto) {
            return $this->productRepository->getPaginated($dto);
        });
    }

    /**
     * Get featured products with caching.
     */
    public function getFeaturedProducts(int $limit = 8): Collection
    {
        $cache = Cache::supportsTags() ? Cache::tags(['products', 'featured']) : Cache::getFacadeRoot();
        
        return $cache->remember('featured_products', 3600, function () use ($limit) {
            return $this->productRepository->getFeatured($limit);
        });
    }

    /**
     * Get distinct product categories with caching.
     */
    public function getProductCategories(): Collection
    {
        $cache = Cache::supportsTags() ? Cache::tags(['products', 'metadata']) : Cache::getFacadeRoot();

        return $cache->remember('product_categories', 7200, function () {
            return $this->productRepository->getCategories();
        });
    }

    /**
     * Find a product by slug with caching.
     */
    public function getProductBySlug(string $slug)
    {
        $cache = Cache::supportsTags() ? Cache::tags(['products', "product.{$slug}"]) : Cache::getFacadeRoot();

        return $cache->remember("product.{$slug}", 3600, function () use ($slug) {
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
        if (Cache::supportsTags()) {
            // Redis magic! We only clear product-related items. (｡♥‿♥｡)
            Cache::tags(['products'])->flush();
        } else {
            // Fallback for drivers that don't support tagging (like file or database).
            // We'll clear the entire cache to be safe, just as we did before. ✨
            Cache::flush();
        }

        // Individual item cleanup (still good practice)
        Cache::forget("product.{$product->slug}");
        Cache::forget('featured_products');
        Cache::forget('product_categories');
        Cache::forget('product_collections');
    }
}
