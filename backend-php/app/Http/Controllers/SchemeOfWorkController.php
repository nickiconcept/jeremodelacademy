<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use App\Models\SystemSetting;

class SchemeOfWorkController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|integer',
            'class_id' => 'required|integer',
            'academic_session' => 'required|string',
            'term' => 'required|string'
        ]);

        $subjectId = $request->input('subject_id');
        $classId = $request->input('class_id');
        $session = $request->input('academic_session');
        $term = $request->input('term');

        // Get the tier of the class
        $class = DB::table('classes')->where('id', $classId)->first();
        if (!$class) return response()->json(['error' => 'Class not found'], 404);
        
        $tier = $this->determineTier($class->name);

        $schemes = DB::table('scheme_of_works')
            ->where('subject_id', $subjectId)
            ->where('tier', $tier)
            ->where('term', $term)
            ->orderBy('week')
            ->get();

        $progress = DB::table('sow_progress')
            ->where('class_id', $classId)
            ->where('academic_session', $session)
            ->whereIn('scheme_of_work_id', $schemes->pluck('id'))
            ->get()
            ->keyBy('scheme_of_work_id');

        $schemes->transform(function ($scheme) use ($progress) {
            $scheme->progress = $progress->get($scheme->id) ?: null;
            return $scheme;
        });

        return response()->json($schemes);
    }

    public function markTreated(Request $request)
    {
        $request->validate([
            'scheme_of_work_id' => 'required|integer',
            'class_id' => 'required|integer',
            'academic_session' => 'required|string'
        ]);

        $sowId = $request->input('scheme_of_work_id');
        $classId = $request->input('class_id');
        $session = $request->input('academic_session');
        $teacherId = $request->user()->id;

        $exists = DB::table('sow_progress')
            ->where('scheme_of_work_id', $sowId)
            ->where('class_id', $classId)
            ->where('academic_session', $session)
            ->first();

        if ($exists) {
            DB::table('sow_progress')->where('id', $exists->id)->update([
                'status' => 'completed',
                'completed_at' => now(),
                'teacher_id' => $teacherId
            ]);
        } else {
            DB::table('sow_progress')->insert([
                'scheme_of_work_id' => $sowId,
                'class_id' => $classId,
                'academic_session' => $session,
                'teacher_id' => $teacherId,
                'status' => 'completed',
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json(['message' => 'Topic marked as treated']);
    }

    public function studentIndex(Request $request)
    {
        $settings = DB::table('system_settings')->first();
        if (!$settings || !$settings->allow_students_view_sow_status) {
            return response()->json(['error' => 'Permission denied. Admins have hidden this feature.'], 403);
        }

        return $this->index($request);
    }

    public function adminProgressOverview(Request $request)
    {
        $session = $request->input('academic_session');

        $progress = DB::table('sow_progress')
            ->join('scheme_of_works', 'sow_progress.scheme_of_work_id', '=', 'scheme_of_works.id')
            ->join('users', 'sow_progress.teacher_id', '=', 'users.id')
            ->join('subjects', 'scheme_of_works.subject_id', '=', 'subjects.id')
            ->join('classes', 'sow_progress.class_id', '=', 'classes.id')
            ->where('sow_progress.academic_session', $session)
            ->select(
                'users.id as teacher_id',
                'users.full_name as teacher_name',
                'classes.name as class_name',
                'subjects.name as subject_name',
                'scheme_of_works.topic',
                'scheme_of_works.sub_topic as subtitle',
                'scheme_of_works.week',
                'sow_progress.completed_at'
            )
            ->get();

        $grouped = $progress->groupBy(function ($item) {
            return $item->teacher_id . '-' . $item->class_name . '-' . $item->subject_name;
        })->map(function ($items) {
            $first = $items->first();
            return [
                'teacher_id' => $first->teacher_id,
                'teacher_name' => $first->teacher_name,
                'class_name' => $first->class_name,
                'subject_name' => $first->subject_name,
                'completed_topics' => $items->count(),
                'treated_topics_list' => $items->map(function ($item) {
                    return [
                        'topic' => $item->topic,
                        'subtitle' => $item->subtitle,
                        'week' => $item->week,
                        'completed_at' => $item->completed_at
                    ];
                })->values()->toArray()
            ];
        })->values();

        return response()->json($grouped);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer',
            'subject_id' => 'required|integer',
            'term' => 'required|string',
            'week' => 'required|integer',
            'topic' => 'required|string',
            'subtitle' => 'nullable|string',
            'objectives' => 'nullable|string',
        ]);

        $classId = $request->input('class_id');
        $subjectId = $request->input('subject_id');
        $term = $request->input('term');
        $week = $request->input('week');
        
        $class = DB::table('classes')->where('id', $classId)->first();
        if (!$class) return response()->json(['error' => 'Class not found'], 404);
        
        $tier = $this->determineTier($class->name);

        $exists = DB::table('scheme_of_works')
            ->where('subject_id', $subjectId)
            ->where('tier', $tier)
            ->where('term', $term)
            ->where('week', $week)
            ->first();

        if ($exists) {
            DB::table('scheme_of_works')->where('id', $exists->id)->update([
                'topic' => $request->input('topic'),
                'sub_topic' => $request->input('subtitle'),
                'objectives' => $request->input('objectives'),
                'updated_at' => now()
            ]);
            $schemeId = $exists->id;
        } else {
            $schemeId = DB::table('scheme_of_works')->insertGetId([
                'subject_id' => $subjectId,
                'tier' => $tier,
                'term' => $term,
                'week' => $week,
                'topic' => $request->input('topic'),
                'sub_topic' => $request->input('subtitle'),
                'objectives' => $request->input('objectives'),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json(['message' => 'Scheme of work saved', 'id' => $schemeId]);
    }

    public function destroy($id)
    {
        DB::table('scheme_of_works')->where('id', $id)->delete();
        return response()->json(['message' => 'Scheme of work deleted']);
    }

    private function determineTier($className)
    {
        $className = strtolower($className);
        if (strpos($className, 'jss') !== false) return 'jss';
        if (strpos($className, 'ss') !== false || strpos($className, 'sss') !== false) return 'sss';
        if (strpos($className, 'primary') !== false) return 'primary';
        if (strpos($className, 'nursery') !== false) return 'nursery';
        return 'universal';
    }
}
