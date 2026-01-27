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
        // Define MinIO endpoint and base path from Gemini's memory
        $minioEndpoint = 'https://bucket-production-4ca0.up.railway.app';
        $basePath = 'product-assets/uploads/collections/default/';

        // Helper to get full image URL
        $getImageUrl = function ($imageName) use ($minioEndpoint, $basePath) {
            return "{$minioEndpoint}/{$basePath}{$imageName}";
        };

        // Create categories
        $categoriesData = ['Suits', 'Shirts', 'Accessories', 'Footwear', 'Outerwear'];
        foreach ($categoriesData as $categoryName) {
            Category::firstOrCreate(['slug' => strtolower($categoryName)], [
                'name' => $categoryName,
                'description' => "Premium {$categoryName} for the modern gentleman",
                'is_active' => true,
                'sort_order' => rand(1, 10),
            ]);
        }

        // Create collections
        $collectionsData = [
            ['name' => 'Groom Collection', 'season' => 'All Seasons', 'year' => 2024],
            ['name' => 'Havana Collection', 'season' => 'Summer', 'year' => 2024],
            ['name' => 'Mocha Mousse \'25', 'season' => 'Autumn', 'year' => 2025],
            ['name' => 'Office Collection', 'season' => 'All Seasons', 'year' => 2024],
        ];
        foreach ($collectionsData as $collection) {
            Collection::firstOrCreate(['slug' => strtolower(str_replace(' ', '-', $collection['name']))], [
                'name' => $collection['name'],
                'description' => "Exclusive {$collection['name']}",
                'season' => $collection['season'],
                'year' => $collection['year'],
                'is_active' => true,
            ]);
        }

        // --- Product Data ---
        $productsData = [
            // Groom Collection Products
            [
                'name' => 'Classic Wedding Suit',
                'slug' => 'classic-wedding-suit',
                'description' => 'An elegant suit perfect for your special day.',
                'price' => 1200.00,
                'category_name' => 'Suits', // Temporary
                'collection_name' => 'Groom Collection', // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'images_raw' => ['g1.jpg', 'g2.jpg'], // Temporary
                'sizing' => ['40R', '42R', '44R'],
            ],
            [
                'name' => 'Reception Tuxedo',
                'slug' => 'reception-tuxedo',
                'description' => 'Stylish tuxedo for evening receptions.',
                'price' => 950.00,
                'category_name' => 'Suits', // Temporary
                'collection_name' => 'Groom Collection', // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'images_raw' => ['g3.jpg', 'g4.jpg'], // Temporary
                'sizing' => ['38R', '40R', '42R'],
            ],

            // Havana Collection Products
            [
                'name' => 'Havana Linen Shirt',
                'slug' => 'havana-linen-shirt',
                'description' => 'Lightweight linen shirt for a relaxed, stylish look.',
                'price' => 85.00,
                'category_name' => 'Shirts', // Temporary
                'collection_name' => 'Havana Collection', // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'images_raw' => ['hvn1.jpg', 'hvn2.jpg'], // Temporary
                'sizing' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name' => 'Havana Cotton Trousers',
                'slug' => 'havana-cotton-trousers',
                'description' => 'Comfortable and breathable cotton trousers.',
                'price' => 120.00,
                'category_name' => 'Outerwear', // Temporary
                'collection_name' => 'Havana Collection', // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'images_raw' => ['hvn3.jpg', 'hvn4.jpg'], // Temporary
                'sizing' => ['30', '32', '34', '36'],
            ],

            // Mocha Mousse Collection Products
            [
                'name' => 'Mocha Mousse Blazer',
                'slug' => 'mocha-mousse-blazer',
                'description' => 'Sophisticated blazer with a modern cut.',
                'price' => 350.00,
                'category_name' => 'Outerwear', // Temporary
                'collection_name' => "Mocha Mousse '25", // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'images_raw' => ['mm1.jpg', 'mm2.jpg'], // Temporary
                'sizing' => ['48', '50', '52'],
            ],
            [
                'name' => 'Mocha Mousse Dress Shirt',
                'slug' => 'mocha-mousse-dress-shirt',
                'description' => 'Crisp dress shirt, ideal for business or casual wear.',
                'price' => 90.00,
                'category_name' => 'Shirts', // Temporary
                'collection_name' => "Mocha Mousse '25", // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'images_raw' => ['mm3.jpg', 'mm4.jpg'], // Temporary
                'sizing' => ['S', 'M', 'L'],
            ],

            // Office Collection Products
            [
                'name' => 'Office Professional Trousers',
                'slug' => 'office-professional-trousers',
                'description' => 'Smart and comfortable trousers for the office.',
                'price' => 150.00,
                'category_name' => 'Outerwear', // Temporary
                'collection_name' => 'Office Collection', // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'images_raw' => ['of1.jpg', 'of2.jpg'], // Temporary
                'sizing' => ['30', '32', '34', '36'],
            ],
            [
                'name' => 'Office Silk Tie',
                'slug' => 'office-silk-tie',
                'description' => 'A luxurious silk tie to complete your professional attire.',
                'price' => 60.00,
                'category_name' => 'Accessories', // Temporary
                'collection_name' => 'Office Collection', // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'images_raw' => ['of3.jpg'], // Temporary
                'sizing' => ['One Size'],
            ],
        ];

        foreach ($productsData as $data) {
            $category = Category::where('name', $data['category_name'])->first();
            $collection = Collection::where('name', $data['collection_name'])->first();

            if (!$category) {
                $this->command->warn("Category '{$data['category_name']}' not found for product '{$data['name']}'");
                continue;
            }

            $images = array_map($getImageUrl, $data['images_raw']);

            Product::firstOrCreate(['slug' => $data['slug']], [
                'name' => $data['name'],
                'slug' => $data['slug'],
                'description' => $data['description'],
                'price' => $data['price'],
                'images' => json_encode($images), // Explicitly encode
                'category_id' => $category->id,
                'collection_id' => $collection ? $collection->id : null,
                'is_featured' => $data['is_featured'],
                'is_new' => false,
                'availability' => $data['availability'],
                'sizing' => json_encode($data['sizing']), // Explicitly encode
            ]);
        }
    }
}