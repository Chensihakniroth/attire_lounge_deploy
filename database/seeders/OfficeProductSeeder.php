<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class OfficeProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Find the Office Collections
        $officeCollection = Collection::where('slug', 'office-collections')->first();

        if (!$officeCollection) {
            $this->command->info('Office Collections not found. Please ensure CollectionSeeder has been run.');
            return;
        }

        // Find or create a category for Office products
        $formalCategory = Category::firstOrCreate(
            ['slug' => 'formal-wear'],
            [
                'name' => 'Formal Wear',
                'description' => 'Elegant and professional attire for the office.',
            ]
        );

        // Delete existing 'of' products to ensure a clean slate
        $slugsToDelete = [];
        for ($i = 1; $i <= 5; $i++) {
            $slugsToDelete[] = 'of' . $i;
        }
        DB::table('products')->whereIn('slug', $slugsToDelete)->delete();

        // Create Office products from of1 to of5
        for ($i = 1; $i <= 5; $i++) {
            $slug = 'of' . $i;
            Product::create(
                [
                    'slug' => $slug,
                    'name' => 'Office Product ' . $i,
                    'description' => 'A sharp and modern piece designed for the professional environment.',
                    'price' => 399.99,
                    'category_id' => $formalCategory->id,
                    'collection_id' => $officeCollection->id,
                    'is_featured' => true,
                    'is_new' => true,
                    'availability' => 'In Stock',
                    'sizing' => json_encode(['S', 'M', 'L']),
                ]
            );
        }

        $this->command->info('Office products seeded successfully!');
    }
}
