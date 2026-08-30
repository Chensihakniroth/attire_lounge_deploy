<?php

namespace App\Http\Controllers;

use App\Services\Agent\AgentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class AiAgentController extends Controller
{
    public function __construct(private AgentService $agent)
    {
    }

    public function settings(Request $request)
    {
        $base = config('agent.api_base') ?: 'https://opencode.ai/zen/v1';
        $model = config('agent.model') ?: 'claude-sonnet-5';

        return response()->json([
            'success' => true,
            'api_base' => $base,
            'model' => $model,
            'available_models' => [
                'deepseek-v4-flash-free',
                'muse-spark-1.2-contributor-free',
                'mimo-v2.5-free',
                'ling-3.0-flash-fin-free',
                'gemini-3.5-flash-lite',
                'gemini-3-flash',
                'claude-haiku-4-5',
                'claude-sonnet-4',
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'api_base' => ['nullable', 'url:http,https'],
            'model' => ['required', 'string', 'min:3'],
        ]);

        $apiBase = rtrim($data['api_base'] ?? config('agent.api_base') ?: 'https://opencode.ai/zen/v1', '/');
        $model = trim($data['model']);

        $this->writeEnvValue('AI_API_BASE', $apiBase);
        $this->writeEnvValue('AI_MODEL', $model);

        putenv('AI_API_BASE=' . $apiBase);
        putenv('AI_MODEL=' . $model);
        $_ENV['AI_API_BASE'] = $apiBase;
        $_ENV['AI_MODEL'] = $model;
        $_SERVER['AI_API_BASE'] = $apiBase;
        $_SERVER['AI_MODEL'] = $model;

        config()->set('agent.api_base', $apiBase);
        config()->set('agent.model', $model);

        Artisan::call('config:clear');

        return response()->json([
            'success' => true,
            'api_base' => $apiBase,
            'model' => $model,
        ]);
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
        $outlet   = $request->header('X-Active-Outlet') ?: $request->input('outlet', 'attire_lounge');
        $stream   = $request->boolean('stream', false) || $request->header('Accept') === 'text/event-stream';

        if ($stream) {
            return response()->stream(function () use ($messages, $language, $outlet) {
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

                $this->agent->chat($messages, $language, $outlet, function ($evt) use ($sendEvent) {
                    $sendEvent($evt['type'] ?? 'message', $evt);
                });
            }, 200, [
                'Content-Type'      => 'text/event-stream; charset=UTF-8',
                'Cache-Control'     => 'no-cache, no-transform',
                'Connection'        => 'keep-alive',
                'X-Accel-Buffering' => 'no',
            ]);
        }

        $result = $this->agent->chat($messages, $language, $outlet);

        return response()->json([
            'success'    => true,
            'reply'      => $result['reply'],
            'tool_calls' => $result['tool_calls'] ?? [],
        ]);
    }

    private function writeEnvValue(string $key, string $value): void
    {
        $path = base_path('.env');
        $content = file_exists($path) ? file_get_contents($path) : '';
        $lines = preg_split('/\r\n|\n|\r/', $content) ?: [];
        $updated = false;

        foreach ($lines as $index => $line) {
            if (preg_match('/^\s*#?\s*' . preg_quote($key, '/') . '\s*=/', $line)) {
                $lines[$index] = $key . '=' . $value;
                $updated = true;
                break;
            }
        }

        if (! $updated) {
            $lines[] = $key . '=' . $value;
        }

        file_put_contents($path, implode(PHP_EOL, $lines) . PHP_EOL);
    }
}
