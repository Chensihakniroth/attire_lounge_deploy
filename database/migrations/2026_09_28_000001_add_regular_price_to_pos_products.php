<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_products', function (Blueprint $table) {
            $table->decimal('regular_price', 10, 2)->nullable()->after('price');
        });

        // Backfill: existing rows have never been on a promo, so their current
        // price IS their regular price until the WooCommerce sync says otherwise.
        DB::table('pos_products')->whereNull('regular_price')->update([
            'regular_price' => DB::raw('price'),
        ]);
    }

    public function down(): void
    {
        Schema::table('pos_products', function (Blueprint $table) {
            $table->dropColumn('regular_price');
        });
    }
};
