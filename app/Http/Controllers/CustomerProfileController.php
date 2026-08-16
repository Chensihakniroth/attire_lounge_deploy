<?php

namespace App\Http\Controllers;

use App\Services\CustomerProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerProfileController extends Controller
{
    protected $customerProfileService;

    public function __construct(CustomerProfileService $customerProfileService)
    {
        $this->customerProfileService = $customerProfileService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'per_page']);
        // Enforce per_page maximum to prevent data dumps
        if (isset($filters['per_page']) && $filters['per_page'] > 100) {
            $filters['per_page'] = 100;
        }
        // Scope to the authenticated admin's outlet
        $filters['outlet'] = $request->header('X-Active-Outlet', 'attire_lounge');
        $customerProfiles = $this->customerProfileService->getAllCustomerProfiles($filters);
        return response()->json($customerProfiles);
    }

    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
            'client_status' => 'required|string',
            'name' => 'required|string',
            'email' => 'nullable|email',
            'nationality' => 'nullable|string',
            'phone' => 'nullable|string',
            'host' => 'nullable|string',
            'assistant' => 'nullable|string',
            'how_did_they_find_us' => 'nullable|string',
            'shirt_size' => 'nullable|string',
            'jacket_size' => 'nullable|string',
            'pants_size' => 'nullable|string',
            'shoes_size' => 'nullable|string',
            'preferred_color' => 'nullable|string',
            'color_notes' => 'nullable|string',
            'remarks' => 'nullable|string',
            'birthday' => 'nullable|date',
            'is_vip' => 'nullable|boolean',
        ]);

        $customerProfile = $this->customerProfileService->createCustomerProfile($validatedData);

        return response()->json($customerProfile, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $customerProfile = $this->customerProfileService->getCustomerProfileById($id);

        if (!$customerProfile) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        // Enforce outlet scoping — admin can only view profiles from their outlet
        // Profiles with null outlet (legacy data) are visible to all
        $outlet = $request->header('X-Active-Outlet', 'attire_lounge');
        if ($customerProfile->outlet !== null && $customerProfile->outlet !== $outlet) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        return response()->json($customerProfile);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customerProfile = $this->customerProfileService->getCustomerProfileById($id);

        if (!$customerProfile) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        // Enforce outlet scoping
        // Profiles with null outlet (legacy data) are editable by all
        $outlet = $request->header('X-Active-Outlet', 'attire_lounge');
        if ($customerProfile->outlet !== null && $customerProfile->outlet !== $outlet) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        $validatedData = $request->validate([
            'date' => 'sometimes|required|date',
            'client_status' => 'sometimes|required|string',
            'name' => 'sometimes|required|string',
            'email' => 'nullable|email',
            'nationality' => 'nullable|string',
            'phone' => 'nullable|string',
            'host' => 'nullable|string',
            'assistant' => 'nullable|string',
            'how_did_they_find_us' => 'nullable|string',
            'shirt_size' => 'nullable|string',
            'jacket_size' => 'nullable|string',
            'pants_size' => 'nullable|string',
            'shoes_size' => 'nullable|string',
            'preferred_color' => 'nullable|string',
            'color_notes' => 'nullable|string',
            'remarks' => 'nullable|string',
            'birthday' => 'nullable|date',
            'is_vip' => 'nullable|boolean',
        ]);

        $customerProfile = $this->customerProfileService->updateCustomerProfile($id, $validatedData);

        return response()->json($customerProfile);
    }

    public function destroy(int $id): JsonResponse
    {
        $customerProfile = $this->customerProfileService->getCustomerProfileById($id);

        if (!$customerProfile) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }

        // Enforce outlet scoping
        // Profiles with null outlet (legacy data) are deletable by all
        $outlet = request()->header('X-Active-Outlet', 'attire_lounge');
        if ($customerProfile->outlet !== null && $customerProfile->outlet !== $outlet) {
            return response()->json(['message' => 'Customer profile not found.'], 404);
        }
        $this->customerProfileService->deleteCustomerProfile($id);
        return response()->json(null, 204);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->input('data', []);

        if (empty($data) || !is_array($data)) {
            return response()->json(['message' => 'No data provided.'], 400);
        }

        $imported = 0;
        $updated = 0;

        foreach ($data as $row) {
            // 📡 Robust Normalize keys
            $normalizedRow = [];
            foreach ($row as $key => $value) {
                $safeKey = preg_replace('/[\x00-\x1F\x7F-\xFF]/', '', (string)$key);
                $cleanKey = strtolower(str_replace([' ', '-'], '_', trim($safeKey ?? '')));

                // Alias mapping
                if (in_array($cleanKey, ['client_name', 'name', 'customer_name', 'customer', 'client'])) $cleanKey = 'name';
                if (in_array($cleanKey, ['phone_number', 'phone', 'mobile', 'tel', 'contact'])) $cleanKey = 'phone';
                if (in_array($cleanKey, ['client_status', 'status'])) $cleanKey = 'client_status';
                if (in_array($cleanKey, ['channel', 'how_did_they_find_us', 'how_found', 'source'])) $cleanKey = 'how_did_they_find_us';
                if (in_array($cleanKey, ['shirt_size', 'shirt'])) $cleanKey = 'shirt_size';
                if (in_array($cleanKey, ['jacket_size', 'jacket'])) $cleanKey = 'jacket_size';
                if (in_array($cleanKey, ['pants_size', 'pants', 'trouser'])) $cleanKey = 'pants_size';
                if (in_array($cleanKey, ['shoes', 'shoes_size', 'shoe_size', 'shoe'])) $cleanKey = 'shoes_size';
                if (in_array($cleanKey, ['preferred_colors', 'preferred_color', 'color'])) $cleanKey = 'preferred_color';
                if (in_array($cleanKey, ['color_note', 'color_notes'])) $cleanKey = 'color_notes';
                if (in_array($cleanKey, ['additional_notes', 'remarks', 'note', 'notes', 'remark'])) $cleanKey = 'remarks';

                $normalizedRow[$cleanKey] = $value;
            }

            $name = trim($normalizedRow['name'] ?? '');
            if (empty($name) || strtolower($name) === 'unknown' || strtolower($name) === 'client name') {
                continue;
            }

            $phone = trim($normalizedRow['phone'] ?? '');

            // 📅 Parse Date
            $date = null;
            if (!empty($normalizedRow['date'])) {
                try {
                    $date = \Carbon\Carbon::parse($normalizedRow['date'])->toDateString();
                } catch (\Exception $e) {}
            }
            if (!$date) {
                $date = now()->toDateString();
            }

            // 🏷️ Normalize Client Status
            $statusRaw = strtolower($normalizedRow['client_status'] ?? 'new');
            $clientStatus = 'New';
            $isVip = false;
            if (str_contains($statusRaw, 'vip')) {
                $clientStatus = 'VIP';
                $isVip = true;
            } elseif (str_contains($statusRaw, 'return')) {
                $clientStatus = 'Returning';
            }

            $sanitize = fn($v) => is_string($v) ? strip_tags(trim($v)) : $v;

            $profileData = [
                'date' => $date,
                'name' => $sanitize($name),
                'phone' => $sanitize($phone) ?: null,
                'client_status' => $clientStatus,
                'is_vip' => $isVip,
                'nationality' => $sanitize($normalizedRow['nationality'] ?? 'Cambodia'),
                'host' => $sanitize($normalizedRow['host'] ?? null),
                'assistant' => $sanitize($normalizedRow['assistant'] ?? null),
                'how_did_they_find_us' => $sanitize($normalizedRow['how_did_they_find_us'] ?? 'Facebook'),
                'shirt_size' => $sanitize($normalizedRow['shirt_size'] ?? null),
                'jacket_size' => $sanitize($normalizedRow['jacket_size'] ?? null),
                'pants_size' => $sanitize($normalizedRow['pants_size'] ?? null),
                'shoes_size' => $sanitize($normalizedRow['shoes_size'] ?? null),
                'preferred_color' => $sanitize($normalizedRow['preferred_color'] ?? null),
                'color_notes' => $sanitize($normalizedRow['color_notes'] ?? null),
                'remarks' => $sanitize($normalizedRow['remarks'] ?? null),
            ];

            // 🔍 De-duplication check: Match by phone if present, or by exact name
            $existing = null;
            if (!empty($phone) && strlen($phone) >= 6) {
                $existing = \App\Models\CustomerProfile::where('phone', $phone)->first();
            }
            if (!$existing) {
                $existing = \App\Models\CustomerProfile::where('name', $name)->first();
            }

            if ($existing) {
                $existing->update(array_filter($profileData, fn($v) => $v !== null && $v !== ''));
                $updated++;
            } else {
                \App\Models\CustomerProfile::create($profileData);
                $imported++;
            }
        }

        return response()->json([
            'message' => "Successfully synchronized {$imported} new profiles and updated {$updated} existing profiles from the master sheet!",
            'imported_count' => $imported,
            'updated_count' => $updated,
        ]);
    }
}
