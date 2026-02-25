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
     * Get the images attribute dynamically from MinIO.
     * No need to store paths in the database! ✨
     */
    public function getImagesAttribute()
    {
        $endpoint = 'https://bucket-production-4ca0.up.railway.app/product-assets';
        $slug = $this->slug;
        $path = '/uploads/collections/default/'; // Default path

        // Logic based on collection_id (mapping from your database)
        // 1: Havana, 2: Mocha, 3: Groom, 4: Office -> /default/
        // 5: Accessories -> /accessories/
        // 6: Travel -> /Travel collections/

        if ($this->collection_id == 5) {
            $path = '/uploads/collections/accessories/';
        } elseif ($this->collection_id == 6) {
            $path = '/uploads/collections/Travel collections/';
        }

        // Determine primary extension. Havana, Mocha Mousse, and Office should use .jpg
        $primaryExt = 'webp';
        $secondaryExt = 'jpg';
        
        // Use the collection name or ID to check. 
        // Based on seeder: 2: Havana, 3: Mocha, 4: Office (if seeded in that order)
        // Let's check by name/slug to be safer if possible, or just IDs if we trust them.
        // The user says Havana, Office, Mocha Mousse.
        if (in_array($this->collection_id, [1, 2, 3, 4])) {
            // Check collection name via relationship
            $collectionName = $this->collection ? $this->collection->name : '';
            if (str_contains($collectionName, 'Havana') || 
                str_contains($collectionName, 'Mocha') || 
                str_contains($collectionName, 'Office')) {
                $primaryExt = 'jpg';
                $secondaryExt = 'webp';
            }
        }

        return [
            "{$endpoint}{$path}{$slug}.{$primaryExt}?v=new",
            "{$endpoint}{$path}{$slug}.{$secondaryExt}?v=new",
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
