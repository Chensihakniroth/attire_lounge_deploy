<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AdminLoginController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'login' => 'required|string',
                'password' => 'required',
            ]);

            $ipAddress = $request->ip();
            $userAgent = $request->header('User-Agent');
            $loginInput = $request->input('login');

            $isEmail = filter_var($loginInput, FILTER_VALIDATE_EMAIL);
            $credentialField = $isEmail ? 'email' : 'name';
            
            $credentials = [
                $credentialField => $loginInput,
                'password' => $request->input('password'),
            ];

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

                return response()->json([
                    'message' => 'Oh no! Those credentials don\'t seem right. Please check and try again! (｡>﹏<｡)'
                ], 401);
            }

            $user = Auth::user();

            // Check if user has admin or super-admin role
            if (!$user->hasAnyRole(['super-admin', 'admin'])) {
                Auth::logout();
                return response()->json([
                    'message' => 'I\'m sorry, but you don\'t have permission to enter the atelier dashboard. (｡•́︿•̀｡)'
                ], 403);
            }

            // Get all permission names including from roles
            $abilities = $user->getAllPermissions()->pluck('name')->toArray();
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
                'message' => 'Welcome back to the Lounge! (ﾉ´ヮ`)ﾉ*:･ﾟ✧',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $abilities,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Please provide both your identity and password, honey! (◕‿◕✿)',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Something went wrong on our end. Please try again in a little bit! (っ˘ω˘ς)',
                'debug' => $e->getMessage() // Return error message for easier debugging
            ], 500);
        }
    }
}
