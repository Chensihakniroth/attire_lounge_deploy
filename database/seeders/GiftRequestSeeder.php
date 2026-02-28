<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GiftRequest;

class GiftRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        GiftRequest::factory(20)->create();
    }
}
