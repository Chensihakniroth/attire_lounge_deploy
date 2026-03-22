<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TelegramSubscribeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:subscribe';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Poll Telegram for /subscribe messages and link chat_ids to users.';

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
        $this->info("Listening for Telegram updates... (Press Ctrl+C to stop)");

        $offset = 0;

        while (true) {
            $updates = $this->telegram->getUpdates($offset);

            foreach ($updates as $update) {
                $offset = $update['update_id'] + 1;

                if (isset($update['message']['text'])) {
                    $text = $update['message']['text'];
                    $chatId = $update['message']['chat']['id'];

                    if (preg_match('/^\/subscribe\s+([\w\.-]+@[\w\.-]+\.\w+)$/', $text, $matches)) {
                        $email = $matches[1];
                        $this->subscribeUser($email, $chatId);
                    } elseif ($text === '/start') {
                        $this->telegram->sendMessage($chatId, "Welcome! To subscribe to alerts, send: `/subscribe your.email@example.com` (use your account email).");
                    }
                }
            }

            sleep(2);
        }
    }

    protected function subscribeUser(string $email, string $chatId)
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->telegram->sendMessage($chatId, "❌ User not found with email: $email");
            $this->error("User not found: $email");
            return;
        }

        // Optional: Check if user is an employee/admin
        if (!$user->hasAnyRole(['super-admin', 'admin', 'appointment-manager', 'gift-manager', 'product-manager'])) {
            $this->telegram->sendMessage($chatId, "🚫 Sorry, only authorized employees can subscribe to alerts.");
            $this->warn("Unauthorized subscribe attempt: $email");
            return;
        }

        $user->telegram_chat_id = $chatId;
        $user->save();

        $this->telegram->sendMessage($chatId, "✅ Success! You are now subscribed to alerts. Welcome aboard, {$user->name}!");
        $this->info("Subscribed user: {$user->name} ($email) with Chat ID: $chatId");
    }
}
