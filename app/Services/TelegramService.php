<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $token;
    protected string $baseUrl;

    public function __construct()
    {
        $this->token = config('services.telegram.bot_token', '');
        $this->baseUrl = "https://api.telegram.org/bot{$this->token}";
    }

    /**
     * Send a message to a chat ID.
     */
    public function sendMessage(string $chatId, string $message, string $parseMode = 'Markdown'): bool
    {
        if (empty($this->token)) {
            Log::warning('TelegramService: TELEGRAM_BOT_TOKEN is not set.');
            return false;
        }

        try {
            $response = Http::post("{$this->baseUrl}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('TelegramService Error:', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('TelegramService Exception:', [
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get updates from Telegram.
     */
    public function getUpdates(int $offset = 0): array
    {
        if (empty($this->token)) {
            return [];
        }

        try {
            $response = Http::get("{$this->baseUrl}/getUpdates", [
                'offset' => $offset,
                'timeout' => 30,
            ]);

            if ($response->successful()) {
                return $response->json()['result'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('TelegramService getUpdates Exception:', [
                'message' => $e->getMessage(),
            ]);
            return [];
        }
    }
}
