<?php

namespace Tests\Unit;

use App\Models\Activity;
use App\Models\Altering;
use App\Models\Appointment;
use App\Models\CustomerProfile;
use App\Models\GiftRequest;
use App\Models\NewsletterSubscription;
use App\Models\Notification;
use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\PosPayment;
use App\Models\PosProduct;
use App\Models\PosRefund;
use App\Models\Promocode;
use App\Models\SalesTarget;
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
        \Illuminate\Support\Facades\Cache::flush();
        $this->tools = new BusinessDataTools();
    }

    public function test_tool_definitions_are_valid(): void
    {
        $defs = $this->tools->definitions();
        $this->assertIsArray($defs);
        $this->assertCount(27, $defs);

        $names = array_map(fn ($d) => $d['function']['name'], $defs);
        $this->assertContains('get_stats', $names);
        $this->assertContains('search_products', $names);
        $this->assertContains('update_product', $names);
        $this->assertContains('list_appointments', $names);
        $this->assertContains('get_invoice_detail', $names);
        $this->assertContains('create_pos_refund', $names);
        $this->assertContains('search_gift_requests', $names);
        $this->assertContains('get_gift_request', $names);
        $this->assertContains('update_gift_request_status', $names);
        $this->assertContains('list_altering_orders', $names);
        $this->assertContains('get_altering_order', $names);
        $this->assertContains('update_altering_status', $names);
        $this->assertContains('search_promocodes', $names);
        $this->assertContains('get_sales_target', $names);
        $this->assertContains('list_notifications', $names);
        $this->assertContains('list_activities', $names);
        $this->assertContains('create_appointment', $names);
        $this->assertContains('get_customer_order_history', $names);
        $this->assertContains('list_daily_report', $names);
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

        PosProduct::create([
            'outlet' => 'attire_lounge',
            'name' => 'Empty Tuxedo Shoes',
            'sku' => 'SHOE-000',
            'variant' => 'Size 42',
            'price' => 220.00,
            'stock_qty' => 0,
            'min_stock' => 3,
            'is_active' => true,
        ]);

        $res = $this->tools->call('list_low_stock', []);
        $this->assertStringContainsString('Low-stock items', $res);
        $this->assertStringContainsString('Low Stock Tie', $res);
        $this->assertStringContainsString('Out-of-stock items', $res);
        $this->assertStringContainsString('Empty Tuxedo Shoes', $res);
        $this->assertStringContainsString('SHOE-000', $res);
        $this->assertStringContainsString('stock: 0', $res);

        // Test out_of_stock_only
        $outOnlyRes = $this->tools->call('list_low_stock', ['out_of_stock_only' => true]);
        $this->assertStringContainsString('Empty Tuxedo Shoes', $outOnlyRes);
        $this->assertStringNotContainsString('Low Stock Tie', $outOnlyRes);

        // Test search query filter
        $queryRes = $this->tools->call('list_low_stock', ['query' => 'Silk']);
        $this->assertStringContainsString('Low Stock Tie', $queryRes);
        $this->assertStringNotContainsString('Empty Tuxedo Shoes', $queryRes);

        // Add 2nd out of stock product for pagination
        PosProduct::create([
            'outlet' => 'attire_lounge',
            'name' => 'Empty Tuxedo Belt',
            'sku' => 'BELT-000',
            'variant' => 'Leather',
            'price' => 45.00,
            'stock_qty' => 0,
            'min_stock' => 3,
            'is_active' => true,
        ]);

        // Test pagination with limit and page
        $pageRes = $this->tools->call('list_low_stock', ['out_of_stock_only' => true, 'limit' => 1, 'page' => 1]);
        $this->assertStringContainsString('Page 1 of 2', $pageRes);
        $this->assertStringContainsString('items 1-1 of 2', $pageRes);

        $page2Res = $this->tools->call('list_low_stock', ['out_of_stock_only' => true, 'limit' => 1, 'page' => 2]);
        $this->assertStringContainsString('Page 2 of 2', $page2Res);
        $this->assertStringContainsString('items 2-2 of 2', $page2Res);
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

    public function test_get_invoice_detail(): void
    {
        $user = \App\Models\User::factory()->create();
        $cust = CustomerProfile::create([
            'date' => today()->toDateString(),
            'client_status' => 'new',
            'name' => 'Oliver Queen',
            'phone' => '555-ARROW',
        ]);

        $inv = PosInvoice::create([
            'outlet' => 'attire_lounge',
            'cashier_id' => $user->id,
            'customer_profile_id' => $cust->id,
            'invoice_number' => 'INV-2026-DETAIL',
            'date' => today()->toDateString(),
            'status' => 'completed',
            'payment_status' => 'paid',
            'subtotal' => 300.00,
            'items_discount' => 20.00,
            'grand_total' => 280.00,
        ]);

        PosInvoiceItem::create([
            'outlet' => 'attire_lounge',
            'invoice_id' => $inv->id,
            'product_name' => 'Emerald Blazer',
            'product_sku' => 'BLZ-EM-01',
            'quantity' => 1,
            'unit_price' => 300.00,
            'discount_amount' => 20.00,
            'line_total' => 280.00,
            'is_service' => false,
        ]);

        PosPayment::create([
            'outlet' => 'attire_lounge',
            'invoice_id' => $inv->id,
            'method' => 'card',
            'amount' => 280.00,
            'reference' => 'TX-998877',
        ]);

        // Test by ID
        $resById = $this->tools->call('get_invoice_detail', ['id' => $inv->id]);
        $this->assertStringContainsString('INV-2026-DETAIL', $resById);
        $this->assertStringContainsString('Oliver Queen', $resById);
        $this->assertStringContainsString('Emerald Blazer', $resById);
        $this->assertStringContainsString('$280.00', $resById);
        $this->assertStringContainsString('Card: $280.00', $resById);

        // Test by invoice_number
        $resByNumber = $this->tools->call('get_invoice_detail', ['invoice_number' => 'INV-2026-DETAIL']);
        $this->assertStringContainsString('Emerald Blazer', $resByNumber);
    }

    public function test_search_gift_requests(): void
    {
        GiftRequest::create([
            'name' => 'Clark Kent',
            'phone' => '111-222-3333',
            'email' => 'clark@dailyplanet.com',
            'recipient_name' => 'Lois Lane',
            'recipient_title' => 'Ms.',
            'recipient_phone' => '444-555-6666',
            'status' => 'pending',
            'selected_items' => ['Silk Scarf', 'Leather Cufflinks'],
        ]);

        $res = $this->tools->call('search_gift_requests', ['query' => 'Clark']);
        $this->assertStringContainsString('Clark Kent', $res);
        $this->assertStringContainsString('Lois Lane', $res);
        $this->assertStringContainsString('items: 2', $res);
    }

    public function test_list_altering_orders(): void
    {
        Altering::create([
            'order_no' => 'ALT-101',
            'customer_name' => 'Barry Allen',
            'mobile' => '999-SPEED',
            'product' => 'Red Running Tuxedo',
            'status' => 'in_progress',
            'pickup_status' => 'pending',
            'customer_pickup_status' => 'pending',
            'altering_cost' => 45.00,
        ]);

        $res = $this->tools->call('list_altering_orders', ['query' => 'Barry']);
        $this->assertStringContainsString('ALT-101', $res);
        $this->assertStringContainsString('Barry Allen', $res);
        $this->assertStringContainsString('Red Running Tuxedo', $res);
        $this->assertStringContainsString('$45.00', $res);
    }

    public function test_get_sales_target(): void
    {
        SalesTarget::create([
            'outlet' => 'attire_lounge',
            'year' => 2026,
            'month' => 8,
            'target_revenue' => 10000.00,
        ]);

        $res = $this->tools->call('get_sales_target', ['year' => 2026, 'month' => 8]);
        $this->assertStringContainsString('Sales Performance for 2026-08', $res);
        $this->assertStringContainsString('Target: $10,000.00', $res);
    }

    public function test_list_notifications(): void
    {
        Notification::create([
            'type' => 'inventory_alert',
            'title' => 'Low Stock Warning',
            'message' => 'Ties are running low in stock.',
            'is_read' => false,
        ]);

        $res = $this->tools->call('list_notifications', ['unread_only' => true]);
        $this->assertStringContainsString('Total unread notifications: 1', $res);
        $this->assertStringContainsString('Low Stock Warning', $res);
    }

    public function test_create_pos_refund_and_stock_restoration(): void
    {
        $user = \App\Models\User::factory()->create();
        $prod = PosProduct::create([
            'outlet' => 'attire_lounge',
            'name' => 'Italian Silk Scarf',
            'sku' => 'SCARF-01',
            'price' => 50.00,
            'stock_qty' => 5,
            'min_stock' => 2,
            'is_active' => true,
        ]);

        $inv = PosInvoice::create([
            'outlet' => 'attire_lounge',
            'cashier_id' => $user->id,
            'invoice_number' => 'INV-REF-01',
            'date' => today()->toDateString(),
            'status' => 'completed',
            'subtotal' => 100.00,
            'grand_total' => 100.00,
        ]);

        $item = PosInvoiceItem::create([
            'outlet' => 'attire_lounge',
            'invoice_id' => $inv->id,
            'product_id' => $prod->id,
            'product_name' => 'Italian Silk Scarf',
            'product_sku' => 'SCARF-01',
            'quantity' => 2,
            'unit_price' => 50.00,
            'line_total' => 100.00,
            'is_service' => false,
        ]);

        // Partial refund of 1 unit
        $partialRes = $this->tools->call('create_pos_refund', [
            'invoice_id' => $inv->id,
            'type' => 'partial',
            'invoice_item_id' => $item->id,
            'quantity' => 1,
            'reason' => 'Customer changed mind',
        ]);
        $this->assertStringContainsString('PARTIAL refund', $partialRes);
        $this->assertStringContainsString('$50.00', $partialRes);

        $prod->refresh();
        $this->assertEquals(6, $prod->stock_qty); // restored 1 unit

        $inv->refresh();
        $this->assertEquals('partial', $inv->payment_status);

        // Full refund of remainder
        $fullRes = $this->tools->call('create_pos_refund', [
            'invoice_id' => $inv->id,
            'type' => 'full',
            'reason' => 'Defect on remaining item',
        ]);
        $this->assertStringContainsString('FULL refund', $fullRes);

        $prod->refresh();
        $this->assertEquals(7, $prod->stock_qty); // restored second unit

        $inv->refresh();
        $this->assertEquals('refunded', $inv->status);
    }

    public function test_gift_request_get_and_update_status(): void
    {
        $gift = GiftRequest::create([
            'name' => 'Tony Stark',
            'phone' => '100-IRON',
            'email' => 'tony@stark.com',
            'recipient_name' => 'Pepper Potts',
            'recipient_title' => 'CEO',
            'status' => 'pending',
            'selected_items' => ['Gold Cufflinks'],
            'preferences' => 'Include handwritten note',
        ]);

        $getRes = $this->tools->call('get_gift_request', ['id' => $gift->id]);
        $this->assertStringContainsString('Pepper Potts', $getRes);
        $this->assertStringContainsString('Gold Cufflinks', $getRes);
        $this->assertStringContainsString('Include handwritten note', $getRes);

        $updateRes = $this->tools->call('update_gift_request_status', [
            'id' => $gift->id,
            'status' => 'approved',
        ]);
        $this->assertStringContainsString('status updated: pending → approved', $updateRes);

        $gift->refresh();
        $this->assertEquals('approved', $gift->status);
    }

    public function test_altering_order_get_and_update_status(): void
    {
        $alt = Altering::create([
            'order_no' => 'ALT-202',
            'customer_name' => 'Arthur Curry',
            'mobile' => '777-OCEAN',
            'product' => 'Waterproof Linen Shirt',
            'status' => 'pending',
            'pickup_status' => 'pending',
            'altering_cost' => 30.00,
        ]);

        $getRes = $this->tools->call('get_altering_order', ['id' => $alt->id]);
        $this->assertStringContainsString('Arthur Curry', $getRes);
        $this->assertStringContainsString('Waterproof Linen Shirt', $getRes);
        $this->assertStringContainsString('$30.00', $getRes);

        $updateRes = $this->tools->call('update_altering_status', [
            'id' => $alt->id,
            'status' => 'ready',
            'customer_pickup_status' => 'ready_for_pickup',
            'remark' => 'Sleeves shortened 2 inches',
        ]);
        $this->assertStringContainsString('status: pending → ready', $updateRes);

        $alt->refresh();
        $this->assertEquals('ready', $alt->status);
        $this->assertNotNull($alt->ready_at);
    }

    public function test_create_appointment(): void
    {
        $res = $this->tools->call('create_appointment', [
            'name' => 'Diana Prince',
            'phone' => '888-AMAZON',
            'service' => 'Styling Consultation',
            'date' => today()->toDateString(),
            'time' => '15:30',
        ]);
        $this->assertStringContainsString('Created new Appointment', $res);
        $this->assertStringContainsString('Diana Prince', $res);

        $this->assertDatabaseHas('appointments', [
            'name' => 'Diana Prince',
            'phone' => '888-AMAZON',
            'status' => 'pending',
        ]);
    }

    public function test_search_promocodes(): void
    {
        Promocode::create([
            'name' => 'Summer VIP 20%',
            'code' => 'SUMMER20',
            'discount_percentage' => 20,
            'expires_at' => now()->addDays(30),
        ]);

        $res = $this->tools->call('search_promocodes', ['query' => 'SUMMER']);
        $this->assertStringContainsString('SUMMER20', $res);
        $this->assertStringContainsString('20%', $res);
        $this->assertStringContainsString('ACTIVE', $res);
    }

    public function test_get_customer_order_history(): void
    {
        $cust = CustomerProfile::create([
            'date' => today()->toDateString(),
            'client_status' => 'regular',
            'name' => 'Hal Jordan',
            'phone' => '555-LANTERN',
        ]);

        $user = \App\Models\User::factory()->create();

        $inv = PosInvoice::create([
            'outlet' => 'attire_lounge',
            'cashier_id' => $user->id,
            'customer_profile_id' => $cust->id,
            'invoice_number' => 'INV-HIST-01',
            'date' => today()->toDateString(),
            'status' => 'completed',
            'grand_total' => 150.00,
        ]);

        PosInvoiceItem::create([
            'outlet' => 'attire_lounge',
            'invoice_id' => $inv->id,
            'product_name' => 'Green Flight Jacket',
            'quantity' => 1,
            'unit_price' => 150.00,
            'line_total' => 150.00,
        ]);

        $res = $this->tools->call('get_customer_order_history', ['customer_id' => $cust->id]);
        $this->assertStringContainsString('Hal Jordan', $res);
        $this->assertStringContainsString('Lifetime Spend: $150.00', $res);
        $this->assertStringContainsString('Green Flight Jacket', $res);
    }

    public function test_list_activities(): void
    {
        $user = \App\Models\User::factory()->create(['name' => 'Admin Boss']);

        Activity::create([
            'user_id' => $user->id,
            'action' => 'updated_price',
            'model_type' => PosProduct::class,
            'model_id' => 99,
            'details' => 'Changed price from $100 to $120',
        ]);

        $res = $this->tools->call('list_activities', ['action' => 'updated_price']);
        $this->assertStringContainsString('updated_price', $res);
        $this->assertStringContainsString('Admin Boss', $res);
        $this->assertStringContainsString('PosProduct #99', $res);
    }

    public function test_list_daily_report(): void
    {
        $user = \App\Models\User::factory()->create();
        $date = today()->toDateString();

        $inv = PosInvoice::create([
            'outlet' => 'attire_lounge',
            'cashier_id' => $user->id,
            'invoice_number' => 'INV-REP-01',
            'date' => $date,
            'status' => 'completed',
            'grand_total' => 500.00,
        ]);

        PosInvoiceItem::create([
            'outlet' => 'attire_lounge',
            'invoice_id' => $inv->id,
            'product_name' => 'Handmade Leather Shoes',
            'quantity' => 2,
            'unit_price' => 250.00,
            'line_total' => 500.00,
        ]);

        $res = $this->tools->call('list_daily_report', ['date' => $date]);
        $this->assertStringContainsString("Sales Report for {$date}", $res);
        $this->assertStringContainsString('$500.00', $res);
    }
}
