<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class NewsletterSubscription extends Model
{
    use Auditable;

    protected $fillable = ['phone_number'];
}
