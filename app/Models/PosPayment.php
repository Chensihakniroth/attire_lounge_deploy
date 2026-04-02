<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PosPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'method',
        'amount',
        'reference',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    public function invoice()
    {
        return $this->belongsTo(PosInvoice::class, 'invoice_id');
    }

    // Human-readable method labels
    public static function methodLabel(string $method): string
    {
        return match ($method) {
            'cash'     => 'Cash',
            'credit'   => 'Credit Card',
            'debit'    => 'Debit Card',
            'khqr'     => 'KHQR',
            'qr_code'  => 'QR Code',
            'deposit'  => 'Deposit',
            default    => ucfirst($method),
        };
    }
}
