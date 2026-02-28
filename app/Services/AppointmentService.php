<?php

namespace App\Services;

use App\Models\Appointment;
use App\Repositories\Interfaces\AppointmentRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Exception;

class AppointmentService
{
    /**
     * @var AppointmentRepositoryInterface
     */
    protected $appointmentRepository;

    /**
     * Inject the Repository Interface.
     */
    public function __construct(AppointmentRepositoryInterface $appointmentRepository)
    {
        $this->appointmentRepository = $appointmentRepository;
    }

    /**
     * Create a new appointment.
     *
     * @param array $data
     * @return Appointment
     * @throws Exception
     */
    public function createAppointment(array $data): Appointment
    {
        Log::info('AppointmentService: Creating appointment...', ['data' => $data]);

        try {
            $appointmentData = $data;
            $appointmentData['appointment_type'] = $data['service'] ?? 'general';

            $appointment = $this->appointmentRepository->create($appointmentData);

            Log::info('AppointmentService: Created successfully.', ['id' => $appointment->id]);

            return $appointment;
        } catch (Exception $e) {
            Log::error('AppointmentService Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get all appointments sorted by latest (paginated).
     */
    public function getAllAppointments(int $perPage = 15)
    {
        return $this->appointmentRepository->getPaginated($perPage);
    }

    /**
     * Update appointment status.
     *
     * @param Appointment $appointment
     * @param string $status
     * @return Appointment
     */
    public function updateStatus(Appointment $appointment, string $status): Appointment
    {
        return $this->appointmentRepository->updateStatus($appointment, $status);
    }

    /**
     * Clear all completed appointments.
     *
     * @return int The number of deleted appointments.
     */
    public function clearCompleted(): int
    {
        return $this->appointmentRepository->deleteByStatus('done');
    }
}
