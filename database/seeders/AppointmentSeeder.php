<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('appointments')->delete();

        Appointment::create([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'phone' => '123-456-7890',
            'service' => 'Custom Suit Fitting',
            'date' => Carbon::now()->addDays(10),
            'time' => '10:00 AM',
            'appointment_type' => 'virtual',
            'message' => 'Looking forward to my fitting.',
            'status' => 'confirmed',
            'favorite_item_image_url' => json_encode([
                'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/collections/default/g1.jpg',
                'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/collections/default/hvn2.jpg'
            ]),
        ]);

        Appointment::create([
            'name' => 'Jane Smith',
            'email' => 'jane.smith@example.com',
            'phone' => '098-765-4321',
            'service' => 'Wedding Consultation',
            'date' => Carbon::now()->addDays(15),
            'time' => '2:00 PM',
            'appointment_type' => 'in-person',
            'message' => 'Need a tuxedo for my wedding.',
            'status' => 'pending',
            'favorite_item_image_url' => json_encode([
                'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/collections/default/mm1.jpg'
            ]),
        ]);

        Appointment::create([
            'name' => 'Peter Jones',
            'email' => 'peter.jones@example.com',
            'phone' => '555-555-5555',
            'service' => 'General Inquiry',
            'date' => Carbon::now()->addDays(5),
            'time' => '11:30 AM',
            'appointment_type' => 'virtual',
            'message' => 'I have a few questions about your services.',
            'status' => 'pending',
            'favorite_item_image_url' => null,
        ]);
    }
}
