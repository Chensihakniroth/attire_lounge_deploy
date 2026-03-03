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

    public function index(): JsonResponse
    {
        $customerProfiles = $this->customerProfileService->getAllCustomerProfiles();
        return response()->json($customerProfiles);
    }

    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'date' => 'required|date',
            'client_status' => 'required|string',
            'name' => 'required|string',
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
        ]);

        $customerProfile = $this->customerProfileService->createCustomerProfile($validatedData);

        return response()->json($customerProfile, 201);
    }

    public function show(int $id): JsonResponse
    {
        $customerProfile = $this->customerProfileService->getCustomerProfileById($id);
        return response()->json($customerProfile);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validatedData = $request->validate([
            'date' => 'sometimes|required|date',
            'client_status' => 'sometimes|required|string',
            'name' => 'sometimes|required|string',
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
        ]);

        $customerProfile = $this->customerProfileService->updateCustomerProfile($id, $validatedData);

        return response()->json($customerProfile);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->customerProfileService->deleteCustomerProfile($id);
        return response()->json(null, 204);
    }
}
