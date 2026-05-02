<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;
use App\Traits\ClearsAdminStats;

class NewsletterSubscription extends Model
{
    use Auditable, ClearsAdminStats;

    protected $fillable = ['phone_number'];
}
