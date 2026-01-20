<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RailwayUpload extends Model
{
    protected $fillable = [
        'original_name',
        's3_key',
        'public_url',
        'file_type',
        'file_size',
        'bucket_name',
        'user_id',
    ];
}
