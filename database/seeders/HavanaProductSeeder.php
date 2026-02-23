<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class HavanaProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Find the Havana Collection
        $havanaCollection = Collection::where('slug', 'havana-collection')->first();

        if (!$havanaCollection) {
            $this->command->info('Havana Collection not found. Please ensure CollectionSeeder has been run.');
            return;
        }

        // Find or create a category for Havana products
        $havanaCategory = Category::firstOrCreate(
            ['slug' => 'casual-wear'],
            [
                'name' => 'Casual Wear',
                'description' => 'Light and comfortable attire for everyday elegance.',
            ]
        );

        // Delete existing 'hvn' products to ensure a clean slate
        $slugsToDelete = [];
        for ($i = 1; $i <= 8; $i++) {
            $slugsToDelete[] = 'hvn' . $i;
        }
        DB::table('products')->whereIn('slug', $slugsToDelete)->delete();

        // Create Havana products from hvn1 to hvn8
        for ($i = 1; $i <= 8; $i++) {
            $slug = 'hvn' . $i;
            Product::create(
                [
                    'slug' => $slug,
                    'name' => 'Havana Product ' . $i,
                    'description' => 'A breezy and stylish piece perfect for warm evenings.',
                    'price' => 149.99,
                    'category_id' => $havanaCategory->id,
                    'collection_id' => $havanaCollection->id,
                    'is_featured' => true,
                    'is_new' => true,
                    'availability' => 'In Stock',
                    'sizing' => json_encode(['XS', 'S', 'M', 'L']),
                ]
            );
        }

        $this->command->info('Havana products seeded successfully!');
    }
}
