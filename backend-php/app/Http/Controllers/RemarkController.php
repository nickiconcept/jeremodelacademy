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
            'performance_summary' => 'required|string', // A string describing their grades/behavior
            'type' => 'required|in:teacher,principal',
        ]);

        $user = $this->authenticatedUser();
        $classId = DB::table('students')->where('id', $validated['student_id'])->value('class_id');
        $allowedTeacher = $user && $user->role === 'teacher' && $classId && $this->teacherIsFormMaster($classId) && $validated['type'] === 'teacher';
        abort_unless($user && ($user->role === 'admin' || $allowedTeacher), 403);

        // Check if AI is allowed by admin
        $setting = SystemSetting::first();
        if ($setting && $setting->remark_generation_mode !== 'ai') {
            return response()->json(['message' => 'AI generation is not enabled by the admin.'], 403);
        }

        $apiKey = env('GEMINI_API_KEY');
        if (! $apiKey) {
            return response()->json(['message' => 'Gemini API key is not configured on the server.'], 500);
        }

        $prompt = 'You are writing a professional, concise report card remark for a student. ';
        $prompt .= 'Based on the following performance summary, write an encouraging remark (1-2 short sentences maximum). ';
        $prompt .= 'Type of remark: '.($validated['type'] === 'teacher' ? 'Class Teacher' : 'Principal').'. ';
        $prompt .= 'Performance Summary: '.$validated['performance_summary'].' .';

        try {
            $response = Http::post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='.$apiKey, [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedText = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Excellent performance this term. Keep it up!';

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
                return response()->json(['message' => 'Failed to connect to Gemini API', 'error' => $response->body()], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred during AI generation: '.$e->getMessage()], 500);
        }
    }
}
