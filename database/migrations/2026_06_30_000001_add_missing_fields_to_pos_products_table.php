<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_products', function (Blueprint $table) {
            $table->string('status', 20)->default('available')->after('is_active');
            $table->integer('max_stock')->nullable()->after('min_stock');
            $table->boolean('watch_threshold')->default(false)->after('max_stock');
            $table->json('attributes')->nullable()->after('variant');
        });
    }

    public function down(): void
    {
        Schema::table('pos_products', function (Blueprint $table) {
            $table->dropColumn(['status', 'max_stock', 'watch_threshold', 'attributes']);
        });
    }
};
