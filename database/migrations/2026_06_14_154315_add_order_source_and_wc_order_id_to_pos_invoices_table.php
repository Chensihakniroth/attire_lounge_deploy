<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_invoices', function (Blueprint $table) {
            $table->string('order_source', 32)->default('pos')->after('outlet');
            $table->unsignedBigInteger('wc_order_id')->nullable()->after('order_source');
            $table->string('currency', 3)->default('USD')->after('grand_total');

            $table->index('wc_order_id');
            $table->index('order_source');
        });
    }

    public function down(): void
    {
        Schema::table('pos_invoices', function (Blueprint $table) {
            $table->dropColumn(['order_source', 'wc_order_id', 'currency']);
        });
    }
};
