<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NileProductSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = storage_path('nile_products.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("JSON file not found: {$jsonPath}");
            $this->command->line("Run the Excel-to-JSON script first to generate storage/nile_products.json");
            return;
        }

        $this->command->info('Loading Nile product data from JSON...');
        $products = json_decode(file_get_contents($jsonPath), true);

        if (!$products) {
            $this->command->error('Failed to parse JSON file.');
            return;
        }

        $this->command->info('Importing ' . count($products) . ' Nile products...');

        $now = now()->toDateTimeString();
        $products = array_map(fn($p) => array_merge($p, [
            'tier'       => 'Standard',
            'min_stock'  => 0,
            'image_path' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]), $products);

        // Delete existing Nile products first to avoid stale data
        DB::table('pos_products')
            ->where('outlet', 'nile')
            ->delete();

        $chunks = array_chunk($products, 200);
        foreach ($chunks as $i => $chunk) {
            DB::table('pos_products')->insert($chunk);
            $this->command->info('  Chunk ' . ($i + 1) . ' / ' . count($chunks) . ' inserted');
        }

        $this->command->info('✅ Done! ' . count($products) . ' Nile products imported.');

        $this->command->info("\nStyle breakdown:");
        $styles = DB::table('pos_products')
            ->where('outlet', 'nile')
            ->select(DB::raw("SUBSTRING_INDEX(sku, '-', 1) as style_code"), DB::raw('count(*) as total'))
            ->groupBy('style_code')
            ->orderBy('style_code')
            ->get();

        foreach ($styles as $s) {
            $this->command->line("  {$s->style_code}: {$s->total} SKUs");
        }
    }
}
