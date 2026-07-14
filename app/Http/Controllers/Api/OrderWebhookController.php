<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\StockChanged;
use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\PosProduct;
use App\Models\CustomerProfile;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class OrderWebhookController extends Controller
{
    /**
     * Receive order from WooCommerce (via Khron's integration).
     *
     * POST /api/v1/orders/webhook
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'wc_order_id'    => 'required|integer',
            'customer'       => 'required|array',
            'customer.name'  => 'required|string|max:255',
            'customer.email' => 'nullable|email|max:255',
            'customer.phone' => 'nullable|string|max:50',
            'items'          => 'required|array|min:1',
            'items.*.sku'    => 'required|string|max:100',
            'items.*.name'   => 'required|string|max:255',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'subtotal'       => 'required|numeric|min:0',
            'discount'       => 'nullable|numeric|min:0',
            'tax'            => 'nullable|numeric|min:0',
            'total'          => 'required|numeric|min:0',
            'currency'       => 'nullable|string|size:3',
            'payment_method' => 'nullable|string|max:100',
        ]);

        // Check for duplicate order (raw query to bypass outlet scope)
        $existing = DB::table('pos_invoices')
            ->where('wc_order_id', $validated['wc_order_id'])
            ->where('outlet', 'nile')
            ->first();

        if ($existing) {
            return response()->json([
                'success'    => true,
                'message'    => 'Order already processed',
                'invoice_id' => $existing->id,
                'duplicate'  => true,
            ]);
        }

        // Validate all SKUs exist
        $skus = collect($validated['items'])->pluck('sku');
        $products = PosProduct::withoutGlobalScope(\App\Models\Scopes\OutletScope::class)
            ->whereIn('sku', $skus)
            ->where('outlet', 'nile')
            ->get()
            ->keyBy('sku');

        $missingSkus = $skus->filter(fn($sku) => !$products->has($sku));
        if ($missingSkus->isNotEmpty()) {
            Log::warning('WC webhook: SKUs not found', [
                'wc_order_id' => $validated['wc_order_id'],
                'missing_skus' => $missingSkus->values(),
            ]);

            return response()->json([
                'success' => false,
                'error'   => 'skus_not_found',
                'message' => 'Some SKUs not found in POS',
                'missing_skus' => $missingSkus->values(),
            ], 404);
        }

        // Check stock availability
        foreach ($validated['items'] as $item) {
            $product = $products[$item['sku']];
            if (!$product->is_service && $product->stock_qty < $item['quantity']) {
                return response()->json([
                    'success' => false,
                    'error'   => 'insufficient_stock',
                    'message' => "Insufficient stock for SKU: {$item['sku']}",
                    'sku'     => $item['sku'],
                    'available' => $product->stock_qty,
                ], 409);
            }
        }

        // Process the order
        try {
            $invoice = DB::transaction(function () use ($validated, $products) {
                $customerProfileId = null;
                if (!empty($validated['customer']['email'])) {
                    $customer = CustomerProfile::firstOrCreate(
                        ['email' => $validated['customer']['email']],
                        [
                            'name'          => $validated['customer']['name'],
                            'phone'         => $validated['customer']['phone'] ?? null,
                            'date'          => now()->toDateString(),
                            'client_status' => 'Standard',
                        ]
                    );
                    $customerProfileId = $customer->id;
                }

                $invoice = PosInvoice::create([
                    'outlet'             => 'nile',
                    'order_source'       => 'woocommerce',
                    'wc_order_id'        => $validated['wc_order_id'],
                    'customer_profile_id'=> $customerProfileId,
                    'cashier_id'         => optional(User::first())->id ?? 1,
                    'date'               => now()->toDateString(),
                    'subtotal'           => $validated['subtotal'],
                    'items_discount'     => $validated['discount'] ?? 0,
                    'tier_discount_pct'  => 0,
                    'tier_discount_amt'  => 0,
                    'promo_discount_amt' => 0,
                    'grand_total'        => $validated['total'],
                    'currency'           => $validated['currency'] ?? 'USD',
                    'notes'              => 'WC Order #' . $validated['wc_order_id'] . ' | ' . ($validated['payment_method'] ?? 'N/A'),
                    'status'             => 'completed',
                    'payment_status'     => 'paid',
                ]);

                $itemsProcessed = [];
                foreach ($validated['items'] as $item) {
                    $product = $products[$item['sku']];

                    PosInvoiceItem::create([
                        'outlet'         => 'nile',
                        'invoice_id'     => $invoice->id,
                        'product_id'     => $product->id,
                        'product_name'   => $product->name,
                        'product_variant'=> $product->variant,
                        'product_sku'    => $product->sku,
                        'is_service'     => $product->is_service,
                        'quantity'       => $item['quantity'],
                        'unit_price'     => $item['unit_price'],
                        'discount_type'  => 'none',
                        'discount_value' => 0,
                        'discount_amount'=> 0,
                        'gift_wrap'      => false,
                        'line_total'     => $item['quantity'] * $item['unit_price'],
                    ]);

                    if (!$product->is_service) {
                        $oldStock = $product->stock_qty;
                        $product->decrement('stock_qty', $item['quantity']);
                        $newStock = $product->fresh()->stock_qty;

                        broadcast(new StockChanged(
                            sku: $product->sku,
                            name: $product->name,
                            oldStock: $oldStock,
                            newStock: $newStock,
                            outlet: 'nile',
                            reason: 'wc_order'
                        ))->toOthers();
                    }

                    $itemsProcessed[] = [
                        'sku'              => $item['sku'],
                        'name'             => $product->name,
                        'quantity_deducted'=> $item['quantity'],
                        'remaining_stock'  => $product->is_service ? null : ($product->fresh()->stock_qty),
                    ];
                }

                Notification::create([
                    'type'    => 'wc_order',
                    'title'   => 'New Online Order #' . $validated['wc_order_id'],
                    'message' => $validated['customer']['name'] . ' — ' . count($validated['items']) . ' item(s) — ' . ($validated['currency'] ?? 'USD') . ' ' . number_format($validated['total'], 2),
                    'data'    => [
                        'wc_order_id'    => $validated['wc_order_id'],
                        'invoice_id'     => $invoice->id,
                        'invoice_number' => $invoice->invoice_number,
                        'customer_name'  => $validated['customer']['name'],
                        'customer_email' => $validated['customer']['email'] ?? null,
                        'item_count'     => count($validated['items']),
                        'total'          => $validated['total'],
                        'currency'       => $validated['currency'] ?? 'USD',
                    ],
                    'source'  => 'webhook',
                ]);

                return $invoice;
            });

            Log::info('WC webhook: Order processed', [
                'wc_order_id' => $validated['wc_order_id'],
                'invoice_id'  => $invoice->id,
            ]);

            // ── Send Telegram Notification (Nile Cambodia Bot) ──
            try {
                $nileConfig = config('nile-telegram');
                $botToken  = $nileConfig['bot_token'] ?? '';
                $chatId    = $nileConfig['chat_id'] ?? '';

                if (!empty($botToken) && !empty($chatId)) {
                    $items = $validated['items'];
                    $formatVariant = function($variant) {
                        if (!$variant) return '';
                        $parts = array_map('trim', array_filter(explode('-', $variant)));
                        return ' (' . implode(', ', $parts) . ')';
                    };
                    $itemLines = collect($items)->take(5)->map(fn($i) =>
                        "• {$i['name']}" . ($products[$i['sku']]->variant ? $formatVariant($products[$i['sku']]->variant) : '') . " × {$i['quantity']} — $" . number_format($i['unit_price'], 2)
                    )->implode("\n");

                    if (count($items) > 5) {
                        $itemLines .= "\n… and " . (count($items) - 5) . " more item(s)";
                    }

                    $message = "🛒 *New Online Order #{$validated['wc_order_id']}* 🛒\n\n"
                        . "👤 *Customer:* {$validated['customer']['name']}\n"
                        . "📧 *Email:* " . ($validated['customer']['email'] ?? 'N/A') . "\n"
                        . "📦 *Items:* " . count($items) . "\n\n"
                        . "{$itemLines}\n\n"
                        . "💰 *Total:* " . ($validated['currency'] ?? 'USD') . ' ' . number_format($validated['total'], 2) . "\n"
                        . "💳 *Payment:* " . ($validated['payment_method'] ?? 'N/A') . "\n"
                        . "🕐 *Time:* " . now()->format('M d, Y h:i A');

                    $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                        'chat_id'    => $chatId,
                        'text'       => $message,
                        'parse_mode' => 'Markdown',
                    ]);

                    if (!$response->successful()) {
                        Log::warning('Nile Telegram notification failed', [
                            'status' => $response->status(),
                            'body'   => $response->json(),
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Nile Telegram notification error: ' . $e->getMessage());
            }

            return response()->json([
                'success'        => true,
                'invoice_id'     => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'items_processed'=> $itemsProcessed ?? [],
            ]);
        } catch (\Exception $e) {
            Log::error('WC webhook: Failed', [
                'wc_order_id' => $validated['wc_order_id'],
                'error'       => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error'   => 'processing_error',
                'message' => 'Failed to process order. Please retry.',
            ], 500);
        }
    }

    /**
     * Manually send a Telegram notification for an existing invoice.
     * POST /api/v1/admin/pos/invoices/{id}/notify-telegram
     */
    public function notifyTelegram(int $invoiceId)
    {
        $invoice = PosInvoice::with(['items', 'customer'])->findOrFail($invoiceId);

        $nileConfig = config('nile-telegram');
        $botToken  = $nileConfig['bot_token'] ?? '';
        $chatId    = $nileConfig['chat_id'] ?? '';

        if (empty($botToken) || empty($chatId)) {
            return response()->json([
                'success' => false,
                'error'   => 'Telegram not configured',
            ], 500);
        }

        $items = $invoice->items ?? collect();
        $itemLines = $items->take(5)->map(function($i) {
            $variant = $i->product_variant ?? '';
            $detail = '';
            if ($variant) {
                $parts = array_map('trim', array_filter(explode('-', $variant)));
                $detail = ' (' . implode(', ', $parts) . ')';
            }
            return "• {$i->product_name}{$detail} × {$i->quantity} — $" . number_format($i->unit_price, 2);
        })->implode("\n");

        if ($items->count() > 5) {
            $itemLines .= "\n… and " . ($items->count() - 5) . " more item(s)";
        }

        $customerName = $invoice->customer?->name ?? 'Guest';
        $customerEmail = $invoice->customer?->email ?? 'N/A';
        $wcOrderId = $invoice->wc_order_id ?? $invoice->invoice_number;

        $message = "🛒 *New Online Order #{$wcOrderId}* 🛒\n\n"
            . "👤 *Customer:* {$customerName}\n"
            . "📧 *Email:* {$customerEmail}\n"
            . "📦 *Items:* {$items->count()}\n\n"
            . "{$itemLines}\n\n"
            . "💰 *Total:* " . ($invoice->currency ?? 'USD') . ' ' . number_format($invoice->grand_total, 2) . "\n"
            . "🕐 *Time:* " . $invoice->created_at->format('M d, Y h:i A');

        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id'    => $chatId,
                'text'       => $message,
                'parse_mode' => 'Markdown',
            ]);

            if (!$response->successful()) {
                Log::warning('Nile manual Telegram notification failed', [
                    'invoice_id' => $invoiceId,
                    'status'     => $response->status(),
                    'body'       => $response->json(),
                ]);

                return response()->json([
                    'success' => false,
                    'error'   => 'Telegram API returned status ' . $response->status(),
                ], 502);
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification sent to Telegram group',
            ]);
        } catch (\Exception $e) {
            Log::error('Nile manual Telegram notification error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
