<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NewsletterSubscription;

class NewsletterSubscriptionSeeder extends Seeder
{
    /**
     * Seed newsletter subscribers with Cambodian phone numbers.
     */
    public function run(): void
    {
        $phones = [
            '012 345 678',
            '096 789 012',
            '010 555 333',
            '069 112 233',
            '077 888 999',
            '085 444 567',
            '098 222 111',
            '070 333 444',
            '081 856 626',
            '081 333 693',
            '087 669 168',
            '012 460 557',
            '093 959 259',
            '010 711 443',
            '095 963 366',
        ];

        foreach ($phones as $phone) {
            NewsletterSubscription::updateOrCreate(
                ['phone_number' => $phone],
                ['phone_number' => $phone]
            );
        }
    }
}
