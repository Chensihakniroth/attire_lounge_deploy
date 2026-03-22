<?php

namespace App\Services;

use App\Models\GiftRequest;
use App\Repositories\Interfaces\GiftRequestRepositoryInterface;
use Illuminate\Support\Facades\Log;

class GiftRequestService
{
    /**
     * @var GiftRequestRepositoryInterface
     */
    protected $giftRequestRepository;

    public function __construct(GiftRequestRepositoryInterface $giftRequestRepository)
    {
        $this->giftRequestRepository = $giftRequestRepository;
    }

    /**
     * Get all gift requests (paginated).
     */
    public function getAllGiftRequests(int $perPage = 15)
    {
        return $this->giftRequestRepository->getPaginated($perPage);
    }

    /**
     * Create a new gift request.
     */
    public function createGiftRequest(array $data)
    {
        $giftRequest = $this->giftRequestRepository->create($data);

        event(new \App\Events\GiftRequestCreated($giftRequest));

        return $giftRequest;
    }

    /**
     * Update gift request status.
     */
    public function updateStatus(GiftRequest $giftRequest, string $status)
    {
        return $this->giftRequestRepository->updateStatus($giftRequest, $status);
    }

    /**
     * Delete a gift request.
     */
    public function deleteGiftRequest(GiftRequest $giftRequest)
    {
        return $this->giftRequestRepository->delete($giftRequest);
    }
}
