<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = DB::table('subjects')->orderBy('tier')->orderBy('name')->get();
        $classSubjects = DB::table('class_subjects')->get()->groupBy('subject_id');

        $subjects->transform(function ($subject) use ($classSubjects) {
            $classes = [];
            if ($classSubjects->has($subject->id)) {
                foreach ($classSubjects[$subject->id] as $cs) {
                    $classes[] = ['class_id' => $cs->class_id];
                }
            }
            $subject->classes = $classes;
            return $subject;
        });

        return response()->json($subjects);
    }

    public function show($id)
    {
        $subject = DB::table('subjects')->where('id', $id)->first();
        if (!$subject) {
            return response()->json(['error' => 'Subject not found'], 404);
        }
        return response()->json($subject);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        $id = DB::table('subjects')->insertGetId([
            'name' => $request->name,
            'tier' => 'universal',
        ]);

        return response()->json(['message' => 'Subject created successfully', 'id' => $id], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        $subject = DB::table('subjects')->where('id', $id)->first();
        if (!$subject) {
            return response()->json(['error' => 'Subject not found'], 404);
        }

        DB::table('subjects')->where('id', $id)->update([
            'name' => $request->name,
        ]);

        // Sync class assignments if class_ids is provided
        if ($request->has('class_ids') && is_array($request->class_ids)) {
            // Remove all existing class mappings for this subject
            DB::table('class_subjects')->where('subject_id', $id)->delete();
            // Re-insert the new ones
            foreach ($request->class_ids as $classId) {
                DB::table('class_subjects')->insert([
                    'class_id' => $classId,
                    'subject_id' => $id,
                    'teacher_id' => null,
                ]);
            }
        }

        return response()->json(['message' => 'Subject updated successfully']);
    }

    public function destroy($id)
    {
        $deleted = DB::table('subjects')->where('id', $id)->delete();
        if (!$deleted) {
            return response()->json(['error' => 'Subject not found'], 404);
        }
        return response()->json(['message' => 'Subject deleted successfully']);
    }

    public function assign(Request $request)
    {
        $class_ids = $request->input('class_ids');
        $class_id = $request->input('class_id');
        $subject_id = $request->input('subject_id');
        $teacher_id = $request->input('teacher_id');
        $overwrite = $request->input('overwrite');

        $targetClasses = $class_ids ?: ($class_id ? [$class_id] : []);

        try {
            DB::beginTransaction();

            if (!$overwrite) {
                foreach ($targetClasses as $cid) {
                    $existing = DB::table('class_subjects')
                        ->where('class_id', $cid)
                        ->where('subject_id', $subject_id)
                        ->whereNotNull('teacher_id')
                        ->first();
                        
                    if ($existing && $existing->teacher_id != $teacher_id) {
                        $cls = DB::table('classes')->where('id', $cid)->first();
                        $sub = DB::table('subjects')->where('id', $subject_id)->first();
                        return response()->json(['error' => "A teacher is already assigned to {$sub->name} in {$cls->name}. Use the Edit option on the class subject to reassign."], 400);
                    }
                }
            }

            foreach ($targetClasses as $cid) {
                // Upsert logic
                $exists = DB::table('class_subjects')
                    ->where('class_id', $cid)
                    ->where('subject_id', $subject_id)
                    ->first();
                
                if ($exists) {
                    DB::table('class_subjects')
                        ->where('class_id', $cid)
                        ->where('subject_id', $subject_id)
                        ->update(['teacher_id' => $teacher_id]);
                } else {
                    DB::table('class_subjects')->insert([
                        'class_id' => $cid,
                        'subject_id' => $subject_id,
                        'teacher_id' => $teacher_id
                    ]);
                }
            }

            // Retroactive timetable update: fill in unassigned periods for these classes/subject
            if ($teacher_id) {
                \App\Models\Timetable::whereIn('class_id', $targetClasses)
                    ->where('subject_id', $subject_id)
                    ->whereNull('teacher_id')
                    ->update(['teacher_id' => $teacher_id]);
            }

            DB::commit();
            return response()->json(['message' => 'Subject mapped to selected classes successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function syncForClass(Request $request)
    {
        $request->validate([
            'class_id' => 'required|integer',
            'subject_ids' => 'present|array',
        ]);

        $classId = $request->class_id;
        $subjectIds = $request->subject_ids;

        // Fetch existing subjects for the class
        $existing = DB::table('class_subjects')->where('class_id', $classId)->pluck('subject_id')->toArray();

        $toAdd = array_diff($subjectIds, $existing);
        $toRemove = array_diff($existing, $subjectIds);

        if (!empty($toRemove)) {
            DB::table('class_subjects')
                ->where('class_id', $classId)
                ->whereIn('subject_id', $toRemove)
                ->delete();
        }

        if (!empty($toAdd)) {
            $insertData = [];
            foreach ($toAdd as $sid) {
                $insertData[] = ['class_id' => $classId, 'subject_id' => $sid];
            }
            DB::table('class_subjects')->insert($insertData);
        }

        return response()->json(['message' => 'Class subjects synced successfully']);
    }

    public function syncForTier(Request $request)
    {
        $request->validate([
            'tier' => 'required|string',
            'subject_ids' => 'present|array',
        ]);

        $tier = $request->tier;
        $subjectIds = $request->subject_ids;

        DB::beginTransaction();
        try {
            // Get what was previously assigned as core subjects for this tier
            $oldTierSubjects = DB::table('tier_subjects')->where('tier', $tier)->pluck('subject_id')->toArray();
            
            // 1. Update tier_subjects table
            DB::table('tier_subjects')->where('tier', $tier)->delete();
            
            if (!empty($subjectIds)) {
                $tierSubjectsData = [];
                foreach ($subjectIds as $sid) {
                    $tierSubjectsData[] = ['tier' => $tier, 'subject_id' => $sid];
                }
                DB::table('tier_subjects')->insert($tierSubjectsData);
            }

            // Figure out the delta of what was checked vs unchecked in the modal
            $tierSubjectsToAdd = array_diff($subjectIds, $oldTierSubjects);
            $tierSubjectsToRemove = array_diff($oldTierSubjects, $subjectIds);

            // 2. Sync delta to all existing academic classes in this tier
            $classes = DB::table('classes')->where('tier', $tier)->where('is_virtual', false)->pluck('id');
            foreach ($classes as $classId) {
                $existing = DB::table('class_subjects')->where('class_id', $classId)->pluck('subject_id')->toArray();
                
                // We only add the newly checked tier subjects (if they don't already have them)
                $toAdd = array_diff($tierSubjectsToAdd, $existing);
                
                // We only remove the subjects that were specifically unchecked from the tier core subjects
                $toRemove = array_intersect($tierSubjectsToRemove, $existing);

                if (!empty($toRemove)) {
                    DB::table('class_subjects')
                        ->where('class_id', $classId)
                        ->whereIn('subject_id', $toRemove)
                        ->delete();
                }

                if (!empty($toAdd)) {
                    $insertData = [];
                    foreach ($toAdd as $sid) {
                        $insertData[] = ['class_id' => $classId, 'subject_id' => $sid];
                    }
                    DB::table('class_subjects')->insert($insertData);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Tier subjects synced successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function getTierSubjects($tier)
    {
        $subjects = DB::table('tier_subjects')->where('tier', $tier)->pluck('subject_id')->toArray();
        return response()->json($subjects);
    }

    public function classSubjects()
    {
        $rows = DB::table('class_subjects')
            ->join('classes', 'class_subjects.class_id', '=', 'classes.id')
            ->join('subjects', 'class_subjects.subject_id', '=', 'subjects.id')
            ->leftJoin('users', 'class_subjects.teacher_id', '=', 'users.id')
            ->select(
                'class_subjects.class_id',
                'class_subjects.subject_id',
                'class_subjects.teacher_id',
                'classes.name as class_name',
                'subjects.name as subject_name',
                'users.full_name as teacher_name'
            )
            ->orderBy('classes.name')
            ->orderBy('subjects.name')
            ->get();
        return response()->json($rows);
    }
}
