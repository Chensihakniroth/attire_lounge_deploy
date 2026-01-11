<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment; // Import the Appointment model
use Illuminate\Support\Facades\Log; // Added for logging

class AppointmentController extends Controller
{
    /**
     * Store a newly created appointment in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validate the incoming request data
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'phone' => 'required|string|max:255',
                'service' => 'required|string|max:255',
                'date' => 'required|date',
                'time' => 'required|string|max:255',
                'message' => 'required|string',
            ]);

            $appointment = Appointment::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
                'service' => $validatedData['service'],
                'date' => $validatedData['date'],
                'time' => $validatedData['time'],
                'message' => $validatedData['message'],
            ]);

            // Log successful creation
            Log::info('Appointment created successfully', ['appointment_id' => $appointment->id, 'email' => $appointment->email]);

            return response()->json([
                'message' => 'Appointment request submitted successfully!',
                'appointment' => $appointment
            ], 201); // 201 Created

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log validation errors
            Log::error('Appointment validation failed', ['errors' => $e->errors(), 'request' => $request->all()]);
            return response()->json([
                'message' => 'Validation Failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Log any other exceptions
            Log::error('Failed to create appointment: ' . $e->getMessage(), ['trace' => $e->getTraceAsString(), 'request' => $request->all()]);
            return response()->json([
                'message' => 'Failed to create appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
