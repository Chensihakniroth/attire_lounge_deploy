<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PosRefund extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'type',
        'invoice_item_id',
        'amount',
        'reason',
        'processed_by',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    public function invoice()
    {
        return $this->belongsTo(PosInvoice::class, 'invoice_id');
    }

    public function invoiceItem()
    {
        return $this->belongsTo(PosInvoiceItem::class, 'invoice_item_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
