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
        Schema::create('railway_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('original_name');
            $table->string('s3_key');
            $table->string('public_url');
            $table->string('file_type');
            $table->integer('file_size');
            $table->string('bucket_name');
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('railway_uploads');
    }
};
