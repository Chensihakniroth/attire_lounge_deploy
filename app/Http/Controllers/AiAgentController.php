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
                'claude-fable-5',
                'claude-opus-5',
                'claude-opus-4-8',
                'claude-opus-4-7',
                'claude-opus-4-6',
                'claude-opus-4-5',
                'claude-sonnet-5',
                'claude-sonnet-4-6',
                'claude-sonnet-4-5',
                'claude-sonnet-4',
                'claude-haiku-4-5',
                'gemini-3.6-flash',
                'gemini-3.7-flash',
                'gemini-3.5-flash-lite',
                'gemini-3.5-flash',
                'gemini-3.1-pro',
                'gemini-3-flash',
                'gpt-5.6-sol',
                'gpt-5.6-terra',
                'gpt-5.6-luna',
                'gpt-5.5',
                'gpt-5.5-pro',
                'gpt-5.4',
                'gpt-5.4-pro',
                'gpt-5.4-mini',
                'gpt-5.4-nano',
                'gpt-5.3-codex-spark',
                'gpt-5.3-codex',
                'gpt-5.2',
                'gpt-5.2-codex',
                'gpt-5.1',
                'gpt-5.1-codex-max',
                'gpt-5.1-codex',
                'gpt-5.1-codex-mini',
                'gpt-5',
                'gpt-5-codex',
                'gpt-5-nano',
                'grok-build-0.1',
                'grok-4.6',
                'grok-4.5',
                'muse-spark-1.2',
                'deepseek-v4-pro',
                'deepseek-v4-flash',
                'glm-5.2',
                'glm-5.1',
                'glm-5',
                'minimax-m3',
                'minimax-m2.7',
                'minimax-m2.5',
                'kimi-k3',
                'kimi-k2.7-code',
                'kimi-k2.6',
                'kimi-k2.5',
                'qwen3.6-plus',
                'qwen3.5-plus',
                'big-pickle',
                'deepseek-v4-flash-free',
                'muse-spark-1.2-contributor-free',
                'mimo-v2.5-free',
                'ling-3.0-flash-fin-free',
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
