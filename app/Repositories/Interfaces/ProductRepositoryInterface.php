<?php

namespace App\Repositories\Interfaces;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface ProductRepositoryInterface
{
    /**
     * Get paginated products with filters and sorting.
     */
    public function getPaginated(array $filters, string $sort, int $perPage): LengthAwarePaginator;

    /**
     * Get featured products.
     */
    public function getFeatured(int $limit): Collection;

    /**
     * Get distinct categories.
     */
    public function getCategories(): Collection;

    /**
     * Find a product by its slug.
     */
    public function findBySlug(string $slug): ?Product;
}
