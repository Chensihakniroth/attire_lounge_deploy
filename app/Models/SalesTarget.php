<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesTarget extends Model
{
    protected $fillable = ['year', 'month', 'target_revenue', 'notes'];

    protected $casts = [
        'year'           => 'integer',
        'month'          => 'integer',
        'target_revenue' => 'decimal:2',
    ];
}
