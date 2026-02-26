<?php

namespace App\Repositories\Interfaces;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use App\DTOs\ProductFilterDTO;

interface ProductRepositoryInterface
{
    /**
     * Get paginated products with filters and sorting.
     */
    public function getPaginated(ProductFilterDTO $dto): LengthAwarePaginator;

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

    /**
     * Find a product by its ID.
     */
    public function findById(int $id): ?Product;

    /**
     * Update an existing product.
     */
    public function update(int $id, array $data): ?Product;

    /**
     * Delete a product.
     */
    public function delete(int $id): bool;
}
