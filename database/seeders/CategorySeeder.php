<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Groom Wear', 'slug' => 'groom-wear', 'description' => 'Elegant tuxedos and formal wear for special occasions.'],
            ['name' => 'Casual Wear', 'slug' => 'casual-wear', 'description' => 'Lightweight fabrics and breezy silhouettes.'],
            ['name' => 'Everyday Wear', 'slug' => 'everyday-wear', 'description' => 'Breathable natural fabrics for sophisticated comfort.'],
            ['name' => 'Formal Wear', 'slug' => 'formal-wear', 'description' => 'Sophisticated and comfortable attire for the modern workplace.'],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Fine accessories to complete your look.'],
            ['name' => 'Suits', 'slug' => 'suits', 'description' => 'Stylish and durable essentials for the modern explorer.'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
