<?php

namespace App\Models;

use App\Traits\BelongsToOutlet;
use App\Traits\ClearsAdminStats;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PosProduct extends Model
{
    use HasFactory, BelongsToOutlet, ClearsAdminStats;

    protected $fillable = [
        'outlet',
        'sku',
        'barcode',
        'name',
        'variant',
        'price',
        'stock_qty',
        'min_stock',
        'category',
        'tier',
        'is_service',
        'is_accessory',
        'is_active',
        'image_path',
    ];

    protected $casts = [
        'price'        => 'float',
        'stock_qty'    => 'integer',
        'min_stock'    => 'integer',
        'is_service'   => 'boolean',
        'is_accessory' => 'boolean',
        'is_active'    => 'boolean',
    ];

    protected $appends = ['display_name', 'attributes'];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeServices($query)
    {
        return $query->where('is_service', true);
    }

    public function scopeProducts($query)
    {
        return $query->where('is_service', false);
    }

    public function scopeSearch($query, ?string $term = null, ?string $name = null, ?string $attribute = null, ?string $code = null)
    {
        // Escape LIKE wildcards in all user inputs
        $escape = fn($s) => addcslashes($s, '%_');

        if ($term) {
            $safe = $escape($term);
            $query->where(function ($q) use ($safe) {
                $q->where('name', 'LIKE', "%{$safe}%")
                  ->orWhere('variant', 'LIKE', "%{$safe}%")
                  ->orWhere('sku', 'LIKE', "%{$safe}%")
                  ->orWhere('barcode', 'LIKE', "%{$safe}%")
                  ->orWhere('category', 'LIKE', "%{$safe}%")
                  ->orWhere('tier', 'LIKE', "%{$safe}%")
                  ->orWhere('id', 'LIKE', "%{$safe}%");
            });
        }

        if ($name) {
            $query->where('name', 'LIKE', "%{$escape($name)}%");
        }

        if ($attribute) {
            $query->where('variant', 'LIKE', "%{$escape($attribute)}%");
        }

        if ($code) {
            $safe = $escape($code);
            $query->where(function ($cq) use ($safe) {
                $cq->where('sku', 'LIKE', "{$safe}%")
                   ->orWhere('barcode', 'LIKE', "{$safe}%")
                   ->orWhere('id', 'LIKE', "{$safe}%");
            });
        }

        return $query;
    }

    /**
     * Virtual field: attributes
     * Parses the variant string (e.g., "-L -FINE STRIPE") back into an array of objects.
     * [{key: 'GENERAL', value: 'L'}, {key: 'GENERAL', value: 'FINE STRIPE'}]
     */
    public function getAttributesAttribute(): array
    {
        if (!$this->variant) return [];

        // Split by '-' and clean up
        $parts = array_filter(explode('-', $this->variant));
        $attributes = [];

        foreach ($parts as $part) {
            $val = trim($part);
            if ($val) {
                $attributes[] = [
                    'key'   => 'GENERAL', // unknown key, but value is what works!
                    'value' => $val
                ];
            }
        }

        return $attributes;
    }

    // Relationships
    public function invoiceItems()
    {
        return $this->hasMany(PosInvoiceItem::class, 'product_id');
    }

    // Computed display name (name + variant)
    public function getDisplayNameAttribute(): string
    {
        return $this->variant ? "{$this->name} {$this->variant}" : $this->name;
    }
}
