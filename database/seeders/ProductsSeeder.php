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
            // Groom Collection Products
            [
                'name' => 'Classic Wedding Suit',
                'slug' => 'classic-wedding-suit',
                'description' => 'An elegant suit perfect for your special day.',
                'price' => 1200.00,
                'compare_price' => 1500.00,
                'category' => 'Suits',
                'collection' => 'Groom Collection',
                'featured' => true,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/g1.jpg', 'uploads/collections/default/g2.jpg']),
                'sizes' => json_encode(['40R', '42R', '44R']),
                'colors' => json_encode(['Black', 'Navy']),
                'fabric' => 'Premium Wool',
                'fit' => 'Tailored Fit',
            ],
            [
                'name' => 'Reception Tuxedo',
                'slug' => 'reception-tuxedo',
                'description' => 'Stylish tuxedo for evening receptions.',
                'price' => 950.00,
                'compare_price' => null,
                'category' => 'Suits',
                'collection' => 'Groom Collection',
                'featured' => false,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/g3.jpg', 'uploads/collections/default/g4.jpg']),
                'sizes' => json_encode(['38R', '40R', '42R']),
                'colors' => json_encode(['Midnight Blue']),
                'fabric' => 'Silk Blend',
                'fit' => 'Slim Fit',
            ],

            // Havana Collection Products
            [
                'name' => 'Havana Linen Shirt',
                'slug' => 'havana-linen-shirt',
                'description' => 'Lightweight linen shirt for a relaxed, stylish look.',
                'price' => 85.00,
                'compare_price' => 110.00,
                'category' => 'Shirts',
                'collection' => 'Havana Collection',
                'featured' => true,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/hvn1.jpg', 'uploads/collections/default/hvn2.jpg']),
                'sizes' => json_encode(['S', 'M', 'L', 'XL']),
                'colors' => json_encode(['White', 'Sky Blue']),
                'fabric' => 'Linen',
                'fit' => 'Regular Fit',
            ],
            [
                'name' => 'Havana Cotton Trousers',
                'slug' => 'havana-cotton-trousers',
                'description' => 'Comfortable and breathable cotton trousers.',
                'price' => 120.00,
                'compare_price' => null,
                'category' => 'Outerwear',
                'collection' => 'Havana Collection',
                'featured' => false,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/hvn3.jpg', 'uploads/collections/default/hvn4.jpg']),
                'sizes' => json_encode(['30', '32', '34', '36']),
                'colors' => json_encode(['Khaki', 'Stone']),
                'fabric' => 'Cotton',
                'fit' => 'Relaxed Fit',
            ],

            // Mocha Mousse Collection Products
            [
                'name' => 'Mocha Mousse Blazer',
                'slug' => 'mocha-mousse-blazer',
                'description' => 'Sophisticated blazer with a modern cut.',
                'price' => 350.00,
                'compare_price' => 450.00,
                'category' => 'Outerwear',
                'collection' => "Mocha Mousse '25",
                'featured' => true,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/mm1.jpg', 'uploads/collections/default/mm2.jpg']),
                'sizes' => json_encode(['48', '50', '52']),
                'colors' => json_encode(['Mocha', 'Dark Grey']),
                'fabric' => 'Wool Blend',
                'fit' => 'Slim Fit',
            ],
            [
                'name' => 'Mocha Mousse Dress Shirt',
                'slug' => 'mocha-mousse-dress-shirt',
                'description' => 'Crisp dress shirt, ideal for business or casual wear.',
                'price' => 90.00,
                'compare_price' => null,
                'category' => 'Shirts',
                'collection' => "Mocha Mousse '25",
                'featured' => false,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/mm3.jpg', 'uploads/collections/default/mm4.jpg']),
                'sizes' => json_encode(['S', 'M', 'L']),
                'colors' => json_encode(['Cream', 'Light Brown']),
                'fabric' => 'Egyptian Cotton',
                'fit' => 'Classic Fit',
            ],

            // Office Collection Products
            [
                'name' => 'Office Professional Trousers',
                'slug' => 'office-professional-trousers',
                'description' => 'Smart and comfortable trousers for the office.',
                'price' => 150.00,
                'compare_price' => null,
                'category' => 'Outerwear',
                'collection' => 'Office Collection',
                'featured' => true,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/of1.jpg', 'uploads/collections/default/of2.jpg']),
                'sizes' => json_encode(['30', '32', '34', '36']),
                'colors' => json_encode(['Grey', 'Navy']),
                'fabric' => 'Gabardine',
                'fit' => 'Straight Fit',
            ],
            [
                'name' => 'Office Silk Tie',
                'slug' => 'office-silk-tie',
                'description' => 'A luxurious silk tie to complete your professional attire.',
                'price' => 60.00,
                'compare_price' => null,
                'category' => 'Accessories',
                'collection' => 'Office Collection',
                'featured' => false,
                'in_stock' => true,
                'images' => json_encode(['uploads/collections/default/of3.jpg']),
                'sizes' => json_encode(['One Size']),
                'colors' => json_encode(['Burgundy', 'Forest Green']),
                'fabric' => 'Silk',
                'fit' => 'Standard',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
