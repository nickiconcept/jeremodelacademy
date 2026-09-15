<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SkillController extends Controller
{
    public function getSkills(Request $request)
    {
        try {
            $tier = $request->query('tier');
            $affective = DB::table('affective_skills')
                ->select('id', 'name', 'target_section', DB::raw("'affective' as category"))
                ->orderBy('name')
                ->get();
            $psychomotor = DB::table('psychomotor_skills')
                ->select('id', 'name', 'target_section', DB::raw("'psychomotor' as category"))
                ->orderBy('name')
                ->get();
            
            $skills = $affective->merge($psychomotor);
            
            if ($tier) {
                $t = strtolower($tier);
                $section = ($t === 'jss' || $t === 'sss') ? 'secondary' : 'primary';
                $skills = $skills->filter(function($s) use ($section) {
                    return $s->target_section === 'all' || $s->target_section === $section;
                })->values();
            }
            
            return response()->json($skills);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function addSkill(Request $request)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $name = $request->input('name');
        $cat = strtolower($request->input('category', 'affective'));
        $section = strtolower($request->input('target_section', 'secondary'));

        try {
            if ($cat === 'psychomotor') {
                DB::table('psychomotor_skills')->insert([
                    'name' => $name, 'target_section' => $section
                ]);
            } else {
                DB::table('affective_skills')->insert([
                    'name' => $name, 'target_section' => $section
                ]);
            }
            return response()->json(['message' => 'Skill created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function updateSkill(Request $request, $id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $name = $request->input('name');
        $cat = strtolower($request->input('category', 'affective'));
        $section = strtolower($request->input('target_section', 'secondary'));

        try {
            if ($cat === 'psychomotor') {
                DB::table('psychomotor_skills')->where('id', $id)->update([
                    'name' => $name, 'target_section' => $section
                ]);
            } else {
                DB::table('affective_skills')->where('id', $id)->update([
                    'name' => $name, 'target_section' => $section
                ]);
            }
            return response()->json(['message' => 'Skill updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function deleteSkill(Request $request, $id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') return response()->json(['error' => 'Unauthorized'], 403);

        $cat = strtolower($request->query('category', 'affective'));
        try {
            if ($cat === 'psychomotor') {
                DB::table('psychomotor_skills')->where('id', $id)->delete();
            } else {
                DB::table('affective_skills')->where('id', $id)->delete();
            }
            return response()->json(['message' => 'Skill deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function getStudents(Request $request, $classId)
    {
        $term = $request->query('term');
        $session = $request->query('session');
        $user = auth('api')->user();

        try {
            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $classId)->first();
                if (!$cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: Not the Form Master'], 403);
                }
            }

            $students = DB::table('students as s')
                ->join('users as u', 's.id', '=', 'u.id')
                ->where('s.class_id', $classId)
                ->orderBy('u.full_name')
                ->select('s.id', 'u.full_name', 's.admission_number')
                ->get();

            $evaluationsAffective = DB::table('student_affective_eval')
                ->where('term', $term)
                ->where('academic_year', $session)
                ->whereIn('student_id', function($q) use ($classId) {
                    $q->select('id')->from('students')->where('class_id', $classId);
                })
                ->distinct('student_id')
                ->pluck('student_id')->toArray();

            $evaluationsPsychomotor = DB::table('student_psychomotor_eval')
                ->where('term', $term)
                ->where('academic_year', $session)
                ->whereIn('student_id', function($q) use ($classId) {
                    $q->select('id')->from('students')->where('class_id', $classId);
                })
                ->distinct('student_id')
                ->pluck('student_id')->toArray();

            $evaluatedStudentIds = array_unique(array_merge($evaluationsAffective, $evaluationsPsychomotor));

            $result = $students->map(function($s) use ($evaluatedStudentIds) {
                $s->status = in_array($s->id, $evaluatedStudentIds) ? 'Rated' : 'Unrated';
                return $s;
            });

            return response()->json($result);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function getEvaluations(Request $request, $studentId)
    {
        $term = $request->query('term');
        $session = $request->query('session');

        try {
            $affective = DB::table('student_affective_eval')
                ->where('student_id', $studentId)
                ->where('term', $term)
                ->where('academic_year', $session)
                ->select('skill_id', 'rating', DB::raw("'affective' as category"))
                ->get();

            $psychomotor = DB::table('student_psychomotor_eval')
                ->where('student_id', $studentId)
                ->where('term', $term)
                ->where('academic_year', $session)
                ->select('skill_id', 'rating', DB::raw("'psychomotor' as category"))
                ->get();

            return response()->json($affective->merge($psychomotor));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function saveEvaluation(Request $request)
    {
        $student_id = $request->input('student_id');
        $term = $request->input('term');
        $session = $request->input('session');
        $ratings = $request->input('ratings'); // [{ skill_id, rating, category }]

        try {
            foreach ($ratings as $r) {
                $category = strtolower($r['category'] ?? '');
                if ($category === 'psychomotor') {
                    DB::table('student_psychomotor_eval')->updateOrInsert(
                        [
                            'student_id' => $student_id,
                            'skill_id' => $r['skill_id'],
                            'term' => $term,
                            'academic_year' => $session
                        ],
                        ['rating' => $r['rating']]
                    );
                } else {
                    DB::table('student_affective_eval')->updateOrInsert(
                        [
                            'student_id' => $student_id,
                            'skill_id' => $r['skill_id'],
                            'term' => $term,
                            'academic_year' => $session
                        ],
                        ['rating' => $r['rating']]
                    );
                }
            }
            return response()->json(['message' => 'Skills evaluation saved successfully']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function getBehavioral(Request $request, $studentId)
    {
        $term = $request->query('term');
        $year = $request->query('year');

        try {
            $row = DB::table('behavioral_grades')
                ->where('student_id', $studentId)
                ->where('term', $term)
                ->where('academic_year', $year)
                ->first();

            if ($row) {
                return response()->json($row);
            }

            return response()->json([
                'student_id' => (int)$studentId,
                'term' => $term,
                'academic_year' => $year,
                'punctuality' => 3, 'neatness' => 3, 'honesty' => 3, 'self_control' => 3,
                'peer_relationship' => 3, 'sports' => 3, 'manual_skills' => 3, 
                'musical_skills' => 3, 'verbal_fluency' => 3
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function saveBehavioral(Request $request)
    {
        $user = auth('api')->user();
        $student_id = $request->input('student_id');
        $class_id = $request->input('class_id');
        $term = $request->input('term');
        $academic_year = $request->input('academic_year');

        try {
            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $class_id)->first();
                if (!$cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: You are not the Form Master of this class.'], 403);
                }
            }

            DB::table('behavioral_grades')->updateOrInsert(
                [
                    'student_id' => $student_id,
                    'term' => $term,
                    'academic_year' => $academic_year
                ],
                [
                    'punctuality' => $request->input('punctuality'),
                    'neatness' => $request->input('neatness'),
                    'honesty' => $request->input('honesty'),
                    'self_control' => $request->input('self_control'),
                    'peer_relationship' => $request->input('peer_relationship'),
                    'sports' => $request->input('sports'),
                    'manual_skills' => $request->input('manual_skills'),
                    'musical_skills' => $request->input('musical_skills'),
                    'verbal_fluency' => $request->input('verbal_fluency')
                ]
            );

            return response()->json(['message' => 'Behavioral grades saved successfully']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }
}
