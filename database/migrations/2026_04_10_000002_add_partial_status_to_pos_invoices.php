<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (in_array(DB::getDriverName(), ['mysql', 'mariadb'])) {
            DB::statement("ALTER TABLE pos_invoices MODIFY COLUMN status ENUM('active', 'held', 'completed', 'partial', 'refunded', 'void') DEFAULT 'active'");
        }
    }

    public function down(): void
    {
        if (in_array(DB::getDriverName(), ['mysql', 'mariadb'])) {
            DB::statement("ALTER TABLE pos_invoices MODIFY COLUMN status ENUM('active', 'held', 'completed', 'refunded', 'void') DEFAULT 'active'");
        }
    }
};
