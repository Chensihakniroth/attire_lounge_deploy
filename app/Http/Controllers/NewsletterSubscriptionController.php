<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;

class NewsletterSubscriptionController extends Controller
{
    /**
     * Display a listing of subscribers.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = NewsletterSubscription::latest();

        if ($request->has('search')) {
            $search = addcslashes($request->search, '%_');
            $query->where('phone_number', 'like', '%' . $search . '%');
        }

        $subscribers = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $subscribers,
        ]);
    }

    /**
     * Store a new subscription.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone_number' => 'required|string|unique:newsletter_subscriptions,phone_number',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        try {
            $subscriber = NewsletterSubscription::create(['phone_number' => $request->phone_number]);

            \Illuminate\Support\Facades\Log::info('Newsletter subscription created', [
                'subscriber_id' => $subscriber->id,
            ]);

            return response()->json(['message' => 'Successfully subscribed!'], 201);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Newsletter subscription failed: ' . $e->getMessage());
            return response()->json(['message' => 'Something went wrong while subscribing. Please try again later.'], 500);
        }
    }

    /**
     * Remove a subscriber.
     *
     * @param NewsletterSubscription $subscriber
     * @return JsonResponse
     */
    public function destroy(NewsletterSubscription $subscriber): JsonResponse
    {
        $subscriber->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subscriber removed successfully.',
        ]);
    }
}
