<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Collection;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        // Create categories
        $categories = ['Suits', 'Shirts', 'Accessories', 'Footwear', 'Outerwear'];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category,
                'slug' => strtolower($category),
                'description' => "Premium {$category} for the modern gentleman",
                'is_active' => true,
                'sort_order' => rand(1, 10),
            ]);
        }

        // Create collections
        $collections = [
            ['name' => 'Spring 2024', 'season' => 'Spring', 'year' => 2024],
            ['name' => 'Heritage Collection', 'season' => 'All Seasons', 'year' => 2024],
            ['name' => 'Evening Wear', 'season' => 'Autumn/Winter', 'year' => 2024],
        ];

        foreach ($collections as $collection) {
            Collection::create([
                'name' => $collection['name'],
                'slug' => strtolower(str_replace(' ', '-', $collection['name'])),
                'description' => "Exclusive {$collection['name']}",
                'season' => $collection['season'],
                'year' => $collection['year'],
                'is_active' => true,
            ]);
        }

        // Create sample products
        $products = [
            [
                'name' => 'Wool Two-Piece Suit',
                'slug' => 'wool-two-piece-suit',
                'description' => 'Tailored from premium Italian wool with hand-stitched details.',
                'price' => 1850.00,
                'compare_price' => 2200.00,
                'category' => 'Suits',
                'collection' => 'Spring 2024',
                'featured' => true,
                'in_stock' => true,
                'images' => json_encode(['suit1.jpg', 'suit2.jpg']),
                'sizes' => json_encode(['38R', '40R', '42R', '44R']),
                'colors' => json_encode(['Navy', 'Charcoal', 'Black']),
                'fabric' => 'Italian Wool',
                'fit' => 'Modern Fit',
            ],
            // Add more products...
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
