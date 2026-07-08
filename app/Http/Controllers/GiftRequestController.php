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
            'sender_age' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:255',
            'recipient_name' => 'required|string|max:255',
            'recipient_title' => 'required|string|in:Mr,Mrs,Ms,Dr',
            'recipient_phone' => 'nullable|string|max:255',
            'recipient_email' => 'nullable|email|max:255',
            'preferences' => 'nullable|string',
            'selected_items' => 'nullable|array',
        ]);

        $giftRequest = $this->giftRequestService->createGiftRequest($validated);

        return response()->json($giftRequest, 201);
    }

    /**
     * Update the status of the specified resource in storage.
     */
    public function updateStatus(Request $request, $id)
    {
        $giftRequest = GiftRequest::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|string|in:Pending,Reviewed,Completed,Cancelled',
        ]);

        $this->giftRequestService->updateStatus($giftRequest, $validated['status']);

        return response()->json($giftRequest);
    }

    /**
     * Add a product item to an existing gift request.
     */
    public function addItem(Request $request, $id)
    {
        $giftRequest = GiftRequest::findOrFail($id);
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $product = \App\Models\Product::findOrFail($validated['product_id']);

        $items = $giftRequest->selected_items ?? [];

        // Prevent duplicates
        foreach ($items as $item) {
            if (isset($item['id']) && $item['id'] == $product->id) {
                return response()->json(['message' => 'Item already in request.'], 422);
            }
        }

        $items[] = [
            'id' => $product->id,
            'name' => $product->name,
            'image' => $product->images[0] ?? null,
            'price' => $product->price,
        ];

        $giftRequest->selected_items = $items;
        $giftRequest->save();

        return response()->json($giftRequest);
    }

    /**
     * Remove a product item from a gift request.
     */
    public function removeItem(Request $request, $id)
    {
        $giftRequest = GiftRequest::findOrFail($id);
        $validated = $request->validate([
            'product_id' => 'required|integer',
        ]);

        $items = $giftRequest->selected_items ?? [];
        $items = array_values(array_filter($items, fn($item) => ($item['id'] ?? null) != $validated['product_id']));

        $giftRequest->selected_items = $items;
        $giftRequest->save();

        return response()->json($giftRequest);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $giftRequest = GiftRequest::findOrFail($id);
        $this->giftRequestService->deleteGiftRequest($giftRequest);

        return response()->json(null, 204);
    }
}