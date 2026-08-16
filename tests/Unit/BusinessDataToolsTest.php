<?php

namespace Tests\Unit;

use App\Models\Appointment;
use App\Models\CustomerProfile;
use App\Models\NewsletterSubscription;
use App\Models\PosInvoice;
use App\Models\PosProduct;
use App\Services\Agent\BusinessDataTools;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessDataToolsTest extends TestCase
{
    use RefreshDatabase;

    private BusinessDataTools $tools;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tools = new BusinessDataTools();
    }

    public function test_tool_definitions_are_valid(): void
    {
        $defs = $this->tools->definitions();
        $this->assertIsArray($defs);
        $this->assertCount(12, $defs);

        $names = array_map(fn ($d) => $d['function']['name'], $defs);
        $this->assertContains('get_stats', $names);
        $this->assertContains('search_products', $names);
        $this->assertContains('update_product', $names);
        $this->assertContains('list_appointments', $names);
    }

    public function test_refuses_unknown_tools(): void
    {
        $result = $this->tools->call('drop_database', []);
        $this->assertStringStartsWith('Refused: tool "drop_database" is not available.', $result);
    }

    public function test_get_stats(): void
    {
        $result = $this->tools->call('get_stats', []);
        $this->assertStringContainsString('Outlet', $result);
        $this->assertStringContainsString('products:', $result);
        $this->assertStringContainsString('revenue today:', $result);
    }

    public function test_search_and_get_and_update_product(): void
    {
        $product = PosProduct::create([
            'outlet' => 'attire_lounge',
            'name' => 'Classic Navy Suit',
            'sku' => 'CNS-001',
            'variant' => '40R',
            'price' => 250.00,
            'stock_qty' => 10,
            'min_stock' => 3,
            'max_stock' => 20,
            'category' => 'Suits',
            'is_active' => true,
            'is_service' => false,
            'is_accessory' => false,
        ]);

        // Search
        $searchRes = $this->tools->call('search_products', ['query' => 'Classic']);
        $this->assertStringContainsString('Classic Navy Suit', $searchRes);
        $this->assertStringContainsString('$250.00', $searchRes);

        // Get single
        $getRes = $this->tools->call('get_product', ['id' => $product->id]);
        $this->assertStringContainsString('Product #' . $product->id, $getRes);

        // Update product price and stock
        $updateRes = $this->tools->call('update_product', [
            'id' => $product->id,
            'price' => 280.00,
            'stock_qty' => 8,
        ]);
        $this->assertStringContainsString('price: 250 → 280', $updateRes);
        $this->assertStringContainsString('stock_qty: 10 → 8', $updateRes);

        $product->refresh();
        $this->assertEquals(280.00, $product->price);
        $this->assertEquals(8, $product->stock_qty);
    }

    public function test_list_low_stock(): void
    {
        PosProduct::create([
            'outlet' => 'attire_lounge',
            'name' => 'Low Stock Tie',
            'sku' => 'TIE-001',
            'variant' => 'Silk',
            'price' => 35.00,
            'stock_qty' => 2,
            'min_stock' => 5,
            'max_stock' => 20,
            'is_active' => true,
        ]);

        $res = $this->tools->call('list_low_stock', []);
        $this->assertStringContainsString('Low-stock items: 1', $res);
        $this->assertStringContainsString('Low Stock Tie', $res);
    }

    public function test_appointment_management(): void
    {
        $app = Appointment::create([
            'name' => 'James Bond',
            'phone' => '007',
            'service' => 'Bespoke Fitting',
            'appointment_type' => 'bespoke',
            'date' => today()->toDateString(),
            'time' => '14:00',
            'status' => 'pending',
        ]);

        $listRes = $this->tools->call('list_appointments', ['status' => 'pending']);
        $this->assertStringContainsString('James Bond', $listRes);

        $updateRes = $this->tools->call('update_appointment_status', [
            'id' => $app->id,
            'status' => 'confirmed',
        ]);
        $this->assertStringContainsString('status: pending → confirmed', $updateRes);

        $app->refresh();
        $this->assertEquals('confirmed', $app->status);
    }

    public function test_customers_orders_and_subscribers(): void
    {
        $cust = CustomerProfile::create([
            'date' => today()->toDateString(),
            'client_status' => 'new',
            'name' => 'Bruce Wayne',
            'phone' => '123456789',
            'email' => 'bruce@waynecorp.com',
        ]);

        $searchCust = $this->tools->call('search_customers', ['query' => 'Wayne']);
        $this->assertStringContainsString('Bruce Wayne', $searchCust);

        $getCust = $this->tools->call('get_customer', ['id' => $cust->id]);
        $this->assertStringContainsString('Bruce Wayne', $getCust);

        $user = \App\Models\User::factory()->create();

        $inv = PosInvoice::create([
            'outlet' => 'attire_lounge',
            'cashier_id' => $user->id,
            'invoice_number' => 'INV-2026-001',
            'date' => today()->toDateString(),
            'status' => 'completed',
            'subtotal' => 100.00,
            'tax_total' => 10.00,
            'grand_total' => 110.00,
        ]);

        $salesRes = $this->tools->call('get_daily_sales', ['date' => today()->toDateString()]);
        $this->assertStringContainsString('$110.00', $salesRes);

        $orderRes = $this->tools->call('list_orders', ['status' => 'completed']);
        $this->assertStringContainsString('INV-2026-001', $orderRes);

        $sub = NewsletterSubscription::create([
            'phone_number' => '0987654321',
        ]);

        $subRes = $this->tools->call('list_newsletter_subscribers', []);
        $this->assertStringContainsString('0987654321', $subRes);
    }
}
