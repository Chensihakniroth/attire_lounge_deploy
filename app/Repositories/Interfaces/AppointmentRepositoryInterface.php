<?php

namespace App\Repositories\Interfaces;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Collection;

interface AppointmentRepositoryInterface
{
    /**
     * Get all appointments sorted by latest.
     *
     * @return Collection
     */
    public function all(): Collection;

    /**
     * Get paginated appointments sorted by latest.
     *
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPaginated(int $perPage = 15);

    /**
     * Create a new appointment.
     *
     * @param array $data
     * @return Appointment
     */
    public function create(array $data): Appointment;

    /**
     * Update an appointment's status.
     *
     * @param Appointment $appointment
     * @param string $status
     * @return Appointment
     */
    public function updateStatus(Appointment $appointment, string $status): Appointment;

    /**
     * Delete all appointments with a specific status.
     *
     * @param string $status
     * @return int
     */
    public function deleteByStatus(string $status): int;
}
