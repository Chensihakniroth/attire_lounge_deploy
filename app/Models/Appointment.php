<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
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
