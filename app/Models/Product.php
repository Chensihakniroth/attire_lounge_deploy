<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    // The actual table name is 'products'
    protected $table = 'products';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'category_id',
        'collection_id',
        'is_featured',
        'is_new',
        'is_visible',
        'availability',
        'sizing'
    ];

    protected $casts = [
        'sizing' => 'array',
        'is_featured' => 'boolean',
        'is_new' => 'boolean',
        'is_visible' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * Get the images attribute dynamically from MinIO.
     * Delegates logic to the Collection model to maintain SRP. ✨
     */
    public function getImagesAttribute()
    {
        $endpoint = config('services.minio.endpoint');
        $slug = $this->slug;
        
        $collection = $this->collection;
        
        // If no collection, default to standard settings
        $path = $collection ? $collection->getStoragePath() : '/uploads/collections/default/';
        $primaryExt = $collection ? $collection->getPreferredExtension() : 'webp';
        $secondaryExt = ($primaryExt === 'webp') ? 'jpg' : 'webp';

        // Custom logic for numbered image files in specific collections
        $fileName = $slug;
        if ($collection) {
            if ($collection->slug === 'shades-of-elegance') {
                $fileName = str_replace('shades-', '', $slug);
            } elseif ($collection->slug === 'street-sartorial') {
                $fileName = str_replace('street-', '', $slug);
            }
        }

        return [
            "{$endpoint}{$path}{$fileName}.{$primaryExt}?v=new",
            "{$endpoint}{$path}{$fileName}.{$secondaryExt}?v=new",
        ];
    }

    /**
     * Relationships
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collection_id');
    }

    /**
     * Scopes for featured products (keeping this one as it's simple)
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
