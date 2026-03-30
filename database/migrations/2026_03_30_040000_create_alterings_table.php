<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alterings', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->nullable();
            $table->string('customer_name');
            $table->string('mobile')->nullable();
            $table->string('delivery_address')->nullable();
            $table->text('product')->nullable();
            $table->string('purchased_date')->nullable();
            $table->string('tailor_pickup_date')->nullable();
            $table->string('pickup_status')->nullable();
            $table->string('customer_pickup_date')->nullable();
            $table->string('customer_pickup_status')->nullable();
            $table->text('remark')->nullable();
            $table->decimal('altering_cost', 8, 2)->nullable();
            $table->date('start_date')->nullable();
            $table->dateTime('ready_at')->nullable(); // countdown target
            $table->enum('status', ['pending', 'in_progress', 'ready', 'completed', 'cancelled'])->default('pending');
            $table->dateTime('notified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alterings');
    }
};
