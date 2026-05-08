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

        // Filter only caffeine/drink manager products
        $drinkProducts = array_filter($products, function ($item) {
            return isset($item['outlet']) && $item['outlet'] === 'caffeine';
        });

        $this->command->info("Importing " . count($drinkProducts) . " drink products for caffeine outlet...");

        $now = now()->toDateTimeString();
        $drinkProducts = array_map(fn($p) => array_merge($p, [
            'created_at' => $p['created_at'] ?? $now,
            'updated_at' => $p['updated_at'] ?? $now,
        ]), $drinkProducts);

        $chunks = array_chunk($drinkProducts, 100);
        foreach ($chunks as $i => $chunk) {
            DB::table('pos_products')->upsert(
                $chunk,
                ['outlet', 'sku'], // Composite unique: outlet + sku
                ['name', 'variant', 'price', 'stock_qty', 'min_stock', 'category', 'tier', 'is_service', 'is_accessory', 'is_active', 'image_path', 'updated_at']
            );
            $this->command->info('  Chunk ' . ($i + 1) . ' / ' . count($chunks) . ' upserted');
        }

        $this->command->info('✅ Done! ' . count($drinkProducts) . ' Drink Manager products imported.');

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
