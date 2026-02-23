<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class MochaMousseProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Find the Mocha Mousse '25 Collection
        $mochaMousseCollection = Collection::where('slug', 'mocha-mousse-25')->first();

        if (!$mochaMousseCollection) {
            $this->command->info("Mocha Mousse '25 Collection not found. Please ensure CollectionSeeder has been run.");
            return;
        }

        // Find or create a category for Mocha Mousse products
        $everydayCategory = Category::firstOrCreate(
            ['slug' => 'everyday-wear'],
            [
                'name' => 'Everyday Wear',
                'description' => 'Comfortable and stylish for daily use.',
            ]
        );

        // Delete existing 'mm' products to ensure a clean slate
        $slugsToDelete = [];
        for ($i = 1; $i <= 7; $i++) {
            $slugsToDelete[] = 'mm' . $i;
        }
        DB::table('products')->whereIn('slug', $slugsToDelete)->delete();

        // Create Mocha Mousse products from mm1 to mm7
        for ($i = 1; $i <= 7; $i++) {
            $slug = 'mm' . $i;
            Product::create(
                [
                    'slug' => $slug,
                    'name' => 'Mocha Mousse Product ' . $i,
                    'description' => 'A soft and breathable garment, perfect for sophisticated comfort.',
                    'price' => 249.99,
                    'category_id' => $everydayCategory->id,
                    'collection_id' => $mochaMousseCollection->id,
                    'is_featured' => true,
                    'is_new' => true,
                    'availability' => 'In Stock',
                    'sizing' => json_encode(['XS', 'S', 'M', 'L', 'XL']),
                ]
            );
        }

        $this->command->info('Mocha Mousse products seeded successfully!');
    }
}
