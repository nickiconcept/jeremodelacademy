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
        Schema::table('system_settings', function (Blueprint $table) {
            $table->decimal('attendance_location1_lat', 10, 8)->nullable();
            $table->decimal('attendance_location1_lng', 11, 8)->nullable();
            $table->decimal('attendance_location2_lat', 10, 8)->nullable();
            $table->decimal('attendance_location2_lng', 11, 8)->nullable();
            $table->integer('attendance_radius')->nullable()->default(100);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            $table->dropColumn([
                'attendance_location1_lat',
                'attendance_location1_lng',
                'attendance_location2_lat',
                'attendance_location2_lng',
                'attendance_radius'
            ]);
        });
    }
};
