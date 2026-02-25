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
        if ($dto->categoryId) {
            $query->where('category_id', $dto->categoryId);
        }

        if ($dto->collectionId) {
            $query->where('collection_id', $dto->collectionId);
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
