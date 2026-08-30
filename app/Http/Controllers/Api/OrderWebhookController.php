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
            'total'          => 'required|numeric|min:0',
            'currency'       => 'nullable|string|size:3',
            'payment_method' => 'nullable|string|max:100',
            'address'         => 'nullable|string|max:500',
            'shipping_method' => 'nullable|string|max:100',
        ]);

        // Duplicate-order detection happens INSIDE the transaction below (row lock +
        // unique index on wc_order_id), so two concurrent webhook deliveries
        // of the same order can't both slip through the check.

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
            $result = DB::transaction(function () use ($validated, $products) {
                // Duplicate guard: lock the row inside the transaction so two
                // concurrent deliveries of the same order can't both insert.
                $existing = DB::table('pos_invoices')
                    ->where('wc_order_id', $validated['wc_order_id'])
                    ->where('outlet', 'nile')
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    return ['duplicate' => true, 'invoice_id' => $existing->id];
                }

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
                        'subtotal'       => $validated['subtotal'],
                        'discount'       => $validated['discount'] ?? 0,
                        'total'          => $validated['total'],
                        'currency'       => $validated['currency'] ?? 'USD',
                    ],
                    'source'  => 'webhook',
                ]);

                return ['duplicate' => false, 'invoice' => $invoice];
            });

            if ($result['duplicate']) {
                return response()->json([
                    'success'    => true,
                    'message'    => 'Order already processed',
                    'invoice_id' => $result['invoice_id'],
                    'duplicate'  => true,
                ]);
            }

            $invoice = $result['invoice'];

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
                    $currency  = $validated['currency'] ?? 'USD';
                    $itemLines = $this->formatNileItems(
                        $validated['items'],
                        $currency,
                        fn($i) => [
                            $i['name'],
                            $products[$i['sku']]->variant ?? '',
                            $i['quantity'],
                            $i['unit_price'],
                        ]
                    );

                    $message = $this->buildNileOrderTelegramMessage([
                        'wc_order_id'     => $validated['wc_order_id'],
                        'customer_name'   => $validated['customer']['name'],
                        'customer_email'  => $validated['customer']['email'] ?? null,
                        'customer_phone'  => $validated['customer']['phone'] ?? null,
                        'address'         => $validated['address'] ?? null,
                        'shipping_method' => $validated['shipping_method'] ?? null,
                        'payment_method'  => $validated['payment_method'] ?? null,
                        'currency'        => $currency,
                        'item_lines'      => $itemLines,
                        'item_count'      => count($validated['items']),
                        'subtotal'        => $validated['subtotal'],
                        'discount'        => $validated['discount'] ?? 0,
                        'total'           => $validated['total'],
                        'time'            => now()->format('M d, Y h:i A'),
                        'view_order_url'  => $this->nileOrderViewUrl($validated['wc_order_id']),
                    ]);

                    $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                        'chat_id'    => $chatId,
                        'text'       => $message,
                        'parse_mode' => 'HTML',
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

        $currency  = $invoice->currency ?? 'USD';
        $itemLines = $this->formatNileItems(
            $invoice->items ?? collect(),
            $currency,
            fn($i) => [
                $i->product_name,
                $i->product_variant ?? '',
                $i->quantity,
                $i->unit_price,
            ]
        );

        $customerName  = $invoice->customer?->name ?? 'Guest';
        $customerEmail = $invoice->customer?->email ?? null;
        $wcOrderId     = $invoice->wc_order_id ?? $invoice->invoice_number;

        $message = $this->buildNileOrderTelegramMessage([
            'wc_order_id'     => $wcOrderId,
            'customer_name'   => $customerName,
            'customer_email'  => $customerEmail,
            'customer_phone'  => $invoice->customer?->phone ?? null,
            'address'         => $invoice->customer?->address ?? null,
            'shipping_method' => $invoice->shipping_method ?? null,
            'payment_method'  => $this->extractPaymentMethod($invoice),
            'currency'        => $currency,
            'item_lines'      => $itemLines,
            'item_count'      => $invoice->items?->count() ?? 0,
            'subtotal'        => $invoice->subtotal,
            'discount'        => $invoice->items_discount,
            'total'           => $invoice->grand_total,
            'time'            => $invoice->created_at->format('M d, Y h:i A'),
            'view_order_url'  => $this->nileOrderViewUrl($wcOrderId),
        ]);

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

    /**
     * Build the Nile order Telegram notification body (HTML), matching the
     * approved reference layout: header + order date, customer block,
     * payment/delivery, "+ Items :" list, totals, optional View-Order link.
     * Every user-supplied value is HTML-escaped, so a value containing
     * '<', '>', '&' (or an email with '_') can never break parsing.
     * Optional fields (phone / address / delivery) are omitted when empty.
     */
    private function buildNileOrderTelegramMessage(array $data): string
    {
        $e   = fn($s) => htmlspecialchars((string) ($s ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $sep = '──────────────';
        $ts  = strtotime((string) ($data['time'] ?? '')) ?: time();
        $sym = (($data['currency'] ?? 'USD') === 'USD') ? '$' : $e($data['currency']) . ' ';

        $lines = [
            "🛍️ <b>NEW ORDER : #{$e($data['wc_order_id'])}</b>",
            'Order Date: ' . date('F j, Y', $ts) . ' • ' . date('g:i A', $ts),
            $sep,
            "Customer: {$e($data['customer_name'])}",
        ];

        // Email -> tappable mailto link, shown ONLY when the address is valid.
        $email = trim((string) ($data['customer_email'] ?? ''));
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) !== false) {
            $lines[] = "Email: <a href=\"mailto:{$e($email)}\">{$e($email)}</a>";
        }

        // Phone -> tap opens a Telegram chat with that number (https://t.me/+<digits>).
        $phone  = trim((string) ($data['customer_phone'] ?? ''));
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) >= 8) {
            $lines[] = "Phone: <a href=\"https://t.me/+{$digits}\">{$e($phone)}</a>";
        }
        if (!empty($data['address'])) {
            $lines[] = "Address: {$e($data['address'])}";
        }

        $lines[] = $sep;
        $lines[] = 'Payment: ' . ($data['payment_method'] ? $e($data['payment_method']) : 'N/A');

        if (!empty($data['shipping_method'])) {
            $lines[] = "Delivery: {$e($data['shipping_method'])}";
        }

        $lines[] = $sep;
        $lines[] = '+ Items :';

        if (!empty($data['item_lines'])) {
            $lines[] = $data['item_lines'];
        }

        $lines[] = $sep;
        $lines[] = 'Subtotal: ' . $sym . number_format((float) $data['subtotal'], 2);

        if ((float) ($data['discount'] ?? 0) > 0) {
            $lines[] = '🏷️ Discount: -' . $sym . number_format((float) $data['discount'], 2);
        }

        $lines[] = '💰 Total: ' . $sym . number_format((float) $data['total'], 2);

        if (!empty($data['view_order_url'])) {
            $lines[] = '';
            $lines[] = "🔗 <a href=\"{$e($data['view_order_url'])}\">View Order</a>";
        }

        return implode("\n", $lines);
    }

    /**
     * Build the "+ Items :" block (HTML-escaped) to match the reference layout:
     *   1. Horsebit
     *   • Color Black | Size 43 | Qty 1
     *   • $145.00 × 1
     * Variant "Black-43" maps to color=Black, size=43. Shows the first 5 items,
     * then appends a "… and N more" note.
     */
    private function formatNileItems(iterable $items, string $currency, \Closure $resolve): string
    {
        $e   = fn($s) => htmlspecialchars((string) ($s ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $all = collect($items);
        $sym = (($currency ?: 'USD') === 'USD') ? '$' : $e($currency) . ' ';

        $blocks = $all->take(5)->values()->map(function ($it, $idx) use ($resolve, $e, $sym) {
            [$name, $variant, $qty, $price] = $resolve($it);

            return ($idx + 1) . '. ' . $e($name) . "\n"
                . $this->variantDetailLine($variant, $qty, $e) . "\n"
                . '• ' . $sym . number_format((float) $price, 2) . " × {$qty}";
        })->implode("\n");

        if ($all->count() > 5) {
            $blocks .= "\n… and " . ($all->count() - 5) . " more item(s)";
        }

        return $blocks;
    }

    /**
     * Render the "• Color X | Size Y | Qty N" line for a variant like "Black-43".
     * Falls back gracefully when the variant is missing or has one part only.
     */
    private function variantDetailLine(?string $variant, $qty, \Closure $e): string
    {
        $parts = array_values(array_filter(
            array_map('trim', explode('-', (string) $variant)),
            fn($p) => $p !== ''
        ));

        if (count($parts) >= 2) {
            return "• Color {$e($parts[0])} | Size {$e($parts[1])} | Qty {$qty}";
        }
        if (count($parts) === 1) {
            return "• Color {$e($parts[0])} | Qty {$qty}";
        }

        return "• Qty {$qty}";
    }

    /**
     * Resolve the "View Order" deep link from config (set NILE_ORDER_VIEW_URL).
     * The template may contain a {wc_order_id} placeholder. Returns null when
     * not configured, so the link is simply omitted.
     */
    private function nileOrderViewUrl($wcOrderId): ?string
    {
        $template = config('nile-telegram.order_view_url');
        if (empty($template) || empty($wcOrderId)) {
            return null;
        }

        return str_replace('{wc_order_id}', $wcOrderId, $template);
    }

    /**
     * Best-effort payment-method for the manual re-send. The webhook stores it
     * in the invoice notes ("WC Order #123 | ABA PayWay"), so fall back to that.
     */
    private function extractPaymentMethod(PosInvoice $invoice): ?string
    {
        if (!empty($invoice->payment_method)) {
            return $invoice->payment_method;
        }
        if (empty($invoice->notes)) {
            return null;
        }
        if (preg_match('/\|\\s*(.+)$/', $invoice->notes, $m)) {
            return trim($m[1]);
        }

        return null;
    }
}
