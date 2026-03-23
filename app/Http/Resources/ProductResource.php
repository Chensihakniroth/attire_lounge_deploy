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
            'category_id' => $this->category_id,
            'category' => $this->category ? $this->category->name : 'Uncategorized',
            'collection_id' => $this->collection_id,
            'collection' => $this->collection ? $this->collection->name : 'General',
            'collection_slug' => $this->collection ? $this->collection->slug : null,
            'is_featured' => $this->is_featured,
            'is_new' => $this->is_new,
            'is_visible' => $this->is_visible,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'in_stock' => $this->availability === 'In Stock',
            'availability' => $this->availability,
            'fabric' => $this->fabric,
            'silhouette' => $this->silhouette,
            'details' => $this->details,
            'images' => $this->images, // Uses our smart dynamic accessor! ✨
            'sizes' => $this->sizing,
        ];
    }
}
