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
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('client_status');
            $table->string('name');
            $table->string('nationality')->nullable();
            $table->string('phone')->nullable();
            $table->string('host')->nullable();
            $table->string('assistant')->nullable();
            $table->string('how_did_they_find_us')->nullable();
            $table->string('shirt_size')->nullable();
            $table->string('jacket_size')->nullable();
            $table->string('pants_size')->nullable();
            $table->string('shoes_size')->nullable();
            $table->string('preferred_color')->nullable();
            $table->text('color_notes')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_profiles');
    }
};
