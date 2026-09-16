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
        Schema::table('timetables', function (Blueprint $table) {
            $table->string('type')->default('class')->after('id'); // 'class', 'short_break', 'long_break'
            $table->string('activity')->nullable()->after('type');
            $table->unsignedBigInteger('subject_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('timetables', function (Blueprint $table) {
            $table->dropColumn(['type', 'activity']);
            $table->unsignedBigInteger('subject_id')->nullable(false)->change();
        });
    }
};
