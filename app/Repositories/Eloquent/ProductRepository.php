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
        $query = $this->model->query();

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
     * Get distinct categories.
     */
    public function getCategories(): Collection
    {
        return $this->model->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');
    }

    /**
     * Find a product by its slug.
     */
    public function findBySlug(string $slug): ?Product
    {
        return $this->model->where('slug', $slug)->first();
    }
}
