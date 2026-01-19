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

        // For simplicity, we'll assume any authenticated user is an admin for now.
        // In a real application, you'd add a role check here:
        // if (!$user->hasRole('admin')) {
        //     Auth::logout();
        //     throw ValidationException::withMessages([
        //         'email' => ['You do not have administrative privileges.'],
        //     ]);
        // }

        // Create a Sanctum token
        $token = $user->createToken('admin-token', ['admin'])->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user, // Optionally return user data
        ]);
    }
}
