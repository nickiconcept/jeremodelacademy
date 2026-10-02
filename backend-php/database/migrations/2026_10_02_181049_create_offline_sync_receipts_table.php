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
        Schema::create('offline_sync_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('sync_id', 64)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('operation', 32);
            $table->unsignedBigInteger('class_id')->nullable();
            $table->date('attendance_date')->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_lng', 11, 8)->nullable();
            $table->decimal('location_accuracy', 10, 2)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'operation', 'created_at'], 'offline_sync_user_operation_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offline_sync_receipts');
    }
};
