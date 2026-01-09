<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment; // Import the Appointment model

class AppointmentController extends Controller
{
    /**
     * Store a newly created appointment in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone' => 'nullable|string|max:255',
            'appointmentType' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $appointment = Appointment::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'phone' => $validatedData['phone'],
            'appointment_type' => $validatedData['appointmentType'], // Match database column name
            'message' => $validatedData['message'],
        ]);

        return response()->json([
            'message' => 'Appointment request submitted successfully!',
            'appointment' => $appointment
        ], 201); // 201 Created
    }
}
