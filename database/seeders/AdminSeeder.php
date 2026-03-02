<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \Illuminate\Support\Facades\Log::info('Running AdminSeeder');

        $admins = [
            [
                'name' => 'outonghour',
                'email' => 'outonghour@attirelounge.com',
                'password' => Hash::make('outonghour123'),
                'role' => 'super-admin',
            ],
            [
                'name' => 'alyssa',
                'email' => 'alyssa@attirelounge.com',
                'password' => Hash::make('alyssa123'),
                'role' => 'super-admin',
            ],
            [
                'name' => 'ping',
                'email' => 'ping@attirelounge.com',
                'password' => Hash::make('ping123'),
                'role' => 'super-admin',
            ],
            [
                'name' => 'nel',
                'email' => 'nel@attirelounge.com',
                'password' => Hash::make('nel123'),
                'role' => 'super-admin',
            ],
        ];

        foreach ($admins as $adminData) {
            $user = User::updateOrCreate(
                ['email' => $adminData['email']],
                [
                    'name' => $adminData['name'],
                    'password' => $adminData['password'],
                ]
            );

            // Assign the role after creating/finding the user
            $user->assignRole($adminData['role']);
        }
    }
}
