<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

class PosInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'customer_profile_id',
        'cashier_id',
        'date',
        'subtotal',
        'items_discount',
        'tier_discount_pct',
        'tier_discount_amt',
        'promo_code_id',
        'promo_discount_amt',
        'grand_total',
        'notes',
        'status',
        'payment_status',
    ];

    protected $casts = [
        'date'               => 'date',
        'subtotal'           => 'float',
        'items_discount'     => 'float',
        'tier_discount_pct'  => 'float',
        'tier_discount_amt'  => 'float',
        'promo_discount_amt' => 'float',
        'grand_total'        => 'float',
    ];

    // Auto-generate invoice number on create
    protected static function booted(): void
    {
        static::creating(function (PosInvoice $invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = static::generateInvoiceNumber();
            }
            if (empty($invoice->date)) {
                $invoice->date = now()->toDateString();
            }
        });

        // When invoice is completed, update customer profile
        static::updated(function (PosInvoice $invoice) {
            if ($invoice->wasChanged('status') && $invoice->status === 'completed') {
                $invoice->updateCustomerProfile();
            }
        });
    }

    public static function generateInvoiceNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = "INV-{$date}-";

        $last = static::where('invoice_number', 'LIKE', "{$prefix}%")
            ->orderByDesc('invoice_number')
            ->value('invoice_number');

        $sequence = $last ? (intval(substr($last, -4)) + 1) : 1;

        return $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    protected function updateCustomerProfile(): void
    {
        if (!$this->customer_profile_id) return;

        $customer = CustomerProfile::find($this->customer_profile_id);
        if (!$customer) return;

        // Update total spend & visit history
        $totalSpend = static::where('customer_profile_id', $this->customer_profile_id)
            ->where('status', 'completed')
            ->sum('grand_total');

        // VIP auto-upgrade: single receipt >= $500 on products
        if ($this->subtotal - $this->items_discount >= 500) {
            $customer->client_status = 'VIP';
        }

        $customer->save();
    }

    // Relationships
    public function customer()
    {
        return $this->belongsTo(CustomerProfile::class, 'customer_profile_id');
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items()
    {
        return $this->hasMany(PosInvoiceItem::class, 'invoice_id');
    }

    public function payments()
    {
        return $this->hasMany(PosPayment::class, 'invoice_id');
    }

    public function refunds()
    {
        return $this->hasMany(PosRefund::class, 'invoice_id');
    }

    public function promoCode()
    {
        return $this->belongsTo(Promocode::class, 'promo_code_id');
    }

    // Helpers
    public function getTotalPaidAttribute(): float
    {
        return $this->payments->sum('amount');
    }

    public function getBalanceDueAttribute(): float
    {
        return max(0, $this->grand_total - $this->total_paid);
    }
}
