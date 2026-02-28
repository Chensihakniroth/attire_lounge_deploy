<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable; // Import the Auditable trait

class GiftRequest extends Model
{
    use HasFactory, Auditable; // Use the Auditable trait

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