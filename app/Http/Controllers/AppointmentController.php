<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentStatusRequest;
use Illuminate\Http\Request;
use App\Models\Appointment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AppointmentController extends Controller
{
    /**
     * Store a newly created appointment in storage.
     */
    public function store(StoreAppointmentRequest $request)
    {
        Log::info('=== APPOINTMENT REQUEST START ===', ['data' => $request->all()]);

        try {
            // Validate the incoming request data.
            // Note: The frontend sends 'date' and 'time', which map directly to the database columns.
            $validatedData = $request->validated();

            Log::info('Validation passed.', $validatedData);

            // The 'appointment_type' column in the database must have a value.
            // We will use the 'service' value for this, as was the original intent.
            $appointmentData = $validatedData;
            $appointmentData['appointment_type'] = $validatedData['service'];

            // Create the appointment using the prepared data.
            $appointment = Appointment::create($appointmentData);

            Log::info('Appointment created successfully.', ['id' => $appointment->id]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment request submitted successfully!',
                'appointment' => $appointment
            ], 201);

        } catch (\Exception $e) {
            Log::error('Appointment Creation Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

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
    public function index()
    {
        // Optimization: Sort by latest first directly in the database query
        $appointments = Appointment::orderBy('created_at', 'desc')->get();
        return response()->json($appointments);
    }

    /**
     * Update the status of the specified appointment.
     */
    public function updateStatus(UpdateAppointmentStatusRequest $request, Appointment $appointment)
    {
        Log::info('=== APPOINTMENT STATUS UPDATE START ===', ['appointment_id' => $appointment->id, 'request_data' => $request->all()]);

        try {
            $validatedData = $request->validated();

            $appointment->status = $validatedData['status'];
            $appointment->save();

            Log::info('Appointment status updated successfully.', ['id' => $appointment->id, 'new_status' => $appointment->status]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully!',
                'appointment' => $appointment
            ]);

        } catch (\Exception $e) {
            Log::error('Appointment Status Update Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
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
    public function clearCompleted()
    {
        Log::info('=== CLEAR COMPLETED APPOINTMENTS START ===');

        try {
            $deletedCount = Appointment::where('status', 'done')->delete();

            Log::info('Cleared completed appointments successfully.', ['count' => $deletedCount]);

            return response()->json([
                'success' => true,
                'message' => "Successfully cleared {$deletedCount} completed appointments!"
            ]);
        } catch (\Exception $e) {
            Log::error('Clear Completed Appointments Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
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
