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
            'category_id' => $this->category?->id,
            'category_slug' => $this->category ? $this->category->slug : null,
            'collection' => $this->collection ? $this->collection->name : 'General',
            'collection_id' => $this->collection?->id,
            'collection_slug' => $this->collection ? $this->collection->slug : null,
            'is_new' => $this->is_new,
            'is_visible' => $this->is_visible,
            'show_in_lookbook' => $this->show_in_lookbook,
            'in_stock' => $this->availability === 'In Stock',
            'availability' => $this->availability,
            'fabric' => $this->fabric,
            'silhouette' => $this->silhouette,
            'details' => $this->details,
            'detailed_description' => $this->detailed_description,
            'images' => $this->images ?? [],
            'sizes' => $this->sizing,
        ];
    }
}
