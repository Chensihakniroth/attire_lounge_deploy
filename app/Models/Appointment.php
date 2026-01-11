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
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
