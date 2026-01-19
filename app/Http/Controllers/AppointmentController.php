<?php

namespace App\Http\Controllers;

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
    public function store(Request $request)
    {
        Log::info('=== APPOINTMENT REQUEST START ===', ['data' => $request->all()]);

        try {
            // Validate the incoming request data.
            // Note: The frontend sends 'date' and 'time', which map directly to the database columns.
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'phone' => 'required|string|max:255',
                'service' => 'required|string|max:255',
                'date' => 'required|date',
                'time' => 'required|string|max:255', // Stored as string, e.g., "14:30"
                'message' => 'nullable|string',
                'favorite_item_image_url' => 'nullable|array',
                'favorite_item_image_url.*' => 'string',
            ]);

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

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation Error:', ['errors' => $e->errors()]);

            return response()->json([
                'success' => false,
                'message' => 'Validation Failed',
                'errors' => $e->errors()
            ], 422);

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
     * Handle OPTIONS request for CORS preflight
     */
    public function handleOptions()
    {
        return response()->json([], 200);
    }

    /**
     * Display a listing of the appointments.
     */
    public function index()
    {
        $appointments = Appointment::all();
        return response()->json($appointments);
    }

    /**
     * Update the status of the specified appointment.
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        Log::info('=== APPOINTMENT STATUS UPDATE START ===', ['appointment_id' => $appointment->id, 'request_data' => $request->all()]);

        try {
            $validatedData = $request->validate([
                'status' => 'required|string|in:pending,done,cancelled',
            ]);

            $appointment->status = $validatedData['status'];
            $appointment->save();

            Log::info('Appointment status updated successfully.', ['id' => $appointment->id, 'new_status' => $appointment->status]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment status updated successfully!',
                'appointment' => $appointment
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation Error (Update Status):', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation Failed',
                'errors' => $e->errors()
            ], 422);
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
     * Handle OPTIONS request for CORS preflight for status update.
     */
    public function handleOptionsStatus()
    {
        return response()->json([], 200);
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

    /**
     * Handle OPTIONS request for CORS preflight for clear completed.
     */
    public function handleOptionsClearCompleted()
    {
        return response()->json([], 200);
    }
}
