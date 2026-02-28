<?php

namespace App\Repositories\Eloquent;

use App\Models\GiftRequest;
use App\Repositories\Interfaces\GiftRequestRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class GiftRequestRepository implements GiftRequestRepositoryInterface
{
    /**
     * @var GiftRequest
     */
    protected $model;

    public function __construct(GiftRequest $model)
    {
        $this->model = $model;
    }

    /**
     * Get all gift requests sorted by latest.
     */
    public function all(): Collection
    {
        return $this->model->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get paginated gift requests sorted by latest.
     */
    public function getPaginated(int $perPage = 15)
    {
        return $this->model->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Create a new gift request.
     */
    public function create(array $data): GiftRequest
    {
        return $this->model->create($data);
    }

    /**
     * Update a gift request's status.
     */
    public function updateStatus(GiftRequest $giftRequest, string $status): GiftRequest
    {
        $giftRequest->status = $status;
        $giftRequest->save();
        return $giftRequest;
    }

    /**
     * Delete a gift request.
     */
    public function delete(GiftRequest $giftRequest): ?bool
    {
        return $giftRequest->delete();
    }
}
