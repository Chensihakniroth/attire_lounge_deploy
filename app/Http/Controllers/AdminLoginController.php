<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User; // Assuming admin users are in the 'users' table

class AdminLoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        try {
            // Attempt to authenticate
            if (!Auth::attempt($request->only('email', 'password'))) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials do not match our records.'],
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed.', 'error' => $e->getMessage()], 500);
        }

        $user = Auth::user();

        // Add a role check to ensure only admins can log in
        if (!isset($user->role) || $user->role !== 'admin') {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => ['You do not have administrative privileges.'],
            ]);
        }

        // Create a Sanctum token
        $token = $user->createToken('admin-token', ['admin'])->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user, // Optionally return user data
        ]);
    }

    public function createAdmin()
    {
        try {
            // Check if user already exists
            $user = User::where('email', 'admin@attirelounge.com')->first();
            if ($user) {
                // Optionally, update the password if the user exists
                $user->password = 'admin123';
                $user->save();
                return response()->json(['message' => 'Admin user already exists. Password has been reset.']);
            } else {
                // Create the user if they don't exist
                User::create([
                    'name' => 'Admin',
                    'email' => 'admin@attirelounge.com',
                    'password' => 'admin123', // The 'hashed' cast on the User model will handle hashing
                    'role' => 'admin',
                ]);
                return response()->json(['message' => 'Admin user created successfully. You can now log in.']);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create or update admin user.', 'error' => $e->getMessage()], 500);
        }
    }
}
