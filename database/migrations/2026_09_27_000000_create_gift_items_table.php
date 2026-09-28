<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Gift item catalog. Replaces the hardcoded resources/js/data/giftOptions.js
     * so items can be added/edited from the admin Inventory Manager.
     *
     * `item_id` is the stable slug used by the storefront and by the
     * gift_item_stocks.item_id stock-toggle table — never reuse it.
     */
    public function up(): void
    {
        Schema::create('gift_items', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('item_id')->unique();
            $blueprint->string('name');
            $blueprint->string('category')->index(); // ties | pocket_squares | boxes
            $blueprint->string('color')->nullable();
            $blueprint->decimal('price', 10, 2)->default(0);
            $blueprint->string('image')->nullable();
            $blueprint->boolean('is_active')->default(true)->index();
            $blueprint->unsignedInteger('sort_order')->default(0);
            $blueprint->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_items');
    }
};
