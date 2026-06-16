<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NileCategorySeeder extends Seeder
{
    /**
     * Style code → style group name mapping.
     * Derived from 6331.Product List.20260615.xlsx
     *
     * Format: 'STYLE_CODE' => 'GROUP_NAME'
     * Style code = the 4-char prefix before the size dash (e.g. K001, S015)
     */
    private const STYLE_GROUPS = [
        // K Code — Standard Leather
        'K001' => 'HORSE-BIT',
        'K002' => 'HORSE-BIT',
        'K003' => 'TASSEL',
        'K004' => 'HORSE-BIT PEBBLE',
        'K005' => 'PENNY',
        'K006' => 'PLAIN',
        'K007' => 'PLAIN',
        'K008' => 'PENNY SUEDE',
        'K009' => 'PENNY SUEDE',
        'K010' => 'PENNY SUEDE',
        'K011' => 'PENNY',
        'K012' => 'DOUBLE MONK STRAP',
        'K013' => 'SPLIT SEAM SLIPPERS',

        // L Code — Textured Leather
        'L001' => 'HORSE-BIT TEXTURE',
        'L002' => 'HORSE-BIT',

        // S Code — Premium Full Grain Leather
        'S001' => 'CROSS-BUCKLE',
        'S002' => 'CROSS-BUCKLE',
        'S003' => 'PENNY',
        'S004' => 'PENNY',
        'S005' => 'PENNY',
        'S006' => 'PENNY CROC EMBOSSED',
        'S007' => 'TASSEL',
        'S008' => 'TASSEL',
        'S009' => 'HORSE-BIT',
        'S010' => 'HORSE-BIT',
        'S011' => 'PENNY SUEDE',
        'S012' => 'HORSE-BIT PEBBLE',
        'S013' => 'HORSE-BIT SUEDE',
        'S014' => 'SINGLE STRAP',
        'S015' => 'OPERA PUMP',
    ];

    public function run(): void
    {
        $this->command->info('Updating Nile product categories by style group...');

        $updated = 0;
        $skipped = 0;

        foreach (self::STYLE_GROUPS as $styleCode => $groupName) {
            // Extract the prefix letter + 3-digit code (e.g. K001, S015)
            // SKU format: K001-001 → style code = K001
            $affected = DB::table('pos_products')
                ->where('outlet', 'nile')
                ->where('sku', 'LIKE', "{$styleCode}-%")
                ->update(['category' => $groupName]);

            if ($affected > 0) {
                $this->command->line("  {$styleCode} → {$groupName} ({$affected} SKUs)");
                $updated += $affected;
            } else {
                $this->command->line("  {$styleCode} → {$groupName} (no SKUs found, skipped)");
                $skipped++;
            }
        }

        $this->command->info("✅ Done! {$updated} products updated, {$skipped} style codes with no matches.");

        // Show final category breakdown
        $this->command->info("\nCategory breakdown:");
        $categories = DB::table('pos_products')
            ->where('outlet', 'nile')
            ->select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        foreach ($categories as $cat) {
            $this->command->line("  {$cat->category}: {$cat->total} SKUs");
        }
    }
}
