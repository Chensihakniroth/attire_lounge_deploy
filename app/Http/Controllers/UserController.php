<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use App\Models\Activity;

class UserController extends Controller
{
    /**
     * List all admin users.
     */
    public function index(): JsonResponse
    {
        $users = User::with(['roles', 'permissions'])->get();
        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a new admin user.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'array',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if ($request->has('roles')) {
            $user->assignRole($request->roles);
        }

        Activity::create([
            'user_id' => auth()->id(),
            'action' => 'created',
            'model_type' => User::class,
            'model_id' => $user->id,
            'details' => "Created new admin user: {$user->email}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        return response()->json([
            'success' => true,
            'data' => $user->load('roles'),
        ]);
    }

    /**
     * Update an admin user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'roles' => 'array',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        Activity::create([
            'user_id' => auth()->id(),
            'action' => 'updated',
            'model_type' => User::class,
            'model_id' => $user->id,
            'details' => "Updated admin user: {$user->email}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        return response()->json([
            'success' => true,
            'data' => $user->load('roles'),
        ]);
    }

    /**
     * Remove an admin user.
     */
    public function destroy(User $user, Request $request): JsonResponse
    {
        if ($user->hasRole('super-admin') && User::role('super-admin')->count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the last super-admin.',
            ], 422);
        }

        $email = $user->email;
        $id = $user->id;
        $user->delete();

        Activity::create([
            'user_id' => auth()->id(),
            'action' => 'deleted',
            'model_type' => User::class,
            'model_id' => $id,
            'details' => "Deleted admin user: {$email}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * List all available roles and permissions.
     */
    public function rolesAndPermissions(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'roles' => Role::where('guard_name', 'sanctum')->get(),
                'permissions' => Permission::where('guard_name', 'sanctum')->get(),
            ],
        ]);
    }
}
