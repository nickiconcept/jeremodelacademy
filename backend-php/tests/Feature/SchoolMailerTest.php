<?php

namespace Tests\Feature;

use App\Mail\SchoolMessage;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\AccountSetupLink;
use App\Services\SchoolMailer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SchoolMailerTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_registration_message_gives_the_default_password_and_requires_a_change(): void
    {
        Mail::fake();

        app(SchoolMailer::class)->studentRegistered('guardian@example.com', 'Student Name', 'JMA/2026/0001');

        Mail::assertSent(SchoolMessage::class, function (SchoolMessage $mail): bool {
            return $mail->hasTo('guardian@example.com')
                && str_contains($mail->body, 'JMA/2026/0001')
                && str_contains($mail->body, 'initial portal password are JMA/2026/0001')
                && str_contains($mail->body, 'change the password at first sign-in')
                && ! str_contains($mail->body, 'unusable-random-password');
        });
    }

    public function test_teacher_registration_message_is_sent_to_the_teacher(): void
    {
        Mail::fake();

        app(SchoolMailer::class)->teacherRegistered('teacher@example.com', 'Teacher Name', 'JMA/STF/2026/001');

        Mail::assertSent(SchoolMessage::class, fn (SchoolMessage $mail): bool => $mail->hasTo('teacher@example.com')
            && str_contains($mail->body, 'JMA/STF/2026/001')
            && str_contains($mail->body, 'initial portal password are JMA/STF/2026/001')
            && str_contains($mail->body, 'change the password at first sign-in')
        );
    }

    public function test_missing_guardian_email_does_not_send_a_message(): void
    {
        Mail::fake();

        app(SchoolMailer::class)->studentRegistered(null, 'Student Name', 'JMA/2026/0001');

        Mail::assertNothingOutgoing();
    }

    public function test_student_registration_uses_admission_number_as_default_and_guardian_email_is_optional(): void
    {
        Mail::fake();
        $admin = User::create([
            'username' => 'ADMIN-STUDENT-REG',
            'password_hash' => bcrypt('admin-password'),
            'full_name' => 'Admin User',
            'role' => 'admin',
            'permissions' => [],
        ]);

        $response = $this->actingAs($admin, 'api')->postJson('/api/users/register-student', [
            'full_name' => 'New Student',
        ])->assertCreated();

        $student = User::findOrFail($response->json('studentId'));
        $admissionNumber = $response->json('admission_number');

        $this->assertTrue(password_verify($admissionNumber, $student->password_hash));
        $this->assertTrue($student->must_change_password);
        $this->assertNull(DB::table('students')->where('id', $student->id)->value('parent_email'));
        Mail::assertNothingOutgoing();
    }

    public function test_teacher_registration_uses_staff_id_as_default_password(): void
    {
        $admin = User::create([
            'username' => 'ADMIN-TEACHER-REG',
            'password_hash' => bcrypt('admin-password'),
            'full_name' => 'Admin User',
            'role' => 'admin',
            'permissions' => [],
        ]);

        $this->actingAs($admin, 'api')->postJson('/api/users/register-teacher', [
            'full_name' => 'New Teacher',
            'email' => 'new-teacher@example.com',
        ])->assertCreated();

        $teacher = User::where('email', 'new-teacher@example.com')->firstOrFail();
        $this->assertTrue(password_verify($teacher->username, $teacher->password_hash));
        $this->assertTrue($teacher->must_change_password);
    }

    public function test_first_login_password_change_unlocks_protected_portal_routes(): void
    {
        $student = User::create([
            'username' => 'STUDENT-FORCE-CHANGE',
            'password_hash' => bcrypt('JMA/INIT/001'),
            'must_change_password' => true,
            'full_name' => 'Student User',
            'role' => 'student',
            'permissions' => [],
        ]);
        DB::table('students')->insert([
            'id' => $student->id,
            'admission_number' => 'JMA/INIT/001',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $login = $this->postJson('/api/auth/login', [
            'identifier' => $student->username,
            'password' => 'JMA/INIT/001',
        ])->assertOk()->assertJsonPath('user.must_change_password', true);

        $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
            ->getJson('/api/students')
            ->assertForbidden();

        $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
            ->postJson('/api/auth/change-password', [
                'oldPassword' => 'JMA/INIT/001',
                'newPassword' => 'Stronger-Password-2026',
            ])
            ->assertOk();

        $this->assertFalse($student->fresh()->must_change_password);
        $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
            ->postJson('/api/pins/verify', [])
            ->assertUnprocessable();
    }

    public function test_fee_receipt_is_sent_to_the_guardian(): void
    {
        Mail::fake();
        $studentId = DB::table('users')->insertGetId([
            'username' => 'STU-RECEIPT',
            'password_hash' => bcrypt('test-password'),
            'full_name' => 'Student Name',
            'role' => 'student',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('students')->insert([
            'id' => $studentId,
            'admission_number' => 'STU-RECEIPT',
            'parent_name' => 'Guardian Name',
            'parent_email' => 'guardian@example.com',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        app(SchoolMailer::class)->feeReceipt($studentId, 'REC-2026-1234', 5000, 'Cash', 'Tuition Fee');

        Mail::assertSent(SchoolMessage::class, fn (SchoolMessage $mail): bool => $mail->hasTo('guardian@example.com')
                && str_contains($mail->body, 'REC-2026-1234')
                && str_contains($mail->body, '5,000.00')
        );
    }

    public function test_result_entry_closure_uses_bcc_for_guardian_addresses(): void
    {
        Mail::fake();
        $firstStudentId = $this->createStudentWithGuardian('STU-EMAIL-1', 'guardian-one@example.com');
        $secondStudentId = $this->createStudentWithGuardian('STU-EMAIL-2', 'guardian-two@example.com');

        app(SchoolMailer::class)->resultEntryClosed('3rd Term', '2026/2027');

        Mail::assertSent(SchoolMessage::class, function (SchoolMessage $mail) use ($firstStudentId, $secondStudentId): bool {
            return $firstStudentId > 0
                && $secondStudentId > 0
                && $mail->hasBcc('guardian-one@example.com')
                && $mail->hasBcc('guardian-two@example.com')
                && str_contains($mail->body, 'does not necessarily mean report cards are published');
        });
    }

    public function test_closing_result_entry_sends_notice_once_only_on_open_to_closed_transition(): void
    {
        Mail::fake();
        $admin = User::create([
            'username' => 'ADMIN-EMAIL-1',
            'password_hash' => bcrypt('test-password'),
            'full_name' => 'Admin User',
            'role' => 'admin',
            'permissions' => [],
        ]);
        $this->createStudentWithGuardian('STU-EMAIL-3', 'guardian-three@example.com');
        SystemSetting::create([
            'active_session' => '2026/2027',
            'active_term' => '3rd Term',
            'result_entry_open' => true,
        ]);

        $this->actingAs($admin, 'api')
            ->postJson('/api/settings', ['result_entry_open' => 0])
            ->assertOk();

        $this->actingAs($admin, 'api')
            ->postJson('/api/settings', ['result_entry_open' => 0])
            ->assertOk();

        Mail::assertSentTimes(SchoolMessage::class, 1);
        Mail::assertSent(SchoolMessage::class, fn (SchoolMessage $mail): bool => $mail->hasBcc('guardian-three@example.com')
                && str_contains($mail->body, '3rd Term of the 2026/2027 academic session has closed')
        );
    }

    public function test_account_setup_link_is_single_use_and_changes_the_password(): void
    {
        $teacher = User::create([
            'username' => 'TEACHER-SETUP-1',
            'email' => 'teacher-setup@example.com',
            'password_hash' => bcrypt('unusable-random-password'),
            'full_name' => 'Teacher Setup',
            'role' => 'teacher',
            'permissions' => [],
        ]);
        $setupUrl = app(AccountSetupLink::class)->createFor($teacher->id, $teacher->email);
        parse_str((string) parse_url($setupUrl, PHP_URL_FRAGMENT), $fragment);
        $query = $fragment;

        $this->postJson('/api/auth/account-setup', [
            'token' => $query['token'],
            'password' => 'A-strong-password-2026',
            'password_confirmation' => 'A-strong-password-2026',
        ])->assertOk();

        $this->assertTrue(password_verify('A-strong-password-2026', $teacher->fresh()->password_hash));

        $this->postJson('/api/auth/account-setup', [
            'token' => $query['token'],
            'password' => 'Another-strong-password-2026',
            'password_confirmation' => 'Another-strong-password-2026',
        ])->assertStatus(422);
    }

    public function test_legacy_student_initial_password_login_is_allowed_but_forces_a_change(): void
    {
        Mail::fake();
        $studentId = DB::table('users')->insertGetId([
            'username' => 'STU-LEGACY-1',
            'password_hash' => bcrypt('JMA/LEGACY/001'),
            'full_name' => 'Legacy Student',
            'role' => 'student',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('students')->insert([
            'id' => $studentId,
            'admission_number' => 'JMA/LEGACY/001',
            'parent_name' => 'Guardian Name',
            'parent_email' => 'legacy-guardian@example.com',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $login = $this->postJson('/api/auth/login', [
            'identifier' => 'JMA/LEGACY/001',
            'password' => 'JMA/LEGACY/001',
        ])->assertOk()
            ->assertJsonPath('user.must_change_password', true);

        $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
            ->getJson('/api/students')
            ->assertForbidden()
            ->assertJsonPath('must_change_password', true);

        Mail::assertNothingOutgoing();
    }

    public function test_setup_link_request_response_does_not_reveal_account_existence(): void
    {
        Mail::fake();
        $teacher = User::create([
            'username' => 'TEACHER-RESEND-1',
            'email' => 'resend@example.com',
            'password_hash' => bcrypt('unusable-random-password'),
            'full_name' => 'Teacher Resend',
            'role' => 'teacher',
            'permissions' => [],
        ]);

        $validResponse = $this->postJson('/api/auth/account-setup/request', [
            'identifier' => $teacher->username,
            'email' => 'resend@example.com',
        ]);
        $invalidResponse = $this->postJson('/api/auth/account-setup/request', [
            'identifier' => 'NO-SUCH-ACCOUNT',
            'email' => 'resend@example.com',
        ]);

        $validResponse->assertOk();
        $invalidResponse->assertOk();
        $this->assertSame($validResponse->json('message'), $invalidResponse->json('message'));
        Mail::assertSentTimes(SchoolMessage::class, 1);
    }

    private function createStudentWithGuardian(string $admissionNumber, string $email): int
    {
        $studentId = DB::table('users')->insertGetId([
            'username' => $admissionNumber,
            'password_hash' => bcrypt('test-password'),
            'full_name' => 'Student Name',
            'role' => 'student',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('students')->insert([
            'id' => $studentId,
            'admission_number' => $admissionNumber,
            'parent_email' => $email,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $studentId;
    }
}
