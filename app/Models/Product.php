<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'compare_price',
        'images',
        'sizes',
        'colors',
        'category',
        'collection',
        'fabric',
        'fit',
        'featured',
        'in_stock',
        'stock_quantity',
        'sort_order'
    ];

    protected $casts = [
        'images' => 'array',
        'sizes' => 'array',
        'colors' => 'array',
        'featured' => 'boolean',
        'in_stock' => 'boolean',
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2'
    ];

    /**
     * Get the images attribute.
     *
     * @param  string  $value
     * @return array
     */
    public function getImagesAttribute($value)
    {
        $imagePaths = json_decode($value, true) ?? [];

        if (empty($imagePaths)) {
            return [];
        }
        
        return array_map(fn($path) => Storage::disk('minio')->url($path), $imagePaths);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true)->where('in_stock', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('in_stock', true);
    }

    public function getDiscountedPriceAttribute()
    {
        if ($this->compare_price && $this->compare_price > $this->price) {
            return round((($this->compare_price - $this->price) / $this->compare_price) * 100);
        }
        return 0;
    }
}
