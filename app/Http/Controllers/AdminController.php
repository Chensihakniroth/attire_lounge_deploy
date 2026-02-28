<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Collection;
use App\Models\GiftRequest;
use App\Models\Product;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth; // Import Auth facade
use Illuminate\Support\Facades\Log;   // Import Log facade

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
        } else {
            Log::warning('No authenticated user found for AdminController::stats.');
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
            ]
        ]);
    }
}
