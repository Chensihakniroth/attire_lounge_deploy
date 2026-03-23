<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;
use App\Traits\ClearsAdminStats;

class CustomerProfile extends Model
{
    use HasFactory, Auditable, ClearsAdminStats;
    protected $fillable = [
        'date',
        'client_status',
        'name',
        'nationality',
        'phone',
        'host',
        'assistant',
        'how_did_they_find_us',
        'shirt_size',
        'jacket_size',
        'pants_size',
        'shoes_size',
        'preferred_color',
        'color_notes',
        'remarks',
    ];
}
