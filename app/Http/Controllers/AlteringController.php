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

    public function bulkDestroy(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        
        if (empty($ids)) {
            return response()->json(['message' => 'No items selected.'], 400);
        }

        Altering::whereIn('id', $ids)->delete();

        return response()->json([
            'message' => 'Selected altering records deleted successfully.'
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
            // 📡 Robust Normalize keys: lowercase, underscores, strip non-alphanumeric starts (BOM)
            $normalizedRow = [];
            foreach ($row as $key => $value) {
                // Remove BOM and other non-printable characters first
                $safeKey = preg_replace('/[\x00-\x1F\x7F-\xFF]/', '', $key);
                $cleanKey = strtolower(str_replace([' ', '-'], '_', trim($safeKey ?? '')));
                
                // Specific Alias Mapping
                if ($cleanKey === 'prodcut') $cleanKey = 'product';
                if ($cleanKey === 'order_number') $cleanKey = 'order_no';
                if ($cleanKey === 'customer_name' || $cleanKey === 'name' || $cleanKey === 'customer' || $cleanKey === 'client') {
                    $cleanKey = 'customer_name';
                }
                if ($cleanKey === 'delivery_address' || $cleanKey === 'address') $cleanKey = 'delivery_address';
                if ($cleanKey === 'tailor_pick_up_date') $cleanKey = 'tailor_pickup_date';
                
                $normalizedRow[$cleanKey] = $value;
            }
            
            $item = $normalizedRow;

            // 🔍 De-duplication check: Skip if same order_no OR (same name + product + date)
            if (!empty($item['order_no'])) {
                $existing = Altering::where('order_no', $item['order_no'])->first();
                if ($existing) continue;
            } else if (!empty($item['customer_name']) && $item['customer_name'] !== 'Unknown') {
                $existing = Altering::where('customer_name', $item['customer_name'])
                                  ->where('product', $item['product'] ?? null)
                                  ->where('purchased_date', $item['purchased_date'] ?? null)
                                  ->first();
                if ($existing) continue;
            }

            // 📅 Intelligent Date Parsing
            $startDate = null;
            if (!empty($item['purchased_date'])) {
                try {
                    $startDate = \Carbon\Carbon::parse($item['purchased_date'])->toDateString();
                } catch (\Exception $e) {}
            }

            $readyAt = null;
            if (!empty($item['tailor_pick_up_date'])) {
                try {
                    $readyAt = \Carbon\Carbon::parse($item['tailor_pick_up_date'])->toDateString();
                } catch (\Exception $e) {}
            }

            // 🔄 Derived Status Logic
            $status = 'pending';
            $pStatus = strtolower($item['pick_up_status'] ?? $item['status'] ?? '');
            $cStatus = strtolower($item['customer_pickup_status'] ?? '');

            if (str_contains($pStatus, 'completed') || str_contains($cStatus, 'completed')) {
                $status = 'completed';
            } else if (str_contains($pStatus, 'ready') || str_contains($cStatus, 'ready')) {
                $status = 'ready';
            } else if (str_contains($pStatus, 'progress')) {
                $status = 'in_progress';
            }

            Altering::create([
                'order_no' => $item['order_no'] ?? null,
                'customer_name' => $item['customer_name'] ?? 'Unknown',
                'mobile' => $item['mobile'] ?? null,
                'delivery_address' => $item['delivery_address'] ?? null,
                'product' => $item['product'] ?? null,
                'purchased_date' => $item['purchased_date'] ?? null,
                'tailor_pickup_date' => $item['tailor_pick_up_date'] ?? null,
                'pickup_status' => $item['pick_up_status'] ?? null,
                'customer_pickup_date' => $item['customer_pickup_date'] ?? null,
                'customer_pickup_status' => $item['pickup_status'] ?? null,
                'remark' => $item['remark'] ?? null,
                'status' => $status,
                'start_date' => $startDate ?: now()->toDateString(),
                'ready_at' => $readyAt,
            ]);
            $imported++;
        }

        return response()->json([
            'message' => "Successfully synchronized {$imported} records from the master sheet! (•̀ᴗ•́)و",
            'imported_count' => $imported
        ]);
    }
}
