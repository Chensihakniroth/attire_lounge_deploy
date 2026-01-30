<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GiftRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'preferences',
        'status',
        'selected_items',
    ];

    protected $casts = [
        'selected_items' => 'array',
    ];
}