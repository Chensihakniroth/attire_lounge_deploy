<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Collection;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class GroomProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Define the correct slug for the Groom collection
        $correctCollectionSlug = 'groom-collections';

        // Step 1: Clean up any duplicate slugs that are not ID 1
        // Delete any existing collection with slug 'groom' or 'groom-collection' or 'groom-collections' that is *not* ID 1
        DB::table('collections')->whereIn('slug', ['groom', 'groom-collection', $correctCollectionSlug])->where('id', '!=', 1)->delete();

        // Step 2: Ensure the 'Groom Collections' has ID 1 and the correct slug
        $groomCollection = Collection::find(1);

        if ($groomCollection) {
            // If collection with ID 1 exists, update it to be 'Groom Collections' with the correct slug
            $groomCollection->update([
                'name' => 'Groom Collections',
                'slug' => $correctCollectionSlug, // Use the correct slug here
                'description' => 'A collection for the modern groom.',
                'season' => 'All',
                'year' => 2026,
                'is_active' => true,
            ]);
        } else {
            // If no collection with ID 1 exists, create it as 'Groom Collections' with explicit ID and correct slug
            DB::table('collections')->insert([
                'id' => 1,
                'name' => 'Groom Collections',
                'slug' => $correctCollectionSlug, // Use the correct slug here
                'description' => 'A collection for the modern groom.',
                'season' => 'All',
                'year' => 2026,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $groomCollection = Collection::find(1); // Retrieve the newly created collection
        }

        // Find or create a category
        $groomCategory = Category::firstOrCreate(
            ['slug' => 'groom-wear'],
            [
                'name' => 'Groom Wear',
                'description' => 'Clothing for grooms.',
            ]
        );

        // Delete existing 'g' products to ensure a clean slate
        DB::table('products')->whereIn('slug', ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11'])->delete();

        // Create 'Groom' products from g1 to g11
        for ($i = 1; $i <= 11; $i++) {
            $slug = 'g' . $i;
            Product::create(
                [
                    'slug' => $slug,
                    'name' => 'Groom Product ' . $i,
                    'description' => 'A timeless black tuxedo for the discerning groom.',
                    'price' => 599.99,
                    'category_id' => $groomCategory->id,
                    'collection_id' => $groomCollection->id, // This will now always be 1
                    'is_featured' => true,
                    'is_new' => true,
                    'availability' => 'In Stock',
                    'sizing' => json_encode(['S', 'M', 'L', 'XL']),
                ]
            );
        }
    }
}
