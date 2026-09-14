<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SystemController extends Controller
{
    public function getSettings()
    {
        try {
            $settings = DB::table('system_settings')->orderByDesc('id')->first();
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateSettings(Request $request)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        try {
            $data = $request->only([
                'active_session', 'active_term', 'result_entry_open',
                'landing_school_name', 'landing_tagline', 'landing_hero_title',
                'landing_hero_desc', 'landing_address', 'result_show_position',
                'result_show_average', 'contact_phone', 'contact_email',
                'ca1_name', 'ca2_name', 'ca3_name', 'ca4_name', 'exam_name',
                'games_master_name', 'games_master_remark', 'house_master_name',
                'house_master_remark', 'principal_name', 'principal_signature',
                'next_term_fee', 'next_term_begins', 'next_term_ends',
                'max_ca_count',
                'allow_fm_edit_student', 'allow_fm_register_student', 'allow_past_attendance',
                'remark_generation_mode', 'allow_offline_debt', 'allow_students_view_sow_status'
            ]);

            DB::table('system_settings')->insert($data);

            return response()->json(['message' => 'Settings updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getSessions()
    {
        try {
            $sessions = DB::table('academic_sessions')->orderByDesc('session_name')->get();
            return response()->json($sessions);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function createSession(Request $request)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $session_name = $request->input('session_name');
        if (!$session_name) return response()->json(['error' => 'Session name is required'], 400);

        try {
            DB::table('academic_sessions')->insert([
                'session_name' => $session_name,
                'is_current' => 0
            ]);
            return response()->json(['message' => 'Academic session created successfully'], 201);
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'UNIQUE constraint')) {
                return response()->json(['error' => 'Session already exists'], 400);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function setActiveSession(Request $request)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $id = $request->input('id');
        if (!$id) return response()->json(['error' => 'Session ID is required'], 400);

        try {
            $session = DB::table('academic_sessions')->where('id', $id)->first();
            if (!$session) return response()->json(['error' => 'Session not found'], 404);

            DB::transaction(function () use ($id, $session) {
                DB::table('academic_sessions')->update(['is_current' => 0]);
                DB::table('academic_sessions')->where('id', $id)->update(['is_current' => 1]);

                $latestSetting = DB::table('system_settings')->orderByDesc('id')->first();
                if ($latestSetting) {
                    DB::table('system_settings')->where('id', $latestSetting->id)->update([
                        'active_session' => $session->session_name
                    ]);
                }
            });

            return response()->json(['message' => "Session {$session->session_name} is now the active current session."]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getSchemes(Request $request)
    {
        $user = auth('api')->user();
        $class_id = $request->query('class_id');
        $subject_id = $request->query('subject_id');
        $term = $request->query('term');

        try {
            $query = DB::table('scheme_of_work as s')
                ->join('classes as c', 's.class_id', '=', 'c.id')
                ->join('subjects as sub', 's.subject_id', '=', 'sub.id')
                ->leftJoin('users as u', 's.created_by', '=', 'u.id')
                ->select('s.*', 'c.name as class_name', 'sub.name as subject_name', 'u.full_name as author_name');

            if ($user->role === 'teacher') {
                $teacherSubjects = DB::table('class_subjects')->where('teacher_id', $user->id)->get();
                $query->where(function ($q) use ($teacherSubjects) {
                    foreach ($teacherSubjects as $ts) {
                        $q->orWhere(function ($sq) use ($ts) {
                            $sq->where('s.class_id', $ts->class_id)
                               ->where('s.subject_id', $ts->subject_id);
                        });
                    }
                });
            } elseif ($user->role === 'student') {
                $query->where('s.class_id', $user->class_id);
            }

            if ($class_id) $query->where('s.class_id', $class_id);
            if ($subject_id) $query->where('s.subject_id', $subject_id);
            if ($term) $query->where('s.term', $term);

            $schemes = $query->orderBy('s.week')->get();
            return response()->json($schemes);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function saveScheme(Request $request)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $data = $request->only(['class_id', 'subject_id', 'term', 'week', 'topic', 'subtitle', 'objectives']);
        
        if (empty($data['class_id']) || empty($data['subject_id']) || empty($data['term']) || empty($data['week']) || empty($data['topic'])) {
            return response()->json(['error' => 'Class ID, Subject ID, term, week, and topic are required'], 400);
        }

        $data['created_by'] = $user->id;

        try {
            DB::table('scheme_of_work')->updateOrInsert(
                [
                    'class_id' => $data['class_id'],
                    'subject_id' => $data['subject_id'],
                    'term' => $data['term'],
                    'week' => $data['week']
                ],
                [
                    'topic' => $data['topic'],
                    'subtitle' => $data['subtitle'] ?? null,
                    'objectives' => $data['objectives'] ?? null,
                    'created_by' => $user->id
                ]
            );

            return response()->json(['message' => 'Scheme of work entry saved successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteScheme($id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        try {
            DB::table('scheme_of_work')->where('id', $id)->delete();
            return response()->json(['message' => 'Scheme deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
