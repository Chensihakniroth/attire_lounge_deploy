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
            'messages'          => 'required|array|min:1',
            'messages.*.role'   => 'required|string|in:user,assistant,system,tool',
            'messages.*.content' => 'nullable|string',
        ]);

        $result = $this->agent->chat($data['messages']);

        return response()->json([
            'success'    => true,
            'reply'      => $result['reply'],
            'tool_calls' => $result['tool_calls'] ?? [],
        ]);
    }
}
