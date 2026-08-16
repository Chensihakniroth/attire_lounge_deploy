<?php

namespace App\Services\Agent;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Minimal OpenAI-compatible agentic loop for the admin data assistant.
 *
 * It:
 *   1. Prepends a locked system prompt (data-only persona).
 *   2. Calls the configured LLM (OpenCode Zen API) with the closed tool list.
 *   3. Executes any tool_calls via BusinessDataTools::call() — the ONLY way to
 *      mutate/query anything. Unknown tools are refused server-side.
 *   4. Feeds tool results back and repeats up to a turn cap.
 *
 * The API key never reaches the browser.
 */
class AgentService
{
    public function __construct(
        protected BusinessDataTools $tools
    ) {
    }

    public function chat(array $messages): array
    {
        $base  = config('agent.api_base');
        $key   = config('agent.api_key');
        $model = config('agent.model');

        if (! $base || ! $key || ! $model) {
            return ['reply' => 'The AI assistant is not configured on the server. Ask your developer to set AI_API_BASE, AI_API_KEY and AI_MODEL.', 'tool_calls' => []];
        }

        // Require at least one user turn to answer.
        $hasUser = collect($messages)->contains(fn ($m) => ($m['role'] ?? '') === 'user');
        if (! $hasUser) {
            return ['reply' => 'There is no question to answer.', 'tool_calls' => []];
        }

                // Always start from a locked system prompt. Sanitise incoming
        // messages so only provider-recognised fields (role/content, and
        // snake_case tool_calls/tool_call_id when present) are forwarded —
        // this drops the UI-only "toolCalls" annotation the frontend keeps.
        $history = array_merge([$this->systemPrompt()], $this->sanitizeMessages($messages));
        while (count($history) > 60) {
            array_shift($history);
        }

        $maxTurns = (int) config('agent.max_turns', 8);
        $tools    = $this->tools->definitions();
        $used     = [];
        $turns    = 0;

        while (true) {
            $payload = [
                'model'       => $model,
                'messages'    => $history,
                'tools'       => $tools,
                'tool_choice' => 'auto',
                'max_tokens'  => (int) config('agent.max_output_tokens', 1024),
                'temperature' => (float) config('agent.temperature', 0.2),
                'top_p'       => (float) config('agent.top_p', 1.0),
            ];

            try {
                $resp = Http::withToken($key)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->timeout(90)
                    ->post(rtrim($base, '/') . '/chat/completions', $payload);
            } catch (\Throwable $e) {
                return ['reply' => 'Sorry, the AI service request failed: ' . Str::limit($e->getMessage(), 300), 'tool_calls' => $used];
            }

            if ($resp->failed()) {
                $body = $resp->json('error.message');
                if (! is_string($body) || $body === '') {
                    $body = $resp->body();
                }
                return ['reply' => 'Sorry, the AI service returned an error (HTTP ' . $resp->status() . '): ' . Str::limit($body ?: 'unknown', 300), 'tool_calls' => $used];
            }

            $message = $resp->json('choices.0.message');
            if (! is_array($message)) {
                return ['reply' => 'Sorry, the AI service returned an unexpected response.', 'tool_calls' => $used];
            }

            $content   = $message['content'] ?? '';
            $toolCalls = $message['tool_calls'] ?? [];

            if (empty($toolCalls)) {
                return ['reply' => (string) ($content ?? ''), 'tool_calls' => $used];
            }

            foreach ($toolCalls as $tc) {
                $used[] = $tc['function']['name'] ?? 'unknown';
            }

            // Re-emit the assistant turn WITH tool_calls so the model can reason.
            $history[] = [
                'role'       => 'assistant',
                'content'    => $content === null ? '' : $content,
                'tool_calls' => $toolCalls,
            ];

            foreach ($toolCalls as $tc) {
                $name    = $tc['function']['name'] ?? '';
                $rawArgs = $tc['function']['arguments'] ?? '{}';
                $args    = is_array($decoded = json_decode($rawArgs, true)) ? $decoded : [];
                $result  = $this->tools->call($name, $args);

                $history[] = [
                    'role'         => 'tool',
                    'tool_call_id' => $tc['id'] ?? $name,
                    'content'      => $result,
                ];
            }

            $turns++;
            if ($turns >= $maxTurns) {
                $reply = (string) ($content ?? '');
                return ['reply' => $reply . "\n\nStopped: reached the tool-use limit. Ask again to continue.", 'tool_calls' => $used];
            }
        }
    }

        private function sanitizeMessages(array $messages): array
    {
        $out = [];
        foreach ($messages as $m) {
            if (! is_array($m) || ! isset($m['role'])) {
                continue;
            }
            $clean = ['role' => $m['role']];
            if (array_key_exists('content', $m)) {
                $clean['content'] = $m['content'] ?? null;
            }
            // Preserve a tool-call trace only when forwarded in snake_case.
            if ($m['role'] === 'assistant' && isset($m['tool_calls'])) {
                $clean['tool_calls'] = $m['tool_calls'];
            }
            if ($m['role'] === 'tool' && isset($m['tool_call_id'])) {
                $clean['tool_call_id'] = $m['tool_call_id'];
            }
            $out[] = $clean;
        }
        return $out;
    }

    private function systemPrompt(): array
    {
        return [
            'role' => 'system',
            'content' => 'You are "Attire", a helpful data assistant for the Attire Lounge admin panel. '
                . 'You may answer questions about AND help manage business data within these domains: POS products, '
                . 'orders (PosInvoice), customers, appointments, inventory, dashboard stats and newsletter subscribers. '
                . 'You may ONLY use the tools provided — each tool performs a single data operation. '
                . 'You must NEVER modify source code, configuration files, database schema, the filesystem, routes, '
                . 'or deployments, and you must NEVER run shell/artisan commands. '
                . 'If the user asks for anything outside these tools, politely decline and explain what you CAN do. '
                . 'Keep answers concise. Currency is GBP (£). '
                . 'When updating data, summarise the change and confirm it to the user.',
        ];
    }
}
