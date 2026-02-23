<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log; // Add Log facade

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'category_id',
        'collection_id',
        'is_featured',
        'is_new',
        'availability',
        'sizing'
    ];

    protected $casts = [
        'sizing' => 'array',
        'is_featured' => 'boolean',
        'is_new' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * Relationship: Category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relationship: Collection
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Get the images attribute dynamically from a hardcoded map.
     * This avoids storing image URLs in the database.
     */
    public function getImagesAttribute($value)
    {
        // Generate image array for 't' slugs
        $tImages = [];
        for ($i = 0; $i <= 10; $i++) {
            $tImages[] = "t{$i}.webp";
        }

        $slugImageMap = [
            'g1' => ['g1.webp', 'g2.webp'],
            'g2' => ['g2.webp'],
            'g3' => ['g3.webp', 'g4.webp'],
            'hvn0' => ['hvn0.jpg', 'hvn1.jpg', 'hvn2.jpg'],
            'hvn3' => ['hvn3.jpg', 'hvn4.jpg'],
            'mm1' => ['mm1.jpg', 'mm2.jpg'],
            'mm3' => ['mm3.jpg', 'mm4.jpg'],
            'of1' => ['of1.jpg', 'of2.jpg'],
            'of3' => ['of3.jpg'],
            't0' => $tImages, // Our new entry for Travel Collection
        ];

        $basePath = 'uploads/collections/default/';
        $minioUrl = rtrim(config('filesystems.disks.minio.endpoint') . '/' . config('filesystems.disks.minio.bucket'), '/');

        if (isset($slugImageMap[$this->slug])) {
            return array_map(function($image) use ($minioUrl, $basePath) {
                // Determine base path based on image prefix if needed, for 'Travel collections' we use a specific path
                if (str_starts_with($image, 't')) {
                    $specificBasePath = 'uploads/collections/Travel collections/';
                    return "{$minioUrl}/{$specificBasePath}{$image}";
                }
                return "{$minioUrl}/{$basePath}{$image}";
            }, $slugImageMap[$this->slug]);
        }

        // Fallback for other products, constructs a URL based on the slug
        // Determine extension based on slug prefix
        $ext = '.webp'; // Default extension
        if (str_starts_with($this->slug, 'hvn') || str_starts_with($this->slug, 'mm') || str_starts_with($this->slug, 'of')) {
            $ext = '.jpg';
        } else if (str_starts_with($this->slug, 't')) {
            $ext = '.webp';
        }

        // Determine specific base path for fallback if needed
        $specificFallbackBasePath = $basePath;
        if (str_starts_with($this->slug, 't')) {
            $specificFallbackBasePath = 'uploads/collections/Travel collections/';
        }
        return ["{$minioUrl}/{$specificFallbackBasePath}{$this->slug}{$ext}"];
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('availability', 'In Stock');
    }

    public function scopeInStock($query)
    {
        return $query->where('availability', 'In Stock');
    }

    /**
     * Advanced Filtering
     */
    public function scopeFilter($query, array $filters)
    {
        if (isset($filters['category']) && $filters['category']) {
            $query->whereHas('category', function($q) use ($filters) {
                $q->where('slug', $filters['category'])->orWhere('name', $filters['category']);
            });
        }

        if (isset($filters['collection']) && $filters['collection']) {
            $collections = is_array($filters['collection']) ? $filters['collection'] : [$filters['collection']];

            // DEBUG: Log the collections being filtered by
            Log::info('Product::scopeFilter: Filtering by collections', ['collections' => $collections]);

            $query->whereHas('collection', function($q) use ($collections) {
                // DEBUG: Log the sub-query for collection filtering
                Log::info('Product::scopeFilter: whereHas sub-query for collections', [
                    'query' => $q->toSql(),
                    'bindings' => $q->getBindings(),
                    'collections_in_closure' => $collections // Confirm scope of $collections
                ]);
                $q->whereIn('slug', $collections)->orWhereIn('name', $collections);
            });
        }

        if (isset($filters['search']) && $filters['search']) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }
    }

    /**
     * Advanced Sorting
     */
    public function scopeSort($query, $sort = 'newest')
    {
        switch ($sort) {
            case 'price_low':
                $query->orderBy('price');
                break;
            case 'price_high':
                $query->orderByDesc('price');
                break;
            case 'name_asc':
                $query->orderBy('name');
                break;
            case 'name_desc':
                $query->orderByDesc('name');
                break;
            case 'category':
                $query->join('categories', 'products.category_id', '=', 'categories.id')
                      ->orderBy('categories.name')
                      ->select('products.*');
                break;
            default:
                $query->orderByDesc('created_at');
        }
    }
}
