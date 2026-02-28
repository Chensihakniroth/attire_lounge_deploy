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
            // Restore 'date' if it was dropped
            if (!Schema::hasColumn('appointments', 'date')) {
                $table->date('date')->after('service')->nullable();
            }

            // Restore 'appointment_type' if needed (optional, but let's make it consistent)
            if (!Schema::hasColumn('appointments', 'appointment_type')) {
                $table->string('appointment_type')->after('phone')->nullable();
            }

            // Drop 'service_date_time' if it was added
            if (Schema::hasColumn('appointments', 'service_date_time')) {
                $table->dropColumn('service_date_time');
            }

            // Ensure 'message' is nullable (as it was in one of the temp migrations)
            $table->text('message')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['date', 'appointment_type']);
            $table->dateTime('service_date_time')->nullable();
            $table->text('message')->nullable(false)->change();
        });
    }
};
