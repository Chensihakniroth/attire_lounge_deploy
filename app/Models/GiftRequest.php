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
        'sender_age',
        'email',
        'phone',
        'recipient_name',
        'recipient_title',
        'recipient_phone',
        'recipient_email',
        'preferences',
        'status',
        'selected_items',
    ];

    protected $casts = [
        'selected_items' => 'array',
    ];
}