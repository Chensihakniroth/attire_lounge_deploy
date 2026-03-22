<?php

namespace App\Console\Commands;

use App\Models\TelegramSubscriber;
use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class TelegramPoll extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:poll';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Poll Telegram updates and handle interactive commands';

    protected TelegramService $telegram;

    public function __construct(TelegramService $telegram)
    {
        parent::__construct();
        $this->telegram = $telegram;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Telegram Poll...');
        $offsetKey = 'telegram_poll_offset';
        $offset = Cache::get($offsetKey, 0);

        while (true) {
            $updates = $this->telegram->getUpdates($offset);

            foreach ($updates as $update) {
                $offset = $update['update_id'] + 1;
                Cache::put($offsetKey, $offset);

                if (isset($update['message'])) {
                    $this->handleMessage($update['message']);
                } elseif (isset($update['callback_query'])) {
                    $this->handleCallbackQuery($update['callback_query']);
                }
            }

            sleep(2);
        }
    }

    protected function handleMessage(array $message)
    {
        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';

        if (str_starts_with($text, '/start')) {
            $this->telegram->sendMessageWithKeyboard(
                $chatId,
                "👋 *Hello!* Would you like to receive notifications and alerts in this chat?",
                [
                    [
                        ['text' => '✅ Yes, Subscribe', 'callback_data' => 'subscribe'],
                        ['text' => '❌ No, Thanks', 'callback_data' => 'unsubscribe'],
                    ]
                ]
            );
        } elseif (str_starts_with($text, '/room')) {
            $subscribers = TelegramSubscriber::where('is_active', true)->get();
            if ($subscribers->isEmpty()) {
                $this->telegram->sendMessage($chatId, "📭 *No rooms currently subscribed.*");
            } else {
                $list = $subscribers->map(fn($s) => "• " . ($s->chat_title ?: 'Private Chat') . " (`{$s->chat_id}`)")->implode("\n");
                $this->telegram->sendMessage($chatId, "📋 *Subscribed Rooms:*\n\n{$list}");
            }
        } elseif (str_starts_with($text, '/clear')) {
            $parts = explode(' ', $text);
            $amount = isset($parts[1]) ? min(100, max(1, (int)$parts[1])) : 10;
            $currentMessageId = $message['message_id'];

            // Delete the command message itself first
            $this->telegram->deleteMessage($chatId, $currentMessageId);

            // Delete preceding messages
            for ($i = 1; $i <= $amount; $i++) {
                $this->telegram->deleteMessage($chatId, $currentMessageId - $i);
            }
        }
    }

    protected function handleCallbackQuery(array $query)
    {
        $callbackId = $query['id'];
        $chatId = $query['message']['chat']['id'];
        $messageId = $query['message']['message_id'];
        $data = $query['data'];

        if ($data === 'subscribe') {
            TelegramSubscriber::updateOrCreate(
                ['chat_id' => (string) $chatId],
                [
                    'chat_type' => $query['message']['chat']['type'],
                    'chat_title' => $query['message']['chat']['title'] ?? $query['from']['first_name'] ?? 'User',
                    'is_active' => true,
                ]
            );

            $this->telegram->answerCallbackQuery($callbackId, "Subscribed successfully!");
            $this->telegram->editMessageText($chatId, $messageId, "✅ *Confirmed!* This chat will now receive all new notification alerts.");
        } elseif ($data === 'unsubscribe') {
            TelegramSubscriber::where('chat_id', (string) $chatId)->update(['is_active' => false]);

            $this->telegram->answerCallbackQuery($callbackId, "Unsubscribed.");
            $this->telegram->editMessageText($chatId, $messageId, "❌ *Notifications disabled* for this chat.");
        }
    }
}
