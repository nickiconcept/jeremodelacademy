<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PinController extends Controller
{
    public function generatePins(Request $request): JsonResponse
    {
        $this->requireAdmin();
        $validated = $request->validate(['count' => ['nullable', 'integer', 'min:1', 'max:500']]);
        $count = (int) ($validated['count'] ?? 50);
        DB::transaction(function () use ($count): void {
            for ($i = 0; $i < $count; $i++) {
                $id = DB::table('result_pins')->insertGetId([
                    'pin' => strtoupper(Str::random(4).'-'.Str::random(4).'-'.Str::random(4)),
                    'usage_count' => 0, 'status' => 'active', 'generated_at' => now(),
                ]);
                DB::table('result_pins')->where('id', $id)->update(['serial_number' => 'JMA-'.str_pad((string) $id, 8, '0', STR_PAD_LEFT)]);
            }
        });

        return response()->json(['message' => "Successfully generated {$count} cards"], 201);
    }

    public function getPins(Request $request): JsonResponse
    {
        $this->requireAdmin();
        $pins = DB::table('result_pins as p')
            ->leftJoin('students as s', 'p.issued_to_student_id', '=', 's.id')
            ->leftJoin('users as u', 's.id', '=', 'u.id')
            ->leftJoin('users as staff', 'p.issued_by', '=', 'staff.id')
            ->select('p.*', 'u.full_name as student_name', 's.admission_number', 'staff.full_name as issued_by_name')
            ->orderByDesc('p.id')->get();

        return response()->json($pins);
    }

    public function issue(Request $request, int $id): JsonResponse
    {
        $this->requireAdmin();
        $data = $request->validate(['student_id' => ['required', 'integer', 'exists:students,id']]);
        DB::transaction(function () use ($id, $data): void {
            $pin = DB::table('result_pins')->where('id', $id)->lockForUpdate()->first();
            abort_unless($pin, 404, 'Card not found.');
            abort_if($pin->issued_to_student_id !== null || $pin->student_id !== null || $pin->usage_count > 0 || $pin->status !== 'active', 409, 'This card is no longer available for issuance.');
            DB::table('result_pins')->where('id', $id)->update([
                'issued_to_student_id' => $data['student_id'], 'issued_by' => auth('api')->id(), 'issued_at' => now(),
            ]);
            ActivityLog::log('issue_card', 'results', "Issued card {$pin->serial_number}", ['meta' => ['student_id' => $data['student_id']]]);
        });

        return response()->json(['message' => 'Card issued successfully.']);
    }

    public function verifyPin(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        abort_unless($user && $user->role === 'student', 403);
        $data = $request->validate([
            'pin' => ['required', 'string', 'max:20'],
            'term' => ['required', 'string', 'max:40'],
            'academic_year' => ['required', 'string', 'max:40'],
        ]);
        $result = app(ReportCardController::class)->viewStudentResult((int) $user->id, $data['term'], $data['academic_year'], $data['pin']);

        return response()->json($result + ['message' => 'Result opened. This card can only check this result.'])->header('Cache-Control', 'no-store');
    }
}
