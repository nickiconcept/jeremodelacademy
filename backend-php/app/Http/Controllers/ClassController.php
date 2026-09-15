<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{
    public function index()
    {
        $classes = DB::table('classes')
            ->leftJoin('users', 'classes.form_master_id', '=', 'users.id')
            ->where('classes.name', 'NOT LIKE', '%Waiting Room%')
            ->select('classes.*', 'users.full_name as form_master_name')
            ->orderBy('classes.name')
            ->get();
        return response()->json($classes);
    }

    public function waitingRooms()
    {
        $classes = DB::table('classes')
            ->leftJoin('users', 'classes.form_master_id', '=', 'users.id')
            ->where('classes.name', 'LIKE', '%Waiting Room%')
            ->select('classes.*', 'users.full_name as form_master_name')
            ->orderBy('classes.name')
            ->get();
        return response()->json($classes);
    }

    public function show($id)
    {
        $class = DB::table('classes')->where('id', $id)->first();
        if (!$class) {
            return response()->json(['error' => 'Class not found'], 404);
        }
        return response()->json($class);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'tier' => 'required|string',
        ]);

        $id = DB::table('classes')->insertGetId([
            'name' => $request->name,
            'tier' => $request->tier,
        ]);

        return response()->json(['message' => 'Class created successfully', 'id' => $id], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string',
            'tier' => 'required|string',
        ]);

        $updated = DB::table('classes')->where('id', $id)->update([
            'name' => $request->name,
            'tier' => $request->tier,
        ]);

        if (!$updated) {
            return response()->json(['error' => 'Class not found or no changes made'], 404);
        }

        return response()->json(['message' => 'Class updated successfully']);
    }

    public function destroy($id)
    {
        $deleted = DB::table('classes')->where('id', $id)->delete();
        if (!$deleted) {
            return response()->json(['error' => 'Class not found'], 404);
        }
        return response()->json(['message' => 'Class deleted successfully']);
    }
    public function assignFormMaster(Request $request)
    {
        $class_id = $request->input('class_id');
        $teacher_id = $request->input('teacher_id');

        try {
            if ($teacher_id) {
                $existingAssignment = DB::table('classes')->where('form_master_id', $teacher_id)->where('id', '!=', $class_id)->first();
                if ($existingAssignment) {
                    return response()->json(['error' => "This teacher is already assigned as Form Master for {$existingAssignment->name}. A teacher can only be a form master for one class."], 400);
                }
            }

            DB::table('classes')->where('id', $class_id)->update(['form_master_id' => $teacher_id ?: null]);
            return response()->json(['message' => 'Form master assigned successfully']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }
}
