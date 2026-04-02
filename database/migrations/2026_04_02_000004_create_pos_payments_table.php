<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('pos_invoices')->cascadeOnDelete();
            $table->enum('method', ['cash', 'credit', 'debit', 'khqr', 'qr_code', 'deposit']);
            $table->decimal('amount', 10, 2);
            $table->string('reference')->nullable(); // card last4, ref number, etc.
            $table->timestamps();

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_payments');
    }
};
