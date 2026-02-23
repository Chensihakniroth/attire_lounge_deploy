<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Product; // Import the Product model

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing product slugs
        Product::where('slug', 'classic-wedding-suit')->update(['slug' => 'g1']);
        Product::where('slug', 'reception-tuxedo')->update(['slug' => 'g3']);
        Product::where('slug', 'havana-linen-shirt')->update(['slug' => 'hvn0']);
        Product::where('slug', 'havana-cotton-trousers')->update(['slug' => 'hvn3']);
        Product::where('slug', 'mocha-mousse-blazer')->update(['slug' => 'mm1']);
        Product::where('slug', 'mocha-mousse-dress-shirt')->update(['slug' => 'mm3']);
        Product::where('slug', 'office-professional-trousers')->update(['slug' => 'of1']);
        Product::where('slug', 'office-silk-tie')->update(['slug' => 'of3']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert slugs if needed for rollback, though this might not be perfect
        Product::where('slug', 'g1')->update(['slug' => 'classic-wedding-suit']);
        Product::where('slug', 'g3')->update(['slug' => 'reception-tuxedo']);
        Product::where('slug', 'hvn0')->update(['slug' => 'havana-linen-shirt']);
        Product::where('slug', 'hvn3')->update(['slug' => 'havana-cotton-trousers']);
        Product::where('slug', 'mm1')->update(['slug' => 'mocha-mousse-blazer']);
        Product::where('slug', 'mm3')->update(['slug' => 'mocha-mousse-dress-shirt']);
        Product::where('slug', 'of1')->update(['slug' => 'office-professional-trousers']);
        Product::where('slug', 'of3')->update(['slug' => 'office-silk-tie']);
    }
};
