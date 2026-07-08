<?php

namespace App\Services;

use App\Models\PosInvoice;
use App\Models\PosRefund;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SalesService
{
    /**
     * Get a comprehensive daily sales report.
     */
    public function getDailyReport(string $date, string $outlet): array
    {
        return Cache::remember("sales_daily_{$outlet}_{$date}", 3600, function () use ($date, $outlet) {
            $invoices = PosInvoice::where('date', $date)
                ->where('status', 'completed')
                ->with(['items', 'payments', 'customer'])
                ->orderByDesc('created_at')
                ->get();

            $totalRevenue = $invoices->sum('grand_total');

            $totalRefunds = PosRefund::whereHas('invoice', function ($q) use ($date, $outlet) {
                $q->where('date', $date)->where('outlet', $outlet);
            })->sum('amount');

            $netRevenue = $totalRevenue - $totalRefunds;

            // Total items (cups) sold
            $totalItems = (int) DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->where('pos_invoices.date', $date)
                ->where('pos_invoices.status', 'completed')
                ->where('pos_invoices.outlet', $outlet)
                ->sum('pos_invoice_items.quantity');

            // Top sellers
            $topSellers = DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->where('pos_invoices.date', $date)
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

            // Category breakdown
            $categoryBreakdown = DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->leftJoin('pos_products', 'pos_invoice_items.product_id', '=', 'pos_products.id')
                ->where('pos_invoices.date', $date)
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
                'category_breakdown' => $categoryBreakdown,
                'invoices'           => $invoices,
            ];
        });
    }

    /**
     * Get a monthly sales report summary.
     */
    public function getMonthlyReport(int $year, int $month, string $outlet): array
    {
        return Cache::remember("sales_monthly_{$outlet}_{$year}_{$month}", 21600, function () use ($year, $month, $outlet) {
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

            // Total items (cups) sold
            $totalItems = (int) DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
                ->where('pos_invoices.status', 'completed')
                ->where('pos_invoices.outlet', $outlet)
                ->sum('pos_invoice_items.quantity');

            // Category breakdown
            $categoryBreakdown = DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->leftJoin('pos_products', 'pos_invoice_items.product_id', '=', 'pos_products.id')
                ->whereBetween('pos_invoices.date', [$start->toDateString(), $end->toDateString()])
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
                'year'               => $year,
                'month'              => $month,
                'total_revenue'      => round($totalRevenue, 2),
                'total_refunds'      => round($totalRefunds, 2),
                'net_revenue'        => round($netRevenue, 2),
                'total_items'        => $totalItems,
                'daily_breakdown'    => $dailyRevenue,
                'category_breakdown' => $categoryBreakdown,
            ];
        });
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

        $cacheKey = "sales_weekly_{$outlet}_{$startStr}";

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

            // Total items sold
            $totalItems = (int) DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->whereBetween('pos_invoices.date', [$startStr, $endStr])
                ->where('pos_invoices.status', 'completed')
                ->where('pos_invoices.outlet', $outlet)
                ->sum('pos_invoice_items.quantity');

            // Top sellers
            $topSellers = DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->whereBetween('pos_invoices.date', [$startStr, $endStr])
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

            // Category breakdown
            $categoryBreakdown = DB::table('pos_invoice_items')
                ->join('pos_invoices', 'pos_invoice_items.invoice_id', '=', 'pos_invoices.id')
                ->leftJoin('pos_products', 'pos_invoice_items.product_id', '=', 'pos_products.id')
                ->whereBetween('pos_invoices.date', [$startStr, $endStr])
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
                'category_breakdown' => $categoryBreakdown,
                'invoices'           => $invoices,
            ];
        });
    }
}
