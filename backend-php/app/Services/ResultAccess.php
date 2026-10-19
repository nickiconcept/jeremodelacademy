<?php

namespace App\Services;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;

class ResultAccess
{
    public const MAX_CHECKS = 5;

    public function debtMessage(int $studentId, string $term, string $year): ?string
    {
        $debts = DB::table('fee_invoices')->where('student_id', $studentId)->whereColumn('amount_due', '>', 'amount_paid');
        if ((clone $debts)->where(fn ($q) => $q->whereNull('term')->orWhereNull('academic_year')->orWhere('term', '')->orWhere('academic_year', ''))->exists()) {
            return 'A fee balance needs term/session classification. Please visit the finance office before checking results.';
        }
        if ($debts->where('term', $term)->where('academic_year', $year)->exists()) {
            return 'Outstanding school fees for this term must be cleared before viewing this result.';
        }

        return null;
    }

    public function view(int $studentId, string $term, string $year, ?string $code, Closure $build): array
    {
        return DB::transaction(function () use ($studentId, $term, $year, $code, $build): array {
            DB::table('students')->where('id', $studentId)->lockForUpdate()->first();
            if (! DB::table('result_publications')->where('student_id', $studentId)->where('term', $term)->where('academic_year', $year)->exists()) {
                $this->deny('This result has not been published yet.');
            }
            if ($message = $this->debtMessage($studentId, $term, $year)) {
                $this->deny($message);
            }
            $query = DB::table('result_pins');
            if ($code !== null) {
                $query->where('pin', strtoupper(trim($code)));
            } else {
                $query->where('student_id', $studentId)->where('term', $term)->where('academic_year', $year)
                    ->where('status', 'active')->where('usage_count', '<', self::MAX_CHECKS)
                    ->orderByDesc('activated_at')->orderByDesc('id');
            }
            $pin = $query->lockForUpdate()->first();
            if (! $pin) {
                $this->deny('Enter a valid result checker PIN issued to you.');
            }
            if ((int) $pin->issued_to_student_id !== $studentId) {
                $this->deny('This card has not been issued to you. Please visit the school office.');
            }
            if ($pin->student_id !== null && ((int) $pin->student_id !== $studentId || $pin->term !== $term || $pin->academic_year !== $year)) {
                $this->deny('This PIN is bound to another result. Use a different PIN.');
            }
            if ($pin->status !== 'active' || $pin->usage_count >= self::MAX_CHECKS) {
                $this->deny('This PIN has exceeded its maximum limit of 5 checks.');
            }
            $report = $build();
            $count = (int) $pin->usage_count + 1;
            DB::table('result_pins')->where('id', $pin->id)->update([
                'student_id' => $studentId, 'term' => $term, 'academic_year' => $year,
                'activated_at' => $pin->activated_at ?? now(), 'usage_count' => $count,
                'status' => $count >= self::MAX_CHECKS ? 'exhausted' : 'active',
            ]);
            ActivityLog::log('check_result', 'results', "Viewed Report Card for {$term} {$year} (PIN Usage: {$count} of 5)", [
                'meta' => ['serial_number' => $pin->serial_number],
            ]);

            return ['report_card' => $report, 'pin' => ['serial_number' => $pin->serial_number, 'usage_count' => $count], 'remaining_checks' => self::MAX_CHECKS - $count];
        }, 3);
    }

    private function deny(string $message): never
    {
        throw new HttpResponseException(response()->json(['error' => $message], 403));
    }
}
