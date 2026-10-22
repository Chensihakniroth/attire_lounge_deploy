<?php

namespace Tests\Feature;

use App\Models\PosInvoice;
use App\Models\PosProduct;
use App\Models\PosPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PosInvoiceCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'admin']);
        $this->admin = User::factory()->create();
        $this->admin->assignRole($adminRole);
        Sanctum::actingAs($this->admin);
    }

    public function test_fully_discounted_order_can_checkout_without_a_payment(): void
    {
        $product = $this->createProduct(100.00);

        $response = $this->withHeader('X-Active-Outlet', 'attire_lounge')
            ->postJson('/api/v1/admin/pos/invoices', [
                'discount_type' => 'percentage',
                'discount_value' => 100,
                'items' => [$this->itemPayload($product)],
                'payments' => [],
            ]);

        $response->assertCreated()
            ->assertJsonPath('grand_total', 0)
            ->assertJsonPath('payment_status', 'paid');

        $invoice = PosInvoice::query()->latest('id')->firstOrFail();

        $this->assertSame(0.0, (float) $invoice->grand_total);
        $this->assertSame(0, PosPayment::query()->where('invoice_id', $invoice->id)->count());
    }

    public function test_positive_total_still_requires_a_payment(): void
    {
        $product = $this->createProduct(100.00);

        $response = $this->withHeader('X-Active-Outlet', 'attire_lounge')
            ->postJson('/api/v1/admin/pos/invoices', [
                'discount_type' => 'percentage',
                'discount_value' => 0,
                'items' => [$this->itemPayload($product)],
                'payments' => [],
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Please add a payment before checking out.');

        $this->assertDatabaseCount('pos_invoices', 0);
    }

    public function test_paid_order_still_checks_out_normally(): void
    {
        $product = $this->createProduct(100.00);

        $response = $this->withHeader('X-Active-Outlet', 'attire_lounge')
            ->postJson('/api/v1/admin/pos/invoices', [
                'discount_type' => 'percentage',
                'discount_value' => 0,
                'items' => [$this->itemPayload($product)],
                'payments' => [
                    ['method' => 'cash', 'amount' => 100.00],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('grand_total', 100)
            ->assertJsonPath('payment_status', 'paid');

        $invoice = PosInvoice::query()->latest('id')->firstOrFail();
        $this->assertDatabaseHas('pos_payments', [
            'invoice_id' => $invoice->id,
            'method' => 'cash',
            'amount' => 100.00,
        ]);
    }

    public function test_partial_payment_behavior_remains_supported(): void
    {
        $product = $this->createProduct(100.00);

        $response = $this->withHeader('X-Active-Outlet', 'attire_lounge')
            ->postJson('/api/v1/admin/pos/invoices', [
                'discount_type' => 'percentage',
                'discount_value' => 0,
                'items' => [$this->itemPayload($product)],
                'payments' => [
                    ['method' => 'deposit', 'amount' => 25.00],
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('grand_total', 100)
            ->assertJsonPath('payment_status', 'partial');
    }

    private function createProduct(float $price): PosProduct
    {
        return PosProduct::create([
            'outlet' => 'attire_lounge',
            'name' => 'Test Wool Tie',
            'sku' => 'TEST-TIE-001',
            'variant' => 'Navy',
            'price' => $price,
            'stock_qty' => 5,
            'min_stock' => 1,
            'max_stock' => 10,
            'is_service' => false,
            'is_accessory' => false,
            'is_active' => true,
        ]);
    }

    private function itemPayload(PosProduct $product): array
    {
        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_variant' => $product->variant,
            'product_sku' => $product->sku,
            'is_service' => false,
            'quantity' => 1,
            'unit_price' => $product->price,
            'discount_type' => 'none',
            'discount_value' => 0,
            'gift_wrap' => false,
        ];
    }
}
