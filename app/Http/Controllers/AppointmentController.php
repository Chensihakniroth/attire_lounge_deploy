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
        // Log the raw request
        Log::info('=== APPOINTMENT REQUEST START ===');
        Log::info('Request Headers:', $request->headers->all());
        Log::info('Request Data:', $request->all());
        Log::info('Request Method:', ['method' => $request->method()]);
        Log::info('Request Content-Type:', ['type' => $request->header('Content-Type')]);

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

            Log::info('Validation passed', $validatedData);

            // Get all table columns
            $columns = Schema::getColumnListing('appointments');
            Log::info('Table columns:', $columns);

            // Prepare data with only existing columns
            $appointmentData = [];
            foreach ($validatedData as $key => $value) {
                if (in_array($key, $columns)) {
                    $appointmentData[$key] = $value;
                }
            }

            // Ensure required fields are present
            if (!in_array('service', $columns) && in_array('appointment_type', $columns)) {
                $appointmentData['appointment_type'] = $validatedData['service'];
            }

            Log::info('Final data to insert:', $appointmentData);

            // Try to create appointment
            $appointment = Appointment::create($appointmentData);

            Log::info('Appointment created successfully', [
                'id' => $appointment->id,
                'data' => $appointment->toArray()
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
            Log::error('CREATE APPOINTMENT ERROR:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            // Try raw SQL as fallback
            try {
                $columns = Schema::getColumnListing('appointments');
                $data = $request->all();

                // Filter and prepare data
                $insertData = [];
                foreach ($data as $key => $value) {
                    if (in_array($key, $columns)) {
                        $insertData[$key] = $value;
                    }
                }

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
                Log::error('FALLBACK SQL ERROR:', [
                    'message' => $sqlError->getMessage(),
                    'sql_error' => $sqlError->getMessage()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create appointment',
                    'error' => $e->getMessage(),
                    'sql_error' => $sqlError->getMessage()
                ], 500);
            }
        } finally {
            Log::info('=== APPOINTMENT REQUEST END ===');
        }
    }
}
