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
            $table->string('sender_age')->nullable()->after('name');
            $table->string('recipient_name')->after('phone');
            $table->string('recipient_title')->after('recipient_name');
            $table->string('recipient_phone')->nullable()->after('recipient_title');
            $table->string('recipient_email')->nullable()->after('recipient_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gift_requests', function (Blueprint $table) {
            $table->dropColumn([
                'sender_age',
                'recipient_name',
                'recipient_title',
                'recipient_phone',
                'recipient_email'
            ]);
        });
    }
};
