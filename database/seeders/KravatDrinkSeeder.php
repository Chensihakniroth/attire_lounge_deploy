<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KravatDrinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $jsonPath = storage_path('kravat_products.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("JSON file not found: {$jsonPath}");
            return;
        }

        $this->command->info('Loading kravat products from JSON...');
        $products = json_decode(file_get_contents($jsonPath), true);

        if (!$products) {
            $this->command->error('Failed to parse JSON file.');
            return;
        }

        // Filter only kravat products
        $kravatProducts = array_filter($products, function ($item) {
            return isset($item['outlet']) && $item['outlet'] === 'kravat';
        });

        $this->command->info("Importing " . count($kravatProducts) . " products for kravat outlet...");

        $now = now()->toDateTimeString();
        $kravatProducts = array_map(fn($p) => array_merge($p, [
            'created_at' => $p['created_at'] ?? $now,
            'updated_at' => $p['updated_at'] ?? $now,
        ]), $kravatProducts);

        $chunks = array_chunk($kravatProducts, 100);
        foreach ($chunks as $i => $chunk) {
            DB::table('pos_products')->upsert(
                $chunk,
                ['sku'], // Unique key
                ['name', 'variant', 'price', 'stock_qty', 'min_stock', 'category', 'tier', 'is_service', 'is_accessory', 'is_active', 'outlet', 'image_path', 'updated_at']
            );
            $this->command->info('  Chunk ' . ($i + 1) . ' / ' . count($chunks) . ' upserted');
        }

        $this->command->info('✅ Done! ' . count($kravatProducts) . ' Kravat products imported.');

        $this->command->info("\nKravat Category breakdown:");
        $categories = DB::table('pos_products')
            ->where('outlet', 'kravat')
            ->select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        foreach ($categories as $cat) {
            $this->command->line("  {$cat->category}: {$cat->total}");
        }
    }
}
