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

    /**
     * Send a message with an inline keyboard.
     */
    public function sendMessageWithKeyboard(string $chatId, string $message, array $keyboard, string $parseMode = 'Markdown'): bool
    {
        if (empty($this->token)) return false;

        try {
            $response = Http::post("{$this->baseUrl}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
                'reply_markup' => json_encode(['inline_keyboard' => $keyboard]),
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('TelegramService sendMessageWithKeyboard Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Answer a callback query.
     */
    public function answerCallbackQuery(string $callbackQueryId, string $text = ''): bool
    {
        if (empty($this->token)) return false;

        try {
            $response = Http::post("{$this->baseUrl}/answerCallbackQuery", [
                'callback_query_id' => $callbackQueryId,
                'text' => $text,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('TelegramService answerCallbackQuery Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Edit a message's text.
     */
    public function editMessageText(string $chatId, int $messageId, string $text, array $keyboard = null, string $parseMode = 'Markdown'): bool
    {
        if (empty($this->token)) return false;

        try {
            $data = [
                'chat_id' => $chatId,
                'message_id' => $messageId,
                'text' => $text,
                'parse_mode' => $parseMode,
            ];

            if ($keyboard) {
                $data['reply_markup'] = json_encode(['inline_keyboard' => $keyboard]);
            }

            $response = Http::post("{$this->baseUrl}/editMessageText", $data);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('TelegramService editMessageText Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a message.
     */
    public function deleteMessage(string $chatId, int $messageId): bool
    {
        if (empty($this->token)) return false;

        try {
            $response = Http::post("{$this->baseUrl}/deleteMessage", [
                'chat_id' => $chatId,
                'message_id' => $messageId,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            // Ignore errors for message deletion as some IDs might not exist
            return false;
        }
    }
}
