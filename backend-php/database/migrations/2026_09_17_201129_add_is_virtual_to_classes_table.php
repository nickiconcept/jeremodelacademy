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
        Schema::table('classes', function (Blueprint $table) {
            $table->boolean('is_virtual')->default(false);
        });

        // Set existing waiting rooms to virtual
        \Illuminate\Support\Facades\DB::table('classes')
            ->where('name', 'LIKE', '%Waiting Room%')
            ->update(['is_virtual' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('is_virtual');
        });
    }
};
