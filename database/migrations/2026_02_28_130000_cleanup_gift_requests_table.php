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
        Schema::table('gift_requests', function (Blueprint $table) {
            $columnsToDrop = [
                'recipient_name',
                'recipient_age',
                'recipient_gender',
                'occasion',
                'gift_type',
                'notes'
            ];

            foreach ($columnsToDrop as $column) {
                if (Schema::hasColumn('gift_requests', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gift_requests', function (Blueprint $table) {
            $table->string('recipient_name')->after('phone')->nullable();
            $table->string('recipient_age')->after('recipient_name')->nullable();
            $table->string('recipient_gender')->after('recipient_age')->nullable();
            $table->string('occasion')->after('recipient_gender')->nullable();
            $table->string('gift_type')->after('occasion')->nullable();
            $table->text('notes')->after('gift_type')->nullable();
        });
    }
};
