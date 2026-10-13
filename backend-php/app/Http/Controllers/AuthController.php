<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use App\Services\AccountSetupLink;
use App\Services\SchoolMailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        // We check the password manually since the DB column is password_hash
        $user = User::where('username', $credentials['identifier'])
            ->orWhere('email', $credentials['identifier'])
            ->first();

        // If not found in users by username/email, check students table by admission_number
        if (! $user) {
            $student = DB::table('students')
                ->where('admission_number', $credentials['identifier'])
                ->first();
            if ($student) {
                // In the old system, user.id = student.id
                $user = User::find($student->id);
            }
        }

        if (! $user || ! password_verify($credentials['password'], $user->password_hash)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->role === 'student') {
            $student = DB::table('students')->where('id', $user->id)->first();
            if ($student && in_array($student->status, ['inactive', 'suspended', 'graduated'])) {
                return response()->json(['message' => 'Account access restricted. Please contact administrator.'], 403);
            }

            if ($student && password_verify($student->admission_number, $user->password_hash)) {
                $user->must_change_password = true;
            }
        } elseif ($user->role === 'teacher') {
            $teacher = DB::table('teachers')->where('id', $user->id)->first();
            if ($teacher && in_array($teacher->status, ['inactive', 'suspended', 'archived'])) {
                return response()->json(['message' => 'Account access restricted. Please contact administrator.'], 403);
            }

            if (password_verify($user->username, $user->password_hash)) {
                $user->must_change_password = true;
            }
        }

        if ($user->must_change_password) {
            $user->save();
        }

        // Generate token
        if (! $token = auth('api')->login($user)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Log successful login
        ActivityLog::log(
            'login',
            'auth',
            "{$user->full_name} ({$user->role}) logged in",
            ['target_type' => 'user', 'target_id' => $user->id, 'target_name' => $user->full_name]
        );

        $userData = $user->toArray();
        $userData['must_add_signature'] = $user->requiresStaffSignature();
        $userData['must_change_password'] = (bool) $user->must_change_password;
        if ($user->role === 'student') {
            $studentDetails = DB::table('students')
                ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
                ->where('students.id', $user->id)
                ->select('students.admission_number', 'students.class_id', 'classes.name as class_name', 'students.sex', 'students.religion', 'students.date_of_birth')
                ->first();

            if ($studentDetails) {
                $userData = array_merge($userData, (array) $studentDetails);
            }
        }

        return response()->json([
            'token' => $token,
            'user' => $userData,
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return JsonResponse
     */
    public function logout()
    {
        $user = auth('api')->user();
        ActivityLog::log(
            'logout',
            'auth',
            "{$user->full_name} ({$user->role}) logged out",
            ['target_type' => 'user', 'target_id' => $user->id, 'target_name' => $user->full_name]
        );
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Get the authenticated User.
     *
     * @return JsonResponse
     */
    public function me()
    {
        $user = auth('api')->user();
        abort_unless($user, 401);

        $userData = $user->toArray();
        $userData['must_add_signature'] = $user->requiresStaffSignature();
        if ($user->role === 'student') {
            $studentDetails = DB::table('students')
                ->leftJoin('classes', 'students.class_id', '=', 'classes.id')
                ->where('students.id', $user->id)
                ->select('students.admission_number', 'students.class_id', 'classes.name as class_name', 'students.sex', 'students.religion', 'students.date_of_birth')
                ->first();

            if ($studentDetails) {
                $userData = array_merge($userData, (array) $studentDetails);
            }
        }

        return response()->json($userData);
    }

    public function saveStaffSignature(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        abort_unless($user && in_array($user->role, ['teacher', 'admin'], true), 403);
        abort_unless($user->role === 'teacher' || DB::table('teachers')->where('id', $user->id)->exists(), 403);

        $validated = $request->validate([
            'signature' => ['required', 'string', 'max:1000000', 'regex:/^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+\/]+={0,2}$/'],
        ]);
        $image = base64_decode(explode(',', $validated['signature'], 2)[1], true);
        if ($image === false || @getimagesizefromstring($image) === false) {
            throw ValidationException::withMessages([
                'signature' => 'Please draw and accept a signature, or upload a valid signature image.',
            ]);
        }

        DB::transaction(function () use ($user, $validated): void {
            if (! DB::table('teachers')->where('id', $user->id)->exists()) {
                DB::table('teachers')->insert(['id' => $user->id, 'created_at' => now(), 'updated_at' => now()]);
            }
            DB::table('teachers')->where('id', $user->id)->update([
                'signature' => $validated['signature'],
                'updated_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Signature saved successfully']);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'oldPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:8', 'different:oldPassword', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        ]);

        $user = auth('api')->user();
        abort_unless($user, 401);

        if (! Hash::check($validated['oldPassword'], $user->password_hash)) {
            return response()->json(['message' => 'The current password is incorrect.'], 422);
        }

        $user->password_hash = Hash::make($validated['newPassword']);
        $user->must_change_password = false;
        $user->save();

        return response()->json(['message' => 'Password changed successfully. Please sign in again.']);
    }

    public function completeAccountSetup(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'string', 'min:8', 'confirmed', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        ]);

        $tokenHash = hash('sha256', $validated['token']);
        DB::transaction(function () use ($tokenHash, $validated): void {
            $setupToken = DB::table('account_setup_tokens')
                ->where('token_hash', $tokenHash)
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            abort_unless($setupToken, 422, 'This password link is invalid or expired. Request another link using the registered email.');

            $user = User::find($setupToken->user_id);
            $recipientMatches = $user && (
                ($user->email && hash_equals(strtolower($user->email), strtolower($setupToken->email)))
                || ($user->role === 'student'
                    && DB::table('students')
                        ->where('id', $user->id)
                        ->whereRaw('LOWER(parent_email) = ?', [strtolower($setupToken->email)])
                        ->exists())
            );
            abort_unless(
                $recipientMatches,
                422,
                'This password link is no longer valid.'
            );

            $user->password_hash = Hash::make($validated['password']);
            $user->must_change_password = false;
            $user->save();

            DB::table('account_setup_tokens')->where('id', $setupToken->id)->update([
                'used_at' => now(),
                'updated_at' => now(),
            ]);

        });

        return response()->json(['message' => 'Password set successfully. You can now sign in with your account ID.']);
    }

    public function requestAccountSetup(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $user = User::where('username', $validated['identifier'])->first();

        if (! $user) {
            $studentId = DB::table('students')
                ->where('admission_number', $validated['identifier'])
                ->value('id');
            $user = $studentId ? User::find($studentId) : null;
        }

        $recipientEmail = null;
        $recipientName = $user?->full_name ?? '';
        $accountId = $user?->username ?? $validated['identifier'];

        if ($user && $user->role === 'student') {
            $student = DB::table('students')->where('id', $user->id)->first();
            if ($student && $student->parent_email
                && hash_equals(strtolower($student->parent_email), strtolower($validated['email']))) {
                $recipientEmail = $student->parent_email;
                $recipientName = $student->parent_name ?: 'Parent/Guardian';
                $accountId = $student->admission_number;
            } elseif ($user->email
                && hash_equals(strtolower($user->email), strtolower($validated['email']))) {
                $recipientEmail = $user->email;
            }
        } elseif ($user && $user->email
            && hash_equals(strtolower($user->email), strtolower($validated['email']))) {
            $recipientEmail = $user->email;
        }

        if ($user && $recipientEmail) {
            $setupUrl = app(AccountSetupLink::class)->createFor($user->id, $recipientEmail);
            app(SchoolMailer::class)->sendAccountSetupReminder(
                $recipientEmail,
                $recipientName,
                $accountId,
                $setupUrl
            );
        }

        return response()->json([
            'message' => 'If the account ID and email match an eligible account, a password setup or reset link has been sent.',
        ]);
    }

    /**
     * Get the token array structure.
     *
     * @param  string  $token
     * @return JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'token' => $token,
        ]);
    }
}
