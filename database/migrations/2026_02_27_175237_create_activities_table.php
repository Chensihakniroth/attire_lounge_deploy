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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // Who performed the action
            $table->string('action'); // e.g., 'created', 'updated', 'deleted', 'logged_in'
            $table->morphs('model'); // Polymorphic relation for what model was affected
            $table->json('changes')->nullable(); // Store differences for 'updated' actions
            $table->text('details')->nullable(); // Additional context
            $table->ipAddress('ip_address')->nullable(); // IP address of the actor
            $table->text('user_agent')->nullable(); // User agent string
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
