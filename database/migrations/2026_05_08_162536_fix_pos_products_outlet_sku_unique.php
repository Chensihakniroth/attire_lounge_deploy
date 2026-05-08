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
        Schema::table('pos_products', function (Blueprint $table) {
            // Drop the global SKU unique constraint
            $table->dropUnique(['sku']);
            // Add composite unique: each SKU can exist once per outlet
            $table->unique(['outlet', 'sku']);
        });
     }

     /**
      * Reverse the migrations.
      */
     public function down(): void
     {
         Schema::table('pos_products', function (Blueprint $table) {
             $table->dropUnique(['outlet', 'sku']);
             $table->unique(['sku']);
         });
     }
 };
