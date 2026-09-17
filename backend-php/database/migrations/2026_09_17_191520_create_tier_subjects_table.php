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
        Schema::create('tier_subjects', function (Blueprint $table) {
            $table->id();
            $table->string('tier');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['tier', 'subject_id']);
        });

        // Drop auto_assign_tier from subjects
        if (Schema::hasColumn('subjects', 'auto_assign_tier')) {
            Schema::table('subjects', function (Blueprint $table) {
                $table->dropColumn('auto_assign_tier');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tier_subjects');
        
        Schema::table('subjects', function (Blueprint $table) {
            $table->boolean('auto_assign_tier')->default(false);
        });
    }
};
