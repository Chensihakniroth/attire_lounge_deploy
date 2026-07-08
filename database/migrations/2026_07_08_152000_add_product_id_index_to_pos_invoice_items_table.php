<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add product_id index to pos_invoice_items for faster category breakdown queries.
     * The SalesService joins pos_invoice_items.product_id -> pos_products.id for
     * category aggregation — without this index, MySQL scans all rows.
     */
    public function up(): void
    {
        Schema::table('pos_invoice_items', function (Blueprint $table) {
            $table->index('product_id', 'idx_pos_invoice_items_product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pos_invoice_items', function (Blueprint $table) {
            $table->dropIndex('idx_pos_invoice_items_product_id');
        });
    }
};
