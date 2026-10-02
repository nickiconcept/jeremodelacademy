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
        Schema::create('result_publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('term', 40);
            $table->string('academic_year', 40);
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at');
            $table->timestamps();

            $table->unique(['student_id', 'term', 'academic_year'], 'result_publications_student_term_year_unique');
            $table->index(['term', 'academic_year']);
        });

        Schema::create('result_publication_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('term', 40);
            $table->string('academic_year', 40);
            $table->string('action', 20);
            $table->string('scope', 20);
            $table->unsignedBigInteger('class_id')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('performed_at');
            $table->index(['term', 'academic_year', 'performed_at'], 'result_publication_events_term_year_time_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('result_publication_events');
        Schema::dropIfExists('result_publications');
    }
};
