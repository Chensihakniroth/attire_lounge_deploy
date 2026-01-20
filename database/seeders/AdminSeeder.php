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
        User::create([
            'name' => 'Admin',
            'email' => 'admin@attirelounge.com',
            'password' => Hash::make('admin123'), // Change this to a secure password
            'role' => 'admin',
        ]);
    }
}
