<?php

namespace App\DTOs;

use Illuminate\Http\Request;

readonly class ProductFilterDTO
{
    public function __construct(
        public ?string $categorySlug = null,
        public ?int $categoryId = null,
        public ?int $collectionId = null,
        public ?string $search = null,
        public string $sort = 'newest',
        public int $perPage = 12,
        public int $page = 1,
    ) {}

    /**
     * Create a DTO from a Request object.
     */
    public static function fromRequest(Request $request): self
    {
        return new self(
            categorySlug: $request->query('category'),
            search: $request->query('search'),
            sort: $request->query('sort', 'newest'),
            perPage: (int) $request->query('per_page', 12),
            page: (int) $request->query('page', 1),
        );
    }

    /**
     * Create a new instance with updated properties.
     */
    public function with(array $properties): self
    {
        return new self(
            categorySlug: array_key_exists('categorySlug', $properties) ? $properties['categorySlug'] : $this->categorySlug,
            categoryId: array_key_exists('categoryId', $properties) ? $properties['categoryId'] : $this->categoryId,
            collectionId: array_key_exists('collectionId', $properties) ? $properties['collectionId'] : $this->collectionId,
            search: array_key_exists('search', $properties) ? $properties['search'] : $this->search,
            sort: array_key_exists('sort', $properties) ? $properties['sort'] : $this->sort,
            perPage: array_key_exists('perPage', $properties) ? $properties['perPage'] : $this->perPage,
            page: array_key_exists('page', $properties) ? $properties['page'] : $this->page,
        );
    }
}
