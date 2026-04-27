<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add 'outlet' column to all POS-related tables for multi-outlet support.
     * Valid outlets: attire_lounge, caffeine, kravat
     * Default: attire_lounge (preserves all existing data as Attire Lounge)
     */
    public function up(): void
    {
        $tables = [
            'pos_products',
            'pos_invoices',
            'pos_invoice_items',
            'pos_payments',
            'pos_refunds',
            'sales_targets',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('outlet', 32)
                  ->default('attire_lounge')
                  ->after('id')
                  ->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'pos_products',
            'pos_invoices',
            'pos_invoice_items',
            'pos_payments',
            'pos_refunds',
            'sales_targets',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('outlet');
            });
        }
    }
};
