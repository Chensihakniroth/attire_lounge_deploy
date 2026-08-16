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

    public function chat(array $messages, string $language = 'en', ?callable $onEvent = null): array
    {
        @ini_set('max_execution_time', '180');
        @set_time_limit(180);

        $base  = config('agent.api_base');
        $key   = config('agent.api_key');
        $model = config('agent.model');

        if (! $base || ! $key || ! $model) {
            $err = 'The AI assistant is not configured on the server. Ask your developer to set AI_API_BASE, AI_API_KEY and AI_MODEL.';
            if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
            return ['reply' => $err, 'tool_calls' => []];
        }

        // Require at least one user turn to answer.
        $hasUser = collect($messages)->contains(fn ($m) => ($m['role'] ?? '') === 'user');
        if (! $hasUser) {
            $err = 'There is no question to answer.';
            if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
            return ['reply' => $err, 'tool_calls' => []];
        }

        if ($onEvent) {
            $onEvent(['type' => 'status', 'state' => 'searching', 'message' => 'Analyzing store queries and operational schemas...']);
        }

        // Always start from a locked system prompt.
        $history = array_merge([$this->systemPrompt($language)], $this->sanitizeMessages($messages));
        while (count($history) > 60) {
            array_shift($history);
        }

        $maxTurns     = (int) config('agent.max_turns', 4);
        $maxToolCalls = 8;
        $tools        = $this->tools->definitions();
        $used         = [];
        $toolOutputs  = [];
        $turns        = 0;
        $totalCalls   = 0;
        $maxTokens    = (int) config('agent.max_output_tokens', 4096);

        while (true) {
            $forceFinalSynthesis = ($turns >= $maxTurns || $totalCalls >= $maxToolCalls || ($totalCalls > 0 && $turns >= 2));

            $payload = [
                'model'       => $model,
                'messages'    => $history,
                'max_tokens'  => $maxTokens,
                'temperature' => (float) config('agent.temperature', 0.2),
                'top_p'       => (float) config('agent.top_p', 1.0),
            ];

            if (! $forceFinalSynthesis) {
                $payload['tools'] = $tools;
                $payload['tool_choice'] = 'auto';
            } else if ($onEvent) {
                // Emit a "Finalizing" live tool step so the frontend timeline isn't awkwardly idle
                $onEvent([
                    'type'         => 'tool_start',
                    'name'         => 'Finalizing',
                    'args'         => ['action' => 'Synthesizing response from retrieved data'],
                    'tool_call_id' => '_finalizing',
                ]);
            }

            $t0Llm = microtime(true);

            try {
                $resp = Http::withToken($key)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->timeout(120)
                    ->post(rtrim($base, '/') . '/chat/completions', $payload);
            } catch (\Throwable $e) {
                $err = 'Sorry, the AI service request failed: ' . Str::limit($e->getMessage(), 300);
                if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
                return ['reply' => $err, 'tool_calls' => $used];
            }

            $llmDurMs = (int) round((microtime(true) - $t0Llm) * 1000);

            if ($resp->failed()) {
                $body = $resp->json('error.message');
                if (! is_string($body) || $body === '') {
                    $body = $resp->body();
                }
                $err = 'Sorry, the AI service returned an error (HTTP ' . $resp->status() . '): ' . Str::limit($body ?: 'unknown', 300);
                if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
                return ['reply' => $err, 'tool_calls' => $used];
            }

            $message = $resp->json('choices.0.message');
            if (! is_array($message)) {
                $err = 'Sorry, the AI service returned an unexpected response.';
                if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
                return ['reply' => $err, 'tool_calls' => $used];
            }

            $content   = $message['content'] ?? $message['reasoning_content'] ?? '';
            $toolCalls = $message['tool_calls'] ?? [];

            // If we forced final synthesis or no tool calls were requested, finalize the response
            if ($forceFinalSynthesis || empty($toolCalls)) {
                $finalReply = trim((string) ($content ?? ''));
                if ($finalReply === '') {
                    if (! empty($toolOutputs)) {
                        $finalReply = "### Retrieved Records\n\n" . implode("\n\n---\n\n", array_slice($toolOutputs, 0, 6));
                    } else {
                        $finalReply = 'I have processed your query, but no matching records were found.';
                    }
                }

                if ($onEvent) {
                    // Close the "Finalizing" step if it was started
                    $onEvent([
                        'type'         => 'tool_end',
                        'name'         => 'Finalizing',
                        'duration_ms'  => $llmDurMs,
                        'summary'      => 'Response synthesized (' . strlen($finalReply) . ' chars)',
                        'tool_call_id' => '_finalizing',
                    ]);
                    $onEvent(['type' => 'done', 'reply' => $finalReply, 'tool_calls' => $used]);
                }

                return ['reply' => $finalReply, 'tool_calls' => $used];
            }

            // Record and execute tools
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

                if ($onEvent) {
                    $onEvent([
                        'type'         => 'tool_start',
                        'name'         => $name,
                        'args'         => $args,
                        'tool_call_id' => $tc['id'] ?? $name,
                    ]);
                }

                $t0 = microtime(true);
                $result = $this->tools->call($name, $args);
                $durMs = (int) round((microtime(true) - $t0) * 1000);
                $toolOutputs[] = $result;

                if ($onEvent) {
                    $onEvent([
                        'type'         => 'tool_end',
                        'name'         => $name,
                        'duration_ms'  => $durMs,
                        'summary'      => Str::limit(strip_tags($result), 150),
                        'tool_call_id' => $tc['id'] ?? $name,
                    ]);
                }

                $history[] = [
                    'role'         => 'tool',
                    'tool_call_id' => $tc['id'] ?? $name,
                    'content'      => $result,
                ];
                $totalCalls++;
            }

            // Emit 'Finalizing' step immediately after all tools complete execution so timeline shows active synthesis while waiting for LLM
            if ($onEvent) {
                $onEvent([
                    'type'         => 'tool_start',
                    'name'         => 'Finalizing',
                    'args'         => ['status' => 'Synthesizing response & formatting tables'],
                    'tool_call_id' => '_finalizing',
                ]);
            }

            $turns++;
            if ($turns >= $maxTurns || $totalCalls >= $maxToolCalls) {
                if ($onEvent) {
                    $onEvent(['type' => 'status', 'state' => 'composing', 'message' => 'Composing final markdown response and tables...']);
                }
                $history[] = [
                    'role'    => 'user',
                    'content' => 'Please provide the finalized response and formatted markdown summary table based on the retrieved data now.',
                ];
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

    private function systemPrompt(string $language = 'en'): array
    {
        $prompt = 'You are "Niroth\'s Butler", a helpful data assistant for the Attire Lounge. '
            . 'You may answer questions about AND help manage business data within these domains: POS products, '
            . 'orders and invoice details (PosInvoice), gift requests, tailoring/altering orders, sales targets, notifications, '
            . 'customers, appointments, inventory, dashboard stats and newsletter subscribers. '
            . 'You may ONLY use the tools provided — each tool performs a single data operation. '
            . 'CRITICAL TABLE FORMATTING: When listing products, inventory items, orders, or customers, ALWAYS format them as a clean Markdown table with column headers and a separator line (e.g. | # | Product Name | SKU | Price | Stock | Status |). NEVER output messy unformatted blobs. '
            . 'Never return an empty message. '
            . 'You must NEVER modify source code, configuration files, database schema, the filesystem, routes, '
            . 'or deployments, and you must NEVER run shell/artisan commands. '
            . 'If the user asks for anything outside these tools, politely decline and explain what you CAN do. '
            . 'Keep answers concise. Currency is USD ($). '
            . 'When updating data, summarise the change and confirm it to the user. '
            . 'IMPORTANT: When listing results, do NOT auto-paginate repeatedly. Query once or twice, '
            . 'present the results in a clean table, and inform the user of totals and remaining pages.';

        if ($language === 'km') {
            $prompt .= ' IMPORTANT LANGUAGE INSTRUCTION: The user has selected Khmer (ភាសាខ្មែរ). You MUST generate and formulate your complete response and explanations in natural, polite Khmer (ភាសាខ្មែរ). Retain English for product codes/SKUs, technical IDs, and currency symbols ($) when appropriate, but write all explanatory and summary text in Khmer.';
        }

        return [
            'role' => 'system',
            'content' => $prompt,
        ];
    }
}
