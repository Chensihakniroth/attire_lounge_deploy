<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Repositories\Interfaces\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

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
    public function getPaginated(array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = $this->model->query();

        // Apply filters
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['collection_id'])) {
            $query->where('collection_id', $filters['collection_id']);
        }

        if (isset($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        // Apply sorting
        switch ($sort) {
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

        return $query->paginate($perPage);
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
