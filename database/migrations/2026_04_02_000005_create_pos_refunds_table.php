<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('pos_invoices')->cascadeOnDelete();
            $table->enum('type', ['full', 'partial']); // full or line-item refund
            $table->foreignId('invoice_item_id')->nullable()->constrained('pos_invoice_items')->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->text('reason')->nullable();
            $table->foreignId('processed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index('invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_refunds');
    }
};
