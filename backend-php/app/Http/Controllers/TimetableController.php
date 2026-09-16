<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Timetable;

class TimetableController extends Controller
{
    public function index(Request $request)
    {
        $query = Timetable::with(['class', 'subject', 'teacher']);
        
        if ($request->class_id) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->teacher_id) {
            $query->where('teacher_id', $request->teacher_id);
        }
        
        return response()->json($query->orderBy('day_of_week')->orderBy('start_time')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'type' => 'nullable|string|in:class,short_break,long_break',
            'activity' => 'nullable|string',
            'subject_id' => 'required_if:type,class|nullable|exists:subjects,id',
            'teacher_id' => 'nullable|exists:users,id',
            'day_of_week' => 'required|string',
            'start_time' => ['required', 'regex:/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/'],
            'end_time' => ['required', 'regex:/^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/']
        ]);

        // Normalize time to HH:mm
        $request->merge([
            'start_time' => substr($request->start_time, 0, 5),
            'end_time' => substr($request->end_time, 0, 5),
        ]);

        if (strtotime($request->end_time) <= strtotime($request->start_time)) {
            return response()->json(['errors' => ['end_time' => ['The end time must be after the start time.']]], 422);
        }

        // Check for double booking
        $conflict = Timetable::where('day_of_week', $request->day_of_week)
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->where(function ($query) use ($request) {
                $query->where('class_id', $request->class_id);
                if ($request->teacher_id) {
                    $query->orWhere('teacher_id', $request->teacher_id);
                }
            })->exists();

        if ($conflict) {
            return response()->json(['message' => 'This time slot overlaps with an existing class or teacher schedule.'], 422);
        }

        $timetable = Timetable::create($request->all());
        
        return response()->json(['message' => 'Timetable entry added', 'timetable' => $timetable->load(['class', 'subject', 'teacher'])]);
    }

    public function destroy($id)
    {
        Timetable::findOrFail($id)->delete();
        return response()->json(['message' => 'Timetable entry deleted']);
    }
}
