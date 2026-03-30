<?php

namespace App\Services;

use App\Models\Altering;
use App\Models\TelegramSubscriber;
use Illuminate\Support\Facades\Log;

class AlteringService
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Send a notification that an altering order is ready.
     */
    public function sendReadyNotification(Altering $altering): bool
    {
        $message = "✂️ *Altering Order Ready*\n\n";
        
        if ($altering->order_no) {
            $message .= "*Order No:* {$altering->order_no}\n";
        }
        $message .= "*Customer:* {$altering->customer_name}\n";
        
        if ($altering->mobile) {
            $message .= "*Mobile:* {$altering->mobile}\n";
        }
        
        $message .= "*Product/Items:* {$altering->product}\n";
        
        if ($altering->altering_cost) {
            $message .= "*Cost:* \${$altering->altering_cost}\n";
        }

        $message .= "\n✅ Please notify the customer that their items are ready.";

        $subscribers = TelegramSubscriber::where('is_active', true)->get();
        
        if ($subscribers->isEmpty()) {
            Log::warning('AlteringService: No active Telegram subscribers found to notify.');
            return false;
        }

        $successCount = 0;
        foreach ($subscribers as $subscriber) {
            if ($this->telegramService->sendMessage($subscriber->chat_id, $message)) {
                $successCount++;
            }
        }

        $altering->update([
            'notified_at' => now(),
            'status' => 'ready'
        ]);

        return $successCount > 0;
    }
}
