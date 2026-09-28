<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nile_sync_runs', function (Blueprint $table) {
            $table->id();
            $table->string('job', 32);              // prices | stock
            $table->string('outlet', 32)->default('nile');
            $table->string('status', 16);            // success | error | skipped
            $table->string('direction', 32);         // wp_to_pos | pos_to_wp
            $table->unsignedInteger('matched')->default(0);
            $table->unsignedInteger('changed')->default(0);
            $table->unsignedInteger('unchanged')->default(0);
            $table->unsignedInteger('not_on_store')->default(0);
            $table->unsignedInteger('errors')->default(0);
            $table->unsignedInteger('duration_ms')->nullable();
            $table->text('message')->nullable();
            $table->json('details')->nullable();     // per-change lines from the run
            $table->timestamps();

            $table->index(['job', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nile_sync_runs');
    }
};
