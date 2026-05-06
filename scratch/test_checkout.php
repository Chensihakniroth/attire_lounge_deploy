<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\PosPayment;
use App\Models\PosProduct;
use App\Models\User;
use Illuminate\Support\Facades\DB;

// Simulate an incoming request with outlet header
request()->headers->set('X-Active-Outlet', 'attire_lounge');

// Get a test product
$product = PosProduct::first();
if (!$product) {
    echo "ERROR: No POS products found in database!\n";
    exit(1);
}
echo "Using product: {$product->product_name} (ID: {$product->id}, SKU: {$product->sku})\n";

// Get a test user (cashier)
$user = User::first();
if (!$user) {
    echo "ERROR: No users found!\n";
    exit(1);
}
echo "Using cashier: {$user->name} (ID: {$user->id})\n";

// Simulate the store() logic
DB::beginTransaction();
try {
    $items = [[
        'product_id' => $product->id,
        'product_name' => $product->product_name,
        'product_variant' => $product->variant ?? null,
        'product_sku' => $product->sku ?? null,
        'is_service' => false,
        'quantity' => 1,
        'unit_price' => $product->price ?? 10.00,
        'discount_type' => 'none',
        'discount_value' => 0,
        'gift_wrap' => false,
    ]];

    $payments = [[
        'method' => 'cash',
        'amount' => $product->price ?? 10.00,
    ]];

    // Compute totals
    $lineQty = 1;
    $unitPrice = $product->price ?? 10.00;
    $gross = $lineQty * $unitPrice;

    echo "Gross: $gross\n";

    // Create invoice
    echo "Creating invoice...\n";
    $invoice = PosInvoice::create([
        'customer_profile_id' => null,
        'cashier_id' => $user->id,
        'date' => now()->toDateString(),
        'subtotal' => $gross,
        'items_discount' => 0,
        'tier_discount_pct' => 0,
        'tier_discount_amt' => 0,
        'promo_code_id' => null,
        'promo_discount_amt' => 0,
        'grand_total' => $gross,
        'notes' => null,
        'status' => 'completed',
        'payment_status' => 'paid',
    ]);
    echo "Invoice created: ID={$invoice->id}, Number={$invoice->invoice_number}\n";

    // Create line item
    echo "Creating invoice item...\n";
    $computed = PosInvoiceItem::computeLineTotal(1, $unitPrice, 'none', 0);
    $invoiceItem = PosInvoiceItem::create([
        'invoice_id' => $invoice->id,
        'product_id' => $product->id,
        'product_name' => $product->product_name,
        'product_variant' => null,
        'product_sku' => $product->sku ?? null,
        'is_service' => false,
        'quantity' => 1,
        'unit_price' => $unitPrice,
        'discount_type' => 'none',
        'discount_value' => 0,
        'discount_amount' => $computed['discount_amount'],
        'gift_wrap' => false,
        'line_total' => $computed['line_total'],
    ]);
    echo "Invoice item created: ID={$invoiceItem->id}\n";

    // Create payment
    echo "Creating payment...\n";
    $payment = PosPayment::create([
        'invoice_id' => $invoice->id,
        'method' => 'cash',
        'amount' => $gross,
        'reference' => null,
    ]);
    echo "Payment created: ID={$payment->id}\n";

    DB::rollBack(); // Don't actually persist test data
    echo "\n=== SUCCESS === (rolled back test data)\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\n=== FAILED ===\n";
    echo "Exception: " . get_class($e) . "\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}
