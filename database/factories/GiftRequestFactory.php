<?php

namespace Database\Factories;

use App\Models\GiftRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

class GiftRequestFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = GiftRequest::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $ties = [
            ['id' => 'tie-1', 'name' => 'Royal Silk Tie', 'color' => 'Navy Blue', 'price' => 45.00, 'image' => '/uploads/asset/tie1.jpg'],
            ['id' => 'tie-2', 'name' => 'Classic Crimson Tie', 'color' => 'Crimson', 'price' => 42.00, 'image' => '/uploads/asset/tie2.jpg'],
            ['id' => 'tie-3', 'name' => 'Emerald Satin Tie', 'color' => 'Emerald', 'price' => 48.00, 'image' => '/uploads/asset/tie3.jpg'],
        ];

        $pocketSquares = [
            ['id' => 'ps-1', 'name' => 'Paisley Square', 'color' => 'Silver', 'price' => 25.00, 'image' => '/uploads/asset/ps1.jpg'],
            ['id' => 'ps-2', 'name' => 'Linen White Square', 'color' => 'White', 'price' => 22.00, 'image' => '/uploads/asset/ps2.jpg'],
            ['id' => 'ps-3', 'name' => 'Polka Dot Square', 'color' => 'Navy', 'price' => 28.00, 'image' => '/uploads/asset/ps3.jpg'],
        ];

        $boxes = [
            ['id' => 'box-classic', 'name' => 'Classic Black Box', 'price' => 15.00, 'image' => '/uploads/asset/box1.jpg'],
            ['id' => 'box-premium', 'name' => 'Premium Wood Box', 'price' => 35.00, 'image' => '/uploads/asset/box2.jpg'],
        ];

        $tie = $this->faker->randomElement($ties);
        $ps = $this->faker->randomElement($pocketSquares);
        $box = $this->faker->randomElement($boxes);

        $note = $this->faker->boolean(70) ? $this->faker->sentence() : '';
        
        $preferences = "Tie: {$tie['name']} ({$tie['color']})\nPocket Square: {$ps['name']} ({$ps['color']})\nBox: {$box['name']}" . ($note ? "\nNote: \"$note\"" : "");

        return [
            'name' => $this->faker->name,
            'sender_age' => $this->faker->numberBetween(25, 60),
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'recipient_name' => $this->faker->name,
            'recipient_title' => $this->faker->randomElement(['Mr', 'Mrs']),
            'recipient_phone' => $this->faker->optional()->phoneNumber,
            'recipient_email' => $this->faker->optional()->safeEmail,
            'preferences' => $preferences,
            'selected_items' => [
                array_merge(['type' => 'Tie'], $tie),
                array_merge(['type' => 'Pocket Square'], $ps),
                array_merge(['type' => 'Box'], $box),
            ],
            'status' => $this->faker->randomElement(['Pending', 'Completed', 'Cancelled']),
        ];
    }
}
