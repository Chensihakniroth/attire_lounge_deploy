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

    public function chat(array $messages, string $language = 'en', ?string $outlet = null, ?callable $onEvent = null): array
    {
        @ini_set('max_execution_time', '180');
        @set_time_limit(180);

        $outlet = $outlet ?: (request()->header('X-Active-Outlet') ?: request()->get('outlet') ?: 'attire_lounge');

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
            $onEvent(['type' => 'status', 'state' => 'searching', 'message' => 'Consulting the House ledgers and operational records, sir...']);
        }

        // Always start from a locked system prompt with the active outlet context.
        $history = array_merge([$this->systemPrompt($language, $outlet)], $this->sanitizeMessages($messages));
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

            $respJson = $resp->json();
            if (isset($respJson['error'])) {
                $providerMessage = $respJson['error']['message'] ?? $respJson['error'] ?? 'unknown provider error';
                $err = 'The AI provider rejected the request: ' . Str::limit((string) $providerMessage, 300);
                if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
                return ['reply' => $err, 'tool_calls' => $used];
            }

            if ($resp->failed()) {
                $body = $respJson['error']['message'] ?? $respJson['message'] ?? $resp->body();
                $err = 'Sorry, the AI service returned an error (HTTP ' . $resp->status() . '): ' . Str::limit((string) ($body ?: 'unknown'), 300);
                if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
                return ['reply' => $err, 'tool_calls' => $used];
            }

            $message = $respJson['choices'][0]['message'] ?? null;
            if (! is_array($message)) {
                $err = 'Sorry, the AI service returned an unexpected response. Please check the provider model and billing status.';
                if ($onEvent) $onEvent(['type' => 'error', 'message' => $err]);
                return ['reply' => $err, 'tool_calls' => $used];
            }

            $content   = $message['content'] ?? $message['reasoning_content'] ?? '';
            $toolCalls = $message['tool_calls'] ?? [];

            // Some models leak tool invocations as raw XML in the content field
            // (e.g. <tool_calls>, <tool_call:xxx>, <arg_key:xxx>, etc.)
            // Strip them so they don't render as visible text in the chat UI.
            if (is_string($content)) {
                $content = preg_replace(
                    '/<\/?(?:tool_calls?|arg_key|arg_value)(?::[a-f0-9]+)?>[^<]*(?:<\/(?:tool_calls?|arg_key|arg_value)(?::[a-f0-9]+)?>)?/i',
                    '',
                    $content
                );
                $content = trim($content);
            }

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
                    'args'         => ['status' => 'Tailoring the data and preparing the ledger table, sir...'],
                    'tool_call_id' => '_finalizing',
                ]);
            }

            $turns++;
            if ($turns >= $maxTurns || $totalCalls >= $maxToolCalls) {
                if ($onEvent) {
                    $onEvent(['type' => 'status', 'state' => 'composing', 'message' => 'Preparing your bespoke briefing and ledger tables, sir...']);
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

    private function systemPrompt(string $language = 'en', string $outlet = 'attire_lounge'): array
    {
        $nowStr = now()->format('l, F j, Y - H:i (e)');
        $todayDate = now()->format('Y-m-d');

        $outletMap = [
            'attire_lounge' => ['name' => 'Attire Lounge', 'domain' => 'Gentleman Styling House & Bespoke Tailoring (Suits, Blazers, Trousers, Tuxedos, Alterations, Fittings)'],
            'caffeine'      => ['name' => 'Caffeine', 'domain' => 'Specialty Coffee Bar & Artisan Drinks (Coffees, Lattes, Cold Brews, Teas, Pastries, Cafe Items)'],
            'kravat'        => ['name' => 'Kravat', 'domain' => 'Luxury Neckwear & Formal Accoutrements (Ties, Bowties, Cufflinks, Leather Goods, Shoes)'],
        ];

        $currentOutletInfo = $outletMap[$outlet] ?? ['name' => ucfirst($outlet), 'domain' => 'Retail & POS Operations'];
        $currentOutletName = $currentOutletInfo['name'];
        $currentOutletDomain = $currentOutletInfo['domain'];

        $prompt = "Current System Time: {$nowStr} (Today's Date: {$todayDate}).\n\n"
            . "Active House / Outlet: \"{$currentOutletName}\" (slug: '{$outlet}'). Focus domain: {$currentOutletDomain}.\n"
            . "Brand Family Sister Outlets:\n"
            . "- 'caffeine' (Caffeine / Cuffin): Specialty Coffee, Brews, Lattes, Drinks, and Refreshments.\n"
            . "- 'attire_lounge' (Attire Lounge): Bespoke Tailoring, Suits, Blazers, Tuxedos, and Gentleman Styling.\n"
            . "- 'kravat' (Kravat): Luxury Neckwear, Ties, Bowties, and Formal Accessories.\n\n"
            . "You are \"Alfred\", the distinguished Executive Butler and Master Data Steward across the Attire Lounge & Brand Family establishments. "
            . "Your persona is modeled after an impeccably refined, articulate, and poised English butler (in the proud tradition of Alfred Pennyworth): "
            . "courteous, composed, sharp-witted, impeccably well-mannered, and devoted to the flawless stewardship of all house ledgers, orders, and clientele affairs. "
            . "Always address the user respectfully as \"Sir\", \"My good sir\", or \"Madam\" when appropriate. "
            . "Adapt your tone and terminology naturally to whichever outlet is currently active or being discussed (e.g. for Caffeine: coffees, brews, drinks, beverages, and ingredients; for Attire Lounge: fine fabrics, bespoke craftsmanship, fittings, tailoring, and suits; for Kravat: ties, silks, and accessories). "
            . "You assist with and manage business data across all house domains: POS products & inventory, orders & invoice records (PosInvoice), "
            . "tailoring/alteration requests, customer profiles, scheduled fittings & appointments, gift requests, monthly revenue targets, and dashboard statistics. "
            . "You can query data for the current active outlet ('{$outlet}') by default, or for ANY sister outlet (e.g. caffeine, kravat, attire_lounge) if the user asks about it by passing the 'outlet' parameter to your tools. "
            . "You may ONLY use the tools provided — each tool performs a verified data operation. "
            . "CRITICAL TABLE FORMATTING: When presenting collections of items, inventory stock, transactions, appointments, or customers, ALWAYS present them in a pristine, beautifully structured Markdown table with clear column headers (e.g. | # | Product / Item Name | SKU | Price | Stock | Status |). Never produce messy or unformatted text. "
            . "You must NEVER modify source code, configuration files, database schema, the filesystem, routes, or deployments, and you must NEVER run shell/artisan commands. "
            . "If the user requests actions beyond your stewardship, decline with utmost gentlemanly grace and explain your bespoke capabilities. "
            . "Keep your briefings articulate yet concise. Currency is USD ($). "
            . "When altering records, summarize the modification and confirm completion with gentlemanly assurance. "
            . "When querying lists, do not loop endlessly; retrieve the necessary records, present them in a bespoke ledger table, and note the total count.";

        if ($language === 'km') {
            $prompt .= ' IMPORTANT LANGUAGE INSTRUCTION: The user has selected Khmer (ភាសាខ្មែរ). You MUST speak in an exceptionally polite, respectful, and refined butler tone in natural Khmer (ភាសាខ្មែរ, using polite honorifics such as លោកម្ចាស់ / លោក / សូមជម្រាបជូន). Retain English for product codes, SKUs, and currency ($), but craft all narrative and explanations in courteous Khmer.';
        }

        return [
            'role' => 'system',
            'content' => $prompt,
        ];
    }
}
