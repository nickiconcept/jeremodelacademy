<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function registerTeacher(Request $request)
    {
        $full_name = $request->input('full_name');
        $email = $request->input('email');
        $passport_photo = $request->input('passport_photo');
        $surname = $request->input('surname');
        $first_name = $request->input('first_name');
        $other_names = $request->input('other_names');
        $address = $request->input('address');
        $state_of_residence = $request->input('state_of_residence');
        $lga_of_residence = $request->input('lga_of_residence');
        $signature = $request->input('signature');
        $phone_number = $request->input('phone_number');
        $date_of_birth = $request->input('date_of_birth');
        $qualification = $request->input('qualification');
        $discipline = $request->input('discipline');
        $employment_category = $request->input('employment_category');

        if (!$full_name) {
            return response()->json(['error' => 'Full name is required'], 400);
        }

        // Check for duplicate teacher by email and full_name
        if ($email && $full_name) {
            $duplicate = DB::table('users')
                ->where('role', 'teacher')
                ->where('email', $email)
                ->where('full_name', $full_name)
                ->first();
            if ($duplicate) {
                return response()->json(['error' => 'Duplicate Registration: A teacher with this Full Name and Email already exists.'], 400);
            }
        }

        try {
            DB::beginTransaction();

            $year = date('Y');
            $latestTeacher = DB::table('users')
                ->where('role', 'teacher')
                ->where('username', 'like', "JMA/STF/{$year}/%")
                ->orderBy('username', 'desc')
                ->first();
            
            if ($latestTeacher) {
                // Extract the last 3 digits from JMA/STF/YYYY/XXX
                $lastSeq = (int) substr($latestTeacher->username, -3);
                $nextSeq = str_pad($lastSeq + 1, 3, '0', STR_PAD_LEFT);
            } else {
                $nextSeq = '001';
            }
            
            $staff_id = "JMA/STF/{$year}/{$nextSeq}";

            $username = strtoupper($staff_id);
            // Laravel's password_hash equivalent
            $password_hash = password_hash($staff_id, PASSWORD_DEFAULT);

            $userId = DB::table('users')->insertGetId([
                'username' => $username,
                'password_hash' => $password_hash,
                'email' => $email,
                'full_name' => $full_name,
                'role' => 'teacher',
                'passport_photo' => $passport_photo,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('teachers')->insert([
                'id' => $userId,
                'surname' => $surname,
                'first_name' => $first_name,
                'other_names' => $other_names,
                'address' => $address,
                'state_of_residence' => $state_of_residence,
                'lga_of_residence' => $lga_of_residence,
                'signature' => $signature,
                'status' => 'active',
                'phone_number' => $phone_number,
                'date_of_birth' => $date_of_birth,
                'qualification' => $qualification,
                'discipline' => $discipline,
                'employment_category' => $employment_category,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();
            return response()->json(['message' => 'Teacher registered successfully', 'teacherId' => $userId], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json(['error' => 'Username already exists'], 400);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateTeacher(Request $request, $id)
    {
        $user = auth('api')->user();
        if ($user->role !== 'admin' && $user->id != $id) {
            return response()->json(['error' => 'Access denied: You can only update your own profile'], 403);
        }

        $full_name = $request->input('full_name');
        $surname = $request->input('surname');
        $first_name = $request->input('first_name');
        $other_names = $request->input('other_names');
        $address = $request->input('address');
        $state_of_residence = $request->input('state_of_residence');
        $lga_of_residence = $request->input('lga_of_residence');
        $passport_photo = $request->input('passport_photo');
        $digital_signature = $request->input('digital_signature');
        $signature = $request->input('signature');
        $phone_number = $request->input('phone_number');
        $date_of_birth = $request->input('date_of_birth');
        $qualification = $request->input('qualification');
        $discipline = $request->input('discipline');
        $employment_category = $request->input('employment_category');

        $sig = $digital_signature !== null ? $digital_signature : $signature;

        try {
            DB::beginTransaction();

            $computedName = $full_name ?: trim("{$surname} {$first_name} {$other_names}");

            $updateData = ['full_name' => $computedName ?: 'Teacher', 'updated_at' => now()];
            if ($passport_photo !== null) {
                $updateData['passport_photo'] = $passport_photo;
            }

            DB::table('users')->where('id', $id)->update($updateData);

            $teacherUpdateData = [
                'updated_at' => now()
            ];
            if ($surname !== null) $teacherUpdateData['surname'] = $surname;
            if ($first_name !== null) $teacherUpdateData['first_name'] = $first_name;
            if ($other_names !== null) $teacherUpdateData['other_names'] = $other_names;
            if ($address !== null) $teacherUpdateData['address'] = $address;
            if ($state_of_residence !== null) $teacherUpdateData['state_of_residence'] = $state_of_residence;
            if ($lga_of_residence !== null) $teacherUpdateData['lga_of_residence'] = $lga_of_residence;
            if ($sig !== null) $teacherUpdateData['signature'] = $sig;
            if ($phone_number !== null) $teacherUpdateData['phone_number'] = $phone_number;
            if ($date_of_birth !== null) $teacherUpdateData['date_of_birth'] = $date_of_birth;
            if ($qualification !== null) $teacherUpdateData['qualification'] = $qualification;
            if ($discipline !== null) $teacherUpdateData['discipline'] = $discipline;
            if ($employment_category !== null) $teacherUpdateData['employment_category'] = $employment_category;

            DB::table('teachers')->where('id', $id)->update($teacherUpdateData);

            DB::commit();
            return response()->json(['message' => 'Teacher updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        $userId = $request->input('userId');
        $status = $request->input('status');

        if (!$userId || !$status) {
            return response()->json(['error' => 'User ID and status are required'], 400);
        }

        try {
            DB::beginTransaction();
            
            $user = DB::table('users')->where('id', $userId)->first();
            if (!$user) {
                DB::rollBack();
                return response()->json(['error' => 'User not found'], 404);
            }

            // In old node.js it did: UPDATE USERS SET status = ?
            // However, the new Laravel schema removed 'status' from users table.
            // It relies on students.status and teachers.status
            if ($user->role === 'student') {
                DB::table('students')->where('id', $userId)->update(['status' => $status]);
            } elseif ($user->role === 'teacher') {
                $exists = DB::table('teachers')->where('id', $userId)->exists();
                if ($exists) {
                    DB::table('teachers')->where('id', $userId)->update(['status' => $status]);
                } else {
                    DB::table('teachers')->insert(['id' => $userId, 'status' => $status]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'User status updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
