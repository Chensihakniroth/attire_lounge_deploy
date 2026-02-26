<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Collection;
use App\Models\GiftRequest;
use App\Models\Product;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Get overview stats for the admin dashboard.
     */
    public function stats(): JsonResponse
    {
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
