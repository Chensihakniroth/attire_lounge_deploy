<?php

namespace App\Services;

use App\Models\CustomerProfile;
use App\Repositories\Interfaces\CustomerProfileRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Exception;

class CustomerProfileService
{
    /**
     * @var CustomerProfileRepositoryInterface
     */
    protected $customerProfileRepository;

    public function __construct(CustomerProfileRepositoryInterface $customerProfileRepository)
    {
        $this->customerProfileRepository = $customerProfileRepository;
    }

    public function getAllCustomerProfiles(int $perPage = 15)
    {
        return $this->customerProfileRepository->getPaginated($perPage);
    }

    public function createCustomerProfile(array $data): CustomerProfile
    {
        Log::info('CustomerProfileService: Creating customer profile...', ['data' => $data]);

        try {
            $customerProfile = $this->customerProfileRepository->create($data);

            Log::info('CustomerProfileService: Created successfully.', ['id' => $customerProfile->id]);

            return $customerProfile;
        } catch (Exception $e) {
            Log::error('CustomerProfileService Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function updateCustomerProfile(int $id, array $data): CustomerProfile
    {
        return $this->customerProfileRepository->update($id, $data);
    }

    public function deleteCustomerProfile(int $id): bool
    {
        return $this->customerProfileRepository->delete($id);
    }

    public function getCustomerProfileById(int $id): ?CustomerProfile
    {
        return $this->customerProfileRepository->find($id);
    }
}
