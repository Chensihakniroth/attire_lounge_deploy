<?php

namespace App\Http\Controllers;

use App\Services\Agent\AgentService;
use Illuminate\Http\Request;

class AiAgentController extends Controller
{
    public function __construct(private AgentService $agent)
    {
    }

    /**
     * Chat endpoint for the admin-only AI data assistant.
     *
     * Protected by auth:sanctum + role:admin|super-admin at the route level.
     * The frontend sends the full conversation history as { messages: [...] }.
     * The API key never leaves the server.
     */
    public function chat(Request $request)
    {
        $data = $request->validate([
            'messages'           => 'required|array|min:1',
            'messages.*.role'    => 'required|string|in:user,assistant,system,tool',
            'messages.*.content' => 'nullable|string',
            'language'           => 'nullable|string|in:en,km',
            'stream'             => 'nullable|boolean',
        ]);

        $messages = $data['messages'];
        $language = $data['language'] ?? 'en';
        $stream   = $request->boolean('stream', false) || $request->header('Accept') === 'text/event-stream';

        if ($stream) {
            return response()->stream(function () use ($messages, $language) {
                @ini_set('output_buffering', 'off');
                @ini_set('zlib.output_compression', '0');
                while (ob_get_level()) {
                    ob_end_flush();
                }
                ob_implicit_flush(true);

                $sendEvent = function (string $event, array $payload) {
                    echo "event: {$event}\n";
                    echo 'data: ' . json_encode($payload, JSON_UNESCAPED_UNICODE) . "\n\n";
                    if (ob_get_level() > 0) {
                        @ob_flush();
                    }
                    @flush();
                };

                $this->agent->chat($messages, $language, function ($evt) use ($sendEvent) {
                    $sendEvent($evt['type'] ?? 'message', $evt);
                });
            }, 200, [
                'Content-Type'      => 'text/event-stream; charset=UTF-8',
                'Cache-Control'     => 'no-cache, no-transform',
                'Connection'        => 'keep-alive',
                'X-Accel-Buffering' => 'no',
            ]);
        }

        $result = $this->agent->chat($messages, $language);

        return response()->json([
            'success'    => true,
            'reply'      => $result['reply'],
            'tool_calls' => $result['tool_calls'] ?? [],
        ]);
    }
}
