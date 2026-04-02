<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PosInvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'product_name',
        'product_variant',
        'product_sku',
        'is_service',
        'quantity',
        'unit_price',
        'discount_type',
        'discount_value',
        'discount_amount',
        'gift_wrap',
        'line_total',
    ];

    protected $casts = [
        'unit_price'      => 'float',
        'discount_value'  => 'float',
        'discount_amount' => 'float',
        'line_total'      => 'float',
        'quantity'        => 'integer',
        'is_service'      => 'boolean',
        'gift_wrap'       => 'boolean',
    ];

    // Relationships
    public function invoice()
    {
        return $this->belongsTo(PosInvoice::class, 'invoice_id');
    }

    public function product()
    {
        return $this->belongsTo(PosProduct::class, 'product_id');
    }

    public function refunds()
    {
        return $this->hasMany(PosRefund::class, 'invoice_item_id');
    }

    // Compute line total from qty, price, and discount
    public static function computeLineTotal(
        int $qty,
        float $unitPrice,
        string $discountType,
        float $discountValue
    ): array {
        $subtotal = $qty * $unitPrice;

        $discountAmount = match ($discountType) {
            'percent' => $subtotal * ($discountValue / 100),
            'amount'  => min($discountValue * $qty, $subtotal),
            default   => 0.0,
        };

        return [
            'discount_amount' => round($discountAmount, 2),
            'line_total'      => round($subtotal - $discountAmount, 2),
        ];
    }
}
