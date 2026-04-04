<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class NormalizeNomenclature extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:normalize-nomenclature';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $products = \App\Models\PosProduct::whereNull('variant')
            ->orWhere('variant', '')
            ->get();

        $this->info("Scanning " . $products->count() . " products for nomenclature normalization...");
        $count = 0;

        foreach ($products as $product) {
            // Check for the " - " pattern
            if (strpos($product->name, ' - ') !== false) {
                // Find the LAST occurrence of " - " to support names like "HR - GROOM"
                $lastPos = strrpos($product->name, ' - ');
                
                $newName = trim(substr($product->name, 0, $lastPos));
                $newVariant = '-' . trim(substr($product->name, $lastPos + 3));

                $this->line("Fixing [ID: {$product->id}]: '{$product->name}' -> Name: '{$newName}' | Variant: '{$newVariant}'");
                
                $product->update([
                    'name' => $newName,
                    'variant' => $newVariant
                ]);
                $count++;
            }
        }

        $this->info("Successfully normalized {$count} product identities! *(•̀ᴗ•́)و*");
    }
}
