<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description, // Always include for now for better UX
            'price' => number_format((float)$this->price, 2, '.', ''),
            'compare_price' => $this->compare_price ? number_format((float)$this->compare_price, 2, '.', '') : null,
            'category' => $this->category ? $this->category->name : 'Uncategorized',
            'collection' => $this->collection ? $this->collection->name : 'General',
            'collectionSlug' => $this->collection ? $this->collection->slug : null,
            'featured' => (bool)$this->is_featured,
            'in_stock' => $this->availability === 'In Stock',
            'stock_quantity' => $this->stock_quantity ?? 0,
            'images' => $this->images,
            'sizes' => $this->sizing,
            'colors' => $this->colors ?? [],
            'fabric' => $this->fabric ?? 'Premium Fabric',
            'fit' => $this->fit ?? 'Modern Fit',
            'discount_percent' => $this->discount_percent ?? 0,
        ];
    }
}
