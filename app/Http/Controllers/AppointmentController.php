<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentStatusRequest;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    protected $appointmentService;

    /**
     * Inject the AppointmentService.
     */
    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Store a newly created appointment in storage.
     */
    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        Log::info('=== APPOINTMENT REQUEST START ===', ['data' => $request->all()]);

        try {
            $appointment = $this->appointmentService->createAppointment($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Appointment request submitted successfully!',
                'appointment' => $appointment
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred on the server.',
                'error' => 'Server Error'
            ], 500);
        } finally {
            Log::info('=== APPOINTMENT REQUEST END ===');
        }
    }

    /**
     * Display a listing of the appointments.
     */
    public function index(): JsonResponse
    {
        $appointments = $this->appointmentService->getAllAppointments();
        return response()->json($appointments);
    }

    /**
     * Update the status of the specified appointment.
     */
    public function updateStatus(UpdateAppointmentStatusRequest $request, Appointment $appointment): JsonResponse
    {
        Log::info('=== APPOINTMENT STATUS UPDATE START ===', ['appointment_id' => $appointment->id]);

        try {
            $updatedAppointment = $this->appointmentService->updateStatus($appointment, $request->validated()['status']);

            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully!',
                'appointment' => $updatedAppointment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update appointment status.',
                'error' => 'Server Error'
            ], 500);
        } finally {
            Log::info('=== APPOINTMENT STATUS UPDATE END ===', ['appointment_id' => $appointment->id]);
        }
    }

    /**
     * Clear all completed appointments.
     */
    public function clearCompleted(): JsonResponse
    {
        Log::info('=== CLEAR COMPLETED APPOINTMENTS START ===');

        try {
            $deletedCount = $this->appointmentService->clearCompleted();

            return response()->json([
                'success' => true,
                'message' => "Successfully cleared {$deletedCount} completed appointments!"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear completed appointments.',
                'error' => 'Server Error'
            ], 500);
        } finally {
            Log::info('=== CLEAR COMPLETED APPOINTMENTS END ===');
        }
    }
}

