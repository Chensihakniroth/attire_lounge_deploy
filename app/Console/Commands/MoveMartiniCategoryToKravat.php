<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MoveMartiniCategoryToKravat extends Command
{
    protected $signature = 'categories:move-martini';
    protected $description = 'Move MARTINI LOVER category from caffeine to kravat outlet';

    public function handle(): int
    {
        $count = DB::table('pos_products')
            ->where('category', 'MARTINI LOVER')
            ->update(['outlet' => 'kravat']);

        $this->info("✅ Updated {$count} products: MARTINI LOVER category moved from caffeine → kravat");
        return 0;
    }
}
