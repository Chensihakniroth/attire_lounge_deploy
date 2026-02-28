<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\CollectionType;
use App\Traits\Auditable;

class Collection extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'season',
        'year',
        'image',
        'is_active',
        'start_date',
        'end_date',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'year' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the storage path from the Enum based on slug.
     */
    public function getStoragePath(): string
    {
        $type = CollectionType::tryFrom($this->slug);
        return $type ? $type->getStoragePath() : '/uploads/collections/default/';
    }

    /**
     * Get the preferred extension from the Enum based on slug.
     */
    public function getPreferredExtension(): string
    {
        $type = CollectionType::tryFrom($this->slug);
        return $type ? $type->getPreferredExtension() : 'webp';
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'collection_id');
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/collections/' . $this->image);
        }
        return asset('images/collection-placeholder.jpg');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('start_date')
                          ->orWhere('start_date', '<=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>=', now());
                    });
    }
}
