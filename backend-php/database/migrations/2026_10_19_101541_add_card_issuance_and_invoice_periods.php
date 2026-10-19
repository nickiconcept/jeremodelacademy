<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('result_pins', function (Blueprint $table): void {
            $table->string('serial_number')->nullable()->unique();
            $table->unsignedBigInteger('issued_to_student_id')->nullable()->index();
            $table->unsignedBigInteger('issued_by')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('activated_at')->nullable();
        });
        DB::table('result_pins')->orderBy('id')->chunkById(500, function ($pins): void {
            foreach ($pins as $pin) {
                DB::table('result_pins')->where('id', $pin->id)->update([
                    'serial_number' => 'JMA-'.str_pad((string) $pin->id, 8, '0', STR_PAD_LEFT),
                    'issued_to_student_id' => $pin->student_id,
                ]);
            }
        });
        Schema::table('fee_invoices', function (Blueprint $table): void {
            $table->string('term', 40)->nullable();
            $table->string('academic_year', 40)->nullable();
            $table->index(['student_id', 'term', 'academic_year']);
        });
        DB::table('fee_invoices')->orderBy('id')->chunkById(500, function ($invoices): void {
            foreach ($invoices as $invoice) {
                if (preg_match('/ - (1st Term|2nd Term|3rd Term) (\d{4}\/\d{4})$/', $invoice->title, $match)) {
                    DB::table('fee_invoices')->where('id', $invoice->id)->update(['term' => $match[1], 'academic_year' => $match[2]]);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('fee_invoices', function (Blueprint $table): void {
            $table->dropIndex(['student_id', 'term', 'academic_year']);
            $table->dropColumn(['term', 'academic_year']);
        });
        Schema::table('result_pins', function (Blueprint $table): void {
            $table->dropUnique(['serial_number']);
            $table->dropIndex(['issued_to_student_id']);
            $table->dropColumn(['serial_number', 'issued_to_student_id', 'issued_by', 'issued_at', 'activated_at']);
        });
    }
};
