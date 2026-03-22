<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Events\GiftRequestCreated;
use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Support\Facades\Log;

class SendTelegramNotification
{
    protected TelegramService $telegramService;

    /**
     * Create the event listener.
     */
    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        if ($event instanceof AppointmentCreated) {
            $this->handleAppointmentCreated($event);
        } elseif ($event instanceof GiftRequestCreated) {
            $this->handleGiftRequestCreated($event);
        }
    }

    protected function handleAppointmentCreated(AppointmentCreated $event): void
    {
        $appointment = $event->appointment;
        
        // Property names matched to Appointment model
        $message = "📅 *New Appointment Request*\n\n" .
            "👤 *Name:* {$appointment->name}\n" .
            "📞 *Phone:* {$appointment->phone}\n" .
            "📧 *Email:* " . ($appointment->email ?? 'N/A') . "\n" .
            "🏢 *Service:* {$appointment->service} (" . ($appointment->appointment_type ?? 'N/A') . ")\n" .
            "⏰ *Time:* {$appointment->date->format('Y-m-d')} at {$appointment->time}";

        try {
            // Filter users who should receive this (admins or appointment managers)
            $subscribers = User::role(['super-admin', 'admin', 'appointment-manager'])->get();

            foreach ($subscribers as $user) {
                if (isset($user->telegram_chat_id) && !empty($user->telegram_chat_id)) {
                    $this->telegramService->sendMessage($user->telegram_chat_id, $message);
                }
            }
        } catch (\Exception $e) {
            Log::error('SendTelegramNotification Error (Appointment): ' . $e->getMessage());
        }
    }

    protected function handleGiftRequestCreated(GiftRequestCreated $event): void
    {
        $giftRequest = $event->giftRequest;

        // Property names matched to GiftRequest model
        $message = "🎁 *New Gift Request*\n\n" .
            "👤 *Sender:* {$giftRequest->name} ({$giftRequest->phone})\n" .
            "🎯 *Receiver:* {$giftRequest->recipient_name} ({$giftRequest->recipient_phone})\n" .
            "📝 *Preferences:* " . ($giftRequest->preferences ?? 'None');

        try {
            // Filter users who should receive this (admins or gift managers)
            $subscribers = User::role(['super-admin', 'admin', 'gift-manager'])->get();

            foreach ($subscribers as $user) {
                if (isset($user->telegram_chat_id) && !empty($user->telegram_chat_id)) {
                    $this->telegramService->sendMessage($user->telegram_chat_id, $message);
                }
            }
        } catch (\Exception $e) {
            Log::error('SendTelegramNotification Error (Gift): ' . $e->getMessage());
        }
    }
}
