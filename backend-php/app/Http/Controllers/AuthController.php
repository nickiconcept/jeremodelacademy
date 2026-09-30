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

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'oldPassword' => ['required', 'string'],
            'newPassword' => ['required', 'string', 'min:12', 'different:oldPassword', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
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
            'password' => ['required', 'string', 'min:12', 'confirmed', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        ]);

        $tokenHash = hash('sha256', $validated['token']);
        DB::transaction(function () use ($tokenHash, $validated): void {
            $setupToken = DB::table('account_setup_tokens')
                ->where('token_hash', $tokenHash)
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            abort_unless($setupToken, 422, 'This account setup link is invalid or expired. Request a new link from the school.');

            $user = User::find($setupToken->user_id);
            $recipientMatches = $user && (
                $user->email === $setupToken->email
                || ($user->role === 'student'
                    && DB::table('students')
                        ->where('id', $user->id)
                        ->where('parent_email', $setupToken->email)
                        ->exists())
            );
            abort_unless(
                $recipientMatches,
                422,
                'This account setup link is no longer valid.'
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

        $user = User::where('username', $validated['identifier'])
            ->whereIn('role', ['teacher', 'student'])
            ->first();

        if (! $user) {
            $studentId = DB::table('students')
                ->where('admission_number', $validated['identifier'])
                ->value('id');
            $user = $studentId ? User::where('id', $studentId)->where('role', 'student')->first() : null;
        }

        if ($user && $user->role === 'student') {
            $student = DB::table('students')->where('id', $user->id)->first();
            if ($student && hash_equals(strtolower((string) $student->parent_email), strtolower($validated['email']))) {
                $setupUrl = app(AccountSetupLink::class)->createFor($user->id, $student->parent_email);
                app(SchoolMailer::class)->sendAccountSetupReminder(
                    $student->parent_email,
                    $student->parent_name ?: 'Parent/Guardian',
                    $student->admission_number,
                    $setupUrl
                );
            }
        } elseif ($user && $user->role === 'teacher' && $user->email
            && hash_equals(strtolower($user->email), strtolower($validated['email']))) {
            $setupUrl = app(AccountSetupLink::class)->createFor($user->id, $user->email);
            app(SchoolMailer::class)->sendAccountSetupReminder($user->email, $user->full_name, $user->username, $setupUrl);
        }

        return response()->json([
            'message' => 'If the account ID and email match an eligible student or staff account, a password setup link has been sent.',
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
