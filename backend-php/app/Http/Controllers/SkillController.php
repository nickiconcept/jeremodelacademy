<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                $skills = $skills->filter(function ($s) use ($section) {
                    return $s->target_section === 'all' || $s->target_section === $section;
                })->values();
            }

            return response()->json($skills);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function addSkill(Request $request)
    {
        $this->requireAdmin();

        $name = $request->input('name');
        $cat = strtolower($request->input('category', 'affective'));
        $section = strtolower($request->input('target_section', 'secondary'));

        try {
            if ($cat === 'psychomotor') {
                DB::table('psychomotor_skills')->insert([
                    'name' => $name, 'target_section' => $section,
                ]);
            } else {
                DB::table('affective_skills')->insert([
                    'name' => $name, 'target_section' => $section,
                ]);
            }

            return response()->json(['message' => 'Skill created successfully'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function updateSkill(Request $request, $id)
    {
        $this->requireAdmin();

        $name = $request->input('name');
        $cat = strtolower($request->input('category', 'affective'));
        $section = strtolower($request->input('target_section', 'secondary'));

        try {
            if ($cat === 'psychomotor') {
                DB::table('psychomotor_skills')->where('id', $id)->update([
                    'name' => $name, 'target_section' => $section,
                ]);
            } else {
                DB::table('affective_skills')->where('id', $id)->update([
                    'name' => $name, 'target_section' => $section,
                ]);
            }

            return response()->json(['message' => 'Skill updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function deleteSkill(Request $request, $id)
    {
        $this->requireAdmin();

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
        $this->requireAdminOrFormMaster($classId);

        try {
            $students = DB::table('students as s')
                ->join('users as u', 's.id', '=', 'u.id')
                ->where('s.class_id', $classId)
                ->orderBy('u.full_name')
                ->select('s.id', 'u.full_name', 's.admission_number')
                ->get();

            $evaluationsAffective = DB::table('student_affective_eval')
                ->where('term', $term)
                ->where('academic_year', $session)
                ->whereIn('student_id', function ($q) use ($classId) {
                    $q->select('id')->from('students')->where('class_id', $classId);
                })
                ->distinct('student_id')
                ->pluck('student_id')->toArray();

            $evaluationsPsychomotor = DB::table('student_psychomotor_eval')
                ->where('term', $term)
                ->where('academic_year', $session)
                ->whereIn('student_id', function ($q) use ($classId) {
                    $q->select('id')->from('students')->where('class_id', $classId);
                })
                ->distinct('student_id')
                ->pluck('student_id')->toArray();

            $evaluatedStudentIds = array_unique(array_merge($evaluationsAffective, $evaluationsPsychomotor));

            $result = $students->map(function ($s) use ($evaluatedStudentIds) {
                $s->status = in_array($s->id, $evaluatedStudentIds) ? 'Rated' : 'Unrated';

                return $s;
            });

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function getEvaluations(Request $request, $studentId)
    {
        $user = $this->authenticatedUser();
        $studentClassId = DB::table('students')->where('id', $studentId)->value('class_id');
        abort_unless(
            $user && (
                $user->role === 'admin'
                || ($user->role === 'student' && (string) $user->id === (string) $studentId)
                || ($studentClassId && $user->role === 'teacher' && $this->teacherIsFormMaster($studentClassId))
            ),
            403
        );

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
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function saveEvaluation(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'term' => ['required', 'string', 'max:40'],
            'session' => ['required', 'string', 'max:40'],
            'ratings' => ['required', 'array', 'min:1', 'max:100'],
            'ratings.*.skill_id' => ['required', 'integer'],
            'ratings.*.category' => ['required', 'in:affective,psychomotor'],
            'ratings.*.rating' => ['required', 'integer', 'between:1,5'],
        ]);
        $studentClassId = DB::table('students')->where('id', $validated['student_id'])->value('class_id');
        abort_unless($studentClassId, 404, 'Student has no active class.');
        $this->requireAdminOrFormMaster($studentClassId);

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
                            'academic_year' => $session,
                        ],
                        ['rating' => $r['rating']]
                    );
                } else {
                    DB::table('student_affective_eval')->updateOrInsert(
                        [
                            'student_id' => $student_id,
                            'skill_id' => $r['skill_id'],
                            'term' => $term,
                            'academic_year' => $session,
                        ],
                        ['rating' => $r['rating']]
                    );
                }
            }

            return response()->json(['message' => 'Skills evaluation saved successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function getBehavioral(Request $request, $studentId)
    {
        $user = $this->authenticatedUser();
        $studentClassId = DB::table('students')->where('id', $studentId)->value('class_id');
        abort_unless(
            $user && (
                $user->role === 'admin'
                || ($user->role === 'student' && (string) $user->id === (string) $studentId)
                || ($studentClassId && $user->role === 'teacher' && $this->teacherIsFormMaster($studentClassId))
            ),
            403
        );

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
                'student_id' => (int) $studentId,
                'term' => $term,
                'academic_year' => $year,
                'punctuality' => 3, 'neatness' => 3, 'honesty' => 3, 'self_control' => 3,
                'peer_relationship' => 3, 'sports' => 3, 'manual_skills' => 3,
                'musical_skills' => 3, 'verbal_fluency' => 3,
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function saveBehavioral(Request $request)
    {
        $user = auth('api')->user();
        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'term' => ['required', 'string', 'max:40'],
            'academic_year' => ['required', 'string', 'max:40'],
            'punctuality' => ['required', 'integer', 'between:1,5'],
            'neatness' => ['required', 'integer', 'between:1,5'],
            'honesty' => ['required', 'integer', 'between:1,5'],
            'self_control' => ['required', 'integer', 'between:1,5'],
            'peer_relationship' => ['required', 'integer', 'between:1,5'],
            'sports' => ['required', 'integer', 'between:1,5'],
            'manual_skills' => ['required', 'integer', 'between:1,5'],
            'musical_skills' => ['required', 'integer', 'between:1,5'],
            'verbal_fluency' => ['required', 'integer', 'between:1,5'],
        ]);
        $this->requireAdminOrFormMaster($validated['class_id']);
        abort_unless(
            DB::table('students')->where('id', $validated['student_id'])->where('class_id', $validated['class_id'])->exists(),
            403,
            'Student does not belong to the selected class.'
        );

        $student_id = $request->input('student_id');
        $class_id = $request->input('class_id');
        $term = $request->input('term');
        $academic_year = $request->input('academic_year');

        try {
            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $class_id)->first();
                if (! $cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: You are not the Form Master of this class.'], 403);
                }
            }

            DB::table('behavioral_grades')->updateOrInsert(
                [
                    'student_id' => $student_id,
                    'term' => $term,
                    'academic_year' => $academic_year,
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
                    'verbal_fluency' => $request->input('verbal_fluency'),
                ]
            );

            return response()->json(['message' => 'Behavioral grades saved successfully']);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }
}
