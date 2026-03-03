<?php

namespace App\Repositories\Eloquent;

use App\Models\CustomerProfile;
use App\Repositories\Interfaces\CustomerProfileRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class CustomerProfileRepository implements CustomerProfileRepositoryInterface
{
    /**
     * @var CustomerProfile
     */
    protected $model;

    public function __construct(CustomerProfile $model)
    {
        $this->model = $model;
    }

    public function all(): Collection
    {
        return $this->model->orderBy('created_at', 'desc')->get();
    }

    public function getPaginated(int $perPage = 15)
    {
        return $this->model->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function create(array $data): CustomerProfile
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data): CustomerProfile
    {
        $profile = $this->find($id);
        $profile->update($data);
        return $profile;
    }

    public function delete(int $id): bool
    {
        return $this->find($id)->delete();
    }

    public function find(int $id): ?CustomerProfile
    {
        return $this->model->find($id);
    }
}
