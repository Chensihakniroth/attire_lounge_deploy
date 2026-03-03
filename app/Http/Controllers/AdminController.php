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
    public function stats(): JsonResponse
    {
        // 1. Monthly Trends (Last 6 Months)
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthlyTrends[] = [
                'name' => $month->format('M'),
                'appointments' => Appointment::whereYear('created_at', $month->year)->whereMonth('created_at', $month->month)->count(),
                'customers' => CustomerProfile::whereYear('created_at', $month->year)->whereMonth('created_at', $month->month)->count(),
            ];
        }

        // 2. Weekly Trends (Last 4 Weeks)
        $weeklyTrends = [];
        for ($i = 3; $i >= 0; $i--) {
            $startOfWeek = Carbon::now()->subWeeks($i)->startOfWeek();
            $endOfWeek = Carbon::now()->subWeeks($i)->endOfWeek();
            $weeklyTrends[] = [
                'name' => 'W' . $startOfWeek->format('W'),
                'appointments' => Appointment::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count(),
                'customers' => CustomerProfile::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count(),
            ];
        }

        // 3. Daily Trends (Last 7 Days)
        $dailyTrends = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::now()->subDays($i);
            $dailyTrends[] = [
                'name' => $day->format('D'),
                'appointments' => Appointment::whereDate('created_at', $day->toDateString())->count(),
                'customers' => CustomerProfile::whereDate('created_at', $day->toDateString())->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
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
            ]
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
