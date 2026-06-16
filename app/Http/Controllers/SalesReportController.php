<?php

namespace App\Http\Controllers;

use App\Models\SalesTarget;
use App\Models\PosInvoice;
use App\Models\PosRefund;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Scopes\OutletScope;
use App\Services\SalesService;

class SalesReportController extends Controller
{
    protected $salesService;

    public function __construct(SalesService $salesService)
    {
        $this->salesService = $salesService;
    }
    /**
     * GET /api/v1/admin/sales-report/daily
     * Detailed daily report: revenue, invoice count, top sellers, refunds.
     */
    public function daily(Request $request): JsonResponse
    {
        $date   = $request->get('date', now()->toDateString());
        $outlet = $this->resolveOutlet();

        $data = $this->salesService->getDailyReport($date, $outlet);

        // Add payment breakdown which is specific to this controller for now
        // Include both pos_payments and WooCommerce orders (which don't have pos_payments records)
        $data['payment_breakdown'] = DB::table('pos_payments')
            ->join('pos_invoices', 'pos_payments.invoice_id', '=', 'pos_invoices.id')
            ->where('pos_invoices.date', $date)
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $outlet)
            ->select('pos_payments.method', DB::raw('SUM(pos_payments.amount) as total'))
            ->groupBy('pos_payments.method')
            ->get()
            ->merge(
                DB::table('pos_invoices')
                    ->leftJoin('pos_payments', 'pos_invoices.id', '=', 'pos_payments.invoice_id')
                    ->where('pos_invoices.date', $date)
                    ->where('pos_invoices.status', 'completed')
                    ->where('pos_invoices.outlet', $outlet)
                    ->whereNull('pos_payments.id')
                    ->where(function ($q) {
                        $q->where('pos_invoices.order_source', 'woocommerce')
                          ->orWhereNotNull('pos_invoices.wc_order_id');
                    })
                    ->select(DB::raw("'wc' as method"), DB::raw('SUM(pos_invoices.grand_total) as total'))
                    ->groupBy('method')
                    ->get()
            );

        return response()->json($data);
    }

    /**
     * GET /api/v1/admin/sales-report/monthly
     * Monthly summary: total revenue, daily breakdown, vs target.
     */
    public function monthly(Request $request): JsonResponse
    {
        $year   = (int) $request->get('year', now()->year);
        $month  = (int) $request->get('month', now()->month);
        $outlet = $this->resolveOutlet();

        $data = $this->salesService->getMonthlyReport($year, $month, $outlet);

        // Monthly target and top sellers (month) still handled here for now
        $data['target'] = SalesTarget::where('year', $year)->where('month', $month)->first();
        
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        $data['top_sellers'] = DB::table('pos_invoice_items')
            ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
            ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $outlet)
            ->select(
                'pos_invoice_items.product_name',
                'pos_invoice_items.product_variant',
                'pos_invoice_items.product_sku',
                DB::raw('SUM(pos_invoice_items.quantity) as total_qty'),
                DB::raw('SUM(pos_invoice_items.line_total) as total_revenue')
            )
            ->groupBy('pos_invoice_items.product_name', 'pos_invoice_items.product_variant', 'pos_invoice_items.product_sku')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        $data['payment_breakdown'] = DB::table('pos_payments')
            ->join('pos_invoices', 'pos_payments.invoice_id', '=', 'pos_invoices.id')
            ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $outlet)
            ->select('pos_payments.method', DB::raw('SUM(pos_payments.amount) as total'))
            ->groupBy('pos_payments.method')
            ->get()
            ->merge(
                DB::table('pos_invoices')
                    ->leftJoin('pos_payments', 'pos_invoices.id', '=', 'pos_payments.invoice_id')
                    ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
                    ->where('pos_invoices.status', 'completed')
                    ->where('pos_invoices.outlet', $outlet)
                    ->whereNull('pos_payments.id')
                    ->where(function ($q) {
                        $q->where('pos_invoices.order_source', 'woocommerce')
                          ->orWhereNotNull('pos_invoices.wc_order_id');
                    })
                    ->select(DB::raw("'wc' as method"), DB::raw('SUM(pos_invoices.grand_total) as total'))
                    ->groupBy('method')
                    ->get()
            );

        return response()->json($data);
    }

    /**
     * GET /api/v1/admin/sales-report/targets
     * List all saved targets.
     */
    public function getTargets(): JsonResponse
    {
        $targets = SalesTarget::orderByDesc('year')->orderByDesc('month')->get();
        return response()->json($targets);
    }

    /**
     * POST /api/v1/admin/sales-report/targets
     * Upsert a monthly target.
     */
    public function setTarget(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year'           => 'required|integer|min:2020|max:2100',
            'month'          => 'required|integer|min:1|max:12',
            'target_revenue' => 'required|numeric|min:0',
            'notes'          => 'nullable|string|max:500',
        ]);

        $target = SalesTarget::updateOrCreate(
            ['year' => $validated['year'], 'month' => $validated['month']],
            ['target_revenue' => $validated['target_revenue'], 'notes' => $validated['notes'] ?? null]
        );

        return response()->json($target, 201);
    }

    /**
     * DELETE /api/v1/admin/sales-report/targets/{id}
     */
    public function deleteTarget(int $id): JsonResponse
    {
        SalesTarget::findOrFail($id)->delete();
        return response()->json(['message' => 'Target deleted.']);
    }

    /**
     * Resolve the active outlet from request context.
     */
    private function resolveOutlet(): string
    {
        $request = request();
        $outlet = $request->header('X-Active-Outlet')
            ?? $request->get('outlet')
            ?? 'attire_lounge';

        $allowed = ['attire_lounge', 'caffeine', 'kravat', 'nile'];
        return in_array($outlet, $allowed) ? $outlet : 'attire_lounge';
    }
}
