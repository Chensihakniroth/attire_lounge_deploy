<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Activity; // Import the Activity model

class AdminLoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $ipAddress = $request->ip();
        $userAgent = $request->header('User-Agent');
        $attemptedEmail = $request->input('email');

        try {
            // Attempt to authenticate
            if (!Auth::attempt($request->only('email', 'password'))) {
                // Log failed attempt for invalid credentials
                Activity::create([
                    'user_id' => null, // No user authenticated
                    'action' => 'failed_login',
                    'model_type' => User::class,
                    'model_id' => null,
                    'details' => "Failed login attempt for email: {$attemptedEmail}",
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);

                throw ValidationException::withMessages([
                    'email' => ['The provided credentials do not match our records.'],
                ]);
            }
        } catch (ValidationException $e) {
            // Re-throw validation exceptions
            throw $e;
        } catch (\Exception $e) {
            // Log general login errors
            Activity::create([
                'user_id' => null,
                'action' => 'failed_login_error',
                'model_type' => User::class,
                'model_id' => null,
                'details' => "Login error for email: {$attemptedEmail}. Error: {$e->getMessage()}",
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);
            return response()->json(['message' => 'Login failed due to a server error.', 'error' => $e->getMessage()], 500);
        }

        $user = Auth::user();

        // Check if the user has any admin-related role or permission.
        // For simplicity, we'll check if they have the 'super-admin' role,
        // or any permission relevant to admin functionalities.
        // This replaces the old 'user->role !== admin' check.
        // Alternatively, one could define a specific 'admin' role and check for that.
        if (!$user->hasRole('super-admin') && !$user->hasAnyPermission(['view-dashboard', 'manage-products', 'manage-appointments', 'manage-gift-requests', 'manage-images', 'manage-subscribers', 'view-reports'])) {
            Auth::logout();
            // Log unauthorized access attempt
            Activity::create([
                'user_id' => $user->id,
                'action' => 'unauthorized_access_attempt',
                'model_type' => User::class,
                'model_id' => $user->id,
                'details' => "User {$user->email} attempted to log in as admin without appropriate role/permissions.",
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);
            throw ValidationException::withMessages([
                'email' => ['You do not have administrative privileges.'],
            ]);
        }

        // Create a Sanctum token
        // Use abilities based on user's roles/permissions for better security
        $abilities = $user->getPermissionNames()->toArray(); // Get all permissions as abilities
        $token = $user->createToken('admin-token', $abilities)->plainTextToken;

        // Log successful login
        Activity::create([
            'user_id' => $user->id,
            'action' => 'logged_in',
            'model_type' => User::class,
            'model_id' => $user->id,
            'details' => "User {$user->email} successfully logged in.",
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(), // Get roles assigned to user
                'permissions' => $user->getAllPermissions()->pluck('name'), // Get all effective permissions
            ],
        ]);
    }
}
