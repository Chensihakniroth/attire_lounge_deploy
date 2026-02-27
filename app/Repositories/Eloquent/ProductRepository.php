<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use App\DTOs\ProductFilterDTO;

class ProductRepository implements ProductRepositoryInterface
{
    /**
     * @var Product
     */
    protected $model;

    public function __construct(Product $model)
    {
        $this->model = $model;
    }

    /**
     * Get paginated products with filters and sorting.
     */
    public function getPaginated(ProductFilterDTO $dto): LengthAwarePaginator
    {
        $query = $this->model->query()
            ->with(['category', 'collection']) // Eager load relationships ✨
            ->select([ // Only select necessary columns
                'id', 'name', 'slug', 'description', 'price', 
                'images', 'category_id', 'collection_id', 'is_featured', 
                'is_new', 'is_visible', 'availability',
                'fabric', 'silhouette', 'details', 'sizing'
            ]);

        // Apply visibility filter
        if (!$dto->includeHidden) {
            $query->where('is_visible', true);
        }

        // Apply filters
        if (!empty($dto->categoryIds) || !empty($dto->collectionIds)) {
            $query->where(function($q) use ($dto) {
                if (!empty($dto->categoryIds)) {
                    $q->whereIn('category_id', $dto->categoryIds);
                }
                
                if (!empty($dto->collectionIds)) {
                    if (!empty($dto->categoryIds)) {
                        $q->orWhereIn('collection_id', $dto->collectionIds);
                    } else {
                        $q->whereIn('collection_id', $dto->collectionIds);
                    }
                }
            });
        }

        if ($dto->search) {
            $query->where('name', 'like', '%' . $dto->search . '%');
        }

        if (!empty($dto->slugs)) {
            $query->whereIn('slug', $dto->slugs);
        }

        // Apply sorting
        switch ($dto->sort) {
            case 'price_low':
                $query->orderBy('price');
                break;
            case 'price_high':
                $query->orderByDesc('price');
                break;
            case 'featured':
                $query->orderByDesc('is_featured');
                break;
            default:
                $query->orderByDesc('created_at');
        }

        return $query->paginate($dto->perPage, ['*'], 'page', $dto->page);
    }

    /**
     * Get featured products.
     */
    public function getFeatured(int $limit): Collection
    {
        return $this->model->featured()
            ->orderBy('sort_order')
            ->limit($limit)
            ->get();
    }

    /**
     * Get all categories.
     */
    public function getCategories(): Collection
    {
        return \App\Models\Category::orderBy('name')->get();
    }

    /**
     * Find a product by its slug.
     */
    public function findBySlug(string $slug): ?Product
    {
        return $this->model->where('slug', $slug)->first();
    }

    /**
     * Find a product by its ID.
     */
    public function findById(int $id): ?Product
    {
        return $this->model->find($id);
    }

    /**
     * Create a new product.
     */
    public function create(array $data): Product
    {
        // If a slug is provided, use it. Otherwise, create one from the name.
        if (!isset($data['slug']) || empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        // Ensure the final slug is unique
        if ($this->model->where('slug', $data['slug'])->exists()) {
            $originalSlug = $data['slug'];
            $count = 1;
            // Loop until a unique slug is found
            while ($this->model->where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $count++;
            }
        }
        
        return $this->model->create($data);
    }

    /**
     * Update an existing product.
     */
    public function update(int $id, array $data): ?Product
    {
        $product = $this->findById($id);
        if (!$product) {
            return null;
        }

        $product->update($data);
        return $product;
    }

    /**
     * Delete a product.
     */
    public function delete(int $id): bool
    {
        $product = $this->findById($id);
        if (!$product) {
            return false;
        }

        return $product->delete();
    }
}
