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
        Schema::create('sow_progress', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('scheme_of_work_id');
            $table->unsignedBigInteger('class_id');
            $table->string('academic_session');
            $table->unsignedBigInteger('teacher_id')->nullable();
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('scheme_of_work_id')->references('id')->on('scheme_of_works')->onDelete('cascade');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('cascade');
            $table->foreign('teacher_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sow_progress');
    }
};
