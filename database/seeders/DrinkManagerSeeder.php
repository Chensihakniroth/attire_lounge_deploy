<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DrinkManagerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $jsonPath = storage_path('pos_products.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("JSON file not found: {$jsonPath}");
            return;
        }

        $this->command->info('Loading drink manager data from JSON...');
        $products = json_decode(file_get_contents($jsonPath), true);

        if (!$products) {
            $this->command->error('Failed to parse JSON file.');
            return;
        }

        $caffeineCategories = [
            'BAKERY', 'KNY', 'BOOKMARK', 'MONTHLY DRINK', 'MOOD REFRESHERS', 
            'Book', 'COLD', 'FRAPPE', 'GRAB', 'HOT', 'TOPPINGS', 'SET', 'LIBRARY MEMBERSHIP', 
            'KEYCHAIN', 'BOOK FOR SALE'
        ];

        // Filter and map to caffeine
        $caffeineProducts = [];
        $seenSkus = [];

        foreach ($products as $item) {
            $category = $item['category'] ?? 'unknown';
            $sku = $item['sku'] ?? null;
            
            if (!$sku || in_array($sku, $seenSkus)) {
                continue; // Skip without SKU or already processed
            }

            if (in_array($category, $caffeineCategories)) {
                $item['outlet'] = 'caffeine';
                $caffeineProducts[] = $item;
                $seenSkus[] = $sku;
            }
        }

        $this->command->info("Importing " . count($caffeineProducts) . " drink products for caffeine outlet...");

        $now = now()->toDateTimeString();
        $caffeineProducts = array_map(fn($p) => array_merge($p, [
            'created_at' => $p['created_at'] ?? $now,
            'updated_at' => $p['updated_at'] ?? $now,
        ]), $caffeineProducts);

        // Delete existing caffeine products to avoid SKU conflicts during upsert
        DB::table('pos_products')->where('outlet', 'caffeine')->delete();

        $chunks = array_chunk($caffeineProducts, 100);
        foreach ($chunks as $i => $chunk) {
            DB::table('pos_products')->upsert(
                $chunk,
                ['outlet', 'sku'], // Composite unique: outlet + sku
                ['name', 'variant', 'price', 'stock_qty', 'min_stock', 'category', 'tier', 'is_service', 'is_accessory', 'is_active', 'image_path', 'updated_at']
            );
            $this->command->info('  Chunk ' . ($i + 1) . ' / ' . count($chunks) . ' upserted');
        }

        $this->command->info('✅ Done! ' . count($caffeineProducts) . ' Drink Manager products imported.');

        $this->command->info("\nDrink Manager Category breakdown:");
        $categories = DB::table('pos_products')
            ->where('outlet', 'caffeine')
            ->select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        foreach ($categories as $cat) {
            $this->command->line("  {$cat->category}: {$cat->total}");
        }
    }
}
