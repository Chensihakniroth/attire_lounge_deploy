<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;
use App\Models\User;
use App\Models\Product;
use App\Models\CustomerProfile;
use App\Models\Appointment;
use Carbon\Carbon;

class ActivitySeeder extends Seeder
{
    /**
     * Seed the activities (audit log) table with realistic admin actions.
     */
    public function run(): void
    {
        $admin = User::whereHas('roles', fn($q) => $q->whereIn('name', ['super-admin', 'admin']))
            ->first();

        if (!$admin) {
            $this->command->warn('⚠ No admin user found. Skipping ActivitySeeder.');
            return;
        }

        $now = Carbon::now();

        $entries = [
            // Product actions
            [
                'user_id'    => $admin->id,
                'action'     => 'created',
                'model_type' => Product::class,
                'model_id'   => Product::inRandomOrder()->value('id') ?? 1,
                'changes'    => json_encode(['name' => 'Havana Linen Blazer', 'price' => 280]),
                'details'    => 'Added a new product to the Havana Collection.',
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subHours(2),
                'updated_at' => $now->copy()->subHours(2),
            ],
            [
                'user_id'    => $admin->id,
                'action'     => 'updated',
                'model_type' => Product::class,
                'model_id'   => Product::inRandomOrder()->value('id') ?? 1,
                'changes'    => json_encode(['price' => ['old' => 250, 'new' => 280], 'is_visible' => ['old' => false, 'new' => true]]),
                'details'    => 'Updated product pricing and visibility.',
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subHours(4),
                'updated_at' => $now->copy()->subHours(4),
            ],
            [
                'user_id'    => $admin->id,
                'action'     => 'deleted',
                'model_type' => Product::class,
                'model_id'   => 999, // Fake deleted ID
                'changes'    => json_encode(['name' => 'Legacy Test Product']),
                'details'    => 'Removed discontinued product from catalog.',
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subDays(1),
                'updated_at' => $now->copy()->subDays(1),
            ],

            // Customer profile actions
            [
                'user_id'    => $admin->id,
                'action'     => 'created',
                'model_type' => CustomerProfile::class,
                'model_id'   => CustomerProfile::inRandomOrder()->value('id') ?? 1,
                'changes'    => json_encode(['name' => 'Sok Visal', 'client_status' => 'New']),
                'details'    => 'Registered a new walk-in customer.',
                'ip_address' => '192.168.1.15',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'created_at' => $now->copy()->subHours(6),
                'updated_at' => $now->copy()->subHours(6),
            ],
            [
                'user_id'    => $admin->id,
                'action'     => 'updated',
                'model_type' => CustomerProfile::class,
                'model_id'   => CustomerProfile::inRandomOrder()->value('id') ?? 1,
                'changes'    => json_encode(['client_status' => ['old' => 'Returning', 'new' => 'VIP']]),
                'details'    => 'Upgraded customer to VIP tier after large purchase.',
                'ip_address' => '192.168.1.15',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'created_at' => $now->copy()->subDays(2),
                'updated_at' => $now->copy()->subDays(2),
            ],

            // Appointment actions
            [
                'user_id'    => $admin->id,
                'action'     => 'created',
                'model_type' => Appointment::class,
                'model_id'   => Appointment::inRandomOrder()->value('id') ?? 1,
                'changes'    => json_encode(['name' => 'John Doe', 'service' => 'Custom Suit Fitting']),
                'details'    => 'Scheduled a new suit fitting appointment.',
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subDays(3),
                'updated_at' => $now->copy()->subDays(3),
            ],
            [
                'user_id'    => $admin->id,
                'action'     => 'updated',
                'model_type' => Appointment::class,
                'model_id'   => Appointment::inRandomOrder()->value('id') ?? 1,
                'changes'    => json_encode(['status' => ['old' => 'pending', 'new' => 'confirmed']]),
                'details'    => 'Confirmed appointment via phone call.',
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subDays(2)->subHours(3),
                'updated_at' => $now->copy()->subDays(2)->subHours(3),
            ],

            // Login events
            [
                'user_id'    => $admin->id,
                'action'     => 'logged_in',
                'model_type' => User::class,
                'model_id'   => $admin->id,
                'changes'    => null,
                'details'    => 'Admin logged in from dashboard.',
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subHours(1),
                'updated_at' => $now->copy()->subHours(1),
            ],
            [
                'user_id'    => $admin->id,
                'action'     => 'logged_in',
                'model_type' => User::class,
                'model_id'   => $admin->id,
                'changes'    => null,
                'details'    => 'Admin logged in from mobile device.',
                'ip_address' => '10.0.0.45',
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
                'created_at' => $now->copy()->subDays(1)->subHours(8),
                'updated_at' => $now->copy()->subDays(1)->subHours(8),
            ],
            [
                'user_id'    => $admin->id,
                'action'     => 'logged_in',
                'model_type' => User::class,
                'model_id'   => $admin->id,
                'changes'    => null,
                'details'    => 'Morning shift login.',
                'ip_address' => '192.168.1.10',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => $now->copy()->subDays(3)->setHour(8),
                'updated_at' => $now->copy()->subDays(3)->setHour(8),
            ],
        ];

        foreach ($entries as $entry) {
            Activity::create($entry);
        }

        $this->command->info('✅ Seeded ' . count($entries) . ' audit log entries.');
    }
}
