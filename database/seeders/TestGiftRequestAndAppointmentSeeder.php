<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GiftRequest;
use App\Models\Appointment;

class TestGiftRequestAndAppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Appointment::factory(20)->create();
        GiftRequest::factory(20)->create();
    }
}
