<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PosProductSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = storage_path('pos_products.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("JSON file not found: {$jsonPath}");
            return;
        }

        $this->command->info('Loading product data from JSON...');
        $products = json_decode(file_get_contents($jsonPath), true);

        if (!$products) {
            $this->command->error('Failed to parse JSON file.');
            return;
        }

        $this->command->info("Importing " . count($products) . " products...");

        $now = now()->toDateTimeString();
        $products = array_map(fn($p) => array_merge($p, [
            'created_at' => $now,
            'updated_at' => $now,
        ]), $products);

        $chunks = array_chunk($products, 200);
        foreach ($chunks as $i => $chunk) {
            DB::table('pos_products')->insert($chunk);
            $this->command->info('  Chunk ' . ($i + 1) . ' / ' . count($chunks) . ' inserted');
        }

        $this->command->info('✅ Done! ' . count($products) . ' POS products imported.');

        $this->command->info("\nCategory breakdown:");
        $categories = DB::table('pos_products')
            ->select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        foreach ($categories as $cat) {
            $this->command->line("  {$cat->category}: {$cat->total}");
        }
    }
}
