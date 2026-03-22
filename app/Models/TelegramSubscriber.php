<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TelegramSubscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'chat_type',
        'chat_title',
        'is_active',
    ];
}
