<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * WooCommerce orders can carry an order-level tax amount that was previously
     * validated but never persisted. This column lets the full price "recipe"
     * (subtotal, discount, tax, total) be stored and surfaced in notifications.
     */
    public function up(): void
    {
        Schema::table('pos_invoices', function (Blueprint $table) {
            $table->decimal('tax', 10, 2)->default(0)->after('grand_total');
        });
    }

    public function down(): void
    {
        Schema::table('pos_invoices', function (Blueprint $table) {
            $table->dropColumn('tax');
        });
    }
};
