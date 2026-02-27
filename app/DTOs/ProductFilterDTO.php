<?php

namespace App\DTOs;

use Illuminate\Http\Request;

readonly class ProductFilterDTO
{
    public function __construct(
        public array $categorySlugs = [],
        public array $categoryIds = [],
        public array $collectionIds = [],
        public array $slugs = [],
        public ?string $search = null,
        public string $sort = 'newest',
        public int $perPage = 12,
        public int $page = 1,
        public bool $includeHidden = false,
    ) {}

    /**
     * Create a DTO from a Request object.
     */
    public static function fromRequest(Request $request): self
    {
        $category = $request->query('category');
        $categorySlugs = $category ? explode(',', $category) : [];
        
        $slugsParam = $request->query('slugs');
        $slugs = $slugsParam ? explode(',', $slugsParam) : [];

        return new self(
            categorySlugs: $categorySlugs,
            slugs: $slugs,
            search: $request->query('search'),
            sort: $request->query('sort', 'newest'),
            perPage: (int) $request->query('per_page', 12),
            page: (int) $request->query('page', 1),
            includeHidden: $request->boolean('include_hidden', false),
        );
    }

    /**
     * Create a new instance with updated properties.
     */
    public function with(array $properties): self
    {
        return new self(
            categorySlugs: array_key_exists('categorySlugs', $properties) ? $properties['categorySlugs'] : $this->categorySlugs,
            categoryIds: array_key_exists('categoryIds', $properties) ? $properties['categoryIds'] : $this->categoryIds,
            collectionIds: array_key_exists('collectionIds', $properties) ? $properties['collectionIds'] : $this->collectionIds,
            slugs: array_key_exists('slugs', $properties) ? $properties['slugs'] : $this->slugs,
            search: array_key_exists('search', $properties) ? $properties['search'] : $this->search,
            sort: array_key_exists('sort', $properties) ? $properties['sort'] : $this->sort,
            perPage: array_key_exists('perPage', $properties) ? $properties['perPage'] : $this->perPage,
            page: array_key_exists('page', $properties) ? $properties['page'] : $this->page,
            includeHidden: array_key_exists('includeHidden', $properties) ? $properties['includeHidden'] : $this->includeHidden,
        );
    }
}
