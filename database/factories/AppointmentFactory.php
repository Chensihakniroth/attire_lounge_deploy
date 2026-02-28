<?php

namespace Database\Factories;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Appointment::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $services = ['sartorial', 'groom', 'office', 'accessories', 'membership', 'general'];
        $status = ['pending', 'done', 'cancelled'];

        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'appointment_type' => $this->faker->randomElement($services),
            'service' => $this->faker->randomElement($services),
            'date' => $this->faker->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'time' => $this->faker->randomElement(['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']),
            'message' => $this->faker->sentence(),
            'favorite_item_image_url' => [
                ['name' => 'Classic Blue Suit', 'image' => '/uploads/collections/default/g1.jpg'],
                ['name' => 'Silk Tie', 'image' => '/uploads/asset/tie1.jpg']
            ],
            'status' => $this->faker->randomElement($status),
        ];
    }
}
