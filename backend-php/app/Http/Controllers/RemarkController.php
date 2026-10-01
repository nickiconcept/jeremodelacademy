<?php

namespace App\Http\Controllers;

use App\Models\ReportCardRemark;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class RemarkController extends Controller
{
    /**
     * Get remarks for a student for a specific term and year
     */
    public function getRemark($student_id, Request $request)
    {
        $user = $this->authenticatedUser();
        $classId = DB::table('students')->where('id', $student_id)->value('class_id');
        abort_unless(
            $user && (
                $user->role === 'admin'
                || ($user->role === 'student' && (string) $user->id === (string) $student_id)
                || ($classId && $user->role === 'teacher' && $this->teacherIsFormMaster($classId))
            ),
            403
        );

        $term = $request->query('term');
        $academic_year = $request->query('year');

        $remark = ReportCardRemark::where('student_id', $student_id)
            ->where('term', $term)
            ->where('academic_year', $academic_year)
            ->first();

        return response()->json($remark);
    }

    /**
     * Save a manual remark
     */
    public function saveRemark(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'term' => 'required|string',
            'academic_year' => 'required|string',
            'class_teacher_remark' => 'nullable|string',
            'principal_remark' => 'nullable|string',
        ]);

        $user = $this->authenticatedUser();
        $classId = DB::table('students')->where('id', $validated['student_id'])->value('class_id');
        abort_unless(
            $user && (
                $user->role === 'admin'
                || ($classId && $user->role === 'teacher' && $this->teacherIsFormMaster($classId))
            ),
            403
        );
        if ($user->role === 'teacher') {
            $validated['principal_remark'] = null;
        }

        $remark = ReportCardRemark::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'term' => $validated['term'],
                'academic_year' => $validated['academic_year'],
            ],
            [
                'class_teacher_remark' => $validated['class_teacher_remark'] ?? null,
                'principal_remark' => $validated['principal_remark'] ?? null,
                'is_ai_generated' => false,
            ]
        );

        return response()->json(['message' => 'Remark saved successfully', 'remark' => $remark]);
    }

    /**
     * Generate AI Remarks using Google Gemini API
     */
    public function generateAIRemark(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'term' => 'required|string',
            'academic_year' => 'required|string',
            'type' => 'required|in:teacher,principal',
        ]);

        $user = $this->authenticatedUser();
        $classId = DB::table('students')->where('id', $validated['student_id'])->value('class_id');
        $allowedTeacher = $user && $user->role === 'teacher' && $classId && $this->teacherIsFormMaster($classId) && $validated['type'] === 'teacher';
        abort_unless($user && ($user->role === 'admin' || $allowedTeacher), 403);

        // Check if AI is allowed by admin
        $setting = SystemSetting::first();
        if (! $setting || $setting->remark_generation_mode !== 'ai') {
            return response()->json(['message' => 'AI generation is not enabled by the admin.'], 403);
        }

        $apiKey = config('services.gemini.api_key');
        if (! $apiKey) {
            return response()->json(['message' => 'Gemini API key is not configured on the server.'], 500);
        }

        $grades = DB::table('grades as g')
            ->join('subjects as s', 'g.subject_id', '=', 's.id')
            ->where('g.student_id', $validated['student_id'])
            ->where('g.term', $validated['term'])
            ->where('g.academic_year', $validated['academic_year'])
            ->orderBy('s.name')
            ->get(['s.name as subject_name', 'g.total_score']);

        $attendance = DB::table('attendance')
            ->where('student_id', $validated['student_id'])
            ->selectRaw("COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as present")
            ->selectRaw("COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent")
            ->selectRaw("COUNT(CASE WHEN status = 'late' THEN 1 END) as late")
            ->selectRaw('COUNT(*) as total')
            ->first();

        $affectiveRatings = DB::table('student_affective_eval as evaluation')
            ->join('affective_skills as skill', 'evaluation.skill_id', '=', 'skill.id')
            ->where('evaluation.student_id', $validated['student_id'])
            ->where('evaluation.term', $validated['term'])
            ->where('evaluation.academic_year', $validated['academic_year'])
            ->where('evaluation.rating', '>', 0)
            ->get(['skill.name as skill_name', 'evaluation.rating'])
            ->map(fn ($item) => ['area' => $item->skill_name, 'category' => 'character', 'rating' => (int) $item->rating]);

        $psychomotorRatings = DB::table('student_psychomotor_eval as evaluation')
            ->join('psychomotor_skills as skill', 'evaluation.skill_id', '=', 'skill.id')
            ->where('evaluation.student_id', $validated['student_id'])
            ->where('evaluation.term', $validated['term'])
            ->where('evaluation.academic_year', $validated['academic_year'])
            ->where('evaluation.rating', '>', 0)
            ->get(['skill.name as skill_name', 'evaluation.rating'])
            ->map(fn ($item) => ['area' => $item->skill_name, 'category' => 'practical skill', 'rating' => (int) $item->rating]);

        $performanceSummary = [
            'term' => $validated['term'],
            'academic_year' => $validated['academic_year'],
            'subjects' => $grades->map(fn ($grade) => [
                'name' => $grade->subject_name,
                'score' => round((float) $grade->total_score, 1),
            ])->values(),
            'term_average' => $grades->isEmpty() ? null : round((float) $grades->avg('total_score'), 1),
            'attendance' => [
                'present_or_late' => (int) ($attendance->present ?? 0),
                'absent' => (int) ($attendance->absent ?? 0),
                'late' => (int) ($attendance->late ?? 0),
                'recorded_days' => (int) ($attendance->total ?? 0),
            ],
            'behavior_and_skills' => $affectiveRatings->merge($psychomotorRatings)->values(),
        ];

        if ($grades->isEmpty() && (int) ($attendance->total ?? 0) === 0 && $performanceSummary['behavior_and_skills']->isEmpty()) {
            return response()->json(['message' => 'There is not enough recorded student performance to generate a remark.'], 422);
        }

        $remarkRole = $validated['type'] === 'teacher' ? 'Form Master' : 'Principal';
        $prompt = 'Write one professional, personalized report-card remark in 1 or 2 short sentences for the '.$remarkRole.'. ';
        $prompt .= 'Use only the supplied performance evidence. Mention a specific verified strength and, when supported, one constructive next step. ';
        $prompt .= 'Do not invent facts, diagnose, compare the student to classmates, or shame the student. Return only the remark. Evidence: ';
        $prompt .= json_encode($performanceSummary, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        try {
            $model = config('services.gemini.model', 'gemini-3.5-flash-lite');
            $response = Http::timeout(25)
                ->withHeaders(['x-goog-api-key' => $apiKey])
                ->post('https://generativelanguage.googleapis.com/v1beta/models/'.$model.':generateContent', [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.4,
                        'maxOutputTokens' => 120,
                    ],
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedText = trim($data['candidates'][0]['content']['parts'][0]['text'] ?? '');
                if ($generatedText === '') {
                    return response()->json(['message' => 'Gemini returned an empty remark. Please try again.'], 502);
                }

                // Save it to the database automatically
                $remarkData = [
                    'student_id' => $validated['student_id'],
                    'term' => $validated['term'],
                    'academic_year' => $validated['academic_year'],
                ];

                $remark = ReportCardRemark::firstOrNew($remarkData);
                if ($validated['type'] === 'teacher') {
                    $remark->class_teacher_remark = trim($generatedText);
                } else {
                    $remark->principal_remark = trim($generatedText);
                }
                $remark->is_ai_generated = true;
                $remark->save();

                return response()->json([
                    'message' => 'Remark generated successfully',
                    'remark' => $remark,
                ]);
            } else {
                return response()->json(['message' => 'Gemini could not generate a remark. Please try again later.'], 502);
            }
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json(['message' => 'An error occurred during AI generation. Please try again later.'], 502);
        }
    }
}
