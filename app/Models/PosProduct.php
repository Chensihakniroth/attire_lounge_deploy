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
        'max_stock',
        'category',
        'tier',
        'is_service',
        'is_accessory',
        'is_active',
        'status',
        'watch_threshold',
        'image_path',
    ];

    protected $casts = [
        'price'           => 'float',
        'stock_qty'       => 'integer',
        'min_stock'       => 'integer',
        'max_stock'       => 'integer',
        'is_service'      => 'boolean',
        'is_accessory'    => 'boolean',
        'is_active'       => 'boolean',
        'watch_threshold' => 'boolean',
    ];

    protected $appends = ['display_name', 'parsed_attributes'];

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
     * Virtual field: parsed_attributes
     * Parses the variant string into an array of attribute objects.
     * Detects color vs size based on whether the value is numeric.
     * Example: "-Black -38" → [{key:"COLOR",value:"Black"},{key:"SIZE",value:"38"}]
     */
    public function getParsedAttributesAttribute(): array
    {
        if (!$this->variant) return [];

        $parts = array_filter(explode('-', $this->variant));
        $attributes = [];

        foreach ($parts as $part) {
            $val = trim($part);
            if ($val) {
                // Detect type: numeric = size, otherwise = color
                $key = is_numeric($val) ? 'SIZE' : 'COLOR';
                $attributes[] = [
                    'key'   => $key,
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
