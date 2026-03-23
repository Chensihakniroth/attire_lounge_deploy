<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;
use App\Traits\ClearsAdminStats;

class Appointment extends Model
{
    use HasFactory, Auditable, ClearsAdminStats;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'service',
        'date',
        'time',
        'appointment_type',
        'message',
        'favorite_item_image_url',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'favorite_item_image_url' => 'array',
    ];
}
