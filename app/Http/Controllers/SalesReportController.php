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
use Illuminate\Support\Collection;

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
     * Optional `end_date` param turns it into a date-period report (inclusive range).
     */
    public function daily(Request $request): JsonResponse
    {
        $date    = $request->get('date', now()->toDateString());
        $endDate = $request->get('end_date');
        $outlet  = $this->resolveOutlet();

        // Defensive: ignore end_date when it's not a valid range
        if ($endDate !== null && ($endDate < $date || !strtotime($endDate))) {
            $endDate = null;
        }

        $data = $this->salesService->getDailyReport($date, $outlet, $endDate ?: null);

        $data['payment_breakdown'] = $this->paymentBreakdown($date, $endDate ?: $date, $outlet);

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

        // Monthly target
        $data['target'] = SalesTarget::where('year', $year)->where('month', $month)->first();

        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        $data['payment_breakdown'] = $this->paymentBreakdown($start->toDateString(), $end->toDateString(), $outlet);

        return response()->json($data);
    }

    /**
     * GET /api/v1/admin/sales-report/weekly
     * Weekly report: total revenue, 7-day breakdown, top sellers, refunds.
     * Accepts a `date` param — week is resolved as Monday→Sunday containing that date.
     */
    public function weekly(Request $request): JsonResponse
    {
        $date   = $request->get('date', now()->toDateString());
        $outlet = $this->resolveOutlet();

        $data = $this->salesService->getWeeklyReport($date, $outlet);

        // Payment breakdown for the same week range
        $startStr = \Carbon\Carbon::parse($date)->startOfWeek(\Carbon\Carbon::MONDAY)->toDateString();
        $endStr   = \Carbon\Carbon::parse($date)->endOfWeek(\Carbon\Carbon::SUNDAY)->toDateString();

        $data['payment_breakdown'] = $this->paymentBreakdown($startStr, $endStr, $outlet);

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
     * Payment method breakdown for an inclusive date range.
     * Includes pos_payments plus WooCommerce orders (which don't have pos_payments records).
     * Shared by daily/weekly/monthly to avoid duplicated query logic.
     */
    private function paymentBreakdown(string $startStr, string $endStr, string $outlet): Collection
    {
        return DB::table('pos_payments')
            ->join('pos_invoices', 'pos_payments.invoice_id', '=', 'pos_invoices.id')
            ->whereBetween('pos_invoices.date', [$startStr, $endStr])
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $outlet)
            ->select('pos_payments.method', DB::raw('SUM(pos_payments.amount) as total'))
            ->groupBy('pos_payments.method')
            ->get()
            ->merge(
                DB::table('pos_invoices')
                    ->leftJoin('pos_payments', 'pos_invoices.id', '=', 'pos_payments.invoice_id')
                    ->whereBetween('pos_invoices.date', [$startStr, $endStr])
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
