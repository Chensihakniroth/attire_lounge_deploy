<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_products', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique()->nullable();
            $table->string('barcode')->nullable(); // reserved for future scanner
            $table->string('name');
            $table->string('variant')->nullable(); // e.g. "-XL", "-BEIGE -32"
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('stock_qty')->default(0);
            $table->integer('min_stock')->default(0);
            $table->string('category')->nullable(); // JACKET, SHIRT, SERVICE, etc.
            $table->enum('tier', ['Standard', 'Premium', 'Designer'])->default('Standard');
            $table->boolean('is_service')->default(false);
            $table->boolean('is_accessory')->default(false); // eligible for gift wrap toggle
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category');
            $table->index('is_service');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_products');
    }
};
