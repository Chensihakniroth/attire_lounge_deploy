<?php

namespace App\Repositories\Interfaces;

use App\Models\GiftRequest;
use Illuminate\Database\Eloquent\Collection;

interface GiftRequestRepositoryInterface
{
    /**
     * Get all gift requests sorted by latest.
     */
    public function all(): Collection;

    /**
     * Get paginated gift requests sorted by latest.
     *
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15);

    /**
     * Create a new gift request.
     *
     * @param array $data
     * @return GiftRequest
     */
    public function create(array $data): GiftRequest;

    /**
     * Update a gift request's status.
     *
     * @param GiftRequest $giftRequest
     * @param string $status
     * @return GiftRequest
     */
    public function updateStatus(GiftRequest $giftRequest, string $status): GiftRequest;

    /**
     * Delete a gift request.
     *
     * @param GiftRequest $giftRequest
     * @return bool|null
     */
    public function delete(GiftRequest $giftRequest): ?bool;
}
