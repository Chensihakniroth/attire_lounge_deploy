<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Collection;
use App\Models\GiftRequest;
use App\Models\Product;
use App\Models\NewsletterSubscription;
use App\Models\CustomerProfile;
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
    /**
     * Get overview stats for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
        $cache = \Illuminate\Support\Facades\Cache::supportsTags() 
            ? \Illuminate\Support\Facades\Cache::tags(['admin-stats']) 
            : \Illuminate\Support\Facades\Cache::getFacadeRoot();

        $stats = $cache->remember('admin_dashboard_stats', 3600, function () {
            // 1. Monthly Trends (Last 6 Months)
            $monthlyTrends = [];
            $monthlyStart = Carbon::now()->subMonths(5)->startOfMonth();
            
            $appointmentsByMonth = Appointment::select([
                DB::raw('DATE_FORMAT(created_at, "%b") as month_name'),
                DB::raw('COUNT(*) as count')
            ])
            ->where('created_at', '>=', $monthlyStart)
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%b")'))
            ->pluck('count', 'month_name');

            $customersByMonth = CustomerProfile::select([
                DB::raw('DATE_FORMAT(created_at, "%b") as month_name'),
                DB::raw('COUNT(*) as count')
            ])
            ->where('created_at', '>=', $monthlyStart)
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%b")'))
            ->pluck('count', 'month_name');

            for ($i = 5; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $name = $month->format('M');
                $monthlyTrends[] = [
                    'name' => $name,
                    'appointments' => $appointmentsByMonth->get($name, 0),
                    'customers' => $customersByMonth->get($name, 0),
                ];
            }

            // 2. Weekly Trends (Last 4 Weeks)
            $weeklyTrends = [];
            $weeklyStart = Carbon::now()->subWeeks(3)->startOfWeek();

            $appointmentsByWeek = Appointment::select([
                DB::raw('WEEK(created_at, 1) as week_num'),
                DB::raw('COUNT(*) as count')
            ])
            ->where('created_at', '>=', $weeklyStart)
            ->groupBy(DB::raw('WEEK(created_at, 1)'))
            ->pluck('count', 'week_num');

            $customersByWeek = CustomerProfile::select([
                DB::raw('WEEK(created_at, 1) as week_num'),
                DB::raw('COUNT(*) as count')
            ])
            ->where('created_at', '>=', $weeklyStart)
            ->groupBy(DB::raw('WEEK(created_at, 1)'))
            ->pluck('count', 'week_num');

            for ($i = 3; $i >= 0; $i--) {
                $startOfWeek = Carbon::now()->subWeeks($i)->startOfWeek();
                $weekNum = (int)$startOfWeek->format('W');
                $weeklyTrends[] = [
                    'name' => 'W' . $weekNum,
                    'appointments' => $appointmentsByWeek->get($weekNum, 0),
                    'customers' => $customersByWeek->get($weekNum, 0),
                ];
            }

            // 3. Daily Trends (Last 7 Days)
            $dailyTrends = [];
            $dailyStart = Carbon::now()->subDays(6)->startOfDay();

            $appointmentsByDay = Appointment::select([
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            ])
            ->where('created_at', '>=', $dailyStart)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->pluck('count', 'date');

            $customersByDay = CustomerProfile::select([
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            ])
            ->where('created_at', '>=', $dailyStart)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->pluck('count', 'date');

            for ($i = 6; $i >= 0; $i--) {
                $day = Carbon::now()->subDays($i);
                $dateString = $day->toDateString();
                $dailyTrends[] = [
                    'name' => $day->format('D'),
                    'appointments' => $appointmentsByDay->get($dateString, 0),
                    'customers' => $customersByDay->get($dateString, 0),
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
