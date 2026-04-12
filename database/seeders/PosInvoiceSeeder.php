<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\PosPayment;
use App\Models\PosProduct;
use App\Models\CustomerProfile;
use App\Models\User;
use Carbon\Carbon;

class PosInvoiceSeeder extends Seeder
{
    /**
     * Seed realistic POS invoices with items, payments, and varied statuses.
     * Depends on: AdminSeeder, CustomerProfileSeeder, PosProductSeeder, PromocodeSeeder
     */
    public function run(): void
    {
        // Get dependencies
        $cashier = User::whereHas('roles', fn($q) => $q->whereIn('name', ['super-admin', 'admin']))
            ->first();

        if (!$cashier) {
            $this->command->warn('⚠ No admin user found. Skipping PosInvoiceSeeder.');
            return;
        }

        $customers = CustomerProfile::inRandomOrder()->limit(10)->get();
        $products  = PosProduct::where('is_active', true)->where('is_service', false)->inRandomOrder()->limit(20)->get();
        $services  = PosProduct::where('is_active', true)->where('is_service', true)->inRandomOrder()->limit(5)->get();

        if ($products->isEmpty()) {
            $this->command->warn('⚠ No POS products found. Skipping PosInvoiceSeeder.');
            return;
        }

        $now = Carbon::now();
        $invoicesCreated = 0;

        // ── Generate 15 invoices spread across the last 14 days ──
        for ($dayOffset = 13; $dayOffset >= 0; $dayOffset--) {
            $date = $now->copy()->subDays($dayOffset);
            $invoicesForDay = $dayOffset < 3 ? rand(2, 3) : rand(0, 2);

            for ($j = 0; $j < $invoicesForDay; $j++) {
                $customer = $customers->isNotEmpty() ? $customers->random() : null;
                $itemCount = rand(1, 4);

                // Pick random products for this invoice
                $selectedProducts = $products->random(min($itemCount, $products->count()));

                // Occasionally add a service line
                $addService = $services->isNotEmpty() && rand(1, 4) === 1;

                // Build invoice items
                $subtotal = 0;
                $itemsDiscount = 0;
                $lineItems = [];

                foreach ($selectedProducts as $product) {
                    $qty = rand(1, 2);
                    $unitPrice = $product->price;

                    // Random per-item discount (20% chance)
                    $discountType   = 'none';
                    $discountValue  = 0;
                    $discountAmount = 0;
                    if (rand(1, 5) === 1 && $unitPrice > 20) {
                        $discountType   = 'amount';
                        $discountValue  = round(rand(5, 15), 2);
                        $discountAmount = $discountValue * $qty;
                    }

                    $lineTotal = ($unitPrice * $qty) - $discountAmount;
                    $subtotal += $unitPrice * $qty;
                    $itemsDiscount += $discountAmount;

                    $lineItems[] = [
                        'product_id'      => $product->id,
                        'product_name'    => $product->name,
                        'product_variant' => $product->variant,
                        'product_sku'     => $product->sku,
                        'is_service'      => false,
                        'quantity'        => $qty,
                        'unit_price'      => $unitPrice,
                        'discount_type'   => $discountType,
                        'discount_value'  => $discountValue,
                        'discount_amount' => $discountAmount,
                        'gift_wrap'       => $product->is_accessory ? (bool)rand(0, 1) : false,
                        'line_total'      => max(0, $lineTotal),
                    ];
                }

                // Add service if selected
                if ($addService) {
                    $service = $services->random();
                    $lineItems[] = [
                        'product_id'      => $service->id,
                        'product_name'    => $service->name,
                        'product_variant' => $service->variant,
                        'product_sku'     => $service->sku,
                        'is_service'      => true,
                        'quantity'        => 1,
                        'unit_price'      => $service->price,
                        'discount_type'   => 'none',
                        'discount_value'  => 0,
                        'discount_amount' => 0,
                        'gift_wrap'       => false,
                        'line_total'      => $service->price,
                    ];
                    $subtotal += $service->price;
                }

                // Tier discount (based on net amount)
                $netBeforeTier = $subtotal - $itemsDiscount;
                $tierPct = 0;
                if ($netBeforeTier >= 1000) $tierPct = 15;
                elseif ($netBeforeTier >= 500) $tierPct = 10;
                elseif ($netBeforeTier >= 300) $tierPct = 8;

                $tierAmt = round($netBeforeTier * ($tierPct / 100), 2);
                $grandTotal = max(0, round($netBeforeTier - $tierAmt, 2));

                // Pick a status
                $statuses = ['completed', 'completed', 'completed', 'completed', 'active', 'void'];
                $status = $statuses[array_rand($statuses)];
                $paymentStatus = $status === 'completed' ? 'paid' : ($status === 'active' ? 'pending' : 'pending');

                // Create invoice (let booted() auto-generate invoice_number)
                $invoice = PosInvoice::create([
                    'customer_profile_id' => $customer?->id,
                    'cashier_id'          => $cashier->id,
                    'date'                => $date->toDateString(),
                    'subtotal'            => round($subtotal, 2),
                    'items_discount'      => round($itemsDiscount, 2),
                    'tier_discount_pct'   => $tierPct,
                    'tier_discount_amt'   => $tierAmt,
                    'promo_code_id'       => null,
                    'promo_discount_amt'  => 0,
                    'grand_total'         => $grandTotal,
                    'notes'               => null,
                    'status'              => $status,
                    'payment_status'      => $paymentStatus,
                ]);

                // Create line items
                foreach ($lineItems as $item) {
                    PosInvoiceItem::create(array_merge($item, [
                        'invoice_id' => $invoice->id,
                    ]));
                }

                // Create payment for completed invoices
                if ($status === 'completed') {
                    $methods = ['cash', 'khqr', 'credit', 'debit'];
                    PosPayment::create([
                        'invoice_id' => $invoice->id,
                        'method'     => $methods[array_rand($methods)],
                        'amount'     => $grandTotal,
                        'reference'  => null,
                    ]);
                }

                $invoicesCreated++;
            }
        }

        $this->command->info("✅ Created {$invoicesCreated} POS invoices with items & payments.");
    }
}
