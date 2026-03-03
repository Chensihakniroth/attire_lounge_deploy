<?php

namespace App\Repositories\Interfaces;

use App\Models\CustomerProfile;
use Illuminate\Database\Eloquent\Collection;

interface CustomerProfileRepositoryInterface
{
    /**
     * Get all customer profiles.
     *
     * @return Collection
     */
    public function all(): Collection;

    /**
     * Get paginated customer profiles.
     *
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15);

    /**
     * Create a new customer profile.
     *
     * @param array $data
     * @return CustomerProfile
     */
    public function create(array $data): CustomerProfile;

    /**
     * Update a customer profile.
     *
     * @param int $id
     * @param array $data
     * @return CustomerProfile
     */
    public function update(int $id, array $data): CustomerProfile;

    /**
     * Delete a customer profile.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool;

    /**
     * Find a customer profile by id.
     *
     * @param int $id
     * @return CustomerProfile|null
     */
    public function find(int $id): ?CustomerProfile;
}
