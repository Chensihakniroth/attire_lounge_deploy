<?php

namespace App\Services;

use App\Models\Appointment;
use App\Repositories\Interfaces\AppointmentRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Exception;

use App\Events\AppointmentStatusUpdated;

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

            event(new \App\Events\AppointmentCreated($appointment));

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
        $appointment = $this->appointmentRepository->updateStatus($appointment, $status);
        
        try {
            // Broadcast the update for real-time magic! (ﾉ´ヮ`)ﾉ*:･ﾟ✧
            broadcast(new AppointmentStatusUpdated($appointment));
        } catch (Exception $e) {
            Log::warning('AppointmentService: Broadcasting status update failed.', [
                'id' => $appointment->id,
                'error' => $e->getMessage()
            ]);
        }

        return $appointment;
    }

    /**
     * Clear all closed appointments (Completed & Cancelled).
     *
     * @return int The number of deleted appointments.
     */
    public function clearCompleted(): int
    {
        return Appointment::whereIn('status', ['done', 'cancelled'])->delete();
    }
}
