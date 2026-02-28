<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
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

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Create roles and assign permissions
        $superAdminRole = Role::findOrCreate('super-admin');
        $productManagerRole = Role::findOrCreate('product-manager');
        $appointmentManagerRole = Role::findOrCreate('appointment-manager');
        $giftManagerRole = Role::findOrCreate('gift-manager');

        // Assign all permissions to super-admin
        $superAdminRole->givePermissionTo(Permission::all());

        // Assign specific permissions to other roles
        $productManagerRole->givePermissionTo(['view-dashboard', 'manage-products', 'manage-images', 'view-reports']);
        $appointmentManagerRole->givePermissionTo(['view-dashboard', 'manage-appointments', 'view-reports']);
        $giftManagerRole->givePermissionTo(['view-dashboard', 'manage-gift-requests', 'view-reports']);

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
                    'role' => null, // Spatie will manage roles
                ]
            );
            $adminUser->assignRole('super-admin');
        }

        // Assign a default 'admin' role to any existing users that might have been
        // created without explicit roles, assuming they are general admins.
        // This is a migration step from the old 'role' column to Spatie roles.
        User::where('role', 'admin')->get()->each(function ($user) use ($superAdminRole) {
            if (!$user->hasRole('super-admin')) { // Avoid assigning twice if already super-admin
                $user->assignRole($superAdminRole);
            }
            $user->role = null; // Clear old role column
            $user->save();
        });
        // You might want to remove the 'role' column from the users table migration after this is run successfully.
    }
}
