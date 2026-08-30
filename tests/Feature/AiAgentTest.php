<?php

namespace Tests\Feature;

use App\Models\PosProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AiAgentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'customer']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole($adminRole);

        $this->regularUser = User::factory()->create();
        $this->regularUser->assignRole($userRole);
    }

    public function test_ai_chat_requires_authentication(): void
    {
        $res = $this->postJson('/api/v1/admin/ai/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'Hello!'],
            ],
        ]);

        $res->assertStatus(401);
    }

    public function test_ai_chat_refuses_non_admin_users(): void
    {
        Sanctum::actingAs($this->regularUser);

        $res = $this->postJson('/api/v1/admin/ai/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'What are the stats?'],
            ],
        ]);

        $res->assertStatus(403);
    }

    public function test_ai_chat_returns_not_configured_when_api_base_is_empty(): void
    {
        Sanctum::actingAs($this->admin);
        Config::set('agent.api_base', '');
        Config::set('agent.api_key', 'test-key');
        Config::set('agent.model', 'gpt-4o-mini');

        $res = $this->postJson('/api/v1/admin/ai/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'What are the stats?'],
            ],
        ]);

        $res->assertStatus(200);
        $res->assertJson([
            'success' => true,
            'tool_calls' => [],
        ]);
        $this->assertStringContainsString('The AI assistant is not configured on the server', $res->json('reply'));
    }

    public function test_ai_settings_requires_admin_access(): void
    {
        Sanctum::actingAs($this->regularUser);

        $res = $this->getJson('/api/v1/admin/ai/settings');

        $res->assertStatus(403);
    }

    public function test_ai_settings_updates_model_in_env(): void
    {
        Sanctum::actingAs($this->admin);

        $res = $this->postJson('/api/v1/admin/ai/settings', [
            'api_base' => 'https://opencode.ai/zen/v1',
            'model' => 'claude-sonnet-5',
        ]);

        $res->assertStatus(200);
        $res->assertJsonPath('success', true);
        $this->assertSame('claude-sonnet-5', env('AI_MODEL'));
        $this->assertSame('https://opencode.ai/zen/v1', env('AI_API_BASE'));
    }

    public function test_ai_chat_with_mocked_llm_and_tool_call_loop(): void
    {
        Sanctum::actingAs($this->admin);

        Config::set('agent.api_base', 'https://api.openai.com/v1');
        Config::set('agent.api_key', 'sk-test');
        Config::set('agent.model', 'gpt-4o-mini');

        PosProduct::create([
            'outlet' => 'attire_lounge',
            'name' => 'Italian Wool Tuxedo',
            'sku' => 'TUX-99',
            'variant' => 'Black / 42R',
            'price' => 450.00,
            'stock_qty' => 5,
            'min_stock' => 2,
            'max_stock' => 10,
            'is_active' => true,
        ]);

        // Step 1: Model responds with a tool_call to search_products
        // Step 2: Model receives tool response and answers user
        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::sequence()
                ->push([
                    'choices' => [
                        [
                            'message' => [
                                'role' => 'assistant',
                                'content' => null,
                                'tool_calls' => [
                                    [
                                        'id' => 'call_123',
                                        'type' => 'function',
                                        'function' => [
                                            'name' => 'search_products',
                                            'arguments' => json_encode(['query' => 'Tuxedo']),
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ], 200)
                ->push([
                    'choices' => [
                        [
                            'message' => [
                                'role' => 'assistant',
                                'content' => 'We have the Italian Wool Tuxedo in stock (5 units) priced at $450.00.',
                            ],
                        ],
                    ],
                ], 200),
        ]);

        $res = $this->postJson('/api/v1/admin/ai/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'Do we have any Tuxedos in stock?'],
            ],
        ]);

        $res->assertStatus(200);
        $res->assertJson([
            'success' => true,
            'reply' => 'We have the Italian Wool Tuxedo in stock (5 units) priced at $450.00.',
            'tool_calls' => ['search_products'],
        ]);
    }
}
