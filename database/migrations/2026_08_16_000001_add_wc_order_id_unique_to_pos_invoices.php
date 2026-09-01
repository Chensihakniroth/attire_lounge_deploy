<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a UNIQUE index on pos_invoices.wc_order_id.
     *
     * Both MySQL and PostgreSQL allow multiple NULLs in a unique index, and POS
     * invoices always leave wc_order_id NULL — only WooCommerce-imported orders
     * have a value. This closes the race where two concurrent webhook
     * deliveries of the same order could both pass the "duplicate?" check.
     */
    public function up(): void
    {
        // Refuse to build the index while duplicate values already exist,
        // otherwise the migration silently fails or corrupts integrity.
        // Use a GROUP BY on the actual key column only so the query remains valid
        // under MySQL's ONLY_FULL_GROUP_BY strict mode.
        $duplicateIds = DB::table('pos_invoices')
            ->whereNotNull('wc_order_id')
            ->select('wc_order_id')
            ->groupBy('wc_order_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('wc_order_id');

        if ($duplicateIds->isNotEmpty()) {
            throw new RuntimeException(
                "Cannot create unique index on pos_invoices.wc_order_id: " .
                "{$duplicateIds->count()} duplicate wc_order_id value(s) exist. " .
                "Deduplicate these rows before running this migration."
            );
        }

        Schema::table('pos_invoices', function ($table) {
            $table->unique('wc_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('pos_invoices', function ($table) {
            $table->dropUnique('pos_invoices_wc_order_id_unique');
        });
    }
};
