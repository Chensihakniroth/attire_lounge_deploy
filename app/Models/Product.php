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

    public function getDiscountPercentAttribute()
    {
        if ($this->compare_price && $this->compare_price > $this->price) {
            return round((($this->compare_price - $this->price) / $this->compare_price) * 100);
        }
        return 0;
    }

    public function scopeFilter($query, array $filters)
    {
        if (isset($filters['category']) && $filters['category']) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['search']) && $filters['search']) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }
    }

    public function scopeSort($query, $sort = 'newest')
    {
        switch ($sort) {
            case 'price_low':
                $query->orderBy('price');
                break;
            case 'price_high':
                $query->orderByDesc('price');
                break;
            case 'featured':
                $query->where('featured', true)->orderBy('sort_order');
                break;
            default:
                $query->orderByDesc('created_at');
        }
    }
}
