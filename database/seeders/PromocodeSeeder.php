<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promocode;
use Carbon\Carbon;

class PromocodeSeeder extends Seeder
{
    /**
     * Seed the promocodes table with realistic Attire Lounge promotions.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $codes = [
            [
                'name'                => 'Grand Opening',
                'discount_percentage' => 10,
                'code'                => 'ATTIRE10',
                'expires_at'          => $now->copy()->addMonths(3),
            ],
            [
                'name'                => 'VIP Loyalty',
                'discount_percentage' => 15,
                'code'                => 'VIPLOY15',
                'expires_at'          => $now->copy()->addMonths(6),
            ],
            [
                'name'                => 'First Purchase',
                'discount_percentage' => 5,
                'code'                => 'FIRST5',
                'expires_at'          => $now->copy()->addYear(),
            ],
            [
                'name'                => 'Groom Special',
                'discount_percentage' => 20,
                'code'                => 'GROOM20',
                'expires_at'          => $now->copy()->addMonths(2),
            ],
            [
                'name'                => 'Referral Reward',
                'discount_percentage' => 8,
                'code'                => 'REFER8',
                'expires_at'          => $now->copy()->addMonths(4),
            ],
            [
                'name'                => 'Holiday Sale',
                'discount_percentage' => 12,
                'code'                => 'HOLIDAY12',
                'expires_at'          => $now->copy()->addMonth(),
            ],
            [
                'name'                => 'Staff Friends & Family',
                'discount_percentage' => 25,
                'code'                => 'STAFF25',
                'expires_at'          => $now->copy()->addMonths(12),
            ],
            [
                'name'                => 'Flash Weekend',
                'discount_percentage' => 18,
                'code'                => 'FLASH18',
                'expires_at'          => $now->copy()->addWeeks(2),
            ],
        ];

        foreach ($codes as $code) {
            Promocode::updateOrCreate(
                ['code' => $code['code']],
                $code
            );
        }
    }
}
