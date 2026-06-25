<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Collection;
use App\Models\GiftRequest;
use App\Models\Product;
use App\Models\NewsletterSubscription;
use App\Models\CustomerProfile;
use App\Models\PosInvoice;
use App\Models\PosProduct;
use App\Models\PosRefund;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get overview stats for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $outlet = request()->header('X-Active-Outlet', request()->query('outlet', 'attire_lounge'));

        $cache = \Illuminate\Support\Facades\Cache::supportsTags() 
            ? \Illuminate\Support\Facades\Cache::tags(['admin-stats']) 
            : \Illuminate\Support\Facades\Cache::getFacadeRoot();

        $stats = $cache->remember('admin_dashboard_stats_' . $outlet, 300, function () use ($outlet) {
            // ── Trend Data (Index-friendly: fetch raw rows, group in-memory) ──
            $monthlyStart = Carbon::now()->subMonths(5)->startOfMonth();
            $weeklyStart  = Carbon::now()->subWeeks(3)->startOfWeek();
            $dailyStart   = Carbon::now()->subDays(6)->startOfDay();

            // Single query per model for the full 6-month window (covers all 3 trend ranges)
            $recentAppointments = Appointment::where('created_at', '>=', $monthlyStart)
                ->pluck('created_at');
            $recentCustomers = CustomerProfile::where('created_at', '>=', $monthlyStart)
                ->pluck('created_at');

            // 1. Monthly Trends (Last 6 Months) — group in-memory
            $monthlyTrends = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $name  = $month->format('M');
                $start = $month->copy()->startOfMonth();
                $end   = $month->copy()->endOfMonth();

                $monthlyTrends[] = [
                    'name'         => $name,
                    'appointments' => $recentAppointments->filter(fn ($d) => Carbon::parse($d)->between($start, $end))->count(),
                    'customers'    => $recentCustomers->filter(fn ($d) => Carbon::parse($d)->between($start, $end))->count(),
                ];
            }

            // 2. Weekly Trends (Last 4 Weeks) — group in-memory
            $weeklyTrends = [];
            for ($i = 3; $i >= 0; $i--) {
                $start = Carbon::now()->subWeeks($i)->startOfWeek();
                $end   = $start->copy()->endOfWeek();
                $weekNum = (int) $start->format('W');

                $weeklyTrends[] = [
                    'name'         => 'W' . $weekNum,
                    'appointments' => $recentAppointments->filter(fn ($d) => Carbon::parse($d)->between($start, $end))->count(),
                    'customers'    => $recentCustomers->filter(fn ($d) => Carbon::parse($d)->between($start, $end))->count(),
                ];
            }

            // 3. Daily Trends (Last 7 Days) — group in-memory
            $dailyTrends = [];
            for ($i = 6; $i >= 0; $i--) {
                $day        = Carbon::now()->subDays($i);
                $dateString = $day->toDateString();

                $dailyTrends[] = [
                    'name'         => $day->format('D'),
                    'appointments' => $recentAppointments->filter(fn ($d) => Carbon::parse($d)->toDateString() === $dateString)->count(),
                    'customers'    => $recentCustomers->filter(fn ($d) => Carbon::parse($d)->toDateString() === $dateString)->count(),
                ];
            }

            return [
                'appointments' => Appointment::count(),
                'gifts' => GiftRequest::count(),
                'total_customers' => CustomerProfile::count(),
                'products' => Product::count(),
                'collections' => Collection::count(),
                'subscribers' => NewsletterSubscription::count(),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
                'pending_gifts' => GiftRequest::where('status', 'Pending')->count(),
                'trends' => [
                    'month' => $monthlyTrends,
                    'week' => $weeklyTrends,
                    'day' => $dailyTrends,
                ],
                'distributions' => [
                    'nationality' => $this->getDistribution(CustomerProfile::class, 'nationality'),
                    'shirt_size' => $this->getDistribution(CustomerProfile::class, 'shirt_size'),
                    'preferred_color' => $this->getDistribution(CustomerProfile::class, 'preferred_color'),
                ],
                // Outlet-specific POS stats (scoped by Global Scope via X-Active-Outlet header)
                'pos_products' => PosProduct::count(),
                'pos_active_products' => PosProduct::where('is_active', true)->count(),
                'pos_archived_products' => PosProduct::where('is_active', false)->count(),
                'daily_orders' => (int) PosInvoice::whereDate('date', Carbon::now()->toDateString())->where('status', 'completed')->count(),
                'sales' => (int) PosInvoice::where('status', 'completed')->count(),
                'low_stock' => PosProduct::where('is_active', true)->where('stock_qty', '<=', 5)->where('stock_qty', '>', 0)->count(),
                'out_of_stock' => PosProduct::where('is_active', true)->where('stock_qty', '<=', 0)->count(),
                'low_stock_products' => PosProduct::where('is_active', true)
                    ->where('stock_qty', '<=', 5)
                    ->where('stock_qty', '>', 0)
                    ->orderBy('stock_qty', 'asc')
                    ->limit(10)
                    ->get(['id', 'sku', 'name', 'variant', 'stock_qty', 'min_stock', 'category'])
                    ->toArray(),
                'pos_summary' => [
                    'total_revenue' => (float) PosInvoice::whereDate('date', Carbon::now()->toDateString())->where('status', 'completed')->sum('grand_total'),
                    'invoice_count' => (int) PosInvoice::whereDate('date', Carbon::now()->toDateString())->where('status', 'completed')->count(),
                    'total_refunds' => (float) PosRefund::whereHas('invoice', function ($q) {
                        $q->whereDate('date', Carbon::now()->toDateString());
                    })->sum('amount'),
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Helper to get distribution data with an "Others" fallback to ensure 100% coverage.
     */
    private function getDistribution($model, $column)
    {
        $total = $model::whereNotNull($column)->where($column, '!=', '')->count();
        
        $topEntries = $model::select($column . ' as label', DB::raw('count(*) as value'))
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->groupBy($column)
            ->orderBy('value', 'desc')
            ->take(5)
            ->get();

        $sumTop = $topEntries->sum('value');

        if ($total > $sumTop) {
            $topEntries->push([
                'label' => 'Others',
                'value' => $total - $sumTop
            ]);
        }

        return $topEntries;
    }
}
