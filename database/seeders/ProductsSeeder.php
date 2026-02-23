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



        // Create categories
        $categoriesData = ['Suits', 'Accessories'];
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
            ['name' => 'Travel Collection', 'season' => 'All Seasons', 'year' => 2024], // New Travel Collection
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
                'slug' => 'g1',
                'description' => 'An elegant suit perfect for your special day.',
                'price' => 1200.00,
                'category_name' => 'Suits',
                'collection_name' => 'Groom Collection', // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'sizing' => ['40R', '42R', '44R'],
            ],
            [
                'name' => 'Ceremonial Velvet Tuxedo',
                'slug' => 'g2',
                'description' => 'A luxurious velvet tuxedo for the most memorable occasions.',
                'price' => 1500.00,
                'category_name' => 'Suits',
                'collection_name' => 'Groom Collection',
                'is_featured' => true,
                'availability' => 'In Stock',
                'sizing' => ['40R', '42R', '44R', '46R'],
            ],
            [
                'name' => 'Reception Tuxedo',
                'slug' => 'g3',
                'description' => 'Stylish tuxedo for evening receptions.',
                'price' => 950.00,
                'category_name' => 'Suits',
                'collection_name' => 'Groom Collection', // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['38R', '40R', '42R'],
            ],

            // Havana Collection Products
            [
                'name' => 'Havana Linen Shirt',
                'slug' => 'hvn0',
                'description' => 'Lightweight linen shirt for a relaxed, stylish look.',
                'price' => 85.00,
                'category_name' => 'Suits', // Changed from Shirts to Suits
                'collection_name' => 'Havana Collection', // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'sizing' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name' => 'Havana Cotton Trousers',
                'slug' => 'hvn3',
                'description' => 'Comfortable and breathable cotton trousers.',
                'price' => 120.00,
                'category_name' => 'Suits', // Changed from Outerwear to Suits
                'collection_name' => 'Havana Collection', // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['30', '32', '34', '36'],
            ],

            // Mocha Mousse Collection Products
            [
                'name' => 'Mocha Mousse Blazer',
                'slug' => 'mm1',
                'description' => 'Sophisticated blazer with a modern cut.',
                'price' => 350.00,
                'category_name' => 'Suits', // Changed from Outerwear to Suits
                'collection_name' => "Mocha Mousse '25", // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'sizing' => ['48', '50', '52'],
            ],
            [
                'name' => 'Mocha Mousse Dress Shirt',
                'slug' => 'mm3',
                'description' => 'Crisp dress shirt, ideal for business or casual wear.',
                'price' => 90.00,
                'category_name' => 'Suits', // Changed from Shirts to Suits
                'collection_name' => "Mocha Mousse '25", // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['S', 'M', 'L'],
            ],

            // Office Collection Products
            [
                'name' => 'Office Professional Trousers',
                'slug' => 'of1',
                'description' => 'Smart and comfortable trousers for the office.',
                'price' => 150.00,
                'category_name' => 'Suits', // Changed from Outerwear to Suits
                'collection_name' => 'Office Collection', // Temporary
                'is_featured' => true,
                'availability' => 'In Stock',
                'sizing' => ['30', '32', '34', '36'],
            ],
            [
                'name' => 'Office Silk Tie',
                'slug' => 'of3',
                'description' => 'A luxurious silk tie to complete your professional attire.',
                'price' => 60.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Office Collection', // Temporary
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],

            // Travel Collection Products (Individual Items)
            [
                'name' => 'Travel Collection Item T0',
                'slug' => 't0',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => true,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T1',
                'slug' => 't1',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T2',
                'slug' => 't2',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T3',
                'slug' => 't3',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T4',
                'slug' => 't4',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T5',
                'slug' => 't5',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T6',
                'slug' => 't6',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T7',
                'slug' => 't7',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T8',
                'slug' => 't8',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T9',
                'slug' => 't9',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
                'sizing' => ['One Size'],
            ],
            [
                'name' => 'Travel Collection Item T10',
                'slug' => 't10',
                'description' => 'Stylish and durable essentials for the modern explorer.',
                'price' => 250.00,
                'category_name' => 'Accessories',
                'collection_name' => 'Travel Collection',
                'is_featured' => false,
                'availability' => 'In Stock',
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

            Product::updateOrCreate(
                ['slug' => $data['slug']], // Attributes to match
                [ // Attributes to create or update
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'price' => $data['price'],
                    'category_id' => $category->id,
                    'collection_id' => $collection ? $collection->id : null,
                    'is_featured' => $data['is_featured'],
                    'is_new' => false,
                    'availability' => $data['availability'],
                    'sizing' => json_encode($data['sizing']), // Explicitly encode
                ]
            );
        }
    }
}