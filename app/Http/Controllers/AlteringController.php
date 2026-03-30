<?php

namespace App\Http\Controllers;

use App\Models\Altering;
use App\Services\AlteringService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlteringController extends Controller
{
    protected AlteringService $alteringService;

    public function __construct(AlteringService $alteringService)
    {
        $this->alteringService = $alteringService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Altering::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('timeframe') && $request->timeframe !== 'all') {
            switch ($request->timeframe) {
                case 'today':
                    $query->whereDate('start_date', now()->toDateString());
                    break;
                case 'this_week':
                    $query->whereBetween('start_date', [
                        now()->startOfWeek()->toDateString(),
                        now()->endOfWeek()->toDateString()
                    ]);
                    break;
                case 'this_month':
                    $query->whereBetween('start_date', [
                        now()->startOfMonth()->toDateString(),
                        now()->endOfMonth()->toDateString()
                    ]);
                    break;
                case 'this_year':
                    $query->whereBetween('start_date', [
                        now()->startOfYear()->toDateString(),
                        now()->endOfYear()->toDateString()
                    ]);
                    break;
            }
        }

        if ($request->has('date') && !empty($request->date)) {
            $query->whereDate('start_date', $request->date);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('order_no', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        $alterings = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 20));

        return response()->json($alterings);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => 'nullable|string|max:255',
            'customer_name' => 'required|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'delivery_address' => 'nullable|string',
            'product' => 'nullable|string',
            'purchased_date' => 'nullable|string',
            'tailor_pickup_date' => 'nullable|string',
            'pickup_status' => 'nullable|string',
            'customer_pickup_date' => 'nullable|string',
            'customer_pickup_status' => 'nullable|string',
            'remark' => 'nullable|string',
            'altering_cost' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'ready_at' => 'nullable|date',
            'status' => 'nullable|string|in:pending,in_progress,ready,completed,cancelled'
        ]);

        // Automatically set start_date to today if not provided, per user request
        if (empty($validated['start_date'])) {
            $validated['start_date'] = now()->toDateString();
        }

        $altering = Altering::create($validated);

        return response()->json([
            'message' => 'Altering record created successfully.',
            'data' => $altering
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $altering = Altering::findOrFail($id);

        $validated = $request->validate([
            'order_no' => 'nullable|string|max:255',
            'customer_name' => 'sometimes|required|string|max:255',
            'mobile' => 'nullable|string|max:255',
            'delivery_address' => 'nullable|string',
            'product' => 'nullable|string',
            'purchased_date' => 'nullable|string',
            'tailor_pickup_date' => 'nullable|string',
            'pickup_status' => 'nullable|string',
            'customer_pickup_date' => 'nullable|string',
            'customer_pickup_status' => 'nullable|string',
            'remark' => 'nullable|string',
            'altering_cost' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'ready_at' => 'nullable|date',
            'status' => 'nullable|string|in:pending,in_progress,ready,completed,cancelled'
        ]);

        $altering->update($validated);

        return response()->json([
            'message' => 'Altering record updated successfully.',
            'data' => $altering
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $altering = Altering::findOrFail($id);
        $altering->delete();

        return response()->json([
            'message' => 'Altering record deleted successfully.'
        ]);
    }

    public function notify($id): JsonResponse
    {
        $altering = Altering::findOrFail($id);
        
        $success = $this->alteringService->sendReadyNotification($altering);

        if ($success) {
            return response()->json(['message' => 'Notification sent successfully.']);
        }

        return response()->json(['message' => 'Failed to send notification. No active subscribers or Telegram error.'], 500);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->input('data', []);
        
        if (empty($data)) {
            return response()->json(['message' => 'No data provided.'], 400);
        }

        $imported = 0;
        foreach ($data as $row) {
            // Check if exists to avoid duplicates
            if (!empty($row['order_no'])) {
                $existing = Altering::where('order_no', $row['order_no'])->first();
                if ($existing) continue;
            } else if (!empty($row['customer_name'])) {
                $existing = Altering::where('customer_name', $row['customer_name'])
                                  ->where('product', $row['product'] ?? '')
                                  ->first();
                if ($existing) continue;
            }

            // Derive a start_date if purchased_date can be parsed, else null (storing purposes)
            $startDate = null;
            if (!empty($row['purchased_date'])) {
                try {
                    $startDate = \Carbon\Carbon::parse($row['purchased_date'])->toDateString();
                } catch (\Exception $e) {
                    // Ignore parsing error
                }
            }

            // Fallback status logic based on sheet headers
            $status = 'pending';
            if (($row['pickup_status'] ?? '') === 'Completed' || ($row['customer_pickup_status'] ?? '') === 'Completed') {
                $status = 'completed';
            } else if (($row['pickup_status'] ?? '') === 'In-Progress') {
                $status = 'in_progress';
            }

            Altering::create([
                'order_no' => $row['order_no'] ?? null,
                'customer_name' => $row['customer_name'] ?? 'Unknown',
                'mobile' => $row['mobile'] ?? null,
                'delivery_address' => $row['delivery_address'] ?? null,
                'product' => $row['product'] ?? null,
                'purchased_date' => $row['purchased_date'] ?? null,
                'tailor_pickup_date' => $row['tailor_pickup_date'] ?? null,
                'pickup_status' => $row['pickup_status'] ?? null,
                'customer_pickup_date' => $row['customer_pickup_date'] ?? null,
                'customer_pickup_status' => $row['customer_pickup_status'] ?? null,
                'remark' => $row['remark'] ?? null,
                'status' => $status,
                'start_date' => $startDate,
            ]);
            $imported++;
        }

        return response()->json([
            'message' => "Successfully imported {$imported} records."
        ]);
    }
}
