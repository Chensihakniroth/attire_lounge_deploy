<?php

namespace App\Http\Controllers;

use App\Models\SalesTarget;
use App\Models\PosInvoice;
use App\Models\PosRefund;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Scopes\OutletScope;

class SalesReportController extends Controller
{
    /**
     * GET /api/v1/admin/sales-report/daily
     * Detailed daily report: revenue, invoice count, top sellers, refunds.
     */
    public function daily(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());

        $invoices = PosInvoice::whereDate('date', $date)
            ->where('status', 'completed')
            ->with(['items', 'payments', 'customer'])
            ->orderByDesc('created_at')
            ->get();

        $totalRevenue = $invoices->sum('grand_total');

        $totalRefunds = PosRefund::whereHas('invoice', function ($q) use ($date) {
            $q->whereDate('date', $date);
        })->sum('amount');

        $netRevenue = $totalRevenue - $totalRefunds;

        // Top sellers — aggregate invoice items for the day
        $topSellers = DB::table('pos_invoice_items')
            ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
            ->whereDate('pos_invoices.date', $date)
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $this->resolveOutlet())
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

        // Category breakdown
        $categoryBreakdown = DB::table('pos_invoice_items')
            ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
            ->join('pos_products', 'pos_invoice_items.product_id', '=', 'pos_products.id')
            ->whereDate('pos_invoices.date', $date)
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $this->resolveOutlet())
            ->select(
                'pos_products.category',
                DB::raw('SUM(pos_invoice_items.quantity) as total_qty'),
                DB::raw('SUM(pos_invoice_items.line_total) as total_revenue')
            )
            ->groupBy('pos_products.category')
            ->orderByDesc('total_revenue')
            ->get();

        // Payment method breakdown
        $paymentBreakdown = DB::table('pos_payments')
            ->join('pos_invoices', 'pos_payments.invoice_id', '=', 'pos_invoices.id')
            ->whereDate('pos_invoices.date', $date)
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $this->resolveOutlet())
            ->select('pos_payments.method', DB::raw('SUM(pos_payments.amount) as total'))
            ->groupBy('pos_payments.method')
            ->get();

        return response()->json([
            'date'               => $date,
            'invoice_count'      => $invoices->count(),
            'total_revenue'      => round($totalRevenue, 2),
            'total_refunds'      => round($totalRefunds, 2),
            'net_revenue'        => round($netRevenue, 2),
            'avg_order_value'    => $invoices->count() > 0 ? round($totalRevenue / $invoices->count(), 2) : 0,
            'top_sellers'        => $topSellers,
            'category_breakdown' => $categoryBreakdown,
            'payment_breakdown'  => $paymentBreakdown,
            'invoices'           => $invoices,
        ]);
    }

    /**
     * GET /api/v1/admin/sales-report/monthly
     * Monthly summary: total revenue, daily breakdown, vs target.
     */
    public function monthly(Request $request): JsonResponse
    {
        $year  = (int) $request->get('year', now()->year);
        $month = (int) $request->get('month', now()->month);

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        // Daily revenue in the month
        $dailyRevenue = DB::table('pos_invoices')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->where('status', 'completed')
            ->where('outlet', $this->resolveOutlet())
            ->select(DB::raw('DATE(date) as day'), DB::raw('SUM(grand_total) as revenue'), DB::raw('COUNT(*) as invoices'))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $totalRevenue = $dailyRevenue->sum('revenue');

        // Total refunds for month
        $totalRefunds = DB::table('pos_refunds')
            ->join('pos_invoices', 'pos_refunds.invoice_id', '=', 'pos_invoices.id')
            ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
            ->where('pos_invoices.outlet', $this->resolveOutlet())
            ->sum('pos_refunds.amount');

        $netRevenue = $totalRevenue - $totalRefunds;

        // Monthly target
        $target = SalesTarget::where('year', $year)->where('month', $month)->first();

        // Top sellers for month
        $topSellers = DB::table('pos_invoice_items')
            ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
            ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $this->resolveOutlet())
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

        return response()->json([
            'year'           => $year,
            'month'          => $month,
            'total_revenue'  => round($totalRevenue, 2),
            'total_refunds'  => round($totalRefunds, 2),
            'net_revenue'    => round($netRevenue, 2),
            'daily_breakdown'=> $dailyRevenue,
            'top_sellers'    => $topSellers,
            'target'         => $target,
        ]);
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

        $allowed = ['attire_lounge', 'caffeine', 'kravat'];
        return in_array($outlet, $allowed) ? $outlet : 'attire_lounge';
    }
}
