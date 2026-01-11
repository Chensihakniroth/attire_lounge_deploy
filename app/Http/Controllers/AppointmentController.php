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
        Log::info('=== APPOINTMENT REQUEST START ===');
        Log::info('Full Request:', [
            'method' => $request->method(),
            'headers' => $request->headers->all(),
            'content_type' => $request->header('Content-Type'),
            'data' => $request->all(),
            'ip' => $request->ip(),
            'url' => $request->fullUrl()
        ]);

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

            Log::info('Validation passed:', $validatedData);

            // Check table columns
            $columns = Schema::getColumnListing('appointments');
            Log::info('Table columns found:', $columns);

            // Prepare data for insertion
            $appointmentData = [];
            foreach ($validatedData as $key => $value) {
                if (in_array($key, $columns)) {
                    $appointmentData[$key] = $value;
                }
            }

            // Handle appointment_type if service column doesn't exist
            if (!in_array('service', $columns) && in_array('appointment_type', $columns)) {
                $appointmentData['appointment_type'] = $validatedData['service'];
                Log::info('Mapped service to appointment_type');
            }

            Log::info('Final data to insert:', $appointmentData);

            // Create appointment
            $appointment = Appointment::create($appointmentData);

            Log::info('Appointment created successfully:', [
                'id' => $appointment->id,
                'created_at' => $appointment->created_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment request submitted successfully!',
                'appointment' => $appointment
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation Error:', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation Failed',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Appointment Creation Error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            // Try raw SQL as fallback
            try {
                Log::info('Attempting fallback SQL insertion');

                $columns = Schema::getColumnListing('appointments');
                $data = $request->all();

                $insertData = [];
                foreach ($data as $key => $value) {
                    if (in_array($key, $columns)) {
                        $insertData[$key] = $value;
                    }
                }

                // Handle service/appointment_type mapping
                if (!isset($insertData['service']) && isset($data['service']) && in_array('appointment_type', $columns)) {
                    $insertData['appointment_type'] = $data['service'];
                }

                $insertData['created_at'] = now();
                $insertData['updated_at'] = now();

                $id = DB::table('appointments')->insertGetId($insertData);

                Log::info('Fallback SQL insertion successful:', ['id' => $id]);

                return response()->json([
                    'success' => true,
                    'message' => 'Appointment created via fallback method',
                    'id' => $id
                ], 201);

            } catch (\Exception $sqlError) {
                Log::error('Fallback SQL Error:', [
                    'message' => $sqlError->getMessage(),
                    'trace' => $sqlError->getTraceAsString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create appointment',
                    'error' => $sqlError->getMessage(),
                    'debug' => 'Check Laravel logs for details'
                ], 500);
            }
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
}
