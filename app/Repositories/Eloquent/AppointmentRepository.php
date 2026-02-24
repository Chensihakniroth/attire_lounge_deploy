<?php

namespace App\Repositories\Eloquent;

use App\Models\Appointment;
use App\Repositories\Interfaces\AppointmentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class AppointmentRepository implements AppointmentRepositoryInterface
{
    /**
     * @var Appointment
     */
    protected $model;

    public function __construct(Appointment $model)
    {
        $this->model = $model;
    }

    /**
     * Get all appointments sorted by latest.
     */
    public function all(): Collection
    {
        return $this->model->orderBy('created_at', 'desc')->get();
    }

    /**
     * Create a new appointment.
     */
    public function create(array $data): Appointment
    {
        return $this->model->create($data);
    }

    /**
     * Update an appointment's status.
     */
    public function updateStatus(Appointment $appointment, string $status): Appointment
    {
        $appointment->status = $status;
        $appointment->save();
        return $appointment;
    }

    /**
     * Delete all appointments with a specific status.
     */
    public function deleteByStatus(string $status): int
    {
        return $this->model->where('status', $status)->delete();
    }
}
