<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradesController extends Controller
{
    /**
     * Get all students in a class with their grades for a specific subject/term/session.
     * Used by the marks entry screen in Admin and Teacher dashboards.
     */
    public function getGradesForEntry(Request $request, $classId, $subjectId)
    {
        $this->requireAdminOrAssignedTeacher($classId, $subjectId);

        $term = $request->query('term');
        $session = $request->query('session');

        // Get all active students in the class, joined with their user record for full_name
        $students = DB::table('students')
            ->join('users', 'students.id', '=', 'users.id')
            ->where('students.class_id', $classId)
            ->where('students.status', 'active')
            ->select(
                'students.id as student_id',
                'students.admission_number',
                'users.full_name'
            )
            ->orderBy('users.full_name')
            ->get();

        // Fetch existing grades for this class/subject/term/session
        $existingGrades = DB::table('grades')
            ->join('students', 'grades.student_id', '=', 'students.id')
            ->where('students.class_id', $classId)
            ->where('grades.subject_id', $subjectId)
            ->when($term, fn ($q) => $q->where('grades.term', $term))
            ->when($session, fn ($q) => $q->where('grades.academic_year', $session))
            ->select('grades.*')
            ->get()
            ->keyBy('student_id');

        // Merge: every student gets a row, with grades if they exist or zeroes if not
        $result = $students->map(function ($student) use ($existingGrades, $subjectId, $term, $session) {
            $grade = $existingGrades->get($student->student_id);

            return [
                'student_id' => $student->student_id,
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number,
                'subject_id' => (int) $subjectId,
                'term' => $term,
                'academic_year' => $session,
                'ca1' => $grade ? $grade->ca1 : null,
                'ca2' => $grade ? $grade->ca2 : null,
                'ca3' => $grade ? $grade->ca3 : null,
                'ca4' => $grade ? $grade->ca4 : null,
                'exam_score' => $grade ? $grade->exam_score : null,
                'total_score' => $grade ? $grade->total_score : 0,
                'grade_letter' => $grade ? $grade->grade_letter : null,
                'remark' => $grade ? $grade->remark : null,
            ];
        })->values();

        return response()->json($result);
    }

    public function getStudentGrades(Request $request)
    {
        $user = $this->authenticatedUser();
        abort_unless($user, 401);

        $student_id = $request->query('student_id');
        $query = DB::table('grades')
            ->join('subjects', 'grades.subject_id', '=', 'subjects.id')
            ->select('grades.*', 'subjects.name as subject_name');

        if ($user->role === 'student') {
            $student_id = $user->id;
        } elseif ($user->role === 'teacher') {
            $classId = $request->query('class_id');
            $subjectId = $request->query('subject_id');
            abort_unless($classId && $subjectId && $this->teacherHasAssignment($classId, $subjectId), 403);

            $query->whereIn('student_id', function ($students) use ($classId) {
                $students->select('id')->from('students')->where('class_id', $classId);
            })->where('subject_id', $subjectId);
        } elseif ($user->role !== 'admin') {
            abort(403);
        }

        $term = $request->query('term');
        $academic_year = $request->query('academic_year');

        if ($student_id) {
            $query->where('student_id', $student_id);
        }
        if ($term) {
            $query->where('term', $term);
        }
        if ($academic_year) {
            $query->where('academic_year', $academic_year);
        }

        return response()->json($query->get());
    }

    public function saveGrades(Request $request)
    {
        $user = $this->authenticatedUser();
        abort_unless($user && in_array($user->role, ['admin', 'teacher'], true), 403);

        $validated = $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'term' => ['required', 'string', 'max:40'],
            'academic_year' => ['required', 'string', 'max:40'],
            'grades' => ['required', 'array', 'min:1', 'max:500'],
            'grades.*.student_id' => ['required', 'integer', 'distinct', 'exists:students,id'],
            'grades.*.ca1' => ['nullable', 'numeric', 'between:0,10'],
            'grades.*.ca2' => ['nullable', 'numeric', 'between:0,10'],
            'grades.*.ca3' => ['nullable', 'numeric', 'between:0,10'],
            'grades.*.ca4' => ['nullable', 'numeric', 'between:0,10'],
            'grades.*.exam_score' => ['nullable', 'numeric', 'between:0,60'],
            'grades.*.remark' => ['nullable', 'string', 'max:500'],
        ]);

        $this->requireAdminOrAssignedTeacher($validated['class_id'], $validated['subject_id']);

        if ($user->role === 'teacher') {
            $settings = DB::table('system_settings')->orderByDesc('id')->first();
            abort_if(! $settings || ! $settings->result_entry_open, 403, 'Result entry is currently closed.');
        }

        $studentIds = collect($validated['grades'])->pluck('student_id')->unique();
        $classStudentIds = DB::table('students')
            ->where('class_id', $validated['class_id'])
            ->whereIn('id', $studentIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        abort_unless(count($classStudentIds) === $studentIds->count(), 403, 'One or more students do not belong to the selected class.');

        DB::transaction(function () use ($validated) {
            foreach ($validated['grades'] as $gradeData) {
                $scores = [
                    'ca1' => (float) ($gradeData['ca1'] ?? 0),
                    'ca2' => (float) ($gradeData['ca2'] ?? 0),
                    'ca3' => (float) ($gradeData['ca3'] ?? 0),
                    'ca4' => (float) ($gradeData['ca4'] ?? 0),
                    'exam_score' => (float) ($gradeData['exam_score'] ?? 0),
                ];
                $scores['total_score'] = array_sum($scores);
                $scores['grade_letter'] = $this->gradeLetter($scores['total_score']);
                $scores['remark'] = $gradeData['remark'] ?? null;
                $scores['updated_at'] = now();

                DB::table('grades')->updateOrInsert(
                    [
                        'student_id' => $gradeData['student_id'],
                        'subject_id' => $validated['subject_id'],
                        'term' => $validated['term'],
                        'academic_year' => $validated['academic_year'],
                    ],
                    $scores + ['created_at' => now()]
                );

                DB::table('report_card_remarks')
                    ->where('student_id', $gradeData['student_id'])
                    ->where('term', $validated['term'])
                    ->where('academic_year', $validated['academic_year'])
                    ->where('is_ai_generated', true)
                    ->delete();
            }
        });

        return response()->json(['message' => 'Grades saved successfully']);
    }

    private function gradeLetter(float $total): string
    {
        return match (true) {
            $total >= 75 => 'A',
            $total >= 60 => 'B',
            $total >= 50 => 'C',
            $total >= 40 => 'D',
            default => 'F',
        };
    }
}
