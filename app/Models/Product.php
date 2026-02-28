<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable; // Import the Auditable trait

class Product extends Model
{
    use HasFactory, SoftDeletes, Auditable; // Use the Auditable trait

    // The actual table name is 'products'
    protected $table = 'products';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'images',
        'category_id',
        'collection_id',
        'is_featured',
        'is_new',
        'is_visible',
        'availability',
        'sizing',
        'fabric',
        'silhouette',
        'details'
    ];

    protected $casts = [
        'sizing' => 'array',
        'images' => 'array',
        'is_featured' => 'boolean',
        'is_new' => 'boolean',
        'is_visible' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * Boot the model.
     */
    protected static function booted()
    {
        static::deleting(function ($product) {
            // When a product is deleted (or soft-deleted), we should consider 
            // cleaning up the images in MinIO to keep our storage tidy! ✨
            $images = $product->getRawOriginal('images');
            if ($images) {
                $urls = json_decode($images, true);
                if (is_array($urls)) {
                    $endpoint = config('services.minio.endpoint');
                    foreach ($urls as $url) {
                        // Extract the path from the full MinIO URL
                        // e.g., https://endpoint/bucket/path/file.webp -> path/file.webp
                        $path = str_replace($endpoint . '/', '', $url);
                        // Strip query parameters if present (like ?v=new)
                        $path = explode('?', $path)[0];

                        if (\Illuminate\Support\Facades\Storage::disk('minio')->exists($path)) {
                            \Illuminate\Support\Facades\Log::info("Deleting image from MinIO: " . $path);
                            \Illuminate\Support\Facades\Storage::disk('minio')->delete($path);
                        }
                    }
                }
            }
        });
    }

    /**
     * Get the images attribute dynamically from MinIO.
     * Delegates logic to the Collection model to maintain SRP. ✨
     */
    public function getImagesAttribute($value)
    {
        // Since 'images' is cast to an array, $value will already be an array if it exists. ✨
        $images = $this->getRawOriginal('images');
        if ($images) {
            $decoded = json_decode($images, true);
            if (is_array($decoded) && !empty($decoded)) {
                return $decoded;
            }
        }

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
