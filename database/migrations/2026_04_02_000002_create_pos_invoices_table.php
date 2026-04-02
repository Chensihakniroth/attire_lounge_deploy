<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // INV-20260402-0001
            $table->foreignId('customer_profile_id')->nullable()->constrained('customer_profiles')->nullOnDelete();
            $table->foreignId('cashier_id')->constrained('users')->cascadeOnDelete();

            // Dates
            $table->date('date');

            // Pricing breakdown
            $table->decimal('subtotal', 10, 2)->default(0);           // before any discounts
            $table->decimal('items_discount', 10, 2)->default(0);     // sum of per-item discounts
            $table->decimal('tier_discount_pct', 5, 2)->default(0);   // 0, 8, 10, 15
            $table->decimal('tier_discount_amt', 10, 2)->default(0);  // computed amount
            $table->foreignId('promo_code_id')->nullable()->constrained('promocodes')->nullOnDelete();
            $table->decimal('promo_discount_amt', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2)->default(0);

            // Notes
            $table->text('notes')->nullable();

            // Status
            $table->enum('status', ['active', 'held', 'completed', 'refunded', 'void'])->default('active');
            $table->enum('payment_status', ['pending', 'partial', 'paid'])->default('pending');

            $table->timestamps();

            $table->index('date');
            $table->index('status');
            $table->index('customer_profile_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_invoices');
    }
};
