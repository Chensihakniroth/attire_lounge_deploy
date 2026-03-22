<?php

namespace App\Events;

use App\Models\GiftRequest;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GiftRequestCreated implements ShouldBroadcast
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

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin-notifications'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'gift-request.created';
    }
}
