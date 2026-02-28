<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Collection;
use App\Models\GiftRequest;
use App\Models\Product;
use App\Models\NewsletterSubscription;
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
        $user = Auth::user();
        if ($user) {
            Log::info('Authenticated User Details:', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            ]);
        }

        // Get monthly trends for the last 6 months
        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M');
            
            $appointmentCount = Appointment::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
                
            $giftCount = GiftRequest::whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();

            $trends[] = [
                'name' => $monthName,
                'appointments' => $appointmentCount,
                'gifts' => $giftCount,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'appointments' => Appointment::count(),
                'gifts' => GiftRequest::count(),
                'products' => Product::count(),
                'collections' => Collection::count(),
                'subscribers' => NewsletterSubscription::count(),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
                'pending_gifts' => GiftRequest::where('status', 'Pending')->count(),
                'trends' => $trends,
            ]
        ]);
    }
}
