<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('pos_invoices')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('pos_products')->nullOnDelete();

            // Snapshots at time of sale (in case product changes later)
            $table->string('product_name');
            $table->string('product_variant')->nullable();
            $table->string('product_sku')->nullable();
            $table->boolean('is_service')->default(false); // snapshot

            // Quantities & pricing
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->enum('discount_type', ['none', 'amount', 'percent'])->default('none');
            $table->decimal('discount_value', 10, 2)->default(0);  // raw input value
            $table->decimal('discount_amount', 10, 2)->default(0); // computed $ amount
            $table->boolean('gift_wrap')->default(false); // only for accessories

            // Computed line total (after item discount, before tier/promo)
            $table->decimal('line_total', 10, 2);

            $table->timestamps();

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_invoice_items');
    }
};
