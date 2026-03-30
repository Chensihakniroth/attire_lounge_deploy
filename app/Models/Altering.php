<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Altering extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_no',
        'customer_name',
        'mobile',
        'delivery_address',
        'product',
        'purchased_date',
        'tailor_pickup_date',
        'pickup_status',
        'customer_pickup_date',
        'customer_pickup_status',
        'remark',
        'altering_cost',
        'start_date',
        'ready_at',
        'status',
        'notified_at',
    ];

    protected $casts = [
        'ready_at' => 'datetime',
        'start_date' => 'date',
        'notified_at' => 'datetime',
        'altering_cost' => 'decimal:2',
    ];
}
