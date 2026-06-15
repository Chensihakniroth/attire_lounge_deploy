<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $sku;
    public string $name;
    public int $oldStock;
    public int $newStock;
    public int $difference;
    public string $outlet;
    public string $reason;
    public string $timestamp;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $sku,
        string $name,
        int $oldStock,
        int $newStock,
        string $outlet = 'nile',
        string $reason = 'api_update'
    ) {
        $this->sku = $sku;
        $this->name = $name;
        $this->oldStock = $oldStock;
        $this->newStock = $newStock;
        $this->difference = $newStock - $oldStock;
        $this->outlet = $outlet;
        $this->reason = $reason;
        $this->timestamp = now()->toISOString();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('stock-updates'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'stock.changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'sku'        => $this->sku,
            'name'       => $this->name,
            'old_stock'  => $this->oldStock,
            'new_stock'  => $this->newStock,
            'difference' => $this->difference,
            'outlet'     => $this->outlet,
            'reason'     => $this->reason,
            'timestamp'  => $this->timestamp,
        ];
    }
}
