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
        // Now use the same source file to pull Kravat-specific data
        $jsonPath = storage_path('pos_products.json');

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

        $kravatCategories = [
            'Tequila & Mezcal', '1800s', 'SECRET MENUS', 'Samai International Rum Day', 'Gin', 
            'Liqueur and Other', 'Vodka', 'CLASSICS', 'SPARKLING FEELING', 'Campari Red Hands', 
            'Whisky', 'Rum', 'BEER', 'SIGNATURES', 'OLD MENU 1.0', 'WINE', 'Brandy', 
            'Rare Spirit', 'Bottle', 'Events', 'KRAVAT 2.0', 'WOMAN TAKEOVER', 
            'Nikka Sora Takeover', 'Christmas 24', 'MARTINI LOVER', 'JUICE', 'SOFT DRINKS', 'CUSTOMIZE', 'unknown',
            'SPECIAL', 'SNACK', 'SNACKS'
        ];

        // Filter and map to kravat
        $kravatProducts = [];
        $seenSkus = [];

        foreach ($products as $item) {
            $category = $item['category'] ?? 'unknown';
            $sku = $item['sku'] ?? null;
            
            if (!$sku || in_array($sku, $seenSkus)) {
                continue; // Skip without SKU or already processed
            }

            if (in_array($category, $kravatCategories)) {
                $item['outlet'] = 'kravat';
                $kravatProducts[] = $item;
                $seenSkus[] = $sku;
            }
        }

        $this->command->info("Importing " . count($kravatProducts) . " products for kravat outlet...");

        $now = now()->toDateTimeString();
        $kravatProducts = array_map(fn($p) => array_merge($p, [
            'created_at' => $p['created_at'] ?? $now,
            'updated_at' => $p['updated_at'] ?? $now,
        ]), $kravatProducts);

        // Delete existing kravat products to avoid SKU conflicts during upsert
        DB::table('pos_products')->where('outlet', 'kravat')->delete();

        $chunks = array_chunk($kravatProducts, 100);
        foreach ($chunks as $i => $chunk) {
            DB::table('pos_products')->upsert(
                $chunk,
                ['outlet', 'sku'], // Composite unique: outlet + sku
                ['name', 'variant', 'price', 'stock_qty', 'min_stock', 'category', 'tier', 'is_service', 'is_accessory', 'is_active', 'image_path', 'updated_at']
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
