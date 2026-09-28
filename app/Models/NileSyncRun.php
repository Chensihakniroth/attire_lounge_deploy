<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NileSyncRun extends Model
{
    protected $fillable = [
        'job',
        'outlet',
        'status',
        'direction',
        'matched',
        'changed',
        'unchanged',
        'not_on_store',
        'errors',
        'duration_ms',
        'message',
        'details',
    ];

    protected $casts = [
        'details'     => 'array',
        'duration_ms' => 'integer',
        'matched'     => 'integer',
        'changed'     => 'integer',
        'unchanged'   => 'integer',
        'not_on_store'=> 'integer',
        'errors'      => 'integer',
    ];

    public function scopeJob($query, string $job)
    {
        return $query->where('job', $job);
    }
}
