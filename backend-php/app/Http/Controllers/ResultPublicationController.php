<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ResultPublicationController extends Controller
{
    public function candidates(Request $request)
    {
        $this->requireAdmin();

        $validated = $request->validate([
            'term' => ['required', 'string', 'max:40'],
            'academic_year' => ['required', 'string', 'max:40'],
        ]);

        return response()->json([
            'result_entry_open' => (bool) SystemSetting::latest('id')->value('result_entry_open'),
            'candidates' => $this->candidateRows($validated['term'], $validated['academic_year']),
            'history' => $this->publicationHistory($validated['term'], $validated['academic_year']),
        ]);
    }

    public function publish(Request $request)
    {
        $this->requireAdmin();

        $validated = $request->validate([
            'term' => ['required', 'string', 'max:40'],
            'academic_year' => ['required', 'string', 'max:40'],
            'scope' => ['required', 'in:school,class,students'],
            'class_id' => ['required_if:scope,class', 'nullable', 'exists:classes,id'],
            'student_ids' => ['required_if:scope,students', 'array', 'min:1', 'max:2000'],
            'student_ids.*' => ['integer', 'distinct', 'exists:students,id'],
            'confirm_incomplete' => ['sometimes', 'boolean'],
        ]);

        $settings = SystemSetting::latest('id')->first();
        if (! $settings || $settings->result_entry_open) {
            return response()->json(['message' => 'Close result entry before publishing results.'], 409);
        }

        $targetStudents = DB::table('students')->where('status', 'active');
        if ($validated['scope'] === 'class') {
            $targetStudents->where('class_id', $validated['class_id']);
        } elseif ($validated['scope'] === 'students') {
            $targetStudents->whereIn('id', $validated['student_ids']);
        }

        $studentIds = $targetStudents->orderBy('id')->pluck('id');
        if ($studentIds->isEmpty()) {
            return response()->json(['message' => 'No active students were found in the selected scope.'], 422);
        }

        $candidates = $this->candidateRows($validated['term'], $validated['academic_year'], $studentIds->all());
        $studentsWithMissingData = collect($candidates)->filter(fn (array $candidate) => $candidate['graded_subjects'] === 0
            || $candidate['missing_subjects'] > 0
            || ! $candidate['has_class_teacher_remark']
            || ! $candidate['has_principal_remark']
        );

        if ($studentsWithMissingData->isNotEmpty() && ! ($validated['confirm_incomplete'] ?? false)) {
            return response()->json([
                'message' => 'Some selected students have missing marks or remarks. Confirm to publish them anyway.',
                'incomplete_count' => $studentsWithMissingData->count(),
            ], 422);
        }

        $publishedAt = Carbon::now();
        $publications = $studentIds->map(fn ($studentId) => [
            'student_id' => $studentId,
            'term' => $validated['term'],
            'academic_year' => $validated['academic_year'],
            'published_by' => $this->authenticatedUser()->id,
            'published_at' => $publishedAt,
            'created_at' => $publishedAt,
            'updated_at' => $publishedAt,
        ])->all();

        DB::transaction(function () use ($publications, $studentIds, $validated, $publishedAt): void {
            DB::table('result_publications')->upsert(
                $publications,
                ['student_id', 'term', 'academic_year'],
                ['published_by', 'published_at', 'updated_at']
            );

            $this->recordPublicationEvents(
                $studentIds->all(),
                $validated['term'],
                $validated['academic_year'],
                'published',
                $validated['scope'],
                isset($validated['class_id']) ? (int) $validated['class_id'] : null,
                (int) $this->authenticatedUser()->id,
                $publishedAt
            );
        });

        return response()->json([
            'message' => 'Results published successfully.',
            'published_count' => $studentIds->count(),
            'incomplete_count' => $studentsWithMissingData->count(),
        ]);
    }

    public function unpublish(Request $request)
    {
        $this->requireAdmin();

        $validated = $request->validate([
            'term' => ['required', 'string', 'max:40'],
            'academic_year' => ['required', 'string', 'max:40'],
            'scope' => ['required', 'in:school,class,students'],
            'class_id' => ['required_if:scope,class', 'nullable', 'exists:classes,id'],
            'student_ids' => ['required_if:scope,students', 'array', 'min:1', 'max:2000'],
            'student_ids.*' => ['integer', 'distinct', 'exists:students,id'],
        ]);

        $targetStudents = DB::table('result_publications')->where('term', $validated['term'])
            ->where('academic_year', $validated['academic_year']);
        if ($validated['scope'] === 'class') {
            $targetStudents->whereIn('student_id', DB::table('students')->select('id')->where('class_id', $validated['class_id']));
        } elseif ($validated['scope'] === 'students') {
            $targetStudents->whereIn('student_id', $validated['student_ids']);
        }

        $studentIds = $targetStudents->pluck('student_id');
        if ($studentIds->isEmpty()) {
            return response()->json(['message' => 'There are no published results in the selected scope.'], 422);
        }

        $performedAt = Carbon::now();
        DB::transaction(function () use ($validated, $studentIds, $performedAt): void {
            DB::table('result_publications')
                ->where('term', $validated['term'])
                ->where('academic_year', $validated['academic_year'])
                ->whereIn('student_id', $studentIds)
                ->delete();

            $this->recordPublicationEvents(
                $studentIds->all(),
                $validated['term'],
                $validated['academic_year'],
                'unpublished',
                $validated['scope'],
                isset($validated['class_id']) ? (int) $validated['class_id'] : null,
                (int) $this->authenticatedUser()->id,
                $performedAt
            );
        });

        return response()->json([
            'message' => 'Results unpublished successfully.',
            'unpublished_count' => $studentIds->count(),
        ]);
    }

    private function candidateRows(string $term, string $academicYear, ?array $studentIds = null): array
    {
        $gradeStats = DB::table('grades')
            ->where('term', $term)
            ->where('academic_year', $academicYear)
            ->select('student_id', DB::raw('COUNT(DISTINCT subject_id) as graded_subjects'))
            ->groupBy('student_id');

        $query = DB::table('students as s')
            ->join('users as u', 's.id', '=', 'u.id')
            ->leftJoin('classes as c', 's.class_id', '=', 'c.id')
            ->leftJoinSub($gradeStats, 'grade_stats', 'grade_stats.student_id', '=', 's.id')
            ->leftJoin('report_card_remarks as remarks', function ($join) use ($term, $academicYear) {
                $join->on('remarks.student_id', '=', 's.id')
                    ->where('remarks.term', '=', $term)
                    ->where('remarks.academic_year', '=', $academicYear);
            })
            ->leftJoin('result_publications as publication', function ($join) use ($term, $academicYear) {
                $join->on('publication.student_id', '=', 's.id')
                    ->where('publication.term', '=', $term)
                    ->where('publication.academic_year', '=', $academicYear);
            })
            ->leftJoin('users as publisher', 'publisher.id', '=', 'publication.published_by')
            ->leftJoin('class_subjects as class_subject', 'class_subject.class_id', '=', 's.class_id')
            ->where('s.status', 'active')
            ->select(
                's.id',
                's.class_id',
                's.admission_number',
                'u.full_name',
                'c.name as class_name',
                DB::raw('COALESCE(grade_stats.graded_subjects, 0) as graded_subjects'),
                DB::raw('COUNT(DISTINCT class_subject.subject_id) as assigned_subjects'),
                'remarks.class_teacher_remark',
                'remarks.principal_remark',
                'publication.published_at',
                'publisher.full_name as published_by_name'
            )
            ->groupBy(
                's.id', 's.class_id', 's.admission_number', 'u.full_name', 'c.name',
                'grade_stats.graded_subjects', 'remarks.class_teacher_remark',
                'remarks.principal_remark', 'publication.published_at', 'publisher.full_name'
            )
            ->orderBy('c.name')
            ->orderBy('u.full_name');

        if ($studentIds !== null) {
            $query->whereIn('s.id', $studentIds);
        }

        return $query->get()->map(function ($student) {
            $gradedSubjects = (int) $student->graded_subjects;
            $assignedSubjects = max((int) $student->assigned_subjects, $gradedSubjects);

            return [
                'id' => $student->id,
                'class_id' => $student->class_id,
                'class_name' => $student->class_name,
                'full_name' => $student->full_name,
                'admission_number' => $student->admission_number,
                'graded_subjects' => $gradedSubjects,
                'assigned_subjects' => $assignedSubjects,
                'missing_subjects' => max(0, $assignedSubjects - $gradedSubjects),
                'has_class_teacher_remark' => filled($student->class_teacher_remark),
                'has_principal_remark' => filled($student->principal_remark),
                'published_at' => $student->published_at,
                'published_by_name' => $student->published_by_name,
                'is_published' => $student->published_at !== null,
            ];
        })->all();
    }

    private function recordPublicationEvents(array $studentIds, string $term, string $academicYear, string $action, string $scope, ?int $classId, int $userId, Carbon $performedAt): void
    {
        DB::table('result_publication_events')->insert(collect($studentIds)->map(fn ($studentId) => [
            'student_id' => $studentId,
            'term' => $term,
            'academic_year' => $academicYear,
            'action' => $action,
            'scope' => $scope,
            'class_id' => $classId,
            'performed_by' => $userId,
            'performed_at' => $performedAt,
        ])->all());
    }

    private function publicationHistory(string $term, string $academicYear): array
    {
        return DB::table('result_publication_events as events')
            ->join('students as s', 's.id', '=', 'events.student_id')
            ->join('users as student', 'student.id', '=', 's.id')
            ->leftJoin('users as actor', 'actor.id', '=', 'events.performed_by')
            ->leftJoin('classes as c', 'c.id', '=', 'events.class_id')
            ->where('events.term', $term)
            ->where('events.academic_year', $academicYear)
            ->orderByDesc('events.performed_at')
            ->limit(100)
            ->get([
                'events.action', 'events.scope', 'events.performed_at',
                'student.full_name as student_name', 's.admission_number',
                'actor.full_name as performed_by_name', 'c.name as class_name',
            ])
            ->all();
    }
}
