<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Truncate the tables
        Schema::disableForeignKeyConstraints();
        DB::table('role_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        Schema::enableForeignKeyConstraints();

        $guards = ['web', 'sanctum'];
        
        // Create permissions for both guards
        $permissions = [
            'view-dashboard',
            'manage-products',
            'manage-appointments',
            'manage-gift-requests',
            'manage-images',
            'manage-subscribers',
            'view-reports',
            'manage-roles', // For super-admin
            'manage-users', // For super-admin
        ];

        foreach ($guards as $guard) {
            foreach ($permissions as $permission) {
                Permission::findOrCreate($permission, $guard);
            }

            // Create roles for each guard
            $adminRole = Role::findOrCreate('admin', $guard);
            $superAdminRole = Role::findOrCreate('super-admin', $guard);
            $productManagerRole = Role::findOrCreate('product-manager', $guard);
            $appointmentManagerRole = Role::findOrCreate('appointment-manager', $guard);
            $giftManagerRole = Role::findOrCreate('gift-manager', $guard);

            // Assign permissions to roles
            $adminRole->givePermissionTo(Permission::where('guard_name', $guard)->get());
            $superAdminRole->givePermissionTo(Permission::where('guard_name', $guard)->get());
            $productManagerRole->givePermissionTo(Permission::whereIn('name', ['view-dashboard', 'manage-products', 'manage-images', 'view-reports'])->where('guard_name', $guard)->get());
            $appointmentManagerRole->givePermissionTo(Permission::whereIn('name', ['view-dashboard', 'manage-appointments', 'view-reports'])->where('guard_name', $guard)->get());
            $giftManagerRole->givePermissionTo(Permission::whereIn('name', ['view-dashboard', 'manage-gift-requests', 'view-reports'])->where('guard_name', $guard)->get());
        }
        
        // Assign super-admin role to existing user (assuming ID 1 is the main admin)
        $adminUser = User::where('email', 'admin@example.com')->first(); // Or use a specific admin email
        if ($adminUser) {
            $adminUser->assignRole('super-admin');
            // Remove the 'role' column check if Spatie is managing roles
            $adminUser->role = null; 
            $adminUser->save();
        } else {
            // Create a default super-admin user if not exists
            $adminUser = User::updateOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Super Admin',
                    'password' => bcrypt('password'), // Change this to a strong password in production
                ]
            );
            $adminUser->assignRole('super-admin');
        }

        // Assign a default 'admin' role to any existing users that might have been
        // created without explicit roles, assuming they are general admins.
        // This is a migration step from the old 'role' column to Spatie roles.
        User::where('role', 'admin')->get()->each(function ($user) {
            if (!$user->hasRole('super-admin')) { // Avoid assigning twice if already super-admin
                $user->assignRole('super-admin');
            }
            $user->role = null; // Clear old role column
            $user->save();
        });
        // You might want to remove the 'role' column from the users table migration after this is run successfully.
    }
}
