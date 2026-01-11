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
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('service')->after('phone'); // Add this line
            $table->date('date')->after('service');    // Add this line
            $table->string('time')->after('date');     // Add this line

            // Optionally rename appointment_type to service if they're the same
            // $table->renameColumn('appointment_type', 'service');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['service', 'date', 'time']);
        });
    }
};
