<?php

namespace App\Http\Controllers;

use App\Models\PosInvoice;
use App\Models\PosInvoiceItem;
use App\Models\PosPayment;
use App\Models\PosProduct;
use App\Models\Promocode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Services\SalesService;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PosInvoiceController extends Controller
{
    protected $salesService;

    public function __construct(SalesService $salesService)
    {
        $this->salesService = $salesService;
    }
    /**
     * List invoices — filterable by date, status.
     * GET /api/v1/pos/invoices
     */
    public function index(Request $request): JsonResponse
    {
        $query = PosInvoice::with(['customer', 'cashier', 'items', 'payments', 'refunds']);

        if ($date = $request->get('date')) {
            $query->whereDate('date', $date);
        }

        if ($fromDate = $request->get('from_date')) {
            $query->whereDate('date', '>=', $fromDate);
        }

        if ($toDate = $request->get('to_date')) {
            $query->whereDate('date', '<=', $toDate);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($orderSource = $request->get('order_source')) {
            $query->where('order_source', $orderSource);
        }

        if ($wcOrderId = $request->get('wc_order_id')) {
            $query->where('wc_order_id', $wcOrderId);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'LIKE', "%{$search}%")
                  ->orWhere('wc_order_id', 'LIKE', "%{$search}%")
                  ->orWhereHas('customer', fn($cq) => $cq->where('name', 'LIKE', "%{$search}%"));
            });
        }

        if ($customerId = $request->get('customer_profile_id')) {
            $query->where('customer_profile_id', $customerId);
        }

        $invoices = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 20));

        return response()->json($invoices);
    }

    /**
     * Get single invoice detail.
     * GET /api/v1/pos/invoices/{id}
     */
    public function show(int $id): JsonResponse
    {
        $invoice = PosInvoice::with([
            'customer',
            'cashier',
            'items.product',
            'items.refunds',
            'payments',
            'refunds.invoiceItem',
            'refunds.processedBy',
            'promoCode',
        ])->findOrFail($id);

        return response()->json($invoice);
    }

    /**
     * Create and finalize a new invoice (complete sale).
     * POST /api/v1/pos/invoices
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_profile_id'  => 'nullable|exists:customer_profiles,id',
            'discount_type'        => 'nullable|in:percentage,fixed',
            'discount_value'       => 'nullable|numeric|min:0',
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'nullable|exists:pos_products,id',
            'items.*.product_name' => 'required|string',
            'items.*.product_variant' => 'nullable|string',
            'items.*.product_sku'  => 'nullable|string',
            'items.*.is_service'   => 'boolean',
            'items.*.quantity'     => 'required|integer|min:1',
            'items.*.unit_price'   => 'required|numeric|min:0',
            'items.*.discount_type'  => 'in:none,amount,percent',
            'items.*.discount_value' => 'numeric|min:0',
            'items.*.gift_wrap'    => 'boolean',
            'payments'             => 'required|array|min:1',
            'payments.*.method'    => 'required|in:cash,card,deposit,aba,acleda,true_money,foodpanda,grab,wownow',
            'payments.*.amount'    => 'required|numeric|min:0.01',
            'payments.*.reference' => 'nullable|string',
            'promo_code_id'        => 'nullable|exists:promocodes,id',
            'notes'                => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Compute totals
            $totals = $this->computeTotals(
                $validated['items'],
                $validated['promo_code_id'] ?? null,
                $validated['discount_type'] ?? null,
                $validated['discount_value'] ?? 0
            );

            // Determine payment status
            $totalPaid   = collect($validated['payments'])->sum('amount');
            $hasDeposit  = collect($validated['payments'])->contains('method', 'deposit');
            $paymentStatus = ($totalPaid >= $totals['grand_total']) ? 'paid' : 'partial';

            // Create invoice
            $invoice = PosInvoice::create([
                'customer_profile_id' => $validated['customer_profile_id'] ?? null,
                'cashier_id'          => $request->user()->id,
                'date'                => now()->toDateString(),
                'subtotal'            => $totals['subtotal'],
                'items_discount'      => $totals['items_discount'],
                'tier_discount_pct'   => $totals['tier_discount_pct'],
                'tier_discount_amt'   => $totals['tier_discount_amt'],
                'promo_code_id'       => $validated['promo_code_id'] ?? null,
                'promo_discount_amt'  => $totals['promo_discount_amt'],
                'grand_total'         => $totals['grand_total'],
                'notes'               => $validated['notes'] ?? null,
                'status'              => 'completed',
                'payment_status'      => $paymentStatus,
            ]);

            // Create line items
            foreach ($validated['items'] as $item) {
                $computed = PosInvoiceItem::computeLineTotal(
                    $item['quantity'],
                    $item['unit_price'],
                    $item['discount_type'] ?? 'none',
                    $item['discount_value'] ?? 0
                );

                PosInvoiceItem::create([
                    'invoice_id'       => $invoice->id,
                    'product_id'       => $item['product_id'] ?? null,
                    'product_name'     => $item['product_name'],
                    'product_variant'  => $item['product_variant'] ?? null,
                    'product_sku'      => $item['product_sku'] ?? null,
                    'is_service'       => $item['is_service'] ?? false,
                    'quantity'         => $item['quantity'],
                    'unit_price'       => $item['unit_price'],
                    'discount_type'    => $item['discount_type'] ?? 'none',
                    'discount_value'   => $item['discount_value'] ?? 0,
                    'discount_amount'  => $computed['discount_amount'],
                    'gift_wrap'        => $item['gift_wrap'] ?? false,
                    'line_total'       => $computed['line_total'],
                ]);

                // Deduct stock if it's a physical product and has a valid ID
                if (!empty($item['product_id']) && empty($item['is_service'])) {
                    $posProduct = PosProduct::find($item['product_id']);
                    if ($posProduct) {
                        $posProduct->decrement('stock_qty', (int) $item['quantity']);
                    }
                }
            }

            // Create payment rows (split payment support)
            foreach ($validated['payments'] as $payment) {
                PosPayment::create([
                    'invoice_id' => $invoice->id,
                    'method'     => $payment['method'],
                    'amount'     => $payment['amount'],
                    'reference'  => $payment['reference'] ?? null,
                ]);
            }

            DB::commit();
            
            // Clear report caches
            $date   = $invoice->date;
            $outlet = $invoice->outlet;
            $dateStr = $date instanceof \Carbon\Carbon ? $date->toDateString() : \Carbon\Carbon::parse($date)->toDateString();
            $year   = \Carbon\Carbon::parse($date)->year;
            $month  = \Carbon\Carbon::parse($date)->month;
            
            Cache::forget("sales_daily_{$outlet}_{$dateStr}");
            Cache::forget("sales_monthly_{$outlet}_{$year}_{$month}");

            return response()->json(
                $invoice->load(['items', 'payments', 'customer']),
                201
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to save invoice: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Daily sales summary for Admin Dashboard.
     * Delegates to SalesReportController to avoid duplicating aggregation logic.
     * GET /api/v1/pos/summary/daily
     */
    public function dailySummary(Request $request): JsonResponse
    {
        $date   = $request->get('date', now()->toDateString());
        $outlet = $request->header('X-Active-Outlet') ?? $request->query('outlet', 'attire_lounge');

        $fullReport = $this->salesService->getDailyReport($date, $outlet);

        $pendingRefundedCount = (int) PosInvoice::whereDate('date', $date)
            ->where(function ($q) {
                $q->whereIn('status', ['refunded', 'void', 'held', 'active'])
                  ->orWhereIn('payment_status', ['pending', 'partial']);
            })
            ->count();

        return response()->json([
            'date'                   => $fullReport['date'],
            'invoice_count'          => $fullReport['invoice_count'],
            'total_revenue'          => $fullReport['total_revenue'],
            'avg_order'              => $fullReport['avg_order_value'],
            'total_refunds'          => $fullReport['total_refunds'],
            'net_revenue'            => $fullReport['net_revenue'],
            'pending_refunded_count' => $pendingRefundedCount,
        ]);
    }

    /**
     * Compute invoice totals from items + promo code.
     */
    private function computeTotals(array $items, ?int $promoCodeId, ?string $cartDiscountType = null, float $cartDiscountValue = 0): array
    {
        $productSubtotal = 0;
        $serviceSubtotal = 0;
        $itemsDiscount   = 0;

        foreach ($items as $item) {
            $lineQty   = $item['quantity'];
            $unitPrice = $item['unit_price'];
            $dtype     = $item['discount_type'] ?? 'none';
            $dvalue    = $item['discount_value'] ?? 0;

            $gross = $lineQty * $unitPrice;
            $disc  = PosInvoiceItem::computeLineTotal($lineQty, $unitPrice, $dtype, $dvalue)['discount_amount'];
            $net   = $gross - $disc;

            $isService = $item['is_service'] ?? false;
            if ($isService) {
                $serviceSubtotal += $net;
            } else {
                $productSubtotal += $net;
                $itemsDiscount   += $disc;
            }
        }

        // Cart-level discount (manual discount applied from POS UI)
        $tierPct = 0;
        $tierAmt = 0;

        if ($cartDiscountValue > 0 && $cartDiscountType) {
            if ($cartDiscountType === 'percentage') {
                $tierPct = $cartDiscountValue;
                $tierAmt = round($productSubtotal * ($cartDiscountValue / 100), 2);
            } else {
                // Fixed amount discount
                $tierPct = 0;
                $tierAmt = min($cartDiscountValue, $productSubtotal);
            }
        }

        $afterTier = $productSubtotal - $tierAmt;

        // Promo code discount (applied after cart discount, on product total)
        $promoAmt = 0;
        if ($promoCodeId) {
            $promo = Promocode::find($promoCodeId);
            if ($promo && $promo->expires_at >= now()) {
                $promoAmt = round($afterTier * ($promo->discount_percentage / 100), 2);
            }
        }

        $grandTotal = max(0, $afterTier - $promoAmt + $serviceSubtotal);

        return [
            'subtotal'          => round($productSubtotal + $serviceSubtotal + $itemsDiscount, 2),
            'items_discount'    => round($itemsDiscount, 2),
            'tier_discount_pct' => $tierPct,
            'tier_discount_amt' => round($tierAmt, 2),
            'promo_discount_amt'=> $promoAmt,
            'grand_total'       => round($grandTotal, 2),
        ];
    }
}
