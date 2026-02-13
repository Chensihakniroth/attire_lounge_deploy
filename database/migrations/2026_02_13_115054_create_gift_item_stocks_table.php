<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gift_item_stocks', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->string('item_id')->unique();
            $blueprint->boolean('is_out_of_stock')->default(false);
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gift_item_stocks');
    }
};
