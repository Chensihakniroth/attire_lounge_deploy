<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TestAppointmentTrendSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing appointments for a clean visual test
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Appointment::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $services = ['Bespoke Suit', 'Wedding Styling', 'Wardrobe Refresh', 'Accessories Consultation'];
        $statuses = ['pending', 'confirmed', 'done', 'cancelled'];
        $types = ['Physical', 'Online'];

        // 1. Seed data for the LAST 7 DAYS (Daily View)
        // Pattern: 2, 5, 3, 8, 4, 6, 2
        $dailyCounts = [2, 5, 3, 8, 4, 6, 2];
        foreach ($dailyCounts as $index => $count) {
            $date = Carbon::now()->subDays(6 - $index);
            for ($i = 0; $i < $count; $i++) {
                $this->createAppointment($date, $services, $statuses, $types);
            }
        }

        // 2. Seed data for the LAST 4 WEEKS (Weekly View)
        // Pattern: 15, 25, 10, 20 (Note: some of this overlaps with the daily data above)
        $weeklyCounts = [15, 25, 10, 20];
        foreach ($weeklyCounts as $index => $count) {
            $date = Carbon::now()->subWeeks(3 - $index);
            for ($i = 0; $i < $count; $i++) {
                // Random day within that week
                $randomDay = $date->copy()->startOfWeek()->addDays(rand(0, 6));
                $this->createAppointment($randomDay, $services, $statuses, $types);
            }
        }

        // 3. Seed data for the LAST 6 MONTHS (Monthly View)
        // Pattern: 30, 50, 20, 60, 45, 40
        $monthlyCounts = [30, 50, 20, 60, 45, 40];
        foreach ($monthlyCounts as $index => $count) {
            $date = Carbon::now()->subMonths(5 - $index);
            for ($i = 0; $i < $count; $i++) {
                // Random day within that month
                $randomDay = $date->copy()->startOfMonth()->addDays(rand(0, 27));
                $this->createAppointment($randomDay, $services, $statuses, $types);
            }
        }

        $this->command->info('Successfully seeded a rich variety of appointments! (ﾉ´ヮ`)ﾉ*:･ﾟ✧');
    }

    private function createAppointment($createdAt, $services, $statuses, $types)
    {
        // Don't create if it's in the future
        if ($createdAt->isFuture()) return;

        Appointment::create([
            'name' => 'Test Client ' . rand(100, 999),
            'email' => 'client' . rand(100, 999) . '@example.com',
            'phone' => '0' . rand(10000000, 99999999),
            'service' => $services[array_rand($services)],
            'date' => $createdAt->copy()->addDays(rand(1, 7))->toDateString(),
            'time' => rand(9, 18) . ':00',
            'appointment_type' => $types[array_rand($types)],
            'message' => 'Visual testing data.',
            'status' => $statuses[array_rand($statuses)],
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);
    }
}
