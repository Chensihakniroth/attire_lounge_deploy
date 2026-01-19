<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2);
            $table->json('images')->nullable(); // Store multiple image URLs as JSON
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('collection_id')->nullable()->constrained('collections')->onDelete('set null');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new')->default(false);
            $table->string('availability')->default('In Stock');
            $table->json('sizing')->nullable(); // Store available sizes as JSON
            $table->timestamps();
            $table->softDeletes();

            // Regular indexes - NO fulltext
            $table->index(['is_featured', 'is_new']); // Updated indexes
            $table->index('availability');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
