<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable; // Import the Auditable trait

class Appointment extends Model
{
    use HasFactory;
    use Auditable; // Use the Auditable trait

    protected $fillable = [
        'name',
        'email',
        'phone',
        'service',
        'date',
        'time',
        'message',
        'favorite_item_image_url',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'favorite_item_image_url' => 'array',
    ];
}
