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
            'description' => $this->when($request->routeIs('products.show'), $this->description),
            'price' => number_format($this->price, 2),
            'compare_price' => $this->compare_price ? number_format($this->compare_price, 2) : null,
            'category' => $this->category,
            'collection' => $this->collection,
            'featured' => $this->featured,
            'in_stock' => $this->in_stock,
            'stock_quantity' => $this->when($request->routeIs('products.show'), $this->stock_quantity),
            'images' => $this->images,
            'sizes' => $this->when($request->routeIs('products.show'), $this->sizes),
            'colors' => $this->when($request->routeIs('products.show'), $this->colors),
            'fabric' => $this->when($request->routeIs('products.show'), $this->fabric),
            'fit' => $this->when($request->routeIs('products.show'), $this->fit),
            'discount_percent' => $this->discount_percent, // Uses the getDiscountPercentAttribute accessor
        ];
    }
}
