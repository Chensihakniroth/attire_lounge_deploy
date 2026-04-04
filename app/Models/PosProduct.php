<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PosProduct extends Model
{
    use HasFactory;

    protected $fillable = [
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
        return $query->where(function ($q) use ($term, $name, $attribute, $code) {
            if ($term) {
                $q->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('variant', 'LIKE', "%{$term}%")
                  ->orWhere('sku', 'LIKE', "%{$term}%")
                  ->orWhere('barcode', 'LIKE', "%{$term}%")
                  ->orWhere('category', 'LIKE', "%{$term}%")
                  ->orWhere('tier', 'LIKE', "%{$term}%")
                  ->orWhere('id', 'LIKE', "%{$term}%");
            }

            if ($name) {
                $q->where('name', 'LIKE', "%{$name}%");
            }

            if ($attribute) {
                $q->where('variant', 'LIKE', "%{$attribute}%");
            }

            if ($code) {
                $q->where(function ($cq) use ($code) {
                    $cq->where('sku', 'LIKE', "{$code}%")
                       ->orWhere('barcode', 'LIKE', "{$code}%")
                       ->orWhere('id', 'LIKE', "{$code}%");
                });
            }
        });
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
