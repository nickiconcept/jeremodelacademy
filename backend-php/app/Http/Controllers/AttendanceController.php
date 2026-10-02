<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function studentAttendance($studentId)
    {
        $user = auth('api')->user();
        $studentClassId = DB::table('students')->where('id', $studentId)->value('class_id');
        abort_unless(
            $user && (
                $user->role === 'admin'
                || ($user->role === 'student' && (string) $user->id === (string) $studentId)
                || ($studentClassId && $user->role === 'teacher' && $this->teacherIsFormMaster($studentClassId))
            ),
            403
        );

        try {
            $attendance = DB::table('attendance')
                ->where('student_id', $studentId)
                ->orderByDesc('date')
                ->limit(90)
                ->select('date', 'status')
                ->get();

            return response()->json($attendance);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function classReport(Request $request, $classId)
    {
        $view = $request->query('view', 'summary');
        $start_date = $request->query('start_date');
        $end_date = $request->query('end_date');
        $user = auth('api')->user();

        try {
            $this->requireAdminOrFormMaster($classId);

            $query = DB::table('students as s')
                ->join('users as u', 's.id', '=', 'u.id')
                ->leftJoin('attendance as a', function ($join) use ($start_date, $end_date) {
                    $join->on('s.id', '=', 'a.student_id');
                    if ($start_date && $end_date) {
                        $join->whereBetween('a.date', [$start_date, $end_date]);
                    }
                })
                ->where('s.class_id', $classId);

            if ($view === 'monthly') {
                $query->select(
                    's.id as student_id',
                    'u.full_name',
                    's.admission_number',
                    DB::raw("DATE_FORMAT(a.date, '%Y-%m') as month"),
                    DB::raw("SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count"),
                    DB::raw("SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count"),
                    DB::raw("SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count"),
                    DB::raw('COUNT(a.status) as total_days')
                )
                    ->groupBy('s.id', 'u.full_name', 's.admission_number', DB::raw("DATE_FORMAT(a.date, '%Y-%m')"))
                    ->orderBy('u.full_name')
                    ->orderBy('month');
            } elseif ($view === 'weekdays') {
                $query->select(
                    's.id as student_id',
                    'u.full_name',
                    's.admission_number',
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 2 AND a.status = 'present' THEN 1 ELSE 0 END) as mon_present"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 2 AND a.status IN ('absent', 'late') THEN 1 ELSE 0 END) as mon_absent"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 3 AND a.status = 'present' THEN 1 ELSE 0 END) as tue_present"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 3 AND a.status IN ('absent', 'late') THEN 1 ELSE 0 END) as tue_absent"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 4 AND a.status = 'present' THEN 1 ELSE 0 END) as wed_present"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 4 AND a.status IN ('absent', 'late') THEN 1 ELSE 0 END) as wed_absent"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 5 AND a.status = 'present' THEN 1 ELSE 0 END) as thu_present"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 5 AND a.status IN ('absent', 'late') THEN 1 ELSE 0 END) as thu_absent"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 6 AND a.status = 'present' THEN 1 ELSE 0 END) as fri_present"),
                    DB::raw("SUM(CASE WHEN DAYOFWEEK(a.date) = 6 AND a.status IN ('absent', 'late') THEN 1 ELSE 0 END) as fri_absent")
                )
                    ->groupBy('s.id', 'u.full_name', 's.admission_number')
                    ->orderBy('u.full_name');
            } else {
                $query->select(
                    's.id as student_id',
                    'u.full_name',
                    's.admission_number',
                    DB::raw("SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count"),
                    DB::raw("SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count"),
                    DB::raw("SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count"),
                    DB::raw('COUNT(a.status) as total_days')
                )
                    ->groupBy('s.id', 'u.full_name', 's.admission_number')
                    ->orderBy('u.full_name');
            }

            $report = $query->get();

            return response()->json($report);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function classRoster(Request $request, $classId, $date)
    {
        $user = auth('api')->user();

        try {
            $this->requireAdminOrFormMaster($classId);

            $roster = DB::table('students as s')
                ->join('users as u', 's.id', '=', 'u.id')
                ->leftJoin('attendance as a', function ($join) use ($date) {
                    $join->on('s.id', '=', 'a.student_id')
                        ->where('a.date', '=', $date);
                })
                ->where('s.class_id', $classId)
                ->orderBy('u.full_name')
                ->select('s.id as student_id', 'u.full_name', 's.admission_number', 'a.status')
                ->get();

            return response()->json($roster);
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    public function saveAttendance(Request $request)
    {
        $validated = $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'date' => ['required', 'date_format:Y-m-d'],
            'records' => ['required', 'array', 'min:1', 'max:500'],
            'records.*.student_id' => ['required', 'integer', 'distinct', 'exists:students,id'],
            'records.*.status' => ['required', 'in:present,absent,late'],
            'records.*.original_status' => ['nullable', 'in:present,absent,late'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'offline_sync' => ['sometimes', 'boolean'],
            'offline_sync_id' => ['required_if:offline_sync,true', 'nullable', 'uuid'],
            'captured_at' => ['required_if:offline_sync,true', 'nullable', 'date'],
            'timezone_offset_minutes' => ['required_if:offline_sync,true', 'nullable', 'integer', 'between:-840,840'],
        ]);

        $class_id = $request->input('class_id');
        $date = $request->input('date');
        $records = $request->input('records'); // array of {student_id, status}
        $userLat = $request->input('lat');
        $userLng = $request->input('lng');
        $locationAccuracy = $validated['location_accuracy'] ?? null;
        $offlineSync = (bool) ($validated['offline_sync'] ?? false);
        $offlineSyncId = $validated['offline_sync_id'] ?? null;
        $capturedAt = null;
        if ($offlineSync) {
            $capturedAt = Carbon::parse($validated['captured_at'])->utc();
            if ($capturedAt->greaterThan(now()->addMinutes(5)) || $capturedAt->lessThan(now()->subHours(24))) {
                return response()->json(['error' => 'Offline attendance must be synced within 24 hours of capture.'], 422);
            }
            $localCapturedDate = $capturedAt->copy()->subMinutes((int) $validated['timezone_offset_minutes'])->toDateString();
            if ($localCapturedDate !== $date) {
                return response()->json(['error' => 'The captured attendance date does not match the selected attendance date.'], 422);
            }
        }
        $user = auth('api')->user();
        abort_unless($user && in_array($user->role, ['admin', 'teacher'], true), 403);

        $this->requireAdminOrFormMaster($class_id);
        $studentIds = collect($validated['records'])->pluck('student_id')->unique();
        $classStudentIds = DB::table('students')
            ->where('class_id', $class_id)
            ->whereIn('id', $studentIds)
            ->pluck('id');
        abort_unless($classStudentIds->count() === $studentIds->count(), 403, 'Attendance includes students outside the authorized class.');

        try {
            if ($offlineSync) {
                $existingReceipt = DB::table('offline_sync_receipts')->where('sync_id', $offlineSyncId)->first();
                if ($existingReceipt) {
                    if ((string) $existingReceipt->user_id !== (string) $user->id || $existingReceipt->operation !== 'attendance') {
                        return response()->json(['error' => 'This offline sync ID was already used for a different action.'], 409);
                    }

                    return response()->json(['message' => 'This attendance batch was already synchronized.', 'already_synced' => true]);
                }

                $conflictingStudentIds = [];
                foreach ($records as $record) {
                    if (! array_key_exists('original_status', $record)) {
                        return response()->json(['error' => 'Offline attendance is missing its original status snapshot. Refresh the roster and retry.'], 422);
                    }
                    $existingAttendance = DB::table('attendance')
                        ->where('student_id', $record['student_id'])
                        ->where('date', $date)
                        ->first(['status']);
                    if (($existingAttendance->status ?? null) !== ($record['original_status'] ?? null)) {
                        $conflictingStudentIds[] = $record['student_id'];
                    }
                }

                if ($conflictingStudentIds !== []) {
                    return response()->json([
                        'error' => 'Some attendance statuses changed on the server while this device was offline. Review the roster before syncing again.',
                        'conflicting_student_ids' => $conflictingStudentIds,
                    ], 409);
                }
            }

            if ($user->role === 'teacher') {
                $cls = DB::table('classes')->where('id', $class_id)->first();
                if (! $cls || $cls->form_master_id != $user->id) {
                    return response()->json(['error' => 'Access denied: You are not the Form Master of this class'], 403);
                }

                $settings = DB::table('system_settings')->first();
                $today = date('Y-m-d');
                $perms = $user->permissions ?? [];
                if ($date < $today
                    && (! $settings || ! $settings->allow_past_attendance)
                    && ! in_array('can_take_past_attendance', $perms)
                    && ! $offlineSync
                ) {
                    return response()->json(['error' => 'Access denied: Past attendance is not permitted by global settings.'], 403);
                }

                // Geofencing is configurable and only applies to teachers taking attendance.
                $settings = DB::table('system_settings')->first();
                if ($settings && (bool) $settings->attendance_geofencing_enabled) {
                    $locations = [
                        [$settings->attendance_location1_lat, $settings->attendance_location1_lng],
                        [$settings->attendance_location2_lat, $settings->attendance_location2_lng],
                    ];
                    $configuredLocations = array_filter(
                        $locations,
                        static fn (array $location): bool => $location[0] !== null && $location[1] !== null
                    );

                    if ($configuredLocations === []) {
                        return response()->json(['error' => 'Geofencing is enabled, but no school site coordinates are configured. Contact an administrator.'], 403);
                    }

                    if ($userLat === null || $userLng === null) {
                        return response()->json(['error' => 'Geofencing is enabled. You must grant location access to take attendance.'], 403);
                    }

                    $radius = (int) ($settings->attendance_radius ?: 100);
                    if ($offlineSync && ($locationAccuracy === null || $locationAccuracy > $radius)) {
                        return response()->json(['error' => 'The saved GPS accuracy is not sufficient to verify this offline attendance.'], 422);
                    }
                    $withinSchoolSite = false;

                    foreach ($configuredLocations as [$locationLat, $locationLng]) {
                        $distance = $this->calculateDistance($userLat, $userLng, $locationLat, $locationLng);
                        $distanceWithAccuracy = $distance + ($offlineSync ? (float) $locationAccuracy : 0);
                        if ($distanceWithAccuracy <= $radius) {
                            $withinSchoolSite = true;
                            break;
                        }
                    }

                    if (! $withinSchoolSite) {
                        return response()->json(['error' => 'Geofence Error: You must be physically on school premises to take attendance.'], 403);
                    }
                }
            }

            DB::beginTransaction();

            foreach ($records as $rec) {
                $exists = DB::table('attendance')
                    ->where('student_id', $rec['student_id'])
                    ->where('date', $date)
                    ->first();

                if ($exists) {
                    DB::table('attendance')
                        ->where('student_id', $rec['student_id'])
                        ->where('date', $date)
                        ->update([
                            'status' => $rec['status'],
                            'marked_by' => $user->id,
                        ]);
                } else {
                    DB::table('attendance')->insert([
                        'student_id' => $rec['student_id'],
                        'date' => $date,
                        'status' => $rec['status'],
                        'marked_by' => $user->id,
                    ]);
                }
            }

            if ($offlineSync) {
                DB::table('offline_sync_receipts')->insert([
                    'sync_id' => $offlineSyncId,
                    'user_id' => $user->id,
                    'operation' => 'attendance',
                    'class_id' => $class_id,
                    'attendance_date' => $date,
                    'captured_at' => $capturedAt,
                    'location_lat' => $userLat,
                    'location_lng' => $userLng,
                    'location_accuracy' => $locationAccuracy,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json(['message' => 'Attendance records updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage());

            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // in meters

        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $latDelta = $lat2 - $lat1;
        $lonDelta = $lon2 - $lon1;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($lat1) * cos($lat2) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
