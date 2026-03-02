<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Support\Str;

class AdminLoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required',
        ]);

        $ipAddress = $request->ip();
        $userAgent = $request->header('User-Agent');
        $loginInput = $request->input('login');

        // Determine if the login input is an email or a username
        $isEmail = filter_var($loginInput, FILTER_VALIDATE_EMAIL);
        $credentialField = $isEmail ? 'email' : 'name';
        
        $credentials = [
            $credentialField => $loginInput,
            'password' => $request->input('password'),
        ];

        try {
            if (!Auth::attempt($credentials)) {
                Activity::create([
                    'user_id' => null,
                    'action' => 'failed_login',
                    'model_type' => User::class,
                    'model_id' => null,
                    'details' => "Failed login attempt for {$credentialField}: {$loginInput}",
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                ]);

                throw ValidationException::withMessages([
                    'login' => ['The provided credentials do not match our records.'],
                ]);
            }
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Activity::create([
                'user_id' => null,
                'action' => 'failed_login_error',
                'model_type' => User::class,
                'model_id' => null,
                'details' => "Login error for {$credentialField}: {$loginInput}. Error: {$e->getMessage()}",
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);
            return response()->json(['message' => 'Login failed due to a server error.', 'error' => $e->getMessage()], 500);
        }

        $user = Auth::user();

        if (!$user->hasRole('super-admin') && !$user->hasAnyPermission(['view-dashboard', 'manage-products', 'manage-appointments', 'manage-gift-requests', 'manage-images', 'manage-subscribers', 'view-reports'])) {
            Auth::logout();
            Activity::create([
                'user_id' => $user->id,
                'action' => 'unauthorized_access_attempt',
                'model_type' => User::class,
                'model_id' => $user->id,
                'details' => "User {$user->name} attempted to log in as admin without appropriate role/permissions.",
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);
            throw ValidationException::withMessages([
                'login' => ['You do not have administrative privileges.'],
            ]);
        }

        $abilities = $user->getPermissionNames()->toArray();
        $token = $user->createToken('admin-token', $abilities)->plainTextToken;

        Activity::create([
            'user_id' => $user->id,
            'action' => 'logged_in',
            'model_type' => User::class,
            'model_id' => $user->id,
            'details' => "User {$user->name} successfully logged in.",
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
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
}
