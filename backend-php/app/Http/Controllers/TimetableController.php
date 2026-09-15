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
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'nullable|exists:users,id',
            'day_of_week' => 'required|string',
            'start_time' => 'required|string',
            'end_time' => 'required|string'
        ]);

        $timetable = Timetable::create($request->all());
        
        return response()->json(['message' => 'Timetable entry added', 'timetable' => $timetable->load(['class', 'subject', 'teacher'])]);
    }

    public function destroy($id)
    {
        Timetable::findOrFail($id)->delete();
        return response()->json(['message' => 'Timetable entry deleted']);
    }
}
