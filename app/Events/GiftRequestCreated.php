<?php

namespace App\Events;

use App\Models\GiftRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GiftRequestCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public GiftRequest $giftRequest;

    /**
     * Create a new event instance.
     */
    public function __construct(GiftRequest $giftRequest)
    {
        $this->giftRequest = $giftRequest;
    }
}
