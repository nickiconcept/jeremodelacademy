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
        Schema::create('student_admission_sequence', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('last_number')->default(0);
        });

        $highest = 0;
        foreach (['students' => 'admission_number', 'users' => 'username'] as $table => $column) {
            foreach (DB::table($table)->select($column)->where($column, 'like', 'JMA/%')->cursor() as $row) {
                if (preg_match('/^JMA\/\d{4}\/(\d+)$/i', $row->{$column}, $matches)) {
                    $highest = max($highest, (int) $matches[1]);
                }
            }
        }
        DB::table('student_admission_sequence')->insert(['id' => 1, 'last_number' => $highest]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_admission_sequence');
    }
};
