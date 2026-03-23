<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;
use App\Traits\ClearsAdminStats;

class GiftRequest extends Model
{
    use HasFactory, Auditable, ClearsAdminStats;

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