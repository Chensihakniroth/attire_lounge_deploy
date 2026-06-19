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

        // Set outlet from request context, not user input
        $validatedData['outlet'] = $request->header('X-Active-Outlet', 'attire_lounge');

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
}
