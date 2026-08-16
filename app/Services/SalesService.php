<?php

namespace App\Services;

use App\Models\PosInvoice;
use App\Models\PosRefund;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SalesService
{
    /**
     * Daily sales report. When $endDate is null → single-day report (existing behavior).
     * When $endDate is provided → period report spanning [$date, $endDate] with a
     * per-day breakdown, reusing the same aggregate helpers as weekly/monthly.
     */
    public function getDailyReport(string $date, string $outlet, ?string $endDate = null): array
    {
        $cacheKey = $endDate
            ? "sales_daily_v2_{$outlet}_{$date}_{$endDate}"
            : "sales_daily_v2_{$outlet}_{$date}";

        return Cache::remember($cacheKey, 3600, function () use ($date, $endDate, $outlet) {
            if ($endDate !== null && $endDate !== $date) {
                return $this->getPeriodReport($date, $endDate, $outlet);
            }

            $invoices = PosInvoice::whereDate('date', $date)
                ->where('status', 'completed')
                ->with(['items', 'payments', 'customer'])
                ->orderByDesc('created_at')
                ->get();

            $totalRevenue = $invoices->sum('grand_total');

            $totalRefunds = PosRefund::whereHas('invoice', function ($q) use ($date, $outlet) {
                $q->whereDate('date', $date)->where('outlet', $outlet);
            })->sum('amount');

            $netRevenue = $totalRevenue - $totalRefunds;

            // Compute total_items and top_sellers from already-loaded invoices (no extra DB query)
            $allItems = $invoices->flatMap->items;
            $totalItems = (int) $allItems->sum('quantity');

            $sellers = $allItems
                ->groupBy(fn($item) => $item->product_name.'|'.$item->product_variant.'|'.$item->product_sku)
                ->map(fn($group) => (object) [
                    'product_name'    => $group->first()->product_name,
                    'product_variant' => $group->first()->product_variant,
                    'product_sku'     => $group->first()->product_sku,
                    'total_qty'       => $group->sum('quantity'),
                    'total_revenue'   => round($group->sum('line_total'), 2),
                ])
                ->sortByDesc('total_qty')
                ->values();

            $topSellers = $sellers->take(10)->values();
            $lowestSellers = $sellers->reverse()->take(10)->values();

            // Category breakdown
            $categoryBreakdown = DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->leftJoin('pos_products', 'pos_invoice_items.product_id', '=', 'pos_products.id')
                ->whereDate('pos_invoices.date', $date)
                ->where('pos_invoices.status', 'completed')
                ->where('pos_invoices.outlet', $outlet)
                ->select(
                    DB::raw('COALESCE(pos_products.category, "Uncategorized") as category'),
                    DB::raw('SUM(pos_invoice_items.quantity) as total_qty'),
                    DB::raw('SUM(pos_invoice_items.line_total) as total_revenue')
                )
                ->groupBy('category')
                ->orderByDesc('total_revenue')
                ->get();

            return [
                'date'               => $date,
                'invoice_count'      => $invoices->count(),
                'total_revenue'      => round($totalRevenue, 2),
                'total_refunds'      => round($totalRefunds, 2),
                'net_revenue'        => round($netRevenue, 2),
                'avg_order_value'    => $invoices->count() > 0 ? round($totalRevenue / $invoices->count(), 2) : 0,
                'total_items'        => $totalItems,
                'top_sellers'        => $topSellers,
                'lowest_sellers'     => $lowestSellers,
                'category_breakdown' => $categoryBreakdown,
                'invoices'           => $invoices,
            ];
        });
    }

    /**
     * Period report for an arbitrary [start, end] date range.
     * Shares the same aggregate helpers as weekly/monthly — no duplicated query logic.
     */
    private function getPeriodReport(string $startStr, string $endStr, string $outlet): array
    {
        // Daily revenue breakdown grouped by date
        $dailyRevenue = DB::table('pos_invoices')
            ->whereBetween('date', [$startStr, $endStr])
            ->where('status', 'completed')
            ->where('outlet', $outlet)
            ->select('date as day', DB::raw('SUM(grand_total) as revenue'), DB::raw('COUNT(*) as invoices'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $totalRevenue = $dailyRevenue->sum('revenue');

        $totalRefunds = DB::table('pos_refunds')
            ->join('pos_invoices', 'pos_refunds.invoice_id', '=', 'pos_invoices.id')
            ->whereBetween('pos_invoices.date', [$startStr, $endStr])
            ->where('pos_invoices.outlet', $outlet)
            ->sum('pos_refunds.amount');

        $netRevenue = $totalRevenue - $totalRefunds;

        // Total items, top sellers & category breakdown (single consolidated query)
        [$totalItems, $topSellers, $categoryBreakdown, $lowestSellers] = $this->getItemsAggregates($startStr, $endStr, $outlet);

        // Full invoice list for the period
        $invoices = PosInvoice::whereBetween('date', [$startStr, $endStr])
            ->where('status', 'completed')
            ->where('outlet', $outlet)
            ->with(['items', 'payments', 'customer'])
            ->orderByDesc('created_at')
            ->get();

        return [
            'date'               => $startStr,
            'start_date'         => $startStr,
            'end_date'           => $endStr,
            'invoice_count'      => $invoices->count(),
            'total_revenue'      => round($totalRevenue, 2),
            'total_refunds'      => round($totalRefunds, 2),
            'net_revenue'        => round($netRevenue, 2),
            'avg_order_value'    => $invoices->count() > 0 ? round($totalRevenue / $invoices->count(), 2) : 0,
            'total_items'        => $totalItems,
            'top_sellers'        => $topSellers,
            'lowest_sellers'     => $lowestSellers,
            'category_breakdown' => $categoryBreakdown,
            'daily_breakdown'    => $dailyRevenue,
            'invoices'           => $invoices,
        ];
    }

    /**
     * Get a monthly sales report summary.
     */
    public function getMonthlyReport(int $year, int $month, string $outlet): array
    {
        return Cache::remember("sales_monthly_v2_{$outlet}_{$year}_{$month}", 21600, function () use ($year, $month, $outlet) {
            $start = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
            $end   = $start->copy()->endOfMonth();

            $dailyRevenue = DB::table('pos_invoices')
                ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
                ->where('status', 'completed')
                ->where('outlet', $outlet)
                ->select('date as day', DB::raw('SUM(grand_total) as revenue'), DB::raw('COUNT(*) as invoices'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $totalRevenue = $dailyRevenue->sum('revenue');

            $totalRefunds = DB::table('pos_refunds')
                ->join('pos_invoices', 'pos_refunds.invoice_id', '=', 'pos_invoices.id')
                ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
                ->where('pos_invoices.outlet', $outlet)
                ->sum('pos_refunds.amount');

            $netRevenue = $totalRevenue - $totalRefunds;

            // Total items, top sellers & category breakdown (single consolidated query)
            [$totalItems, $topSellers, $categoryBreakdown, $lowestSellers] = $this->getItemsAggregates(
                $start->toDateString(), $end->toDateString(), $outlet
            );

            return [
                'year'               => $year,
                'month'              => $month,
                'total_revenue'      => round($totalRevenue, 2),
                'total_refunds'      => round($totalRefunds, 2),
                'net_revenue'        => round($netRevenue, 2),
                'total_items'        => $totalItems,
                'top_sellers'        => $topSellers,
                'lowest_sellers'     => $lowestSellers,
                'daily_breakdown'    => $dailyRevenue,
                'category_breakdown' => $categoryBreakdown,
            ];
        });
    }

    /**
     * Get total_items, top_sellers, and category_breakdown from a SINGLE
     * DB pass over pos_invoice_items, eliminating 3 separate queries.
     */
    private function getItemsAggregates(string $startStr, string $endStr, string $outlet): array
    {
        $rows = DB::table('pos_invoice_items')
            ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
            ->leftJoin('pos_products', 'pos_invoice_items.product_id', '=', 'pos_products.id')
            ->whereBetween('pos_invoices.date', [$startStr, $endStr])
            ->where('pos_invoices.status', 'completed')
            ->where('pos_invoices.outlet', $outlet)
            ->select(
                'pos_invoice_items.product_name',
                'pos_invoice_items.product_variant',
                'pos_invoice_items.product_sku',
                'pos_invoice_items.quantity',
                'pos_invoice_items.line_total',
                DB::raw('COALESCE(pos_products.category, "Uncategorized") as category'),
            )
            ->get();

        $totalItems = (int) $rows->sum('quantity');

        // Sellers — group by product, sort by qty desc (full list for top & lowest)
        $sellers = $rows
            ->groupBy(fn($r) => $r->product_name.'|'.$r->product_variant.'|'.$r->product_sku)
            ->map(fn($group) => (object) [
                'product_name'    => $group->first()->product_name,
                'product_variant' => $group->first()->product_variant,
                'product_sku'     => $group->first()->product_sku,
                'total_qty'       => $group->sum('quantity'),
                'total_revenue'   => round($group->sum('line_total'), 2),
            ])
            ->sortByDesc('total_qty')
            ->values();

        $topSellers = $sellers->take(10)->values();
        $lowestSellers = $sellers->reverse()->take(10)->values();

        // Category breakdown — group by category
        $categoryBreakdown = $rows
            ->groupBy('category')
            ->map(fn($group) => (object) [
                'category'     => $group->first()->category,
                'total_qty'    => $group->sum('quantity'),
                'total_revenue' => round($group->sum('line_total'), 2),
            ])
            ->sortByDesc('total_revenue')
            ->values();

        return [$totalItems, $topSellers, $categoryBreakdown, $lowestSellers];
    }

    /**
     * Get a weekly sales report for the 7-day period containing the given date.
     * Week runs Monday → Sunday.
     */
    public function getWeeklyReport(string $date, string $outlet): array
    {
        $dt = \Carbon\Carbon::parse($date);
        $weekStart = $dt->copy()->startOfWeek(\Carbon\Carbon::MONDAY);
        $weekEnd   = $weekStart->copy()->endOfWeek(\Carbon\Carbon::SUNDAY);

        $startStr = $weekStart->toDateString();
        $endStr   = $weekEnd->toDateString();

        $cacheKey = "sales_weekly_v2_{$outlet}_{$startStr}";

        return Cache::remember($cacheKey, 21600, function () use ($startStr, $endStr, $outlet, $weekStart) {
            // Daily revenue breakdown for the 7 days
            $dailyRevenue = DB::table('pos_invoices')
                ->whereBetween('date', [$startStr, $endStr])
                ->where('status', 'completed')
                ->where('outlet', $outlet)
                ->select('date as day', DB::raw('SUM(grand_total) as revenue'), DB::raw('COUNT(*) as invoices'))
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $totalRevenue = $dailyRevenue->sum('revenue');

            $totalRefunds = DB::table('pos_refunds')
                ->join('pos_invoices', 'pos_refunds.invoice_id', '=', 'pos_invoices.id')
                ->whereBetween('pos_invoices.date', [$startStr, $endStr])
                ->where('pos_invoices.outlet', $outlet)
                ->sum('pos_refunds.amount');

            $netRevenue = $totalRevenue - $totalRefunds;

            // Total items, top sellers & category breakdown (single consolidated query)
            [$totalItems, $topSellers, $categoryBreakdown, $lowestSellers] = $this->getItemsAggregates($startStr, $endStr, $outlet);

            // Invoice count & invoices list
            $invoices = PosInvoice::whereBetween('date', [$startStr, $endStr])
                ->where('status', 'completed')
                ->where('outlet', $outlet)
                ->with(['items', 'payments', 'customer'])
                ->orderByDesc('created_at')
                ->get();

            return [
                'week_start'         => $startStr,
                'week_end'           => $endStr,
                'invoice_count'      => $invoices->count(),
                'total_revenue'      => round($totalRevenue, 2),
                'total_refunds'      => round($totalRefunds, 2),
                'net_revenue'        => round($netRevenue, 2),
                'total_items'        => $totalItems,
                'daily_breakdown'    => $dailyRevenue,
                'top_sellers'        => $topSellers,
                'lowest_sellers'     => $lowestSellers,
                'category_breakdown' => $categoryBreakdown,
                'invoices'           => $invoices,
            ];
        });
    }
}
