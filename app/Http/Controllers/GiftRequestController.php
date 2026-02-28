<?php

namespace App\Http\Controllers;

use App\Models\GiftRequest;
use App\Services\GiftRequestService;
use Illuminate\Http\Request;

class GiftRequestController extends Controller
{
    protected $giftRequestService;

    public function __construct(GiftRequestService $giftRequestService)
    {
        $this->giftRequestService = $giftRequestService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return response()->json($this->giftRequestService->getAllGiftRequests());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:255',
            'preferences' => 'nullable|string',
            'selected_items' => 'nullable|array',
        ]);

        $giftRequest = $this->giftRequestService->createGiftRequest($validated);

        return response()->json($giftRequest, 201);
    }

    /**
     * Update the status of the specified resource in storage.
     */
    public function updateStatus(Request $request, GiftRequest $giftRequest)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Pending,Reviewed,Completed,Cancelled',
        ]);

        $this->giftRequestService->updateStatus($giftRequest, $validated['status']);

        return response()->json($giftRequest);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GiftRequest $giftRequest)
    {
        $this->giftRequestService->deleteGiftRequest($giftRequest);

        return response()->json(null, 204);
    }
}