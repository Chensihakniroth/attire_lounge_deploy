<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'category' => $this->category ? $this->category->name : 'Uncategorized',
            'collection' => $this->collection ? $this->collection->name : 'General',
            'collection_slug' => $this->collection ? $this->collection->slug : null,
            'featured' => (bool) $this->is_featured,
            'is_new' => (bool) $this->is_new,
            'is_visible' => (bool) $this->is_visible,
            'in_stock' => $this->availability === 'In Stock',
            'fabric' => $this->fabric,
            'silhouette' => $this->silhouette,
            'details' => $this->details,
            'images' => $this->images, // Uses our smart dynamic accessor! ✨
            'sizes' => $this->sizing,
        ];
    }
}
