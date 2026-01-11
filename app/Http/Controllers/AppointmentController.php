<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'service' => 'required|string|max:255',
                'date' => 'required|date',
                'time' => 'required|string|max:10',
                'message' => 'required|string',
            ]);

            $appointment = Appointment::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'service' => $validated['service'],
                'date' => $validated['date'],
                'time' => $validated['time'],
                'message' => $validated['message'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment requested successfully!',
                'data' => $appointment
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
