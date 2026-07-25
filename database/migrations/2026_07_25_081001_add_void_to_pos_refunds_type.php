<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE pos_refunds MODIFY COLUMN type ENUM('full', 'partial', 'void') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE pos_refunds MODIFY COLUMN type ENUM('full', 'partial') NOT NULL");
    }
};
