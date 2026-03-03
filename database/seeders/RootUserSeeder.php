<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RootUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure super-admin role exists
        $role = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'sanctum']);

        $user = User::updateOrCreate(
            ['email' => 'admin@alo.com'],
            [
                'name' => 'Root Admin',
                'password' => Hash::make('alo0994695959'),
            ]
        );

        $user->assignRole($role);

        $this->command->info('Root super-admin account has been secured! (ﾉ´ヮ`)ﾉ*:･ﾟ✧');
    }
}
