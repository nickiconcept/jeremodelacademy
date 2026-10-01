<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            $table->boolean('attendance_geofencing_enabled')->default(false);
        });

        DB::table('system_settings')
            ->where(function ($query) {
                $query->where(function ($location) {
                    $location->whereNotNull('attendance_location1_lat')
                        ->whereNotNull('attendance_location1_lng');
                })->orWhere(function ($location) {
                    $location->whereNotNull('attendance_location2_lat')
                        ->whereNotNull('attendance_location2_lng');
                });
            })
            ->update(['attendance_geofencing_enabled' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('system_settings', function (Blueprint $table) {
            $table->dropColumn('attendance_geofencing_enabled');
        });
    }
};
