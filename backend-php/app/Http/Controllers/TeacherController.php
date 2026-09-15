<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = DB::table('users')
            ->leftJoin('teachers', 'users.id', '=', 'teachers.id')
            ->where('users.role', 'teacher')
            ->select(
                'users.id', 'users.username', 'users.full_name', 'users.email', 'users.passport_photo', 'users.created_at', 'teachers.status',
                'teachers.surname', 'teachers.first_name', 'teachers.other_names', 'teachers.address', 'teachers.state_of_residence', 'teachers.lga_of_residence',
                'teachers.signature as digital_signature', 'teachers.signature',
                'teachers.phone_number', 'teachers.date_of_birth', 'teachers.qualification', 'teachers.discipline', 'teachers.employment_category'
            )
            ->orderBy('users.full_name')
            ->get();
            
        return response()->json($teachers);
    }

    public function show($id)
    {
        $teacher = DB::table('teachers')->where('id', $id)->first();
        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }
        return response()->json($teacher);
    }

    public function store(Request $request)
    {
        $request->validate([
            'surname' => 'required|string',
            'first_name' => 'required|string',
        ]);

        $id = DB::table('teachers')->insertGetId([
            'surname' => $request->surname,
            'first_name' => $request->first_name,
            'other_names' => $request->other_names,
            'address' => $request->address,
            'state_of_residence' => $request->state_of_residence,
            'lga_of_residence' => $request->lga_of_residence,
            'signature' => $request->signature,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json(['message' => 'Teacher created successfully', 'id' => $id], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'surname' => 'required|string',
            'first_name' => 'required|string',
        ]);

        $updated = DB::table('teachers')->where('id', $id)->update([
            'surname' => $request->surname,
            'first_name' => $request->first_name,
            'other_names' => $request->other_names,
            'address' => $request->address,
            'state_of_residence' => $request->state_of_residence,
            'lga_of_residence' => $request->lga_of_residence,
            'signature' => $request->signature,
            'status' => $request->status ?? 'active',
        ]);

        if (!$updated) {
            return response()->json(['error' => 'Teacher not found or no changes made'], 404);
        }

        return response()->json(['message' => 'Teacher updated successfully']);
    }

    public function destroy($id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Permission denied: Only Admins can delete teachers.'], 403);
        }

        try {
            DB::beginTransaction();

            $teacherUser = DB::table('users')->where('id', $id)->where('role', 'teacher')->first();
            if (!$teacherUser) {
                return response()->json(['error' => 'Teacher not found.'], 404);
            }

            // Deleting the user will cascade to teachers table
            DB::table('users')->where('id', $id)->delete();

            DB::commit();
            return response()->json(['message' => 'Teacher deleted successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to delete teacher: ' . $e->getMessage()], 500);
        }
    }

    public function assignments(Request $request)
    {
        $userId = auth('api')->user()->id;

        try {
            $classes = DB::table('class_subjects')
                ->join('classes', 'class_subjects.class_id', '=', 'classes.id')
                ->join('subjects', 'class_subjects.subject_id', '=', 'subjects.id')
                ->where('class_subjects.teacher_id', $userId)
                ->select(
                    'class_subjects.class_id',
                    'class_subjects.subject_id',
                    'classes.name as class_name',
                    'subjects.name as subject_name'
                )
                ->get();

            $formClass = DB::table('classes')->where('form_master_id', $userId)->select('id', 'name')->first();

            return response()->json([
                'subjects' => $classes,
                'formClass' => $formClass ?: null
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage());
            return response()->json(['error' => 'An internal server error occurred.'], 500);
        }
    }
}
