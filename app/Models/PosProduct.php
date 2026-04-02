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

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'LIKE', "%{$term}%")
              ->orWhere('variant', 'LIKE', "%{$term}%")
              ->orWhere('sku', 'LIKE', "%{$term}%")
              ->orWhere('barcode', 'LIKE', "%{$term}%");
        });
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
