<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\SystemSetting;
use App\Models\ReportCardRemark;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportCardController extends Controller
{
    private function calculateGrade($score)
    {
        if ($score >= 75) return ['grade' => 'A', 'remark' => 'Excellent'];
        if ($score >= 60) return ['grade' => 'B', 'remark' => 'Very Good'];
        if ($score >= 50) return ['grade' => 'C', 'remark' => 'Good'];
        if ($score >= 40) return ['grade' => 'D', 'remark' => 'Pass'];
        return ['grade' => 'F', 'remark' => 'Fail'];
    }

    private function buildReportCardData($targetStudentId, $reqTerm, $reqYear)
    {
        // Fetch Active Term Grades
        $activeGrades = DB::table('grades as g')
            ->join('subjects as s', 'g.subject_id', '=', 's.id')
            ->where('g.student_id', $targetStudentId)
            ->where('g.term', $reqTerm)
            ->where('g.academic_year', $reqYear)
            ->select('g.*', 's.name as subject_name')
            ->get();

        // Complete Student Information Header
        $studentInfo = DB::table('students as s')
            ->join('users as u', 's.id', '=', 'u.id')
            ->leftJoin('classes as c', 's.class_id', '=', 'c.id')
            ->leftJoin('users as fm', 'c.form_master_id', '=', 'fm.id')
            ->leftJoin('teachers as fmt', 'c.form_master_id', '=', 'fmt.id')
            ->where('s.id', $targetStudentId)
            ->select(
                's.*', 'u.full_name', 'u.passport_photo', 
                'c.name as class_name', 'c.tier',
                'fm.full_name as form_master_name', 'fmt.signature as form_master_signature'
            )
            ->first();

        // Fetch Unpaid Balance
        $unpaidRow = DB::table('fee_invoices')
            ->where('student_id', $targetStudentId)
            ->select(DB::raw('SUM(amount_due - amount_paid) as balance'))
            ->first();

        if ($studentInfo) {
            $studentInfo->unpaid_balance = ($unpaidRow && $unpaidRow->balance > 0) ? $unpaidRow->balance : 0;
        }

        // Fetch Attendance statistics
        $attendanceStats = DB::table('attendance')
            ->where('student_id', $targetStudentId)
            ->select(
                DB::raw("COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as present"),
                DB::raw("COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent"),
                DB::raw("COUNT(CASE WHEN status = 'late' THEN 1 END) as late"),
                DB::raw("COUNT(*) as total")
            )
            ->first();

        // Calculate cumulative averages if it is the 3rd Term
        $reports = $activeGrades;
        if ($reqTerm === '3rd Term') {
            $allYearGrades = DB::table('grades')
                ->where('student_id', $targetStudentId)
                ->where('academic_year', $reqYear)
                ->select('subject_id', 'term', 'total_score')
                ->get();

            $subTotals = [];
            foreach ($allYearGrades as $g) {
                if (!isset($subTotals[$g->subject_id])) $subTotals[$g->subject_id] = [];
                $subTotals[$g->subject_id][$g->term] = $g->total_score;
            }

            $reports = $activeGrades->map(function($g) use ($subTotals) {
                $t1 = $subTotals[$g->subject_id]['1st Term'] ?? 0;
                $t2 = $subTotals[$g->subject_id]['2nd Term'] ?? 0;
                $t3 = $g->total_score;

                $termsTaken = 0;
                if ($t1 > 0) $termsTaken++;
                if ($t2 > 0) $termsTaken++;
                if ($t3 > 0) $termsTaken++;

                $cumAverage = $termsTaken > 0 ? (($t1 + $t2 + $t3) / $termsTaken) : 0;
                $gradeInfo = $this->calculateGrade($cumAverage);

                $g->term1_total = $t1 ?: '-';
                $g->term2_total = $t2 ?: '-';
                $g->cum_average = number_format($cumAverage, 1);
                $g->cum_grade = $gradeInfo['grade'];
                $g->cum_remark = $gradeInfo['remark'];

                return $g;
            });
        }

        $affectiveBehavioral = DB::table('affective_skills as bs')
            ->leftJoin('student_affective_eval as sse', function($join) use ($targetStudentId, $reqTerm, $reqYear) {
                $join->on('bs.id', '=', 'sse.skill_id')
                     ->where('sse.student_id', '=', $targetStudentId)
                     ->where('sse.term', '=', $reqTerm)
                     ->where('sse.academic_year', '=', $reqYear);
            })
            ->select('bs.name', DB::raw("'affective' as category"), 'bs.target_section', DB::raw('COALESCE(sse.rating, 0) as rating'))
            ->orderBy('bs.name')
            ->get();

        $psychomotorBehavioral = DB::table('psychomotor_skills as bs')
            ->leftJoin('student_psychomotor_eval as sse', function($join) use ($targetStudentId, $reqTerm, $reqYear) {
                $join->on('bs.id', '=', 'sse.skill_id')
                     ->where('sse.student_id', '=', $targetStudentId)
                     ->where('sse.term', '=', $reqTerm)
                     ->where('sse.academic_year', '=', $reqYear);
            })
            ->select('bs.name', DB::raw("'psychomotor' as category"), 'bs.target_section', DB::raw('COALESCE(sse.rating, 0) as rating'))
            ->orderBy('bs.name')
            ->get();

        $behavioral = $affectiveBehavioral->merge($psychomotorBehavioral);

        $position = null;
        $total_students = 0;
        $class_average = '0.0';
        $highest_average = '0.0';
        $lowest_average = '0.0';
        
        $next_term_fee = null;

        if ($studentInfo && $studentInfo->class_id) {
            $classId = $studentInfo->class_id;
            
            if (!empty($studentInfo->tier)) {
                $feeStruct = DB::table('fee_structures')
                    ->where('tier', $studentInfo->tier)
                    ->where('category', 'School Fees')
                    ->first();
                if ($feeStruct) {
                    $next_term_fee = '₦' . number_format($feeStruct->amount, 2);
                }
            }

            $classStudents = DB::table('students')->where('class_id', $classId)->pluck('id');
            $total_students = $classStudents->count();

            $classGrades = DB::table('grades')
                ->where('term', $reqTerm)
                ->where('academic_year', $reqYear)
                ->whereIn('student_id', $classStudents)
                ->select('student_id', 'subject_id', 'total_score')
                ->get();

            $studentTotals = [];
            $studentCounts = [];
            foreach ($classStudents as $sid) {
                $studentTotals[$sid] = 0;
                $studentCounts[$sid] = 0;
            }

            foreach ($classGrades as $g) {
                $studentTotals[$g->student_id] += $g->total_score;
                $studentCounts[$g->student_id] += 1;
            }

            $rankedList = $classStudents->map(function($sid) use ($studentTotals, $studentCounts) {
                $total = $studentTotals[$sid];
                $count = $studentCounts[$sid];
                $avg = $count > 0 ? ($total / $count) : 0;
                return (object)['student_id' => $sid, 'avg' => $avg];
            })->sortByDesc('avg')->values();

            $rankIdx = $rankedList->search(function($item) use ($targetStudentId) {
                return $item->student_id == $targetStudentId;
            });

            if ($rankIdx !== false) {
                $position = $rankIdx + 1;
            }

            $activeAvgs = $rankedList->pluck('avg')->filter(function($a) { return $a > 0; })->values();
            if ($activeAvgs->count() > 0) {
                $sumAvgs = $activeAvgs->sum();
                $class_average = number_format($sumAvgs / $activeAvgs->count(), 1);
                $highest_average = number_format($activeAvgs->max(), 1);
                $lowest_average = number_format($activeAvgs->min(), 1);
            }

            $subjectRanks = [];
            foreach ($classGrades as $cg) {
                if (!isset($subjectRanks[$cg->subject_id])) $subjectRanks[$cg->subject_id] = [];
                $subjectRanks[$cg->subject_id][] = (object)['student_id' => $cg->student_id, 'score' => $cg->total_score];
            }

            foreach ($subjectRanks as $subId => $ranks) {
                usort($subjectRanks[$subId], function($a, $b) { return $b->score <=> $a->score; });
            }

            $reports = collect($reports)->map(function($g) use ($subjectRanks, $targetStudentId) {
                $subRankList = collect($subjectRanks[$g->subject_id] ?? []);
                $subRankIdx = $subRankList->search(function($r) use ($targetStudentId) {
                    return $r->student_id == $targetStudentId;
                });
                
                $g->subject_position = $subRankIdx !== false ? ($subRankIdx + 1) : '-';
                return $g;
            });
        }

        $remarkData = DB::table('report_card_remarks')
            ->where('student_id', $targetStudentId)
            ->where('term', $reqTerm)
            ->where('academic_year', $reqYear)
            ->first();

        return [
            'student' => $studentInfo,
            'grades' => $reports,
            'attendance' => $attendanceStats,
            'academic_year' => $reqYear,
            'term' => $reqTerm,
            'behavioral' => $behavioral,
            'position' => $position,
            'total_students' => $total_students,
            'class_average' => $class_average,
            'highest_average' => $highest_average,
            'lowest_average' => $lowest_average,
            'remarks' => $remarkData,
            'next_term_fee' => $next_term_fee
        ];
    }

    public function getReportCard(Request $request, $studentId)
    {
        $term = $request->query('term');
        $year = $request->query('year');
        $user = auth('api')->user();

        if ($user->role === 'student' && $user->id != $studentId) {
            return response()->json(['error' => 'Unauthorized view.'], 403);
        }

        try {
            if ($user->role === 'student') {
                $unpaidTermFees = DB::table('fee_invoices')
                    ->where('student_id', $studentId)
                    ->where('status', '!=', 'paid')
                    ->where('title', 'like', "%{$term} {$year}%")
                    ->first();

                if ($unpaidTermFees) {
                    return response()->json(['error' => 'Access Denied: Outstanding school fees for this term must be cleared before viewing this result.'], 403);
                }

                $boundPin = DB::table('result_pins')
                    ->where('student_id', $studentId)
                    ->where('term', $term)
                    ->where('academic_year', $year)
                    ->where('status', 'active')
                    ->where('usage_count', '<', 5)
                    ->orderByDesc('id')
                    ->first();

                if (!$boundPin) {
                    return response()->json(['error' => 'Result Locked: Please input a result checker PIN to unlock this term\'s grades.'], 403);
                }

                $newUsage = $boundPin->usage_count + 1;
                $newStatus = $newUsage >= 5 ? 'exhausted' : 'active';
                DB::table('result_pins')->where('id', $boundPin->id)->update([
                    'usage_count' => $newUsage,
                    'status' => $newStatus
                ]);

                ActivityLog::log(
                    'check_result',
                    'results',
                    "Viewed Report Card for {$term} {$year} (PIN Usage: {$newUsage} of 5)"
                );
            }

            $reportCardData = $this->buildReportCardData($studentId, $term, $year);
            return response()->json($reportCardData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getBulkReportCards(Request $request)
    {
        $class_id = $request->query('class_id');
        $term = $request->query('term');
        $year = $request->query('year');

        if (!$class_id || !$term || !$year) {
            return response()->json(['error' => 'class_id, term, and year parameters are required.'], 400);
        }

        try {
            $students = DB::table('students')->where('class_id', $class_id)->pluck('id');
            $reportCards = [];

            foreach ($students as $sid) {
                $reportCards[] = $this->buildReportCardData($sid, $term, $year);
            }

            return response()->json($reportCards);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getBroadsheet(Request $request, $classId)
    {
        $term = $request->query('term');
        $session = $request->query('session');
        $user = auth('api')->user();

        try {
            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $classId)->first();
                if (!$cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: You are not the Form Master of this class'], 403);
                }
            }

            $subjects = DB::table('class_subjects as cs')
                ->join('subjects as s', 'cs.subject_id', '=', 's.id')
                ->where('cs.class_id', $classId)
                ->orderBy('s.name')
                ->select('s.id', 's.name')
                ->get();

            $students = DB::table('students as s')
                ->join('users as u', 's.id', '=', 'u.id')
                ->where('s.class_id', $classId)
                ->orderBy('u.full_name')
                ->select('s.id', 'u.full_name', 's.admission_number')
                ->get();

            $gradesList = DB::table('grades as g')
                ->join('students as s', 'g.student_id', '=', 's.id')
                ->where('s.class_id', $classId)
                ->where('g.term', $term)
                ->where('g.academic_year', $session)
                ->select('g.*')
                ->get();

            $gradeMap = [];
            foreach ($gradesList as $g) {
                if (!isset($gradeMap[$g->student_id])) $gradeMap[$g->student_id] = [];
                $gradeMap[$g->student_id][$g->subject_id] = $g;
            }

            $allYearGradeMap = [];
            if ($term === '3rd Term') {
                $allYearGrades = DB::table('grades as g')
                    ->join('students as s', 'g.student_id', '=', 's.id')
                    ->where('s.class_id', $classId)
                    ->where('g.academic_year', $session)
                    ->select('g.student_id', 'g.subject_id', 'g.term', 'g.total_score')
                    ->get();

                foreach ($allYearGrades as $yg) {
                    if (!isset($allYearGradeMap[$yg->student_id])) $allYearGradeMap[$yg->student_id] = [];
                    if (!isset($allYearGradeMap[$yg->student_id][$yg->subject_id])) $allYearGradeMap[$yg->student_id][$yg->subject_id] = [];
                    $allYearGradeMap[$yg->student_id][$yg->subject_id][$yg->term] = $yg->total_score;
                }
            }

            $studentPerformance = [];

            foreach ($students as $stu) {
                $stuId = $stu->id;
                $stuGrades = [];
                $grandTotal = 0;
                $subjectsTaken = 0;

                foreach ($subjects as $sub) {
                    $subId = $sub->id;
                    $g = $gradeMap[$stuId][$subId] ?? null;

                    if ($g) {
                        $grandTotal += $g->total_score;
                        $subjectsTaken++;

                        $stuSubjectEntry = [
                            'subject_id' => $subId,
                            'score' => $g->total_score,
                            'ca1' => $g->ca1,
                            'ca2' => $g->ca2,
                            'ca3' => $g->ca3,
                            'ca4' => $g->ca4,
                            'exam' => $g->exam_score,
                            'grade' => $g->grade_letter
                        ];

                        if ($term === '3rd Term') {
                            $t1 = $allYearGradeMap[$stuId][$subId]['1st Term'] ?? 0;
                            $t2 = $allYearGradeMap[$stuId][$subId]['2nd Term'] ?? 0;
                            $t3 = $g->total_score;
                            
                            $termsTaken = 0;
                            if ($t1 > 0) $termsTaken++;
                            if ($t2 > 0) $termsTaken++;
                            if ($t3 > 0) $termsTaken++;

                            $cumAvg = $termsTaken > 0 ? (($t1 + $t2 + $t3) / $termsTaken) : 0;
                            $gradeObj = $this->calculateGrade($cumAvg);

                            $stuSubjectEntry['term1'] = $t1 ?: '-';
                            $stuSubjectEntry['term2'] = $t2 ?: '-';
                            $stuSubjectEntry['cum_avg'] = number_format($cumAvg, 1);
                            $stuSubjectEntry['cum_grade'] = $gradeObj['grade'];
                        }

                        $stuGrades[] = $stuSubjectEntry;
                    } else {
                        $emptyEntry = [
                            'subject_id' => $subId,
                            'score' => '-',
                            'ca1' => '-',
                            'ca2' => '-',
                            'ca3' => '-',
                            'ca4' => '-',
                            'exam' => '-',
                            'grade' => '-'
                        ];
                        if ($term === '3rd Term') {
                            $emptyEntry['term1'] = '-';
                            $emptyEntry['term2'] = '-';
                            $emptyEntry['cum_avg'] = '-';
                            $emptyEntry['cum_grade'] = '-';
                        }
                        $stuGrades[] = $emptyEntry;
                    }
                }

                $studentPerformance[] = [
                    'student' => $stu,
                    'grades' => $stuGrades,
                    'grandTotal' => $grandTotal,
                    'average' => $subjectsTaken > 0 ? ($grandTotal / $subjectsTaken) : 0
                ];
            }

            usort($studentPerformance, function($a, $b) {
                return $b['average'] <=> $a['average'];
            });

            foreach ($studentPerformance as $idx => $sp) {
                $studentPerformance[$idx]['position'] = $idx + 1;
            }

            return response()->json([
                'subjects' => $subjects,
                'students' => $studentPerformance
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function teacherResultProgress(Request $request)
    {
        $user = auth('api')->user();
        try {
            $settings = DB::table('system_settings')->orderByDesc('id')->first();
            $term = $settings ? $settings->active_term : '3rd Term';
            $year = $settings ? $settings->active_session : '2026/2027';

            $assignments = DB::table('class_subjects as cs')
                ->join('classes as c', 'cs.class_id', '=', 'c.id')
                ->join('subjects as s', 'cs.subject_id', '=', 's.id')
                ->where('cs.teacher_id', $user->id)
                ->orderBy('c.name')
                ->orderBy('s.name')
                ->select('cs.class_id', 'cs.subject_id', 'c.name as class_name', 's.name as subject_name')
                ->get();

            $details = [];
            $completedCount = 0;
            $inProgressCount = 0;
            $pendingCount = 0;

            foreach ($assignments as $item) {
                $totalStudents = DB::table('students')->where('class_id', $item->class_id)->count();
                $uploadedCount = DB::table('grades')
                    ->where('subject_id', $item->subject_id)
                    ->where('term', $term)
                    ->where('academic_year', $year)
                    ->whereIn('student_id', function($q) use ($item) {
                        $q->select('id')->from('students')->where('class_id', $item->class_id);
                    })
                    ->distinct('student_id')
                    ->count();

                $status = 'Pending';
                if ($totalStudents > 0 && $uploadedCount >= $totalStudents) {
                    $status = 'Completed';
                    $completedCount++;
                } elseif ($uploadedCount > 0) {
                    $status = 'In Progress';
                    $inProgressCount++;
                } else {
                    $pendingCount++;
                }

                $details[] = [
                    'class_name' => $item->class_name,
                    'subject_name' => $item->subject_name,
                    'total_students' => $totalStudents,
                    'uploaded_count' => $uploadedCount,
                    'status' => $status,
                    'percentage' => $totalStudents > 0 ? round(($uploadedCount / $totalStudents) * 100) : 0
                ];
            }

            $totalAllocations = count($assignments);
            $percentage = $totalAllocations > 0 ? round(($completedCount / $totalAllocations) * 100) : 0;

            return response()->json([
                'term' => $term,
                'academic_year' => $year,
                'summary' => [
                    'completed' => $completedCount,
                    'in_progress' => $inProgressCount,
                    'pending' => $pendingCount,
                    'total' => $totalAllocations,
                    'percentage' => $percentage
                ],
                'details' => $details
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function adminResultProgress(Request $request)
    {
        try {
            $settings = DB::table('system_settings')->orderByDesc('id')->first();
            $term = $settings ? $settings->active_term : '3rd Term';
            $year = $settings ? $settings->active_session : '2026/2027';

            $allocations = DB::table('class_subjects as cs')
                ->join('classes as c', 'cs.class_id', '=', 'c.id')
                ->join('subjects as s', 'cs.subject_id', '=', 's.id')
                ->leftJoin('users as u', 'cs.teacher_id', '=', 'u.id')
                ->orderBy('c.name')
                ->orderBy('s.name')
                ->select(
                    'cs.class_id', 'cs.subject_id', 'cs.teacher_id',
                    'c.name as class_name', 's.name as subject_name', 'u.full_name as teacher_name'
                )
                ->get();

            $details = [];
            $completedCount = 0;
            $inProgressCount = 0;
            $pendingCount = 0;

            foreach ($allocations as $item) {
                $totalStudents = DB::table('students')->where('class_id', $item->class_id)->count();
                $uploadedCount = DB::table('grades')
                    ->where('subject_id', $item->subject_id)
                    ->where('term', $term)
                    ->where('academic_year', $year)
                    ->whereIn('student_id', function($q) use ($item) {
                        $q->select('id')->from('students')->where('class_id', $item->class_id);
                    })
                    ->distinct('student_id')
                    ->count();

                $status = 'Pending';
                if ($totalStudents > 0 && $uploadedCount >= $totalStudents) {
                    $status = 'Completed';
                    $completedCount++;
                } elseif ($uploadedCount > 0) {
                    $status = 'In Progress';
                    $inProgressCount++;
                } else {
                    $pendingCount++;
                }

                $details[] = [
                    'class_name' => $item->class_name,
                    'subject_name' => $item->subject_name,
                    'teacher_name' => $item->teacher_name ?: 'Unassigned',
                    'total_students' => $totalStudents,
                    'uploaded_count' => $uploadedCount,
                    'status' => $status,
                    'percentage' => $totalStudents > 0 ? round(($uploadedCount / $totalStudents) * 100) : 0
                ];
            }

            $totalAllocations = count($allocations);
            $percentage = $totalAllocations > 0 ? round(($completedCount / $totalAllocations) * 100) : 0;

            return response()->json([
                'term' => $term,
                'academic_year' => $year,
                'summary' => [
                    'completed' => $completedCount,
                    'in_progress' => $inProgressCount,
                    'pending' => $pendingCount,
                    'total' => $totalAllocations,
                    'percentage' => $percentage
                ],
                'details' => $details
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function studentTimeline(Request $request, $studentId)
    {
        $user = auth('api')->user();
        if ($user->role === 'student' && $user->id != $studentId) {
            return response()->json(['error' => 'Unauthorized view.'], 403);
        }

        try {
            $timeline = DB::table('grades')
                ->where('student_id', $studentId)
                ->select('term', 'academic_year')
                ->distinct()
                ->orderByDesc('academic_year')
                ->orderByDesc('term')
                ->get();

            $unlockedPins = DB::table('result_pins')
                ->where('student_id', $studentId)
                ->where('usage_count', '<', 5)
                ->where('status', 'active')
                ->select('term', 'academic_year', 'usage_count')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'timeline' => $timeline,
                'unlockedPins' => $unlockedPins
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}


