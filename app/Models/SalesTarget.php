<?php

namespace App\Models;

use App\Traits\BelongsToOutlet;
use Illuminate\Database\Eloquent\Model;

class SalesTarget extends Model
{
    use BelongsToOutlet;

    protected $fillable = ['outlet', 'year', 'month', 'target_revenue', 'notes'];

    protected $casts = [
        'year'           => 'integer',
        'month'          => 'integer',
        'target_revenue' => 'decimal:2',
    ];
}
