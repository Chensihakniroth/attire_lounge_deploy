<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftItemStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'is_out_of_stock',
    ];

    protected $casts = [
        'is_out_of_stock' => 'boolean',
    ];
}
